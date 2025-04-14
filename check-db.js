const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkDatabase() {
  console.log('Starting database check...');
  console.log('MongoDB URI:', process.env.MONGODB_URI);
  
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    const db = client.db();
    const users = await db.collection('users').find({}).toArray();
    
    console.log('Total users in database:', users.length);
    console.log('Users:', JSON.stringify(users, null, 2));
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await client.close();
  }
}

checkDatabase(); 