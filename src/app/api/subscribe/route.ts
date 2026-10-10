import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, vehicle, make, model, year, vin } = await request.json();
    const text = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);
    const yearNum = Number.parseInt(String(year ?? ""), 10);
    const vinText = text(vin, 17);

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Store in Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // Fallback: log to console if Supabase not configured yet
      console.log(`[EMAIL SIGNUP] ${email} · vehicle: ${vehicle || "none"}`);
      return NextResponse.json({ success: true });
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/recall_subscribers`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        email,
        vehicle: text(vehicle, 120),
        make: text(make, 60),
        model: text(model, 80),
        year: yearNum >= 1950 && yearNum <= 2100 ? yearNum : null,
        vin: vinText && /^[A-HJ-NPR-Z0-9]{17}$/i.test(vinText) ? vinText.toUpperCase() : null,
        site_id: "recallscanner",
        subscribed_at: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      // Duplicate email is OK — treat as success
      if (text.includes("duplicate") || text.includes("unique")) {
        return NextResponse.json({ success: true });
      }
      console.error("Supabase insert error:", text);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
