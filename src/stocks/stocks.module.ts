import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StockSchema } from './schema/stock.schema';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    ProductsModule,
    UsersModule,
    MongooseModule.forFeature([{ name: 'Stocks', schema: StockSchema }]),
  ],
  controllers: [StocksController],
  providers: [StocksService],
})
export class StocksModule {}
