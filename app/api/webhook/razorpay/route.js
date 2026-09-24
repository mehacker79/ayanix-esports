import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/db';
import Tournament from '@/lib/models/Tournament';

export async function POST(request) {
  try {
    const rawPayloadBody = await request.text();
    const razorpaySignatureHeader = request.headers.get('x-razorpay-signature');

    if (!razorpaySignatureHeader) {
      return NextResponse.json({ error: 'Security Signature missing' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawPayloadBody)
      .digest('hex');

    if (expectedSignature !== razorpaySignatureHeader) {
      return NextResponse.json({ error: 'Integrity breach - Bad Signature verification' }, { status: 403 });
    }

    const verificationPayload = JSON.parse(rawPayloadBody);

    if (verificationPayload.event === 'order.paid' || verificationPayload.event === 'payment.captured') {
      const payloadTransactionDetails = verificationPayload.payload.payment.entity;
      const verifiedMetadata = payloadTransactionDetails.notes;

      const referenceSquadId = verifiedMetadata?.squadId;
      const associatedTournamentId = verifiedMetadata?.tournamentId;

      if (referenceSquadId && associatedTournamentId) {
        await connectToDatabase();

        const tournament = await Tournament.findById(associatedTournamentId);
        const squad = tournament?.confirmedSquads.id(referenceSquadId);

        if (squad && squad.paymentStatus !== 'PAID') {
          squad.paymentStatus = 'PAID';
          squad.razorpayPaymentId = payloadTransactionDetails.id;
          await tournament.save();
          console.log(`Squad ${referenceSquadId} marked PAID for tournament ${associatedTournamentId}`);
        }
      }
    }

    return NextResponse.json({ status: 'Webhook Handled successfully' }, { status: 200 });
  } catch (errorException) {
    console.error('Critical System Webhook Failure:', errorException);
    return NextResponse.json({ error: 'Internal Process Pipeline Fault' }, { status: 500 });
  }
}