import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { MongooseModule } from '@nestjs/mongoose';
import { StocksModule } from './stocks/stocks.module';
import { CartModule } from './cart/cart.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'images'),
      serveRoot: '/images',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI, {
      dbName: 'nest_online_store',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123',
      database: 'nest_online_store',
      entities: [__dirname + '/**/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    StocksModule,
    CartModule,
    TransactionsModule,
  ],
})
export class AppModule {}
