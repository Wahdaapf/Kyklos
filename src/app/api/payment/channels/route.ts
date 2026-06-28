import { NextResponse } from "next/server";

export async function GET() {
  try {
    const secretKey = process.env.XENDIT_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Xendit secret key not configured" }, { status: 500 });
    }

    const authHeader = "Basic " + Buffer.from(secretKey + ":").toString("base64");
    const res = await fetch("https://api.xendit.co/payment_channels", {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Xendit API error: ${errText}` }, { status: res.status });
    }

    const data = await res.json();
    // Filter only enabled payment channels
    const enabled = data.filter((c: any) => c.is_enabled === true);

    return NextResponse.json(enabled);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
