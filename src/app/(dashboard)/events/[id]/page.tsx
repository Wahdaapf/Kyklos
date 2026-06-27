import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Agenda Event: {id}</h1>
        <p className="text-sm text-zinc-500 mt-1">Detail agenda, rincian lokasi, waktu, dan data konfirmasi RSVP anggota.</p>
      </div>
      <div>
        <Button asChild variant="outline">
          <Link href="/events">Kembali</Link>
        </Button>
      </div>
    </div>
  );
}
