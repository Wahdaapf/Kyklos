"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount");
  const desc = searchParams.get("desc");
  const billId = searchParams.get("bill_id");
  const communityId = searchParams.get("community_id");
  const profileId = searchParams.get("profile_id");

  useEffect(() => {
    async function updatePaymentStatus() {
      if (!billId || !communityId || !profileId) return;

      try {
        // 1. Update dues bill status to paid
        const { error: billError } = await supabase
          .from("dues_bills")
          .update({ status: "paid" })
          .eq("id", billId);

        if (billError) {
          console.error("Error updating bill status:", billError);
          return;
        }

        // 2. Find dues pocket
        const { data: pockets } = await supabase
          .from("fund_pockets")
          .select("*")
          .eq("community_id", communityId);

        const communityPockets = pockets || [];
        const duesPocket = communityPockets.find((p: any) =>
          p.name.toLowerCase().includes("dues") || p.name.toLowerCase().includes("iuran")
        ) || communityPockets[0];

        if (duesPocket) {
          const txAmount = amount ? Number(amount) : 50000;
          const newBalance = Number(duesPocket.balance) + txAmount;

          // 3. Create transaction record
          await supabase.from("transactions").insert({
            community_id: communityId,
            pocket_id: duesPocket.id,
            profile_id: profileId,
            type: "income",
            amount: txAmount,
            description: desc ? decodeURIComponent(desc) : "Pembayaran Iuran Kas (Lunas)",
            status: "success",
          });

          // 4. Update pocket balance
          await supabase
            .from("fund_pockets")
            .update({ balance: newBalance })
            .eq("id", duesPocket.id);
        }
      } catch (err) {
        console.error("Failed to run local success updates:", err);
      }
    }

    updatePaymentStatus();
  }, [billId, communityId, profileId, amount, desc]);

  const formattedAmount = amount
    ? `Rp ${Number(amount).toLocaleString("id-ID")}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-zinc-100 p-10 max-w-sm w-full text-center space-y-5">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
            Pembayaran Berhasil!
          </h1>
          <p className="text-sm text-zinc-500 font-sans">
            Terima kasih, transaksi Anda telah dikonfirmasi oleh Xendit.
          </p>
        </div>

        {/* Amount & desc */}
        {(formattedAmount || desc) && (
          <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-4 space-y-1 text-left">
            {desc && (
              <p className="text-xs text-zinc-500 font-sans truncate">
                {decodeURIComponent(desc)}
              </p>
            )}
            {formattedAmount && (
              <p className="text-lg font-black text-zinc-900">{formattedAmount}</p>
            )}
          </div>
        )}

        {/* CTA */}
        <Link
          href="/dashboard"
          className="block w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all flex items-center justify-center"
        >
          Kembali ke Dashboard
        </Link>

        <p className="text-[10px] text-zinc-400 font-sans">
          Didukung oleh <span className="font-bold">Xendit</span> Payment Gateway.
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessContent />
    </Suspense>
  );
}
