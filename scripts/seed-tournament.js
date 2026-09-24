// One-off seed script: creates a single UPCOMING tournament so the
// registration/create-order route has something to attach squads to.
//
// Run with:  node -r dotenv/config scripts/seed-tournament.js dotenv_config_path=.env.local

import mongoose from 'mongoose';
import Tournament from '../lib/models/Tournament.js';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set — make sure dotenv loaded .env.local');
  }

  await mongoose.connect(uri);

  const existing = await Tournament.findOne({ status: 'UPCOMING' });
  if (existing) {
    console.log('An UPCOMING tournament already exists:', existing._id.toString());
    await mongoose.disconnect();
    return;
  }

  // Defaults to 24 hours from now — edit this or update the document
  // directly in Atlas once you know your real match schedule.
  const matchStartAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const tournament = await Tournament.create({
    title: 'BGMI Erangel Pro Cup',
    mapType: 'Erangel',
    entryFee: 120,
    prizePool: 1400,
    slotsTotal: 16,
    slotsFilled: 0,
    status: 'UPCOMING',
    matchStartAt,
  });

  console.log('Seeded tournament:', tournament._id.toString());
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});