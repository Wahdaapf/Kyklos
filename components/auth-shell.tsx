import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
}

export function AuthShell({ children, title, subtitle, footer }: AuthShellProps) {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-zinc-50 px-4 py-12">
      {/* Background ambient glow */}
      <div
        className="absolute inset-0 -z-10 opacity-70"
        style={{ background: "radial-gradient(circle at top, rgba(99, 102, 241, 0.08) 0%, transparent 60%)" }}
      />
      
      <div className="w-full max-w-[440px] space-y-6">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Sparkles className="h-6 w-6" strokeWidth={2.25} />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">Kyklos</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
          <p className="mt-1.5 text-sm text-zinc-500">{subtitle}</p>
        </div>
        
        <div className="border border-zinc-200/80 bg-white rounded-2xl p-6 sm:p-8 shadow-md">
          {children}
        </div>
        
        {footer && (
          <p className="text-center text-sm text-zinc-500">
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}
