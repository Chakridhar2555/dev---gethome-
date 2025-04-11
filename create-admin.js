const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    // Get MongoDB URI from .env file
    const fs = require('fs');
    const envContent = fs.readFileSync('.env', 'utf8');
    const mongoUriMatch = envContent.match(/MONGODB_URI=(.+)/);
    
    if (!mongoUriMatch) {
      console.error('MONGODB_URI not found in .env file');
      return;
    }
    
    const uri = mongoUriMatch[1];
    const client = new MongoClient(uri);
    
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: 'admin1@gmail.com' });
    
    if (existingUser) {
      console.log('User already exists. Updating to admin role...');
      
      // Update user to admin role with full permissions
      await db.collection('users').updateOne(
        { email: 'admin1@gmail.com' },
        { 
          $set: { 
            role: 'Administrator',
            permissions: {
              dashboard: true,
              leads: true,
              calendar: true,
              email: true,
              settings: true,
              inventory: true,
              favorites: true,
              mls: true
            },
            updatedAt: new Date()
          } 
        }
      );
      
      console.log('User updated to admin successfully');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('admin1', 10);
      
      // Create admin user
      await db.collection('users').insertOne({
        name: 'Admin User',
        email: 'admin1@gmail.com',
        password: hashedPassword,
        role: 'Administrator',
        permissions: {
          dashboard: true,
          leads: true,
          calendar: true,
          email: true,
          settings: true,
          inventory: true,
          favorites: true,
          mls: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Admin user created successfully');
    }
    
    await client.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminUser(); 