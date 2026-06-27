import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DiscussionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DiscussionDetailPage({ params }: DiscussionDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Diskusi Topik: {id}</h1>
        <p className="text-sm text-zinc-500 mt-1">Ikuti diskusi, sampaikan pendapat, atau isi polling pada topik ini.</p>
      </div>
      <div>
        <Button asChild variant="outline">
          <Link href="/discussion">Kembali</Link>
        </Button>
      </div>
    </div>
  );
}
