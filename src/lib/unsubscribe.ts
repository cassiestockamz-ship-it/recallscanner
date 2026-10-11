import crypto from "node:crypto";

/** Checks t = HMAC-SHA256(UNSUBSCRIBE_SECRET, id) as hex, the token scripts/recall-alerts.mjs puts in each email. */
export function validUnsubscribeToken(id: string | undefined, t: string | undefined): boolean {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret || !id || !t || !/^\d+$/.test(id) || !/^[0-9a-f]{64}$/i.test(t)) return false;
  const expected = crypto.createHmac("sha256", secret).update(id).digest();
  return crypto.timingSafeEqual(expected, Buffer.from(t, "hex"));
}
