import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DiscussionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Forum Diskusi Komunitas</h1>
          <p className="text-sm text-zinc-500 mt-1">Diskusikan topik, buat polling, atau koordinasi pengumuman penting.</p>
        </div>
        <Button>Buat Diskusi Baru</Button>
      </div>
    </div>
  );
}
