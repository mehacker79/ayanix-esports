import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/db';
import Tournament from '@/lib/models/Tournament';

// Called from the browser right after Razorpay's checkout handler fires with
// a successful payment. This does the SAME signature check as the webhook
// (app/api/webhook/razorpay/route.js) but keyed off order_id + payment_id,
// which is what Razorpay's client-side handler gives us — not the webhook
// secret, which only ever reaches the server. Keeping both routes is
// intentional: this one gives the user instant confirmation, the webhook is
// the source of truth if the browser tab closes before this call lands.
export async function POST(request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      squadId,
      tournamentId,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !squadId || !tournamentId) {
      return NextResponse.json({ error: 'Missing payment verification fields.' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment signature mismatch — could not verify this payment.' }, { status: 400 });
    }

    await connectToDatabase();
    const tournament = await Tournament.findById(tournamentId);
    const squad = tournament?.confirmedSquads.id(squadId);

    if (!squad) {
      return NextResponse.json({ error: 'Squad registration not found.' }, { status: 404 });
    }

    if (squad.paymentStatus !== 'PAID') {
      squad.paymentStatus = 'PAID';
      squad.razorpayPaymentId = razorpay_payment_id;
      await tournament.save();
    }

    return NextResponse.json({
      success: true,
      squadName: squad.squadName,
      game: tournament.game,
      title: tournament.title,
      matchStartAt: tournament.matchStartAt,
    });
  } catch (error) {
    console.error('Payment verification failure:', error);
    return NextResponse.json({ error: 'Could not verify payment. Contact support with your payment ID.' }, { status: 500 });
  }
}
