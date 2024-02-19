import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { DataSource } from 'typeorm';
import { Config } from './config';
import { Account, User } from '@freeshares/user';
import { FreeshareAllocation } from '@freeshares/allocation';


let dbSource: DataSource | undefined
export async function getDatabaseSource(config: Config): Promise<DataSource> {
  if (dbSource) {
    return dbSource
  }

  const dbConfig = new DataSource({
    type: 'postgres',
    host: config.db.host,
    port: config.db.port,
    username: config.db.username,
    ssl: false,
    database: 'freeshare',
    synchronize: true,
    logging: false,
    entities: [User, Account, FreeshareAllocation],
    namingStrategy: new SnakeNamingStrategy(),
    subscribers: []
  })
  dbSource = await dbConfig.initialize()
  return dbSource
}
