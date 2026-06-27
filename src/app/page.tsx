import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthRedirect } from "@/components/auth-redirect";
import { Card } from "@/components/ui/card";
import {
  Wallet,
  Users,
  Calendar,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Kyklos — Dompet Komunitas yang Transparan",
  description: "Kyklos menyatukan keuangan, komunikasi, dan operasional komunitas Indonesia dalam satu aplikasi yang ramah dan transparan.",
  openGraph: {
    title: "Kyklos — Dompet Komunitas yang Transparan",
    description: "Kelola arisan, iuran, kas RT/RW, dan event komunitas dengan transparan. Semua anggota bisa melihat ke mana uang mengalir.",
  },
};

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
        <Sparkles className="h-5 w-5" strokeWidth={2.25} />
      </div>
      <span className="text-lg font-semibold tracking-tight text-zinc-900">Kyklos</span>
    </Link>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-zinc-50/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-zinc-500 md:flex">
          <a href="#fitur" className="transition-colors hover:text-zinc-900">Fitur</a>
          <a href="#cara" className="transition-colors hover:text-zinc-900">Cara Kerja</a>
          <a href="#untuk-siapa" className="transition-colors hover:text-zinc-900">Untuk Siapa</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Masuk</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full">
            <Link href="/register">
              Coba Gratis
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10 opacity-80"
        style={{ background: "radial-gradient(circle at top, rgba(99, 102, 241, 0.08) 0%, transparent 65%)" }}
      />
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium text-zinc-500 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
          Untuk komunitas Indonesia — arisan, RT/RW, alumni, paguyuban
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-balance text-5xl font-semibold tracking-tight text-zinc-900 sm:text-6xl">
          Dompet komunitas yang{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
            transparan
          </span>{" "}
          untuk semua anggota.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-500">
          Kyklos menyatukan kas, arisan, iuran, diskusi, dan jadwal acara dalam satu aplikasi
          ramah — bukan seperti aplikasi bank, tapi seperti grup WhatsApp yang rapi.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-6">
            <Link href="/register">
              Mulai komunitas Anda
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-6">
            <Link href="/login">Saya sudah punya akun</Link>
          </Button>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <Card className="overflow-hidden border border-zinc-200/80 bg-white p-0 text-left shadow-md">
      <div className="flex items-center gap-2 border-b border-zinc-200/60 bg-zinc-50/60 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <span className="ml-3 text-xs text-zinc-500">kyklos.app / paguyuban-melati</span>
      </div>
      <div className="grid gap-4 p-6 sm:grid-cols-3">
        <PocketCard label="Kas Utama" amount="Rp 4.250.000" trend="+Rp 350rb bulan ini" />
        <PocketCard label="Arisan" amount="Rp 12.000.000" trend="Putaran 6 dari 12" tone="accent" />
        <PocketCard label="Event 17 Agt" amount="Rp 1.800.000" trend="72% terkumpul" tone="warning" />
        <div className="sm:col-span-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-900">Riwayat terbaru</span>
            <span className="text-zinc-500">Visible untuk semua anggota</span>
          </div>
          <div className="mt-3 space-y-2">
            <LedgerRow name="Iuran Juni — Sari" amount="+ Rp 50.000" status="Lunas" />
            <LedgerRow name="Iuran Juni — Budi" amount="Rp 50.000" status="Tertunggak" tone="warning" />
            <LedgerRow name="Beli konsumsi rapat" amount="− Rp 120.000" status="Tercatat" tone="muted" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function PocketCard({
  label,
  amount,
  trend,
  tone = "primary",
}: {
  label: string;
  amount: string;
  trend: string;
  tone?: "primary" | "accent" | "warning";
}) {
  const toneClasses =
    tone === "warning"
      ? "bg-amber-50 text-amber-700 border border-amber-200/50"
      : tone === "accent"
      ? "bg-indigo-50 text-indigo-700 border border-indigo-200/50"
      : "bg-blue-50 text-blue-700 border border-blue-200/50";
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">{label}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${toneClasses}`}>
          POCKET
        </span>
      </div>
      <div className="mt-2 text-xl font-semibold tracking-tight text-zinc-900">{amount}</div>
      <div className="mt-1 text-xs text-zinc-500">{trend}</div>
    </div>
  );
}

function LedgerRow({
  name,
  amount,
  status,
  tone = "success",
}: {
  name: string;
  amount: string;
  status: string;
  tone?: "success" | "warning" | "muted";
}) {
  const toneClasses =
    tone === "warning"
      ? "bg-amber-50 text-amber-700 border border-amber-200/50"
      : tone === "muted"
      ? "bg-zinc-100 text-zinc-600 border border-zinc-200/50"
      : "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
      <span className="text-zinc-900">{name}</span>
      <div className="flex items-center gap-3">
        <span className="font-medium tabular-nums text-zinc-900">{amount}</span>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${toneClasses}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: Wallet,
    title: "Dompet komunitas",
    desc: "Pisahkan kas, arisan, iuran, dan dana acara dalam pocket terpisah. Saldo dan riwayat terlihat untuk semua anggota.",
  },
  {
    icon: ShieldCheck,
    title: "Transparan & ter-audit",
    desc: "Setiap pemasukan dan pengeluaran tercatat otomatis dengan bukti. Histori tetap utuh meski admin berganti.",
  },
  {
    icon: Users,
    title: "Arisan otomatis",
    desc: "Atur peserta, jadwal putaran, dan undian. Sistem mengingatkan giliran dan setoran tanpa repot.",
  },
  {
    icon: MessageCircle,
    title: "Diskusi terfokus",
    desc: "Forum komunitas yang rapi — pengumuman, polling, dan obrolan tidak tenggelam seperti di grup WhatsApp.",
  },
  {
    icon: Calendar,
    title: "Jadwal & RSVP",
    desc: "Buat agenda rapat, gathering, atau kerja bakti. Anggota konfirmasi kehadiran dalam satu ketukan.",
  },
  {
    icon: Sparkles,
    title: "Whitelabel siap pakai",
    desc: "Ganti nama, logo, dan warna sesuai komunitas Anda. Satu platform, ribuan komunitas.",
  },
];

function Features() {
  return (
    <section id="fitur" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Semua yang dibutuhkan komunitas, dalam satu tempat
        </h2>
        <p className="mt-4 text-zinc-500">
          Berhenti melompat antara WhatsApp, catatan manual, dan transfer pribadi.
        </p>
      </div>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <Card
            key={f.title}
            className="group border border-zinc-200 p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-zinc-900">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{f.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Buat komunitas",
      desc: "Daftar dalam 1 menit. Atur nama, logo, dan undang anggota lewat tautan.",
    },
    {
      n: "02",
      title: "Atur pocket dana",
      desc: "Pisahkan kas, iuran bulanan, arisan, dan dana event. Tentukan nominal dan jatuh tempo.",
    },
    {
      n: "03",
      title: "Anggota bayar & lihat",
      desc: "Setoran masuk via simulasi Midtrans. Saldo dan status tagihan terlihat real-time.",
    },
  ];
  return (
    <section id="cara" className="border-y border-zinc-200 bg-zinc-50/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Cara kerjanya
          </h2>
          <p className="mt-4 text-zinc-500">Tiga langkah sederhana, tanpa training panjang.</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-zinc-200 bg-white p-7">
              <div className="text-xs font-semibold tracking-widest text-indigo-600">{s.n}</div>
              <h3 className="mt-3 text-lg font-semibold text-zinc-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ForWho() {
  const list = [
    "Arisan keluarga & RT",
    "Pengurus RT / RW",
    "Komunitas alumni",
    "Komunitas hobi",
    "Paguyuban daerah",
    "Panitia event komunitas",
  ];
  return (
    <section id="untuk-siapa" className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Dibuat untuk komunitas yang lelah dengan cara lama
          </h2>
          <p className="mt-4 text-zinc-500">
            Bendahara tidak lagi mengejar pembayaran satu per satu. Anggota tahu pasti ke mana uang
            mengalir. Sejarah keuangan tidak hilang saat admin berganti.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3"
            >
              <CheckCircle2 className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium text-zinc-900">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div
        className="overflow-hidden rounded-3xl px-8 py-14 text-center text-white sm:px-14 bg-gradient-to-br from-indigo-600 to-violet-700 shadow-md"
      >
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Siap membuat komunitas Anda lebih transparan?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-indigo-100">
          Gratis untuk dicoba. Tanpa kartu kredit. Setup kurang dari 2 menit.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" variant="secondary" className="rounded-full px-6">
            <Link href="/register">Buat komunitas gratis</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-white/30 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/login">Masuk ke akun</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200/60 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-zinc-500 sm:flex-row">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <p>© {new Date().getFullYear()} Kyklos. Alat pencatatan & koordinasi komunitas.</p>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <AuthRedirect />
      <Nav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <ForWho />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
