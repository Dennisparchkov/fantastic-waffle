import Fastify, { FastifyInstance } from 'fastify';
import { app } from './app';

describe('GET /', () => {
  let server: FastifyInstance;

  beforeEach(() => {
    server = Fastify();
    server.register(app);
  });

  it('should respond with a message', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.json()).toEqual({ message: 'Hello API' });
  });

  it('should respond with 404 when claiming freeshare', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/claim-free-share',
    });

    expect(response.statusCode).toEqual(404);
  });
});
