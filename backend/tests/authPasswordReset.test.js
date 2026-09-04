const request = require('supertest');
const app = require('../src/app');

describe('Auth - Password Reset & Profile Endpoints', () => {
  it('rejects forgot password with empty identifier', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ identifier: '' });

    expect(res.status).toBe(400);
  });

  it('handles forgot password request gracefully for any identifier', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ identifier: 'test_user_xyz@example.com' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('rejects invalid verification code', async () => {
    const res = await request(app)
      .post('/api/auth/verify-reset-code')
      .send({ identifier: 'test_user_xyz@example.com', code: '000000' });

    expect(res.status).toBe(400);
  });

  it('rejects short new password on reset', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({
        identifier: 'test_user_xyz@example.com',
        code: '123456',
        newPassword: 'short',
      });

    expect(res.status).toBe(400);
  });

  it('rejects unauthorized access to profile without JWT token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });
});
