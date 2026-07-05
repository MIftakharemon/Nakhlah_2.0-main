import { NextResponse } from "next/server";

const API_BASE_URL =
    process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";

export async function GET(request, { params }) {
    try {
        if (!API_BASE_URL) {
            return NextResponse.json(
                { message: "API base URL is not configured" },
                { status: 500 },
            );
        }

        const pathSegments = params?.path || [];
        const normalizedBase = API_BASE_URL.endsWith("/")
            ? API_BASE_URL.slice(0, -1)
            : API_BASE_URL;

        const upstreamUrl = new URL(
            `${normalizedBase}/api/globals/${pathSegments.join("/")}`,
        );
        upstreamUrl.search = request.nextUrl.search;

        const authorization = request.headers.get("authorization");

        const upstreamResponse = await fetch(upstreamUrl.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(authorization ? { Authorization: authorization } : {}),
            },
            cache: "no-store",
        });

        const contentType = upstreamResponse.headers.get("content-type") || "";
        const payload = contentType.includes("application/json")
            ? await upstreamResponse.json().catch(() => ({}))
            : await upstreamResponse.text().catch(() => "");

        if (!upstreamResponse.ok) {
            return NextResponse.json(
                typeof payload === "string" ? { message: payload } : payload,
                { status: upstreamResponse.status },
            );
        }

        if (typeof payload === "string") {
            return new NextResponse(payload, {
                status: upstreamResponse.status,
                headers: { "Content-Type": contentType || "text/plain" },
            });
        }

        return NextResponse.json(payload, { status: upstreamResponse.status });
    } catch (error) {
        return NextResponse.json(
            { message: error?.message || "Failed to fetch globals data" },
            { status: 502 },
        );
    }
}
