"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-6 animate-fade-in">
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
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
