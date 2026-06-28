import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { event_id, profile_id, status, community_id } = await req.json();

    if (!event_id || !profile_id || !status || !community_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminServerClient();

    // 1. Fetch event details
    const { data: ev, error: evErr } = await supabase
      .from("events")
      .select("*")
      .eq("id", event_id)
      .single();

    if (evErr || !ev) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const dbStatus = status === "yes" ? "attending" : "absent";

    // 2. Upsert RSVP
    const { error: rsvpErr } = await supabase
      .from("event_rsvps")
      .upsert(
        { event_id, profile_id, status: dbStatus, updated_at: new Date().toISOString() },
        { onConflict: "event_id,profile_id" }
      );

    if (rsvpErr) {
      return NextResponse.json({ error: rsvpErr.message }, { status: 500 });
    }

    // 3. If attending and event is paid, ensure dues_bill exists
    if (dbStatus === "attending" && ev.price && Number(ev.price) > 0) {
      const { data: existingBill } = await supabase
        .from("dues_bills")
        .select("id")
        .eq("community_id", community_id)
        .eq("profile_id", profile_id)
        .ilike("title", `%${ev.title}%`)
        .maybeSingle();

      if (!existingBill) {
        const eventDueDate = ev.event_date
          ? new Date(ev.event_date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

        const { error: billErr } = await supabase
          .from("dues_bills")
          .insert({
            community_id: community_id,
            profile_id: profile_id,
            title: `Tiket: ${ev.title}`,
            amount: Number(ev.price),
            due_date: eventDueDate,
            status: "unpaid",
            pocket_id: ev.pocket_id || null,
          });

        if (billErr) {
          return NextResponse.json({ error: billErr.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
