import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Status } from '../schema/transaction.schema';

export class UpdateTransactionDto {
  @ApiProperty({
    example: 'Jl. Raya Ciledug',
    description: 'Address of receiver',
    type: String,
  })
  @IsString()
  address: string;
}

export class UpdateStatusTransactionDto {
  @ApiProperty({
    type: Status,
    example: 'success',
    description: 'Status of transaction',
    enum: ['process', 'success', 'failed'],
  })
  @IsNotEmpty()
  status: Status;
}
