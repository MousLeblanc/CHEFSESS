// Test script for group dashboard functionality
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Site from '../models/Site.js';
import dotenv from 'dotenv';

dotenv.config();

async function testGroupDashboard() {
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

    // Test group stats endpoint
    const statsResponse = await fetch(`http://localhost:5000/api/groups/${user.groupId}/stats`, {
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

    // Test group sites endpoint
    const sitesResponse = await fetch(`http://localhost:5000/api/groups/${user.groupId}/sites`, {
      headers: {
        'Cookie': cookies
      }
    });

    if (!sitesResponse.ok) {
      console.error('❌ Group sites failed:', await sitesResponse.text());
      return;
    }

    const sitesData = await sitesResponse.json();
    console.log('✅ Group sites successful:', sitesData.length, 'sites found');

    // Test group users endpoint
    const usersResponse = await fetch(`http://localhost:5000/api/groups/${user.groupId}/users`, {
      headers: {
        'Cookie': cookies
      }
    });

    if (!usersResponse.ok) {
      console.error('❌ Group users failed:', await usersResponse.text());
      return;
    }

    const usersData = await usersResponse.json();
    console.log('✅ Group users successful:', usersData.length, 'users found');

    console.log('\n🎉 All group dashboard API endpoints are working correctly!');
    console.log('You can now access the group dashboard at: http://localhost:5000/group-dashboard.html');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

testGroupDashboard();
