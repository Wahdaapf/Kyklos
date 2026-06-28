"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const confirmPayment = async () => {
      const billId = searchParams.get("bill_id");
      const communityId = searchParams.get("community_id");
      const profileId = searchParams.get("profile_id");
      const amount = searchParams.get("amount");
      const desc = searchParams.get("desc");

      if (!billId || !communityId || !profileId || !amount) {
        setStatus("error");
        setErrorMessage("Parameter query pembayaran tidak lengkap.");
        return;
      }

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
            amount: Number(amount),
            description: desc,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Gagal melakukan konfirmasi pembayaran.");
        }

        setStatus("success");

        const timer = setTimeout(() => {
          router.push("/dashboard");
        }, 3000);

        return () => clearTimeout(timer);
      } catch (err: any) {
        console.error("Confirmation error:", err);
        setStatus("error");
        setErrorMessage(err.message || "Terjadi kesalahan saat memproses data.");
      }
    };

    confirmPayment();
  }, [searchParams, router]);

  return (
    <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-6 animate-fade-in">
      {status === "processing" && (
        <>
          <Loader2 className="h-16 w-16 text-indigo-650 mx-auto animate-spin" />
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-zinc-900">Mengonfirmasi Pembayaran...</h1>
            <p className="text-sm text-zinc-500 font-sans leading-relaxed">
              Mohon tunggu sejenak, sistem sedang merekam transaksi pembayaran Anda ke database.
            </p>
          </div>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto animate-bounce" />
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-zinc-900">Pembayaran Berhasil!</h1>
            <p className="text-sm text-zinc-500 font-sans leading-relaxed">
              Terima kasih! Iuran Anda telah berhasil dibayarkan dan tercatat di sistem. Anda akan dialihkan kembali ke Dashboard dalam 3 detik.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full h-11 bg-indigo-650 hover:opacity-90 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="h-16 w-16 text-red-500 mx-auto animate-pulse" />
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-zinc-900">Konfirmasi Gagal</h1>
            <p className="text-sm text-red-500 font-sans leading-relaxed font-semibold">
              {errorMessage}
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full h-11 bg-zinc-800 hover:opacity-90 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
      <Suspense fallback={
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-6 text-center">
          <Loader2 className="h-16 w-16 text-indigo-650 mx-auto animate-spin" />
          <h1 className="text-xl font-bold text-zinc-900">Memuat Parameter...</h1>
        </div>
      }>
        <SuccessPageContent />
      </Suspense>
    </div>
  );
}
