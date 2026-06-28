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

      if (billId && communityId && profileId) {
        // Fetch the dues bill to retrieve pocket_id and actual amount
        const { data: bill } = await supabase
          .from("dues_bills")
          .select("amount, pocket_id, status")
          .eq("id", billId)
          .single();

        if (bill && bill.status !== "paid") {
          // 1. Update dues bill status to paid
          await supabase
            .from("dues_bills")
            .update({ status: "paid" })
            .eq("id", billId);

          if (bill.pocket_id) {
            // Get the current pocket balance
            const { data: pocket } = await supabase
              .from("fund_pockets")
              .select("balance")
              .eq("id", bill.pocket_id)
              .single();

            if (pocket) {
              const billAmount = Number(bill.amount);
              const newBalance = Number(pocket.balance) + billAmount;

              // 2. Create transaction record linked to pocket_id from bill
              await supabase.from("transactions").insert({
                community_id: communityId,
                pocket_id: bill.pocket_id,
                profile_id: profileId,
                type: "income",
                amount: billAmount,
                description: description || `Iuran bulanan masuk dari ${profileName} (Lunas)`,
                status: "success",
              });

              // 3. Update pocket balance where id matches pocket_id from bill
              await supabase
                .from("fund_pockets")
                .update({ balance: newBalance })
                .eq("id", bill.pocket_id);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
