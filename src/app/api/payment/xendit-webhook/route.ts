import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const callbackToken = req.headers.get("x-callback-token");
    const configuredToken = process.env.XENDIT_WEBHOOK_TOKEN;

    if (configuredToken && callbackToken !== configuredToken) {
      return NextResponse.json({ error: "Unauthorized callback token" }, { status: 401 });
    }

    const body = await req.json();
    const { status, external_id, amount, metadata, description } = body;

    if (status === "PAID") {
      const supabase = createAdminServerClient();
      const billId = metadata?.bill_id;
      const communityId = metadata?.community_id;
      const profileId = metadata?.profile_id;
      const profileName = metadata?.name || "Warga Kyklos";

      if (communityId && profileId) {
        // Find pockets to retrieve recurring dues pocket or first pocket
        const { data: pockets } = await supabase
          .from("fund_pockets")
          .select("*")
          .eq("community_id", communityId);

        const communityPockets = pockets || [];
        const duesPocket = communityPockets.find((p: any) => 
          p.name.toLowerCase().includes("dues") || p.name.toLowerCase().includes("iuran")
        ) || communityPockets[0];

        if (duesPocket) {
          const newBalance = Number(duesPocket.balance) + Number(amount);

          // 1. Insert transaction record
          await supabase.from("transactions").insert({
            community_id: communityId,
            pocket_id: duesPocket.id,
            profile_id: profileId,
            type: "income",
            amount: Number(amount),
            description: description || `Iuran bulanan masuk dari ${profileName} (Lunas)`,
            status: "success",
          });

          // 2. Update pocket balance
          await supabase
            .from("fund_pockets")
            .update({ balance: newBalance })
            .eq("id", duesPocket.id);
        }

        // 3. Update dues bill status
        if (billId) {
          await supabase
            .from("dues_bills")
            .update({ status: "paid" })
            .eq("id", billId);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
