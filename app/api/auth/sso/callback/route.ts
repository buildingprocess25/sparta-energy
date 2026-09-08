import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

    if (!token) {
        return NextResponse.redirect(new URL("/login?error=sso_token_missing", baseUrl));
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
        return NextResponse.redirect(new URL("/login?error=sso_exchange_failed", baseUrl));
    }

    // Find user in energy DB
    const user = await prisma.user.findUnique({
        where: { email: spartaEmail }
    });

    if (!user) {
        console.error("[SSO Callback] User not found in energy DB:", spartaEmail);
        return NextResponse.redirect(new URL("/login?error=sso_user_not_found", baseUrl));
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

    const response = NextResponse.redirect(new URL("/dashboard", baseUrl));
    // The proxy and auth helper resolve this fallback cookie from the session table.
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

