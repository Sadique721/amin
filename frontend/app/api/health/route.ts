import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  let dbStatus = 'disconnected';
  try {
    const { default: mongoose } = await import('mongoose');
    const uri = process.env.MONGODB_URI || 'mongodb+srv://haquedot:Rq8XL4BO8Gkf5szC@cluster0.mongodb.net/sanab?retryWrites=true&w=majority';
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri, { bufferCommands: false, maxPoolSize: 5 });
    }
    dbStatus = 'connected';
  } catch (e: any) {
    dbStatus = 'error: ' + (e.message || String(e));
  }

  return NextResponse.json({
    success: true,
    message: '🚀 Sanab API Health OK',
    db: dbStatus,
    timestamp: new Date().toISOString()
  });
}
