import { FastifyInstance } from 'fastify';
import { AppOptions } from '../app';
import { messages } from 'nx/src/utils/ab-testing';

export default async function (fastify: FastifyInstance, options: AppOptions) {
  fastify.post<{ Body: { userId?: string} }>('/claim-free-share', async function (request, reply) {
    // TODO: This is not the correct way to authenticate the user, this should be done via a JWT and validate the issuer and audience.
    // For the sake of simplicity, we are using the userId from the body as a way to authenticate the user.
    // Clearly, this is not secure and should not be used in a production environment.
    const userId = request.body?.userId
    if (!userId) {
      reply.code(400).send({ message: 'userId is required'})
      return
    }

    const lockKey = `${request.routerPath}-${userId}`
    const result = await options.distributedLock.lock(lockKey)
    if (!result) {
      reply.code(400).send({message: 'Another request is already in progress' })
      return
    }

    const allocationResponse = await options.freeshareAllocationService.allocateFreeshare(userId)
    if ('reason' in allocationResponse) {
      await options.distributedLock.unlock(lockKey)
      reply.code(400).send({message: allocationResponse.reason })
      return
    }

    await options.distributedLock.unlock(lockKey)

    reply.send(allocationResponse)
  });
}
