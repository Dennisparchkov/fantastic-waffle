import { FastifyInstance } from 'fastify';
import { AppOptions } from '../app';

export default async function (fastify: FastifyInstance, options: AppOptions) {
  fastify.post('/claim-free-share', async function (request, reply) {
    reply.notFound()

    // choose a random stock
    // purchase it in the customer's account using Emma's funds
    // It should immediately return information about which stock the user has been given, even though the buy order may still be pending
  });
}
