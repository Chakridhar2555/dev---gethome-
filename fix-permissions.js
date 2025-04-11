const { MongoClient } = require('mongodb');

async function fixPermissions() {
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
    
    // Update all admin users with proper permissions
    const result = await db.collection('users').updateMany(
      { $or: [{ role: 'Administrator' }, { role: 'admin' }] },
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
          }
        } 
      }
    );
    
    console.log(`Updated ${result.modifiedCount} admin users with proper permissions`);
    
    // Find the specific admin user we created
    const adminUser = await db.collection('users').findOne({ email: 'admin1@gmail.com' });
    
    if (adminUser) {
      console.log('Admin1 user found:');
      console.log('Role:', adminUser.role);
      console.log('Permissions:', JSON.stringify(adminUser.permissions, null, 2));
    } else {
      console.log('Admin1 user not found');
    }
    
    // Fix potential permissions format issues across all users
    const usersWithoutPermissions = await db.collection('users').find({ permissions: { $exists: false } }).toArray();
    
    console.log(`Found ${usersWithoutPermissions.length} users without permissions`);
    
    for (const user of usersWithoutPermissions) {
      const isAdmin = user.role === 'Administrator' || user.role === 'admin';
      
      await db.collection('users').updateOne(
        { _id: user._id },
        { 
          $set: { 
            permissions: {
              dashboard: isAdmin || true,
              leads: isAdmin || true,
              calendar: isAdmin || true,
              email: isAdmin || true,
              settings: isAdmin || true,
              inventory: isAdmin || true,
              favorites: isAdmin || true,
              mls: isAdmin || true
            }
          } 
        }
      );
    }
    
    console.log(`Added default permissions to ${usersWithoutPermissions.length} users`);
    
    await client.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixPermissions(); 