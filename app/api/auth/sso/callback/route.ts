import { generateId } from "better-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { getHomeUrl } from "@/lib/role-access";
import { clearBetterAuthCookieHeaders, getSsoCookieDomain } from "@/lib/sso-cookie";

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
            // Status and error code only: the response body carries user data.
            console.error("[SSO Callback] Exchange failed:", exchangeRes.status, exchangeBody?.error?.code ?? "no code");
            throw new Error(`Exchange failed: ${exchangeBody?.error?.message || "unknown"}`);
        }

        spartaEmail = exchangeBody?.data?.user?.email;
        if (!spartaEmail) {
            console.error("[SSO Callback] No email in exchange response");
            throw new Error("No email in exchange response");
        }
    } catch (e) {
        console.error("[SSO Callback] Exchange error:", e);
        return NextResponse.redirect(new URL("/login?error=sso_exchange_failed", baseUrl));
    }

    // Find user in energy DB
    const user = await prisma.user.findUnique({
        where: { email: spartaEmail }
    });

    if (!user) {
        console.error("[SSO Callback] SSO user not found in energy DB");
        return NextResponse.redirect(new URL("/login?error=sso_user_not_found", baseUrl));
    }

    // Same token format better-auth generates for its own sessions.
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


    const redirectPath = getHomeUrl(user.role);
    const response = NextResponse.redirect(new URL(redirectPath, baseUrl));
    // The proxy and auth helper resolve this fallback cookie from the session table.
    response.cookies.set("sso_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 8 * 60 * 60,
        path: "/",
        domain: getSsoCookieDomain(),
    });
    // A better-auth cookie left by an earlier login outranks sso_session in sparta, so drop it.
    for (const header of clearBetterAuthCookieHeaders()) {
        response.headers.append("Set-Cookie", header);
    }

    return response;
}

