import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
          success: true,
          message: 'Amin API Health OK',
          status: 'ok',
          timestamp: new Date().toISOString(),
    });
}
