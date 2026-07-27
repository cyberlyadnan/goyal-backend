import type { Response } from 'express';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { MESSAGES } from '../../../constants/index.js';
import { ApiError } from '../../../utils/ApiError.js';
import type { AuthRequest } from '../../../types/index.js';
import { cartService } from '../services/cart.service.js';
import type {
  AddToCartInput,
  CheckoutInput,
  UpdateCartInput,
} from '../validators/cart.validator.js';

export class CartController {
  constructor(private readonly service = cartService) {}

  private retailerId(req: AuthRequest): string {
    if (!req.user?.id) {
      throw ApiError.unauthorized(MESSAGES.UNAUTHORIZED);
    }
    return req.user.id;
  }

  getCart = async (req: AuthRequest, res: Response): Promise<Response> => {
    const cart = await this.service.getCart(this.retailerId(req));
    return ApiResponse.ok(res, MESSAGES.SUCCESS, { cart });
  };

  addItem = async (req: AuthRequest, res: Response): Promise<Response> => {
    const body = req.body as AddToCartInput;
    const cart = await this.service.addItem(this.retailerId(req), body);
    return ApiResponse.ok(res, MESSAGES.CART_ITEM_ADDED, { cart });
  };

  updateItem = async (req: AuthRequest, res: Response): Promise<Response> => {
    const body = req.body as UpdateCartInput;
    const cart = await this.service.updateItem(this.retailerId(req), body);
    return ApiResponse.ok(res, MESSAGES.CART_UPDATED, { cart });
  };

  removeItem = async (req: AuthRequest, res: Response): Promise<Response> => {
    const cart = await this.service.removeItem(
      this.retailerId(req),
      req.params.productId,
    );
    return ApiResponse.ok(res, MESSAGES.CART_ITEM_REMOVED, { cart });
  };

  clearCart = async (req: AuthRequest, res: Response): Promise<Response> => {
    const cart = await this.service.clearCart(this.retailerId(req));
    return ApiResponse.ok(res, MESSAGES.CART_CLEARED, { cart });
  };

  checkout = async (req: AuthRequest, res: Response): Promise<Response> => {
    const body = req.body as CheckoutInput;
    const checkout = await this.service.checkout(this.retailerId(req), body);
    return ApiResponse.created(res, MESSAGES.CHECKOUT_CONFIRMED, { checkout });
  };
}

export const cartController = new CartController();
