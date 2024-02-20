import { get } from 'env-var'

export const config = Object.freeze({
  brokerApiBaseUrl: get('BROKER_API_BASE_URL').required().asString(),
  freeshare: {
    minPrice: get('FREESHARE_MIN_PRICE').default(3).asIntPositive(),
    maxPrice: get('FREESHARE_MAX_PRICE').default(200).asIntPositive(),
    targetCPA: get('FREESHARE_TARGET_CPA').default(10).asIntPositive(),
    useCPAAllocation: get('FREESHARE_USE_CPA').default('false').asBoolStrict(),
  },
  db: {
    host: get('POSTGRES_HOST').required().asString(),
    port: get('POSTGRES_PORT').required().asPortNumber(),
    username: get('POSTGRES_USER').required().asString(),
  },
  redis: {
    host: get('REDIS_HOST').required().asString(),
    port: get('REDIS_PORT').required().asPortNumber(),
    password: get('REDIS_PASSWORD').required().asString(),
  }
})

export type Config = typeof config
