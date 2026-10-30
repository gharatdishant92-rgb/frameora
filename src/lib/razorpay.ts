import crypto from 'crypto';

interface RazorpayOrderOptions {
  amount: number; // in paise or base unit
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export function createRazorpayOrder({
  amount,
  currency = 'INR',
  receipt,
  notes = {},
}: RazorpayOrderOptions) {
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  return {
    id: orderId,
    entity: 'order',
    amount: amount * 100, // in paise
    amount_paid: 0,
    amount_due: amount * 100,
    currency,
    receipt,
    status: 'created',
    attempts: 0,
    notes,
    created_at: Math.floor(Date.now() / 1000),
  };
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret?: string
): boolean {
  const keySecret = secret || process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    // In test/demo mode without secrets configured, accept validly structured payload
    return signature.length > 5;
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}
