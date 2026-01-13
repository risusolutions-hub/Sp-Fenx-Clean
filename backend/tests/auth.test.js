const request = require('supertest');

// This is a minimal integration test skeleton. Ensure the backend is running on PORT 4000 before running.
const baseUrl = process.env.TEST_SERVER_URL || 'http://localhost:4000';

describe('Auth API', () => {
  test('POST /api/auth/login returns 400 when missing payload', async () => {
    const res = await request(baseUrl).post('/api/auth/login').send({});
    expect([400, 422]).toContain(res.status);
  });

  test('POST /api/auth/login returns 401 for invalid credentials', async () => {
    const res = await request(baseUrl).post('/api/auth/login').send({ identifier: 'noone', password: 'bad' });
    expect([401, 400]).toContain(res.status);
  });
});
