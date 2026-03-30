const request = require('supertest');
const app = require('../server');
const AppDataSource = require('../config/data-source');

describe('Auth API Endpoints', () => {
    
    const testUser = {
        email: `testuser_${Date.now()}@example.com`,
        password: 'Password123!',
        role: 'PARENT'
    };

    afterAll(async () => {
        //cleanup
        const repo = AppDataSource.getRepository('User');
        await repo.delete({ email: testUser.email });
    });

    it('should register a new user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.email).toEqual(testUser.email);
    });

    it('should not allow registering an existing user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('User already exists');
    });

    it('should login the user and return a token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.email).toEqual(testUser.email);
    });

    it('should reject login with wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: 'WrongPassword123!'
            });
        
        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toEqual('Invalid email or password');
    });
});
