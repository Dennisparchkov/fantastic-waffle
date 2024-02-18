import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.post('/claim-free-share', async function (request, reply) {
    reply.notFound()
  });
}
