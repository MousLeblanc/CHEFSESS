// Test script to verify group dashboard access
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Site from '../models/Site.js';
import dotenv from 'dotenv';

dotenv.config();

async function testGroupDashboardAccess() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the test group admin user
    const user = await User.findOne({ email: 'groupadmin@test.com' });
    if (!user) {
      console.error('❌ Test user not found');
      return;
    }

    console.log('👤 Test user found:', user.name);
    console.log('   - GroupId:', user.groupId);
    console.log('   - Roles:', user.roles);

    // Test login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'groupadmin@test.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.error('❌ Login failed:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');

    // Get cookies from login response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('🍪 Cookies received:', cookies ? 'Yes' : 'No');

    // Test /me endpoint
    const meResponse = await fetch('http://localhost:5000/api/auth/me', {
      headers: {
        'Cookie': cookies
      }
    });

    if (!meResponse.ok) {
      console.error('❌ /me endpoint failed:', await meResponse.text());
      return;
    }

    const meData = await meResponse.json();
    console.log('✅ /me endpoint successful');
    console.log('   - User name:', meData.user.name);
    console.log('   - User roles:', meData.user.roles);
    console.log('   - User groupId:', meData.user.groupId);

    // Test group dashboard page access
    const dashboardResponse = await fetch('http://localhost:5000/group-dashboard.html', {
      headers: {
        'Cookie': cookies
      }
    });

    if (!dashboardResponse.ok) {
      console.error('❌ Group dashboard access failed:', dashboardResponse.status, dashboardResponse.statusText);
      return;
    }

    console.log('✅ Group dashboard page accessible');
    console.log('   - Status:', dashboardResponse.status);
    console.log('   - Content length:', dashboardResponse.headers.get('content-length'));

    // Test group stats endpoint
    const statsResponse = await fetch(`http://localhost:5000/api/groups/${meData.user.groupId}/stats`, {
      headers: {
        'Cookie': cookies
      }
    });

    if (!statsResponse.ok) {
      console.error('❌ Group stats failed:', await statsResponse.text());
      return;
    }

    const statsData = await statsResponse.json();
    console.log('✅ Group stats successful:', statsData);

    console.log('\n🎉 Group dashboard access test completed successfully!');
    console.log('You can now access the group dashboard at: http://localhost:5000/group-dashboard.html');
    console.log('Make sure to login with: groupadmin@test.com / password123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

testGroupDashboardAccess();
