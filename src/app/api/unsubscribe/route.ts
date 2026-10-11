import { NextRequest, NextResponse } from "next/server";
import { validUnsubscribeToken } from "@/lib/unsubscribe";

// POST only: the confirm button on /unsubscribe, or a mail client's one-click
// List-Unsubscribe-Post (id and t in the query string). A GET never changes anything,
// so link scanners that open every URL in an email cannot unsubscribe anyone.
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  let id = url.searchParams.get("id") ?? undefined;
  let t = url.searchParams.get("t") ?? undefined;
  try {
    const form = await request.formData();
    id = (form.get("id") as string | null) ?? id;
    t = (form.get("t") as string | null) ?? t;
  } catch {
    // no form body (one-click POST): use the query string
  }

  const back = (state: string) => NextResponse.redirect(new URL(`/unsubscribe?${state}`, url.origin), 303);
  if (!validUnsubscribeToken(id, t)) return back("invalid=1");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return back("error=1");

  const res = await fetch(
    `${supabaseUrl}/rest/v1/recall_subscribers?id=eq.${id}&unsubscribed_at=is.null`,
    {
      method: "PATCH",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ unsubscribed_at: new Date().toISOString() }),
    }
  );
  if (!res.ok) {
    console.error("Unsubscribe update error:", await res.text());
    return back("error=1");
  }
  return back("done=1");
}
