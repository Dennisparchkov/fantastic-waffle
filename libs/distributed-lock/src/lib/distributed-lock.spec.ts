import { DistributedLock } from './distributed-lock';
import Redis from 'ioredis';
import { mock } from 'jest-mock-extended';

describe('DistributedLock', () => {

  const redisMock = mock<Redis>()
  const lock = new DistributedLock(redisMock)

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('calls redis.set when lock set', async () => {
    const key = 'key'
    redisMock.set.mockResolvedValue('OK')
    await lock.lock(key)
    const default_ttl = 1000
    expect(redisMock.set).toHaveBeenCalledWith(key, 'locked', 'PX', default_ttl, 'NX')
  })

  it('returns true when lock successful', async () => {
    redisMock.set.mockResolvedValue('OK')
    const result = await lock.lock('key')
    expect(result).toBeTruthy()
  })

  it('returns false when lock unsuccessful', async () => {
    redisMock.set.mockResolvedValue(null)
    const result = await lock.lock('key')
    expect(result).toBeFalsy()
  })

  it('calls redis.del when unlock', async () => {
    redisMock.del.mockResolvedValue(1)
    const key = 'key'
    await lock.unlock(key)
    expect(redisMock.del).toHaveBeenCalledWith(key)
  })

  it('returns true when unlock successful', async () => {
    redisMock.del.mockResolvedValue(1)
    const key = 'key'
    const result = await lock.unlock(key)
    expect(result).toBeTruthy()
  })

  it('returns false when unlock unsuccessful', async () => {
    redisMock.del.mockResolvedValue(0)
    const key = 'key'
    const result = await lock.unlock(key)
    expect(result).toBeFalsy()
  })
})
