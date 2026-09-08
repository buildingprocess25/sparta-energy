import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { serializeSignedCookie } from "better-call";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.redirect(new URL("/login?error=sso_token_missing", request.url));
    }

    const spartaApiUrl = process.env.SPARTA_API_URL || "http://localhost:10000";
    let spartaEmail: string;

    try {
        const exchangeRes = await fetch(`${spartaApiUrl}/v1/sso/exchange`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ moduleId: "energy", launchToken: token })
        });

        const exchangeBody = await exchangeRes.json();

        if (!exchangeRes.ok) {
            console.error("[SSO Callback] Exchange failed:", exchangeRes.status, JSON.stringify(exchangeBody));
            throw new Error(`Exchange failed: ${exchangeBody?.error?.message || "unknown"}`);
        }

        spartaEmail = exchangeBody?.data?.user?.email;
        if (!spartaEmail) {
            console.error("[SSO Callback] No email in exchange response:", JSON.stringify(exchangeBody));
            throw new Error("No email in exchange response");
        }
        console.log("[SSO Callback] Exchange success for email:", spartaEmail);
    } catch (e) {
        console.error("[SSO Callback] Exchange error:", e);
        return NextResponse.redirect(new URL("/login?error=sso_exchange_failed", request.url));
    }

    // Find user in energy DB
    const user = await prisma.user.findUnique({
        where: { email: spartaEmail }
    });

    if (!user) {
        console.error("[SSO Callback] User not found in energy DB:", spartaEmail);
        return NextResponse.redirect(new URL("/login?error=sso_user_not_found", request.url));
    }

    // Create session token - better-auth uses its own generateId
    const { generateId } = require("better-auth");
    const sessionToken = generateId(32);
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

    await prisma.session.create({
        data: {
            id: crypto.randomUUID(),
            token: sessionToken,
            userId: user.id,
            expiresAt,
            ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "",
            userAgent: request.headers.get("user-agent") || "",
        }
    });

    console.log("[SSO Callback] Session created for user:", user.email);

    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    
    // Create properly signed cookie exactly as better-auth does it
    const secret = process.env.BETTER_AUTH_SECRET!;
    const signedCookieValue = await serializeSignedCookie("better-auth.session_token", sessionToken, secret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 8 * 60 * 60,
    });
    
    // Manually append the Set-Cookie header to have full control over the string
    response.headers.append("Set-Cookie", signedCookieValue);
    
    // Also set the plain sso_session cookie for our robust fallback interceptor
    response.cookies.set("sso_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 8 * 60 * 60,
        path: "/",
    });
    
    console.log("[SSO Callback] Session cookie signed and set, redirecting to /dashboard");
    return response;
}

