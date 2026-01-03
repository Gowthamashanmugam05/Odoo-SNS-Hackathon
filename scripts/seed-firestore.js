const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString());
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'odoo-sns'
});

const db = admin.firestore();

async function seedDatabase() {
  try {
    console.log('Seeding Firestore database with sample data...');

    // Sample user/profile
    const userId = 'user_demo_001';
    await db.collection('profiles').doc(userId).set({
      name: 'Demo User',
      email: 'demo@example.com',
      created_at: new Date().toISOString(),
      updatedAt: new Date()
    });
    console.log('✅ Created profile');

    // Sample trip
    const tripId = 'trip_001';
    await db.collection('trips').doc(tripId).set({
      user_id: userId,
      name: 'Europe Adventure 2025',
      description: 'Amazing 14-day European tour',
      start_date: '2025-06-01',
      end_date: '2025-06-14',
      cover_image: null,
      total_budget: 5000,
      is_public: true,
      share_token: 'share_abc123',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Created trip');

    // Sample cities
    const cities = [
      { name: 'Paris', country: 'France', arrival: '2025-06-01', departure: '2025-06-04', index: 0 },
      { name: 'Rome', country: 'Italy', arrival: '2025-06-05', departure: '2025-06-09', index: 1 },
      { name: 'Barcelona', country: 'Spain', arrival: '2025-06-10', departure: '2025-06-14', index: 2 }
    ];

    const cityDocs = {};
    for (const city of cities) {
      const cityDocId = `city_${city.name.toLowerCase()}`;
      await db.collection('trip_cities').doc(cityDocId).set({
        trip_id: tripId,
        city_name: city.name,
        country: city.country,
        arrival_date: city.arrival,
        departure_date: city.departure,
        order_index: city.index,
        notes: `Explore ${city.name}`,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      cityDocs[city.name] = cityDocId;
      console.log(`✅ Created city: ${city.name}`);
    }

    // Sample activities
    const activities = [
      { city: 'Paris', name: 'Eiffel Tower Tour', cost: 25, time: '09:00' },
      { city: 'Paris', name: 'Louvre Museum', cost: 20, time: '14:00' },
      { city: 'Rome', name: 'Colosseum Visit', cost: 18, time: '10:00' },
      { city: 'Rome', name: 'Vatican Tour', cost: 30, time: '15:00' },
      { city: 'Barcelona', name: 'Sagrada Familia', cost: 26, time: '11:00' },
      { city: 'Barcelona', name: 'Park Güell', cost: 22, time: '16:00' }
    ];

    for (const activity of activities) {
      const activityId = `activity_${activity.city}_${activity.name.replace(/\s+/g, '_').toLowerCase()}`;
      await db.collection('activities').doc(activityId).set({
        trip_city_id: cityDocs[activity.city],
        name: activity.name,
        description: `Experience ${activity.name}`,
        activity_date: '2025-06-05',
        start_time: activity.time,
        end_time: null,
        cost: activity.cost,
        category: 'Sightseeing',
        location: activity.city,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ Created activity: ${activity.name}`);
    }

    console.log('\n✨ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
