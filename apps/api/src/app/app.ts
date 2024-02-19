import * as path from 'path';
import 'pg';
import { FastifyInstance } from 'fastify';
import AutoLoad from '@fastify/autoload';
import { getDatabaseSource } from './dataSource';
import { config } from './config';
import { IDistributedLock } from '@freeshares/distributed-lock';
import { IAllocation, IFreeshareAllocationService } from '@freeshares/allocation';
import { Repository } from 'typeorm';
import { User } from '@freeshares/user';

/* eslint-disable-next-line */
export interface AppOptions {
  distributedLock: IDistributedLock
  freeshareAllocationService: IFreeshareAllocationService
}

export async function app(fastify: FastifyInstance, opts: AppOptions) {
  // Load dependencies

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { ...opts },
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: { ...opts },
  });
}
