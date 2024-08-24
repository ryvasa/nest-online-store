import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
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
import {
  CartAggregateResponse,
  CartResponse,
  CountData,
  CountResponse,
} from '../common/models/cart.model';
import { Cart } from './interfaces/cart.interface';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // @Post()
  // @UseGuards(JWTAuthGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Add product to cart' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'The product has been successfully add to cart.',
  //   // type: ProductResponse,
  // })
  // @ApiBody({ type: CreateCartDto })
  // create(
  //   @Body() createCartDto: CreateCartDto,
  //   @Req() request: RequestWithCredential,
  // ) {
  //   return this.cartService.create(request.user.id, createCartDto);
  // }

  @Get()
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all product in cart' })
  @ApiResponse({
    status: 200,
    description: 'Return all product in cart.',
    type: CartAggregateResponse,
  })
  findAll(@Req() request: RequestWithCredential): Promise<Cart | object> {
    return this.cartService.findAllByUser(request.user.id);
  }

  @Get('count')
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get count product in cart' })
  @ApiResponse({
    status: 200,
    description: 'Return count product in cart.',
    type: CountResponse,
  })
  countItems(@Req() request: RequestWithCredential): Promise<CountData> {
    return this.cartService.countChatItems(request.user.id);
  }

  @Post()
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add product to cart' })
  @ApiResponse({
    status: 200,
    description: 'Return count product in cart.',
    type: CartResponse,
  })
  @ApiBody({ type: UpdateCartDto })
  addProductToCart(
    @Req() request: RequestWithCredential,
    @Body() updateCartDto: UpdateCartDto,
  ): Promise<Cart> {
    return this.cartService.addProductToCart(request.user.id, updateCartDto);
  }

  @Patch()
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove product to cart' })
  @ApiResponse({
    status: 200,
    description: 'Return product in cart.',
    type: CartResponse,
  })
  @ApiBody({ type: UpdateCartDto })
  removeProductFromCart(
    @Body() updateCartDto: UpdateCartDto,
    @Req() request: RequestWithCredential,
  ): Promise<Cart> {
    return this.cartService.removeProductFromCart(
      request.user.id,
      updateCartDto,
    );
  }
}
