import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JWTAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/role.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ArrayStockResponse,
  StockResponse,
  StockMessageResponse,
  StockMessage,
} from '../common/models/stock.model';
import { Stock } from './interfaces/stock.interface';

@ApiTags('stocks')
@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Post()
  @UseGuards(JWTAuthGuard)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create stock' })
  @ApiResponse({
    status: 201,
    description: 'The stock has been successfully created.',
    type: StockResponse,
  })
  @ApiBody({ type: CreateStockDto })
  create(@Body() createStockDto: CreateStockDto): Promise<Stock> {
    return this.stocksService.create(createStockDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stock' })
  @ApiResponse({
    status: 200,
    description: 'Return all stock.',
    type: ArrayStockResponse,
  })
  findAll(): Promise<Stock[]> {
    return this.stocksService.findAll();
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get all stock by product' })
  @ApiResponse({
    status: 200,
    description: 'Return all stock by product.',
    type: ArrayStockResponse,
  })
  findAllByProductId(@Param('productId') productId: string): Promise<Stock[]> {
    return this.stocksService.findAllByProductId(productId);
  }

  @Get(':productId/:stockId')
  @ApiOperation({ summary: 'Get a stock' })
  @ApiResponse({
    status: 200,
    description: 'Return a stock.',
    type: StockResponse,
  })
  findOne(
    @Param('productId') productId: string,
    @Param('stockId') stockId: string,
  ): Promise<Stock> {
    return this.stocksService.findOne(productId, stockId);
  }

  @Patch(':productId/:stockId')
  @ApiOperation({ summary: 'Get a stock' })
  @ApiResponse({
    status: 200,
    description: 'Return a stock.',
    type: StockResponse,
  })
  update(
    @Param('productId') productId: string,
    @Param('stockId') stockId: string,
    @Body() updateStockDto: UpdateStockDto,
  ): Promise<Stock> {
    return this.stocksService.update(productId, stockId, updateStockDto);
  }

  @Delete(':productId/:stockId')
  @ApiOperation({ summary: 'Delete a stock' })
  @ApiResponse({
    status: 200,
    type: StockMessageResponse,
  })
  remove(
    @Param('productId') productId: string,
    @Param('stockId') stockId: string,
  ): Promise<StockMessage> {
    return this.stocksService.remove(productId, stockId);
  }
}
