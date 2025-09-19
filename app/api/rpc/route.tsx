import { NextResponse } from "next/server";

const QN = process.env.QUICKNODE_HTTP ?? "https://tiniest-few-patron.solana-mainnet.quiknode.pro/6006d42ab7ce4dac6a265fdbf87f6586c73827a9/"; // e.g. https://...quiknode.pro/<key>/
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN ?? "dopelgangachain.xyz"; // e.g. https://dopelganga.com

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request) {
  if (!QN) return NextResponse.json({ error: "RPC not configured" }, { status: 500 });

  // Only accept JSON-RPC POST
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "Use application/json" }, { status: 415, headers: corsHeaders() });
  }

  const body = await req.text(); // pass-through
  const upstream = await fetch(QN, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });

  const data = await upstream.text();
  return new NextResponse(data, {
    status: upstream.status,
    headers: { "content-type": "application/json", ...corsHeaders() },
  });
}
