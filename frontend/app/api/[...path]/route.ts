import { NextRequest, NextResponse } from 'next/server';

const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:10001';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function proxyToBackend(req: NextRequest, path: string[]): Promise<NextResponse> {
  const url = new URL(req.url);
  const apiPath = path.join('/');
  const targetUrl = `${BACKEND_INTERNAL_URL}/api/${apiPath}${url.search}`;

  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (!['host', 'connection', 'transfer-encoding'].includes(key)) {
      headers[key] = value;
    }
  });

  const body = !['GET', 'HEAD'].includes(req.method) ? await req.text() : undefined;

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
    signal: AbortSignal.timeout(25000),
  });

  const responseText = await response.text();
  const contentType = response.headers.get('Content-Type') || 'application/json';

  return new NextResponse(responseText, {
    status: response.status,
    headers: { 'Content-Type': contentType },
  });
}

export async function GET(req: NextRequest, context: any) {
  try { return await proxyToBackend(req, context.params.path); }
  catch (e: any) { return NextResponse.json({ success: false, message: e.message }, { status: 503 }); }
}
export async function POST(req: NextRequest, context: any) {
  try { return await proxyToBackend(req, context.params.path); }
  catch (e: any) { return NextResponse.json({ success: false, message: e.message }, { status: 503 }); }
}
export async function PUT(req: NextRequest, context: any) {
  try { return await proxyToBackend(req, context.params.path); }
  catch (e: any) { return NextResponse.json({ success: false, message: e.message }, { status: 503 }); }
}
export async function PATCH(req: NextRequest, context: any) {
  try { return await proxyToBackend(req, context.params.path); }
  catch (e: any) { return NextResponse.json({ success: false, message: e.message }, { status: 503 }); }
}
export async function DELETE(req: NextRequest, context: any) {
  try { return await proxyToBackend(req, context.params.path); }
  catch (e: any) { return NextResponse.json({ success: false, message: e.message }, { status: 503 }); }
}
