import Redis from 'ioredis';

export interface IDistributedLock {
  lock(key: string): Promise<boolean>;
  unlock(key: string): Promise<boolean>;
}

export class DistributedLock implements IDistributedLock {

  DEFAULT_TTL = 1000;
  constructor(private readonly redis: Redis) {}

  async lock(key: string): Promise<boolean> {
    const result = await this.redis.set(key, 'locked', 'PX', this.DEFAULT_TTL, 'NX')
    return result === 'OK';
  }

  async unlock(key: string): Promise<boolean> {
    const result = await this.redis.del(key);
    return result === 1;
  }
}
