import axios from 'axios'
import Fastify from 'fastify';
import { app } from './app/app';
import { DistributedLock } from '@freeshares/distributed-lock';
import Redis from 'ioredis';
import { config } from './app/config';
import { Allocation, FreeshareAllocation, FreeshareAllocationService } from '@freeshares/allocation';
import { getDatabaseSource } from './app/dataSource';
import { Account } from '@freeshares/user';
import { Broker } from '@freeshares/broker';
import { InstrumentService } from '@freeshares/instrument';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
});

// Register your application as a normal plugin.

const redis = new Redis({
  host: config.redis.host,
  password: config.redis.password,
  port: config.redis.port
})
server.register(async () => {

  const db =   await getDatabaseSource(config)

  const axiosInstance = axios.create({
    baseURL: config.brokerApiBaseUrl
  })
  const broker = new Broker(axiosInstance)
  const instrumentService = new InstrumentService(broker)
  const freeshareAllocationService = new FreeshareAllocationService(
    new Allocation(config.freeshare.targetCPA, config.freeshare.minPrice, config.freeshare.maxPrice),
    db.getRepository(Account),
    db.getRepository(FreeshareAllocation),
    instrumentService,
    broker,
    config.freeshare.useCPAAllocation
  )

  return app(server, {
    distributedLock: new DistributedLock(redis),
    freeshareAllocationService
  })
})

// Start listening.
server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    console.log(`[ ready ] http://${host}:${port}`);
  }
});
