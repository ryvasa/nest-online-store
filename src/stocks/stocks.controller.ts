import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JWTAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/role.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { imagesStorage } from '../common/config/storage.config';

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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('images', imagesStorage))
  @ApiBody({ type: CreateStockDto })
  create(
    @UploadedFile()
    file: Express.Multer.File,
    @Body() createStockDto: CreateStockDto,
  ): Promise<Stock> {
    createStockDto.image = file.path;
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

  @Patch(':id')
  @UseGuards(JWTAuthGuard)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get a stock' })
  @ApiResponse({
    status: 200,
    description: 'Return a stock.',
    type: StockResponse,
  })
  @ApiBody({ type: UpdateStockDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', imagesStorage))
  update(
    @UploadedFile()
    file: Express.Multer.File,
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
  ): Promise<Stock> {
    updateStockDto.image = file.path;
    return this.stocksService.update(updateStockDto, id);
  }

  @Delete(':productId/:stockId')
  @UseGuards(JWTAuthGuard)
  @UseGuards(RolesGuard)
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
