import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { bill_id, community_id, profile_id, amount, description } = await req.json();

    if (!bill_id || !community_id || !profile_id || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminServerClient();

    // 1. Fetch the dues bill details
    const { data: bill, error: billErr } = await supabase
      .from("dues_bills")
      .select("*")
      .eq("id", bill_id)
      .single();

    if (billErr || !bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    // If already paid, return success immediately to avoid duplicate balance increments
    if (bill.status === "paid") {
      return NextResponse.json({ success: true, message: "Bill already processed" });
    }

    // 2. Update the bill status to paid
    const { error: updateBillErr } = await supabase
      .from("dues_bills")
      .update({
        status: "paid",
      })
      .eq("id", bill_id);

    if (updateBillErr) {
      return NextResponse.json({ error: updateBillErr.message }, { status: 500 });
    }

    // 3. Find the pocket and increment its balance
    const pocketId = bill.pocket_id;
    if (pocketId) {
      const { data: pocket, error: pocketErr } = await supabase
        .from("fund_pockets")
        .select("balance")
        .eq("id", pocketId)
        .single();

      if (!pocketErr && pocket) {
        const newBal = Number(pocket.balance) + Number(amount);
        await supabase
          .from("fund_pockets")
          .update({ balance: newBal })
          .eq("id", pocketId);
      }
    }

    // 4. Record payment transaction
    const { error: txErr } = await supabase
      .from("transactions")
      .insert({
        community_id: community_id,
        pocket_id: pocketId || null,
        profile_id: profile_id,
        type: "income",
        amount: Number(amount),
        description: description || `Pembayaran Iuran: ${bill.title}`,
        status: "success",
      });

    if (txErr) {
      return NextResponse.json({ error: txErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
