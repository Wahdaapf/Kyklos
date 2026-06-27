import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreateCommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Buat Komunitas Baru</h1>
        <p className="text-sm text-zinc-500 mt-1">Lengkapi data berikut untuk membuat komunitas baru di Kyklos.</p>
      </div>
      <div>
        <Button asChild variant="outline">
          <Link href="/community">Kembali</Link>
        </Button>
      </div>
    </div>
  );
}
