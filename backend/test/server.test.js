const request = require('supertest');
describe('API with cache', () => {

    test('GET /post-non-opt', async () => {

        for (let i = 0; i < 10; i++) {
            const res = await request('http://localhost:3000').get('/posts-non-opt');
            expect(res.statusCode).toBe(200);
        }
    });

    test('GET /post', async () => {

        for (let i = 0; i < 10; i++) {
            const res = await request('http://localhost:3000').get('/posts');
            expect(res.statusCode).toBe(200);
        }
    });
});