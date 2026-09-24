import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectToDatabase from '@/lib/db';
import Tournament from '@/lib/models/Tournament';
import User from '@/lib/models/User';

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const { email, squadName, members, game } = await request.json();

    if (!email || !squadName) {
      return NextResponse.json(
        { error: 'Email and squad name are required' },
        { status: 400 }
      );
    }

    if (!members || members.length !== 4 || members.some((m) => !m?.ign?.trim() || !m?.charId?.trim())) {
      return NextResponse.json(
        { error: 'All 4 squad members need an IGN and character ID.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Find or create the captain's user record
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({ email: email.toLowerCase() });
    }

    // 2. Find the currently open tournament FOR THIS GAME — without the game
    //    filter, a BGMI join could silently land the payment on an open
    //    Free Fire tournament (or vice versa) whenever both are live at once.
    const tournamentQuery = { status: { $in: ['UPCOMING', 'LIVE'] } };
    if (game) tournamentQuery.game = game;

    const tournament = await Tournament.findOne(tournamentQuery).sort({ matchStartAt: 1 });
    if (!tournament) {
      return NextResponse.json(
        { error: 'No active tournament found for this game' },
        { status: 404 }
      );
    }

    if (tournament.slotsFilled >= tournament.slotsTotal) {
      return NextResponse.json(
        { error: 'This tournament is already full' },
        { status: 409 }
      );
    }

    // 3. Stage the registration in-memory so we get a squad _id
    //    before creating the Razorpay order (needed for the webhook notes).
    //    Nothing is written to the DB until tournament.save() below.
    tournament.confirmedSquads.push({
      squadName,
      captainId: user._id,
      captainEmail: user.email,
      members: members || [],
      paymentStatus: 'PENDING',
    });
    const stagedRegistration =
      tournament.confirmedSquads[tournament.confirmedSquads.length - 1];

    // 4. Create the real Razorpay order
    const amountInPaise = tournament.entryFee * 100;

    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `${tournament._id}_${stagedRegistration._id}`,
      notes: {
        squadId: stagedRegistration._id.toString(),
        tournamentId: tournament._id.toString(),
      },
    });

    // 5. Only now persist the PENDING row — the order exists in Razorpay too
    await tournament.save();

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      squadId: stagedRegistration._id,
      tournamentId: tournament._id,
      game: tournament.game,
      title: tournament.title,
    });
  } catch (error) {
    console.error('Order creation failure:', error);
    return NextResponse.json(
      { error: 'Internal server error while creating order' },
      { status: 500 }
    );
  }
}