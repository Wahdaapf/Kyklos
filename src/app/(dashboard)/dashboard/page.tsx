"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Wallet,
  Users,
  Calendar,
  MessageCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Bell,
  LogOut,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <span className="text-lg font-semibold tracking-tight text-zinc-900">Kyklos</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <div className="text-sm font-medium text-zinc-900">Anggota Komunitas</div>
                <div className="text-xs text-zinc-500">Arisan Melati</div>
              </div>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                A
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={handleLogout}
            >
              <LogOut className="mr-1.5 h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Greeting */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Selamat datang kembali 👋
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Ini ringkasan komunitas Anda hari ini.
            </p>
          </div>
          <Button className="rounded-xl" onClick={() => router.push("/ledger/create")}>
            <Plus className="mr-1.5 h-4 w-4" />
            Catat transaksi
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Saldo"
            value="Rp 12.450.000"
            delta="+8,2%"
            trend="up"
            icon={Wallet}
          />
          <StatCard
            label="Anggota Aktif"
            value="48"
            delta="+3"
            trend="up"
            icon={Users}
          />
          <StatCard
            label="Event Bulan Ini"
            value="2"
            delta="Akan datang"
            trend="neutral"
            icon={Calendar}
          />
          <StatCard
            label="Diskusi Baru"
            value="17"
            delta="hari ini"
            trend="neutral"
            icon={MessageCircle}
          />
        </div>

        {/* Pockets + activity */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="rounded-2xl border-zinc-200/80 p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-zinc-900">Pocket Dana</h2>
                <p className="text-sm text-zinc-500">
                  Setiap pocket punya saldo dan histori tersendiri.
                </p>
              </div>
              <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => router.push("/wallet")}>
                Kelola
              </Button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Pocket name="Kas Bulanan" balance="Rp 6.200.000" tone="primary" />
              <Pocket name="Arisan" balance="Rp 4.800.000" tone="accent" />
              <Pocket name="Event 17 Agt" balance="Rp 1.450.000" tone="warning" />
            </div>
          </Card>

          <Card className="rounded-2xl border-zinc-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-900">Agenda</h2>
              <Calendar className="h-4 w-4 text-zinc-400" />
            </div>
            <ul className="mt-4 space-y-3">
              {[
                { title: "Rapat agenda", when: "Sabtu, 28 Jun · 19.00", status: "upcoming" },
                { title: "Penarikan arisan", when: "Minggu, 6 Jul · 10.00", status: "upcoming" },
                { title: "Tutup buku Mei", when: "Selesai 31 Mei", status: "done" },
              ].map((a) => (
                <li key={a.title} className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
                      a.status === "done"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-indigo-50 text-indigo-700"
                    }`}
                  >
                    {a.status === "done" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-zinc-900">{a.title}</div>
                    <div className="text-xs text-zinc-500">{a.when}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Transactions */}
        <Card className="mt-6 rounded-2xl border-zinc-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Transaksi Terbaru</h2>
              <p className="text-sm text-zinc-500">
                Semua anggota bisa melihat ke mana uang mengalir.
              </p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => router.push("/ledger")}>
              Lihat semua
            </Button>
          </div>

          <div className="mt-5 divide-y divide-zinc-100">
            {[
              { name: "Iuran Juni — Budi", pocket: "Kas Bulanan", amount: 150000, type: "in" },
              { name: "Konsumsi rapat", pocket: "Kas Bulanan", amount: 320000, type: "out" },
              { name: "Setoran arisan — Sari", pocket: "Arisan", amount: 200000, type: "in" },
              { name: "Sewa tenda 17 Agt", pocket: "Event 17 Agt", amount: 450000, type: "out" },
            ].map((t) => (
              <div key={t.name} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-xl ${
                      t.type === "in"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {t.type === "in" ? (
                      <ArrowDownRight className="h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-900">{t.name}</div>
                    <div className="text-xs text-zinc-500">{t.pocket}</div>
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold ${
                    t.type === "in" ? "text-emerald-600" : "text-zinc-900"
                  }`}
                >
                  {t.type === "in" ? "+" : "−"} Rp {t.amount.toLocaleString("id-ID")}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  icon: typeof Wallet;
}) {
  return (
    <Card className="rounded-2xl border-zinc-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-500">{label}</span>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">{value}</div>
      <div
        className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${
          trend === "up"
            ? "text-emerald-600"
            : trend === "down"
              ? "text-red-600"
              : "text-zinc-400"
        }`}
      >
        {trend === "up" && <TrendingUp className="h-3 w-3" />}
        {delta}
      </div>
    </Card>
  );
}

function Pocket({
  name,
  balance,
  tone,
}: {
  name: string;
  balance: string;
  tone: "primary" | "accent" | "warning";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-indigo-50 text-indigo-700 border border-indigo-200/30"
      : tone === "warning"
        ? "bg-amber-50 text-amber-700 border border-amber-200/30"
        : "bg-blue-50 text-blue-700 border border-blue-200/30";
  return (
    <div className="rounded-xl border border-zinc-200 p-4">
      <div
        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${toneClass}`}
      >
        <Wallet className="h-4 w-4" />
      </div>
      <div className="mt-3 text-sm font-medium text-zinc-500">{name}</div>
      <div className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">{balance}</div>
    </div>
  );
}
