import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: '123',
        database: 'nest_online_store',
        entities: [__dirname + '/../**/**/*.entity{.ts,.js}'],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];

// export const dataSourceOptions: DataSourceOptions = {
//   type: 'postgres',
//   host: 'localhost',
//   port: 5432,
//   username: 'postgres',
//   password: '123',
//   database: 'nestjs_typeorm',
//   entities: ['dist/**/*.entity.js'],
//   migrations: ['dist/db/migrations/*.js'],
// };

// const dataSource = new DataSource(dataSourceOptions);
// export default dataSource;
