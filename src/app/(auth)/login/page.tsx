"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthShell } from "@/components/auth-shell";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat masuk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Selamat datang kembali"
      subtitle="Masuk untuk melanjutkan ke komunitas Anda."
      footer={
        <>
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
            Daftar di sini
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleLogin}>
        {errorMsg && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-medium text-red-700">
            {errorMsg}
          </div>
        )}

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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Kata sandi</Label>
            <Link href="/login" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
              Lupa sandi?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              required
              placeholder="Minimal 8 karakter"
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
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" name="remember" />
          <Label htmlFor="remember" className="text-sm font-normal text-zinc-500 font-sans cursor-pointer">
            Ingat saya di perangkat ini
          </Label>
        </div>

        <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl text-base">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Masuk...
            </>
          ) : (
            "Masuk"
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
            <path
              fill="#4285F4"
              d="M22.5 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.22-4.74 3.22-8.07z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.12A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.45.34-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.96l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
            />
          </svg>
          Lanjutkan dengan Google
        </Button>
      </form>
    </AuthShell>
  );
}
