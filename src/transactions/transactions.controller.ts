import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  UpdateStatusTransactionDto,
  UpdateTransactionDto,
} from './dto/update-transaction.dto';
import { JWTAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequestWithCredential } from '../common/models/auth.model';
import { RolesGuard } from '../common/guards/role.guard';
import { Transaction } from './interfaces/transaction.interface';
import {
  TransactionAggregateResponse,
  TransactionResponse,
} from '../common/models/transaction.model';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crete new transaction' })
  @ApiResponse({
    status: 201,
    description: 'Create new transaction.',
    type: TransactionResponse,
  })
  @ApiBody({ type: CreateTransactionDto })
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() request: RequestWithCredential,
  ): Promise<Transaction> {
    return this.transactionsService.create(
      request.user.id,
      createTransactionDto,
    );
  }

  @Get()
  @UseGuards(JWTAuthGuard)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all transaction' })
  @ApiResponse({
    status: 200,
    description: 'Return all transaction.',
    type: TransactionResponse,
  })
  @ApiBearerAuth()
  async findAll(): Promise<Transaction[]> {
    return this.transactionsService.findAll();
  }

  @Get('user')
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all transaction by user' })
  @ApiResponse({
    status: 200,
    description: 'Return all user transaction.',
    type: TransactionResponse,
  })
  async findAllByUserId(
    @Req() request: RequestWithCredential,
  ): Promise<Transaction[]> {
    return this.transactionsService.findAllByUserId(request.user.id);
  }

  @Get(':id')
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a transaction detail' })
  @ApiResponse({
    status: 200,
    description: 'Return a transaction detail.',
    type: TransactionAggregateResponse,
  })
  async findOne(@Param('id') id: string): Promise<Transaction> {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a transaction (address only)' })
  @ApiResponse({
    status: 200,
    description: 'Update a transaction address.',
    type: TransactionResponse,
  })
  @ApiBody({ type: UpdateTransactionDto })
  async update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Patch(':id/status')
  @UseGuards(JWTAuthGuard)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a transaction (address only)' })
  @ApiResponse({
    status: 200,
    description: 'Update a transaction address.',
    type: TransactionResponse,
  })
  @ApiBody({ type: UpdateStatusTransactionDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusTransactionDto: UpdateStatusTransactionDto,
  ): Promise<Transaction> {
    return this.transactionsService.updateStatus(
      id,
      updateStatusTransactionDto,
    );
  }
}
