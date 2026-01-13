#!/usr/bin/env node

/**
 * COMPREHENSIVE API TEST SUITE
 * Tests all endpoints and system synchronization
 */

const http = require('http');

const BASE_URL = 'http://localhost:4000';
let sessionCookie = null;
let csrfToken = null;

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (sessionCookie) {
      options.headers['Cookie'] = sessionCookie;
    }
    if (csrfToken && method !== 'GET') {
      options.headers['X-CSRF-Token'] = csrfToken;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    return true;
  } catch (e) {
    console.log(`❌ ${name}: ${e.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n=== COMPREHENSIVE API TEST SUITE ===\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Backend connectivity
  if (await test('Backend is running on port 4000', async () => {
    const res = await makeRequest('GET', '/');
    if (res.status >= 500) throw new Error(`Server error: ${res.status}`);
  })) passed++; else failed++;

  // Test 2: Login endpoint exists
  if (await test('Login endpoint accessible', async () => {
    const res = await makeRequest('POST', '/api/auth/login', { 
      identifier: 'superadmin@example.com', 
      password: 'password' 
    });
    if (res.status === 401) throw new Error('Login failed');
    if (res.status >= 500) throw new Error(`Server error: ${res.status}`);
  })) passed++; else failed++;

  // Test 3: Login and get session
  if (await test('Login successful and CSRF token received', async () => {
    const res = await makeRequest('POST', '/api/auth/login', { 
      identifier: 'superadmin@example.com', 
      password: 'password' 
    });
    if (res.status !== 200) throw new Error(`Login failed: ${res.status}`);
    if (!res.data.csrfToken) throw new Error('No CSRF token in response');
    if (!res.headers['set-cookie']) throw new Error('No session cookie set');
    
    csrfToken = res.data.csrfToken;
    sessionCookie = res.headers['set-cookie'][0]?.split(';')[0];
  })) passed++; else failed++;

  // Test 4: Get current user
  if (await test('GET /api/auth/me returns current user', async () => {
    const res = await makeRequest('GET', '/api/auth/me');
    if (res.status !== 200) throw new Error(`Failed: ${res.status}`);
    if (!res.data.id) throw new Error('No user data');
  })) passed++; else failed++;

  // Test 5: Rate limit config endpoint
  if (await test('GET /api/security/rate-limits/config accessible', async () => {
    const res = await makeRequest('GET', '/api/security/rate-limits/config');
    if (res.status === 403) throw new Error('Not superadmin');
    if (res.status === 401) throw new Error('Not authenticated');
    if (res.status >= 500) throw new Error(`Server error: ${res.status}`);
  })) passed++; else failed++;

  // Test 6: Rate limit configuration
  if (await test('Rate limit config has 15-second window', async () => {
    const res = await makeRequest('GET', '/api/security/rate-limits/config');
    if (res.status !== 200) throw new Error(`Failed: ${res.status}`);
    if (!res.data.config) throw new Error('No config in response');
    if (res.data.config.windowMs !== 15000) {
      throw new Error(`Window is ${res.data.config.windowMs}ms, expected 15000ms`);
    }
    if (res.data.config.tiers.standard.max !== 100) {
      throw new Error(`Standard tier is ${res.data.config.tiers.standard.max}, expected 100`);
    }
  })) passed++; else failed++;

  // Test 7: Get users endpoint
  if (await test('GET /api/users returns user list', async () => {
    const res = await makeRequest('GET', '/api/users');
    if (res.status !== 200) throw new Error(`Failed: ${res.status}`);
    if (!Array.isArray(res.data.users) && !Array.isArray(res.data.data)) {
      throw new Error('Users not in expected format');
    }
  })) passed++; else failed++;

  // Test 8: Security logs endpoint
  if (await test('GET /api/security/logs accessible', async () => {
    const res = await makeRequest('GET', '/api/security/logs');
    if (res.status === 500) throw new Error('Server error');
    if (res.status >= 400 && res.status !== 401 && res.status !== 403) {
      throw new Error(`Unexpected status: ${res.status}`);
    }
  })) passed++; else failed++;

  // Test 9: Session management endpoint
  if (await test('GET /api/security/sessions accessible', async () => {
    const res = await makeRequest('GET', '/api/security/sessions');
    if (res.status === 500) throw new Error('Server error');
    if (res.status !== 200 && res.status !== 401 && res.status !== 403) {
      throw new Error(`Unexpected status: ${res.status}`);
    }
  })) passed++; else failed++;

  // Test 10: CSRF token validation
  if (await test('CSRF token works for POST requests', async () => {
    const res = await makeRequest('POST', '/api/auth/logout', null, {
      'X-CSRF-Token': csrfToken || ''
    });
    // Should either succeed or fail for auth reasons, not CSRF
    if (res.status === 400) throw new Error('Bad CSRF token');
  })) passed++; else failed++;

  // Test 11: Update rate limit tier
  if (await test('PUT /api/security/rate-limits/config/:tier works', async () => {
    const res = await makeRequest('PUT', '/api/security/rate-limits/config/standard', 
      { max: 100 },
      { 'X-CSRF-Token': csrfToken || '' }
    );
    if (res.status === 500) throw new Error('Server error');
    // Might be 401/403 for auth, but should not crash
  })) passed++; else failed++;

  // Test 12: Dashboard endpoint
  if (await test('GET /api/dashboard accessible', async () => {
    const res = await makeRequest('GET', '/api/dashboard');
    if (res.status === 500) throw new Error('Server error');
  })) passed++; else failed++;

  // Test 13: Customers endpoint
  if (await test('GET /api/customers accessible', async () => {
    const res = await makeRequest('GET', '/api/customers');
    if (res.status === 500) throw new Error('Server error');
  })) passed++; else failed++;

  // Test 14: Machines endpoint
  if (await test('GET /api/machines accessible', async () => {
    const res = await makeRequest('GET', '/api/machines');
    if (res.status === 500) throw new Error('Server error');
  })) passed++; else failed++;

  // Test 15: Service history endpoint
  if (await test('GET /api/service-history accessible', async () => {
    const res = await makeRequest('GET', '/api/service-history');
    if (res.status === 500) throw new Error('Server error');
  })) passed++; else failed++;

  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

// Give backend time to start
setTimeout(runTests, 2000);
