import { NextResponse } from 'next/server';
import { getConfig as getServerConfig } from '@/lib/config'; // Server-side config loader

export async function GET() {
  try {
    const config = await getServerConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Failed to get config for API route:", error);
    return NextResponse.json({ error: "Failed to load configuration" }, { status: 500 });
  }
}
