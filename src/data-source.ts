import { DataSource, DataSourceOptions } from 'typeorm';

export const appDataSource = new DataSource({
  type: 'postgres',
  database: 'mydatabase',
  entities: ['**/*.entity.ts'],
  migrations: [__dirname + '/migrations/*.ts'],
} as DataSourceOptions);
