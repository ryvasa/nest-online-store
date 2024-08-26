import { Module } from '@nestjs/common';
import { RedicetService } from './redicet.service';
import { RedicetController } from './redicet.controller';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports: [TransactionsModule, PaymentsModule],
  controllers: [RedicetController],
  providers: [RedicetService],
})
export class RedicetModule {}
