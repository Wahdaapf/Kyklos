"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { useEffect } from "react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount");
  const desc = searchParams.get("desc");
  const billId = searchParams.get("bill_id");
  const communityId = searchParams.get("community_id");
  const profileId = searchParams.get("profile_id");

  useEffect(() => {
    async function confirmPayment() {
      if (!billId || !communityId || !profileId) return;

      try {
        const res = await fetch("/api/payment/confirm-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bill_id: billId,
            community_id: communityId,
            profile_id: profileId,
            desc: desc || "",
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          console.error("Failed to confirm payment via API:", errData.error);
        }
      } catch (err) {
        console.error("Failed to call confirm-payment API:", err);
      }
    }

    confirmPayment();
  }, [billId, communityId, profileId, desc]);

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
