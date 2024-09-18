import mongoose from 'mongoose';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect('mongodb://localhost:27017/test_db');
  }
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});
