import { Injectable } from '@nestjs/common';
import * as midtransClient from 'midtrans-client';
import { ChargePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class MidtransService {
  private readonly core: midtransClient.CoreApi;

  constructor() {
    this.core = new midtransClient.CoreApi({
      isProduction: false, // Ganti ke true jika di production
      serverKey: process.env.SERVER_KEY,
      clientKey: process.env.CLIENT_KEY,
    });
  }

  async createChargeTransaction(chargePaymentDto: ChargePaymentDto) {
    return await this.core.charge(chargePaymentDto);
  }

  async getTransactionStatus(orderId: string) {
    return await this.core.transaction.status(orderId);
  }

  async cancelTransaction(orderId: string) {
    return await this.core.transaction.cancel(orderId);
  }
}

// import { Injectable } from '@nestjs/common';
// import * as midtransClient from 'midtrans-client';
// import { ChargePaymentDto } from './dto/create-payment.dto';

// @Injectable()
// export class MidtransService {
//   private readonly snap: midtransClient.Snap;

//   constructor() {
//     this.snap = new midtransClient.Snap({
//       isProduction: false, // Ganti ke true jika di production
//       serverKey: process.env.SERVER_KEY,
//       clientKey: process.env.CLIENT_KEY,
//     });
//   }

//   async createChargeTransaction(chargePaymentDto: ChargePaymentDto) {
//     const parameter = {
//       transaction_details: {
//         order_id: chargePaymentDto.orderId,
//         gross_amount: chargePaymentDto.grossAmount,
//       },
//       customer_details: {
//         ...chargePaymentDto.customerDetails,
//         customer_details_required_fields: ['email', 'first_name', 'phone'],
//       },
//     };
//     return await this.snap.createTransaction(parameter);
//   }

//   async getTransactionStatus(orderId: string) {
//     return await this.snap.transaction.status(orderId);
//   }

//   async cancelTransaction(orderId: string) {
//     return await this.snap.transaction.cancel(orderId);
//   }
// }
