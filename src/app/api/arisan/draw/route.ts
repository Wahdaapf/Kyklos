import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { round_id, winner_id, community_id, profile_id } = await req.json();

    if (!round_id || !winner_id || !community_id || !profile_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!serviceKey || serviceKey.trim() === "" || serviceKey.trim() === anonKey?.trim()) {
      console.error("CRITICAL CONFIG ERROR: Server did not load SUPABASE_SERVICE_ROLE_KEY correctly.");
      return NextResponse.json({
        error: "SUPABASE_SERVICE_ROLE_KEY tidak terdeteksi oleh server. Silakan pastikan variabel tersebut ada di `.env.local` dan restart server Next.js Anda (matikan dengan Ctrl+C dan jalankan kembali `npm run dev` atau `npm run start`)."
      }, { status: 500 });
    }

    const supabase = createAdminServerClient();

    // 1. Fetch active round info
    const { data: round, error: roundErr } = await supabase
      .from("arisan_rounds")
      .select("*")
      .eq("id", round_id)
      .single();

    if (roundErr || !round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    if (round.status !== "pending") {
      return NextResponse.json({ error: "Round is not pending" }, { status: 400 });
    }

    // 2. Fetch winner profile info for transaction description
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", winner_id)
      .single();

    const winnerName = profile?.full_name || "Anggota";

    // 3. Update the active round record in Supabase
    const { error: updateRoundErr } = await supabase
      .from("arisan_rounds")
      .update({
        winner_profile_id: winner_id,
        status: "distributed",
        drawn_at: new Date().toISOString()
      })
      .eq("id", round_id);

    if (updateRoundErr) {
      return NextResponse.json({ error: updateRoundErr.message }, { status: 500 });
    }

    // 4. Update pocket balance
    const { data: pockets, error: pocketsErr } = await supabase
      .from("fund_pockets")
      .select("*")
      .eq("community_id", community_id);

    if (pocketsErr) {
      console.error("Error fetching pockets in arisan draw API:", pocketsErr);
      return NextResponse.json({ error: pocketsErr.message }, { status: 500 });
    }

    const communityPockets = pockets || [];
    const arisanPocket = communityPockets.find((p: any) =>
      p.name.toLowerCase().includes("arisan")
    ) || communityPockets[0];

    if (arisanPocket) {
      const prizeAmount = Number(round.total_prize);
      const newBal = Math.max(0, Number(arisanPocket.balance) - prizeAmount);

      // Update pocket balance in Supabase
      const { error: pocketUpdateErr } = await supabase
        .from("fund_pockets")
        .update({ balance: newBal })
        .eq("id", arisanPocket.id);

      if (pocketUpdateErr) {
        console.error("Error updating pocket balance in arisan draw API:", pocketUpdateErr);
        return NextResponse.json({ error: pocketUpdateErr.message }, { status: 500 });
      }

      // Record arisan payout transaction in Supabase
      const { error: txErr } = await supabase
        .from("transactions")
        .insert({
          community_id: community_id,
          pocket_id: arisanPocket.id,
          profile_id: profile_id,
          type: "expense",
          amount: prizeAmount,
          description: `Pemenang Kocokan: ${winnerName} (Putaran ${round.round_number})`,
          status: "success",
        });

      if (txErr) {
        console.error("Error inserting transaction in arisan draw API:", txErr);
        return NextResponse.json(txErr, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, winner_name: winnerName });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
