import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount, description, bill_id, community_id, profile_id, email, name, phone } = await req.json();

    const secretKey = process.env.XENDIT_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Xendit secret key not configured" }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const externalId = `invoice-${Date.now()}-${bill_id || "gen"}`;

    const payload = {
      external_id: externalId,
      amount: Number(amount),
      description: description || "Pembayaran Iuran Kyklos",
      currency: "IDR",
      customer: {
        given_names: name || "Warga Kyklos",
        email: email || undefined,
        mobile_number: phone || undefined,
      },
      success_redirect_url: `${appUrl}/payment/success?amount=${amount}&desc=${encodeURIComponent(description || "")}&bill_id=${bill_id || ""}&community_id=${community_id || ""}&profile_id=${profile_id || ""}`,
      failure_redirect_url: `${appUrl}/dashboard`,
      metadata: {
        bill_id: bill_id || null,
        community_id: community_id,
        profile_id: profile_id,
        name: name,
      }
    };

    const authHeader = "Basic " + Buffer.from(secretKey + ":").toString("base64");
    const res = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Xendit API error: ${errText}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ invoice_url: data.invoice_url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
