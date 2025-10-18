// Script to create a GROUP_ADMIN user for testing
import mongoose from 'mongoose';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Site from '../models/Site.js';
import dotenv from 'dotenv';

dotenv.config();

async function setupGroupAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create a test group
    const group = await Group.create({
      name: 'Test Group',
      code: 'test-group',
      contactEmail: 'admin@testgroup.com',
      settings: {
        defaultSyncMode: 'auto',
        weekStart: 'monday'
      }
    });
    console.log('✅ Group created:', group.name);

    // Create a test site
    const site = await Site.create({
      groupId: group._id,
      siteName: 'Test EHPAD',
      type: 'ehpad',
      address: '123 Test Street, Test City',
      syncMode: 'auto',
      isActive: true
    });
    console.log('✅ Site created:', site.siteName);

    // Create a GROUP_ADMIN user
    const groupAdmin = await User.create({
      name: 'Group Admin',
      email: 'groupadmin@test.com',
      password: 'password123',
      role: 'admin', // Base role
      roles: ['GROUP_ADMIN'], // Multi-site role
      groupId: group._id,
      businessName: 'Test Group Admin',
      phone: '0123456789'
    });
    console.log('✅ GROUP_ADMIN user created:', groupAdmin.email);

    // Create a SITE_MANAGER user
    const siteManager = await User.create({
      name: 'Site Manager',
      email: 'sitemanager@test.com',
      password: 'password123',
      role: 'collectivite',
      roles: ['SITE_MANAGER'],
      groupId: group._id,
      siteId: site._id,
      businessName: 'Test Site Manager',
      phone: '0987654321'
    });
    console.log('✅ SITE_MANAGER user created:', siteManager.email);

    console.log('\n🎉 Setup complete!');
    console.log('You can now test the group dashboard with:');
    console.log('Email: groupadmin@test.com');
    console.log('Password: password123');
    console.log('\nGroup ID:', group._id.toString());
    console.log('Site ID:', site._id.toString());

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

setupGroupAdmin();
