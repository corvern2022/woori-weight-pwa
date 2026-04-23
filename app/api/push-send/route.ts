import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { targetUserId, title, body, icon } = await req.json();
    if (!targetUserId || !title) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", targetUserId)
      .single();

    if (error || !data) {
      return NextResponse.json({ ok: false, reason: "no subscription" });
    }

    const sub = JSON.parse(data.subscription);
    const payload = JSON.stringify({
      title,
      body: body ?? "",
      icon: icon ?? "/icons/icon-192.png",
    });

    await webpush.sendNotification(sub, payload);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("push-send error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
