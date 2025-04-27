const { MongoClient } = require('mongodb');

let cachedDb = null;

async function connectDB() {
  if (cachedDb) {
    return cachedDb;
  }

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db();
  cachedDb = db;
  return db;
}

module.exports = { connectDB };
