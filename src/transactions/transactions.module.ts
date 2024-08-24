import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { UsersModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionSchema } from './schema/transaction.schema';
import { ProductSchema } from '../products/schema/product.schema';
import { StockSchema } from '../stocks/schema/stock.schema';
import { CartSchema } from '../cart/schema/cart.schema';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: 'Transaction', schema: TransactionSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'Stock', schema: StockSchema },
      { name: 'Cart', schema: CartSchema },
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
