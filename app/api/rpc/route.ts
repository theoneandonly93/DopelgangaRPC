import { NextResponse } from "next/server";

// Load environment variables with safe fallbacks
const QN = process.env.QUICKNODE_HTTP || ""; // Intentionally no baked-in default to avoid accidental leakage
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "*"; // You may wish to restrict this in production

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  } as Record<string, string>;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// Deploy on the Edge Runtime for lower latency and streaming-friendly web APIs (no Node core modules)
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    if (!QN) {
      return NextResponse.json(
        { error: "QUICKNODE_HTTP not configured" },
        { status: 500, headers: corsHeaders() }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Use application/json" },
        { status: 415, headers: corsHeaders() }
      );
    }

    const bodyText = await req.text();

    // Basic JSON-RPC shape validation (non-fatal)
    if (bodyText.trim().length === 0) {
      return NextResponse.json(
        { error: "Empty request body" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const upstream = await fetch(QN, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: bodyText,
    });

    const responseText = await upstream.text();

    return new NextResponse(responseText, {
      status: upstream.status,
      headers: { "content-type": "application/json", ...corsHeaders() },
    });
  } catch (err: any) {
    console.error("RPC proxy error", err);
    return NextResponse.json(
      { error: "Upstream RPC request failed" },
      { status: 502, headers: corsHeaders() }
    );
  }
}
