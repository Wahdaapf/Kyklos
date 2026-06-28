"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthShell } from "@/components/auth-shell";
import { Mail, Lock, User, Eye, EyeOff, Check, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

function PasswordHints({ pw }: { pw: string }) {
  const rules = [
    { label: "Min. 8 karakter", ok: pw.length >= 8 },
    { label: "Mengandung angka", ok: /\d/.test(pw) },
    { label: "Huruf besar & kecil", ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
  ];
  return (
    <ul className="mt-2 grid grid-cols-1 gap-1 text-xs sm:grid-cols-3">
      {rules.map((r) => (
        <li
          key={r.label}
          className={`flex items-center gap-1.5 ${r.ok ? "text-emerald-600 font-medium" : "text-zinc-4 font-medium"}`}
        >
          <Check className="h-3 w-3" strokeWidth={3} />
          {r.label}
        </li>
      ))}
    </ul>
  );
}

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.user) {
        // Fallback: Coba insert profil langsung dari client-side
        // Ini berguna jika email confirmation tidak aktif atau kebijakan RLS memperbolehkan insert langsung
        try {
          await supabase.from("profiles").insert({
            id: data.user.id,
            full_name: name,
            phone: phone,
          });
        } catch (dbErr) {
          console.warn("Client-side profile insert skipped or failed. This is expected if email confirmation is required and auth trigger is not set up yet:", dbErr);
        }

        setSuccessMsg(
          "Pendaftaran berhasil! Silakan periksa kotak masuk email Anda untuk melakukan konfirmasi akun."
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat mendaftar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Buat akun Kyklos Anda"
      subtitle="Mulai catat keuangan dan iuran komunitas secara transparan."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
            Masuk di sini
          </Link>
        </>
      }
    >
      {successMsg ? (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
            <Check className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <h3 className="text-sm font-semibold text-emerald-800 mb-1">Pendaftaran Berhasil!</h3>
          <p className="text-xs text-emerald-700 leading-relaxed">{successMsg}</p>
          <div className="mt-4">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/login">Kembali ke Masuk</Link>
            </Button>
          </div>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleRegister} method="POST">
          {errorMsg && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-medium text-red-700">
              {errorMsg}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nama Anda</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                id="name"
                name="name"
                required
                placeholder="Nama lengkap"
                className="h-11 rounded-xl pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">No. WhatsApp / HP</Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="Contoh: 08123456789"
                className="h-11 rounded-xl pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="nama@komunitas.id"
                className="h-11 rounded-xl pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Kata sandi</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                required
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Buat kata sandi yang kuat"
                className="h-11 rounded-xl pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                aria-label={showPw ? "Sembunyikan sandi" : "Lihat sandi"}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordHints pw={pw} />
          </div>

          <div className="flex items-start gap-2">
            <Checkbox id="terms" name="terms" className="mt-0.5" required />
            <Label htmlFor="terms" className="text-sm font-normal leading-relaxed text-zinc-500">
              Saya setuju dengan{" "}
              <a className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline" href="#">
                Ketentuan Layanan
              </a>{" "}
              dan{" "}
              <a className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline" href="#">
                Kebijakan Privasi
              </a>{" "}
              Kyklos.
            </Label>
          </div>

          <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl text-base">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mendaftar...
              </>
            ) : (
              "Daftar Akun"
            )}
          </Button>

          <div className="relative py-1 text-center">
            <span className="absolute inset-x-0 top-1/2 -z-10 h-px bg-zinc-200" />
            <span className="bg-white px-3 text-xs text-zinc-500">atau</span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl font-medium"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.5 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.22-4.74 3.22-8.07z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.12A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.45.34-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.96l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>
            Daftar dengan Google
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
