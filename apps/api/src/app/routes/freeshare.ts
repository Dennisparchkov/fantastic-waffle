import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.post('/claim-free-share', async function (request, reply) {
    //return { message: 'Hello API' };
    fastify.jwt.decode(request.headers.authorization);
    reply.notFound();
  });
}
