import * as React from "react";
import Link from "next/link";
import {
  Wallet,
  BookOpen,
  Calendar,
  MessageSquare,
  User,
  LogOut,
  Sparkles,
  DollarSign,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200/80 bg-white p-5 sticky top-0 h-screen justify-between">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2 px-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900">Kyklos</span>
          </Link>
          
          <nav className="space-y-1">
            <SidebarLink href="/wallet" icon={Wallet} label="Pocket Kas" />
            <SidebarLink href="/ledger" icon={BookOpen} label="Buku Kas" />
            <SidebarLink href="/contribution" icon={DollarSign} label="Iuran & Kas" />
            <SidebarLink href="/discussion" icon={MessageSquare} label="Diskusi" />
            <SidebarLink href="/events" icon={Calendar} label="Event & RSVP" />
            <SidebarLink href="/profile" icon={User} label="Profil Saya" />
          </nav>
        </div>
        
        <div>
          <Button variant="ghost" className="w-full justify-start text-zinc-500 hover:text-red-600 hover:bg-red-50/50 rounded-xl" asChild>
            <Link href="/login">
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Link>
          </Button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="md:hidden flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <Sparkles className="h-4 w-4" strokeWidth={2.25} />
            </div>
            <span className="text-base font-bold tracking-tight text-zinc-900">Kyklos</span>
          </Link>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </header>
        
        {/* Content Body */}
        <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
