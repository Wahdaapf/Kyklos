import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { bill_id, community_id, profile_id, desc } = await req.json();

    if (!bill_id || !community_id || !profile_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminServerClient();

    // 1. Fetch the dues bill details
    const { data: bill, error: fetchError } = await supabase
      .from("dues_bills")
      .select("amount, pocket_id, status")
      .eq("id", bill_id)
      .single();

    if (fetchError || !bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    if (bill.status === "paid") {
      return NextResponse.json({ success: true, message: "Bill already processed" });
    }

    // 2. Update dues bill status to paid
    const { error: billError } = await supabase
      .from("dues_bills")
      .update({ status: "paid" })
      .eq("id", bill_id);

    if (billError) {
      return NextResponse.json({ error: billError.message }, { status: 500 });
    }

    if (bill.pocket_id) {
      // 3. Get pocket balance
      const { data: pocket } = await supabase
        .from("fund_pockets")
        .select("balance")
        .eq("id", bill.pocket_id)
        .single();

      if (pocket) {
        const billAmount = Number(bill.amount);
        const newBalance = Number(pocket.balance) + billAmount;

        // 4. Create transaction record
        const { error: txError } = await supabase.from("transactions").insert({
          community_id: community_id,
          pocket_id: bill.pocket_id,
          profile_id: profile_id,
          type: "income",
          amount: billAmount,
          description: desc ? decodeURIComponent(desc) : "Pembayaran Iuran Kas (Lunas)",
          status: "success",
        });

        if (txError) {
          console.error("Error creating transaction in confirm-payment:", txError);
        }

        // 5. Update pocket balance
        const { error: pocketError } = await supabase
          .from("fund_pockets")
          .update({ balance: newBalance })
          .eq("id", bill.pocket_id);

        if (pocketError) {
          console.error("Error updating pocket in confirm-payment:", pocketError);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
