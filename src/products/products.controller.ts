import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ArrayProductResponse,
  ProductMessage,
  ProductMessageResponse,
  ProductResponse,
} from '../common/models/product.model';
import { JWTAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/role.guard';
import { Product } from './interfaces/product.interface';
import { imagesStorage } from '../common/config/storage.config';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JWTAuthGuard)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product' })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created.',
    type: ProductResponse,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 4, imagesStorage))
  @ApiBody({ type: CreateProductDto })
  create(
    @UploadedFiles()
    files: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
  ): Promise<Product> {
    const images = files.map((file) => file.path);
    createProductDto.images = images;
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'productName', required: false, type: String })
  @ApiQuery({ name: 'take', required: false, type: String })
  @ApiQuery({ name: 'skip', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Return all products.',
    type: ArrayProductResponse,
  })
  findAll(
    @Query('productName') productName?: string,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
  ): Promise<Product[]> {
    return this.productsService.findAll({ productName, take, skip });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product' })
  @ApiResponse({
    status: 200,
    description: 'Return a product.',
    type: ProductResponse,
  })
  findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JWTAuthGuard)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully updated.',
    type: ProductResponse,
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 4, imagesStorage))
  update(
    @UploadedFiles()
    files: Express.Multer.File[],
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const images = files.map((file) => file.path);
    updateProductDto.images = images;
    // updateProductDto.images = [...updateProductDto.images, ...files];
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JWTAuthGuard)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully deleted.',
    type: ProductMessageResponse,
  })
  remove(@Param('id') id: string): Promise<ProductMessage> {
    return this.productsService.remove(id);
  }
}
