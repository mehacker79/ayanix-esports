import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tournament from '@/lib/models/Tournament';

export async function POST(req) {
  try {
    await connectDB();
    const { squadName, captainEmail, players } = await req.json();

    if (!squadName || !captainEmail || players?.length !== 4) {
      return NextResponse.json({ error: 'Please provide valid details for all 4 players.' }, { status: 400 });
    }

    const mockOrderId = `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const newSquad = await Tournament.create({
      squadName,
      captainEmail,
      players,
      razorpayOrderId: mockOrderId
    });

    return NextResponse.json({ 
      success: true, 
      orderId: mockOrderId,
      teamId: newSquad._id 
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Server Error. Please try again.' }, { status: 500 });
  }
}