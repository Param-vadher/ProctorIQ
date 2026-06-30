import request from 'supertest';
import app from '../src/app';

// Mock the User model so it doesn't attempt to connect to MongoDB
jest.mock('../src/models/User', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn().mockResolvedValue(null)
  }
}));

describe('Auth Endpoints Smoke Test', () => {
  it('should reject access to protected routes without a token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.statusCode).toEqual(401);
  });

  it('should return 400 for invalid login credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      });
    expect(res.statusCode).toEqual(400);
  });
});
