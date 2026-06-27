import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Agenda & Event Komunitas</h1>
          <p className="text-sm text-zinc-500 mt-1">Lihat jadwal kegiatan terdekat, pertemuan warga, dan konfirmasi kehadiran (RSVP).</p>
        </div>
        <Button>Buat Event Baru</Button>
      </div>
    </div>
  );
}
