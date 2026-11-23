import { NextResponse } from "next/server";
import os from "os";

export const dynamic = "force-dynamic";

export async function GET() {
  let lanIp: string | null = null;
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      const netList = interfaces[name];
      if (!netList) continue;
      for (const net of netList) {
        // Find non-internal IPv4 address
        if (net.family === "IPv4" && !net.internal) {
          lanIp = net.address;
          break;
        }
      }
      if (lanIp) break;
    }
  } catch {
    // fallback
  }

  return NextResponse.json({ lanIp });
}
