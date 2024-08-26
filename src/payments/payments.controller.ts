import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { MidtransService } from './midtrans.service';
import { ChargePaymentDto } from './dto/create-payment.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly midtransService: MidtransService) {}
  @Post('charge')
  async chargePayment(@Body() chargePaymentDto: ChargePaymentDto) {
    const chargeResponse =
      await this.midtransService.createChargeTransaction(chargePaymentDto);
    return chargeResponse;
  }

  @Get(':id')
  async getPaymentStatus(@Param('id') id: string) {
    return await this.midtransService.getTransactionStatus(id);
  }

  @Delete(':id')
  async cancelPayment(@Param('id') id: string) {
    return await this.midtransService.cancelTransaction(id);
  }
}
