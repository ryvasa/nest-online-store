import { Module } from '@nestjs/common';
import { MidtransService } from './midtrans.service';
import { PaymentsController } from './payments.controller';

@Module({
  controllers: [PaymentsController],
  providers: [MidtransService],
  exports: [MidtransService],
})
export class PaymentsModule {}
