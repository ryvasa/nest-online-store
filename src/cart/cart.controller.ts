import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JWTAuthGuard } from '../common/guards/jwt-auth.guard';
import { RequestWithCredential } from '../common/models/auth.model';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add product to cart' })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully add to cart.',
    // type: ProductResponse,
  })
  @ApiBody({ type: CreateCartDto })
  create(
    @Body() createCartDto: CreateCartDto,
    @Req() request: RequestWithCredential,
  ) {
    return this.cartService.create(request.user.id, createCartDto);
  }

  @Get()
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all product in cart' })
  @ApiResponse({
    status: 200,
    description: 'Return all product in cart.',
    // type: ProductResponse,
  })
  findAll(@Req() request: RequestWithCredential) {
    return this.cartService.findAllByUser(request.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(+id, updateCartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }
}
