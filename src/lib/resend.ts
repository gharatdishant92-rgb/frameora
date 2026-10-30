import { db } from '../db/index.ts';
import { notifications } from '../db/schema.ts';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  type: string;
  userId?: string | null;
}

export async function sendNotificationEmail({
  to,
  subject,
  html,
  type,
  userId,
}: SendEmailParams): Promise<{ success: boolean; id?: string }> {
  const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const apiKey = process.env.RESEND_API_KEY;

  let emailSent = false;

  if (apiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'FRAMEORA Studio <concierge@frameora.com>',
          to: [to],
          subject,
          html,
        }),
      });

      if (response.ok) {
        emailSent = true;
        console.log(`[Resend] Successfully dispatched email to ${to} (${subject})`);
      } else {
        const errorText = await response.text();
        console.warn(`[Resend] API returned status ${response.status}: ${errorText}`);
      }
    } catch (err) {
      console.error('[Resend] Failed to send email via API:', err);
    }
  } else {
    // Log simulation
    console.log(`[Email Dispatch - Resend Ready] To: ${to} | Subject: "${subject}" | Type: ${type}`);
    emailSent = true;
  }

  // Persist notification in database
  try {
    await db.insert(notifications).values({
      id: notifId,
      userId: userId || null,
      recipientEmail: to,
      type,
      title: subject,
      message: html.replace(/<[^>]*>?/gm, '').substring(0, 300),
      status: emailSent ? 'sent' : 'failed',
    });
  } catch (err) {
    console.error('Error saving notification record:', err);
  }

  return { success: emailSent, id: notifId };
}
