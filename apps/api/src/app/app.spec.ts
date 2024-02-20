import Fastify, { FastifyInstance } from 'fastify';
import { app } from './app';
import { mock } from 'jest-mock-extended';
import { FreeshareAllocationFailureReason, IFreeshareAllocationService } from '@freeshares/allocation';
import { IDistributedLock } from '@freeshares/distributed-lock';
import { messages } from 'nx/src/utils/ab-testing';

describe('GET /', () => {
  let server: FastifyInstance;

  const mockFreeshareAllocationService = mock<IFreeshareAllocationService>();
  const mockDistributedLock = mock<IDistributedLock>();

  beforeEach(() => {
    server = Fastify();
    server.register(() => app(server, {
      distributedLock: mockDistributedLock,
      freeshareAllocationService: mockFreeshareAllocationService
    }));
  });

  it('should respond with a message', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/'
    });

    expect(response.json()).toEqual({ message: 'Hello API' });
  });

  it('should respond with 400 when no userId is passed in body', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/claim-free-share',
      payload: { }
    });

    expect(response.statusCode).toEqual(400)
    expect(response.json()).toEqual({ message: 'userId is required' })
  });

  it('should respond with 400 when lock cannot be taken', async () => {
    const userId = '123'

    mockDistributedLock.lock.mockResolvedValue(false);

    const response = await server.inject({
      method: 'POST',
      url: '/claim-free-share',
      payload: { userId }
    });

    expect(response.statusCode).toEqual(400)
    expect(response.json()).toEqual({ message: 'Another request is already in progress' })
  })

  it('should respond with 400 when claiming freeshare is not successful and releases lock', async () => {
    const userId = '123'

    mockDistributedLock.lock.mockResolvedValue(true);
    mockFreeshareAllocationService.allocateFreeshare.mockResolvedValue({
      success: false,
      reason: FreeshareAllocationFailureReason.ALREADY_CLAIMED
    })

    const response = await server.inject({
      method: 'POST',
      url: '/claim-free-share',
      payload: { userId }
    });

    expect(response.statusCode).toEqual(400)
    expect(response.json()).toEqual({ message: FreeshareAllocationFailureReason.ALREADY_CLAIMED })
    expect(mockDistributedLock.lock).toHaveBeenCalled()
  })


  it('should respond with 200 when claiming freeshare is successful and releases lock', async () => {
    const userId = '123'
    const orderId = '123'
    const instrumentTicker = 'AAPL'
    mockDistributedLock.lock.mockResolvedValue(true);
    mockFreeshareAllocationService.allocateFreeshare.mockResolvedValue({
      success: true,
      orderId,
      instrumentTicker
    })

    const response = await server.inject({
      method: 'POST',
      url: '/claim-free-share',
      payload: { userId }
    });

    expect(response.statusCode).toEqual(200)
    expect(response.json()).toEqual({
      success: true,
      orderId,
      instrumentTicker
    })
    expect(mockDistributedLock.lock).toHaveBeenCalled()
  })



});
