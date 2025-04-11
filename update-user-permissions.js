const { MongoClient, ObjectId } = require('mongodb');

async function updateUserPermissions() {
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
    
    // 1. Update admin users with all permissions
    const adminResult = await db.collection('users').updateMany(
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
    
    console.log(`Updated ${adminResult.modifiedCount} admin users with proper permissions`);
    
    // 2. Get all non-admin users
    const nonAdminUsers = await db.collection('users').find({
      $nor: [{ role: 'Administrator' }, { role: 'admin' }]
    }).toArray();
    
    console.log(`Found ${nonAdminUsers.length} non-admin users`);
    
    // 3. Update non-admin users to have correct permissions structure
    for (const user of nonAdminUsers) {
      // Default: all permissions false
      const newPermissions = {
        dashboard: false,
        leads: false,
        calendar: false,
        email: false,
        settings: false,
        inventory: false,
        favorites: false,
        mls: false
      };
      
      // If the user has existing permissions, only set to true the ones explicitly set to true
      if (user.permissions) {
        Object.keys(user.permissions).forEach(key => {
          if (user.permissions[key] === true) {
            // Only set to true if the permission was explicitly true before
            newPermissions[key] = true;
          }
        });
      }
      
      // Update the user with the corrected permissions
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { permissions: newPermissions } }
      );
      
      console.log(`Updated permissions for user: ${user.name || user.email}`);
    }
    
    // 4. Verify the specific user from the screenshot (user@gmail.com)
    const testUser = await db.collection('users').findOne({ email: 'user@gmail.com' });
    if (testUser) {
      console.log('Test user permissions:', JSON.stringify(testUser.permissions, null, 2));
      
      // Update this user to only have dashboard permission
      await db.collection('users').updateOne(
        { email: 'user@gmail.com' },
        { 
          $set: { 
            permissions: {
              dashboard: true,
              leads: false,
              calendar: false,
              email: false,
              settings: false,
              inventory: false,
              favorites: false,
              mls: false
            }
          } 
        }
      );
      
      console.log('Updated test user to only have dashboard permission');
    }
    
    await client.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

updateUserPermissions(); 