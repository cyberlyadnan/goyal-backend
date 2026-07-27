import { Types } from 'mongoose';
import { ApiError } from '../../../utils/ApiError.js';
import { MESSAGES } from '../../../constants/index.js';
import {
  productsRepository,
  type ProductWithRelations,
} from '../../products/repositories/products.repository.js';
import type { IProductDocument } from '../../products/models/product.model.js';
import type { ICartDocument, ICartItem } from '../models/cart.model.js';
import { cartRepository } from '../repositories/cart.repository.js';
import type {
  AddToCartInput,
  CheckoutAddressInput,
  CheckoutInput,
  UpdateCartInput,
} from '../validators/cart.validator.js';

/** Placeholder delivery fee until logistics module ships. */
export const DELIVERY_CHARGES_PLACEHOLDER = 0;

export interface PublicCartProduct {
  id: string;
  productName: string;
  sku: string;
  image?: string;
  brandName?: string;
  unit?: string;
  weight?: number;
  stock: number;
  minimumOrderQuantity: number;
  maximumOrderQuantity?: number;
  gst: number;
  mrp: number;
  isAvailable: boolean;
}

export interface PublicCartItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  offerPrice?: number;
  effectivePrice: number;
  total: number;
  product?: PublicCartProduct;
}

export interface PublicCart {
  id: string;
  retailerId: string;
  items: PublicCartItem[];
  subtotal: number;
  discount: number;
  gst: number;
  deliveryCharges: number;
  grandTotal: number;
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicCheckout {
  id: string;
  retailerId: string;
  items: Array<{
    productId: string;
    productName: string;
    sku: string;
    brandName?: string;
    image?: string;
    quantity: number;
    unitPrice: number;
    offerPrice?: number;
    gstRate: number;
    total: number;
  }>;
  address: CheckoutAddressInput;
  notes?: string;
  subtotal: number;
  discount: number;
  gst: number;
  deliveryCharges: number;
  grandTotal: number;
  totalItems: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  message: string;
}

type PricedLine = {
  productId: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  offerPrice?: number;
  effectivePrice: number;
  gstRate: number;
  total: number;
  product: IProductDocument | ProductWithRelations;
};

export class CartService {
  constructor(
    private readonly repository = cartRepository,
    private readonly products = productsRepository,
  ) {}

  async getCart(retailerId: string): Promise<PublicCart> {
    const cart = await this.ensureCart(retailerId);
    const refreshed = await this.refreshPricesAndStock(cart);
    return this.toPublic(refreshed);
  }

  async addItem(
    retailerId: string,
    input: AddToCartInput,
  ): Promise<PublicCart> {
    const product = await this.loadSellableProduct(input.productId);
    const cart = await this.ensureCart(retailerId);
    const qtyToAdd = input.quantity ?? product.minimumOrderQuantity ?? 1;

    const existing = cart.items.find(
      (item) => item.productId.toString() === product._id.toString(),
    );
    const nextQty = (existing?.quantity ?? 0) + qtyToAdd;
    this.assertQuantityAllowed(product, nextQty);

    if (existing) {
      existing.quantity = nextQty;
    } else {
      cart.items.push({
        productId: product._id,
        quantity: nextQty,
        unitPrice: product.sellingPrice,
        ...(product.offerPrice !== undefined
          ? { offerPrice: product.offerPrice }
          : {}),
        total: 0,
      } as ICartItem);
    }

    await this.repository.save(cart);
    const refreshed = await this.refreshPricesAndStock(cart);
    return this.toPublic(refreshed);
  }

  async updateItem(
    retailerId: string,
    input: UpdateCartInput,
  ): Promise<PublicCart> {
    const cart = await this.ensureCart(retailerId);
    const index = cart.items.findIndex(
      (item) => item.productId.toString() === input.productId,
    );
    if (index < 0) {
      throw ApiError.notFound(MESSAGES.CART_ITEM_NOT_FOUND);
    }

    if (input.quantity === 0) {
      cart.items.splice(index, 1);
      await this.repository.save(cart);
      const refreshed = await this.refreshPricesAndStock(cart);
      return this.toPublic(refreshed);
    }

    const product = await this.loadSellableProduct(input.productId);
    this.assertQuantityAllowed(product, input.quantity);
    cart.items[index].quantity = input.quantity;
    await this.repository.save(cart);
    const refreshed = await this.refreshPricesAndStock(cart);
    return this.toPublic(refreshed);
  }

  async removeItem(
    retailerId: string,
    productId: string,
  ): Promise<PublicCart> {
    const cart = await this.ensureCart(retailerId);
    const nextItems = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );
    if (nextItems.length === cart.items.length) {
      throw ApiError.notFound(MESSAGES.CART_ITEM_NOT_FOUND);
    }
    cart.items = nextItems;
    await this.repository.save(cart);
    const refreshed = await this.refreshPricesAndStock(cart);
    return this.toPublic(refreshed);
  }

  async clearCart(retailerId: string): Promise<PublicCart> {
    await this.ensureCart(retailerId);
    const cleared = await this.repository.clear(retailerId);
    if (!cleared) {
      throw ApiError.notFound(MESSAGES.CART_NOT_FOUND);
    }
    return this.toPublic(cleared);
  }

  /**
   * Confirms checkout without creating an Order or charging payment.
   * Persists a checkout session for the upcoming payment phase and clears the cart.
   */
  async checkout(
    retailerId: string,
    input: CheckoutInput,
  ): Promise<PublicCheckout> {
    const cart = await this.ensureCart(retailerId);
    if (cart.items.length === 0) {
      throw ApiError.badRequest(MESSAGES.CART_EMPTY);
    }

    const refreshed = await this.refreshPricesAndStock(cart, {
      failOnUnavailable: true,
    });
    if (refreshed.items.length === 0) {
      throw ApiError.badRequest(MESSAGES.CART_EMPTY);
    }

    const lines = await this.buildPricedLines(refreshed, {
      failOnUnavailable: true,
    });
    const totals = this.computeTotals(lines);

    const checkoutDoc = await this.repository.createCheckout({
      retailerId: new Types.ObjectId(retailerId),
      items: lines.map((line) => {
        const brandRef = (line.product as ProductWithRelations).brandId;
        const brandName =
          brandRef && typeof brandRef === 'object' && 'name' in brandRef
            ? brandRef.name
            : undefined;
        return {
          productId: line.productId,
          productName: line.product.productName,
          sku: line.product.sku,
          ...(brandName ? { brandName } : {}),
          ...(line.product.images?.[0]
            ? { image: line.product.images[0] }
            : {}),
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          ...(line.offerPrice !== undefined
            ? { offerPrice: line.offerPrice }
            : {}),
          gstRate: line.gstRate,
          total: line.total,
        };
      }),
      address: input.address,
      ...(input.notes ? { notes: input.notes } : {}),
      ...totals,
      status: 'awaiting_payment',
    });

    await this.repository.clear(retailerId);

    return {
      id: checkoutDoc._id.toString(),
      retailerId,
      items: checkoutDoc.items.map((item) => ({
        productId: item.productId.toString(),
        productName: item.productName,
        sku: item.sku,
        ...(item.brandName ? { brandName: item.brandName } : {}),
        ...(item.image ? { image: item.image } : {}),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        ...(item.offerPrice !== undefined
          ? { offerPrice: item.offerPrice }
          : {}),
        gstRate: item.gstRate,
        total: item.total,
      })),
      address: {
        line1: checkoutDoc.address.line1,
        ...(checkoutDoc.address.line2
          ? { line2: checkoutDoc.address.line2 }
          : {}),
        city: checkoutDoc.address.city,
        state: checkoutDoc.address.state,
        pincode: checkoutDoc.address.pincode,
      },
      ...(checkoutDoc.notes ? { notes: checkoutDoc.notes } : {}),
      subtotal: checkoutDoc.subtotal,
      discount: checkoutDoc.discount,
      gst: checkoutDoc.gst,
      deliveryCharges: checkoutDoc.deliveryCharges,
      grandTotal: checkoutDoc.grandTotal,
      totalItems: checkoutDoc.totalItems,
      status: checkoutDoc.status,
      createdAt: checkoutDoc.createdAt,
      updatedAt: checkoutDoc.updatedAt,
      message:
        'Checkout confirmed. Payment will be collected in the next step.',
    };
  }

  private async ensureCart(retailerId: string): Promise<ICartDocument> {
    const existing = await this.repository.findByRetailerId(retailerId);
    if (existing) {
      return existing;
    }
    return this.repository.createEmpty(retailerId);
  }

  private async loadSellableProduct(
    productId: string,
  ): Promise<IProductDocument> {
    const product = await this.products.findById(productId);
    if (!product || !product.isActive) {
      throw ApiError.notFound(MESSAGES.PRODUCT_NOT_FOUND);
    }
    if (!product.isAvailable || product.stock <= 0) {
      throw ApiError.badRequest(MESSAGES.PRODUCT_OUT_OF_STOCK);
    }
    return product;
  }

  private assertQuantityAllowed(
    product: IProductDocument,
    quantity: number,
  ): void {
    const min = product.minimumOrderQuantity || 1;
    if (quantity < min) {
      throw ApiError.badRequest(
        `Minimum order quantity for this product is ${min}`,
      );
    }
    if (
      product.maximumOrderQuantity !== undefined &&
      quantity > product.maximumOrderQuantity
    ) {
      throw ApiError.badRequest(
        `Maximum order quantity for this product is ${product.maximumOrderQuantity}`,
      );
    }
    if (quantity > product.stock) {
      throw ApiError.badRequest(
        `Only ${product.stock} units available in stock`,
      );
    }
  }

  private effectivePrice(product: {
    sellingPrice: number;
    offerPrice?: number;
  }): number {
    if (product.offerPrice !== undefined && product.offerPrice > 0) {
      return product.offerPrice;
    }
    return product.sellingPrice;
  }

  private recalculate(
    cart: ICartDocument,
    products: Array<IProductDocument | ProductWithRelations>,
  ): void {
    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );

    for (const item of cart.items) {
      const product = productMap.get(item.productId.toString());
      if (product) {
        item.unitPrice = product.sellingPrice;
        if (product.offerPrice !== undefined && product.offerPrice > 0) {
          item.offerPrice = product.offerPrice;
        } else {
          item.offerPrice = undefined;
        }
        const price = this.effectivePrice(product);
        item.total = roundMoney(price * item.quantity);
      } else {
        const price =
          item.offerPrice !== undefined && item.offerPrice > 0
            ? item.offerPrice
            : item.unitPrice;
        item.total = roundMoney(price * item.quantity);
      }
    }

    let subtotal = 0;
    let discount = 0;
    let gst = 0;

    for (const item of cart.items) {
      subtotal += item.unitPrice * item.quantity;
      const effective =
        item.offerPrice !== undefined && item.offerPrice > 0
          ? item.offerPrice
          : item.unitPrice;
      discount += (item.unitPrice - effective) * item.quantity;
      const product = productMap.get(item.productId.toString());
      const gstRate = product?.gst ?? 0;
      gst += item.total * (gstRate / 100);
    }

    cart.subtotal = roundMoney(subtotal);
    cart.discount = roundMoney(discount);
    cart.gst = roundMoney(gst);
    cart.deliveryCharges = DELIVERY_CHARGES_PLACEHOLDER;
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.grandTotal = roundMoney(
      cart.subtotal - cart.discount + cart.gst + cart.deliveryCharges,
    );
  }

  private computeTotals(lines: PricedLine[]) {
    let subtotal = 0;
    let discount = 0;
    let gst = 0;
    let totalItems = 0;

    for (const line of lines) {
      subtotal += line.unitPrice * line.quantity;
      discount += (line.unitPrice - line.effectivePrice) * line.quantity;
      gst += line.total * (line.gstRate / 100);
      totalItems += line.quantity;
    }

    const deliveryCharges = DELIVERY_CHARGES_PLACEHOLDER;
    return {
      subtotal: roundMoney(subtotal),
      discount: roundMoney(discount),
      gst: roundMoney(gst),
      deliveryCharges,
      totalItems,
      grandTotal: roundMoney(
        roundMoney(subtotal) -
          roundMoney(discount) +
          roundMoney(gst) +
          deliveryCharges,
      ),
    };
  }

  private resolveProductId(
    productId: ICartItem['productId'] | ProductWithRelations,
  ): string {
    if (productId && typeof productId === 'object' && '_id' in productId) {
      return productId._id.toString();
    }
    return String(productId);
  }

  private async buildPricedLines(
    cart: ICartDocument,
    options: { failOnUnavailable?: boolean } = {},
  ): Promise<PricedLine[]> {
    const lines: PricedLine[] = [];

    for (const item of cart.items) {
      const productId = this.resolveProductId(
        item.productId as ICartItem['productId'],
      );
      const product =
        (await this.products.findByIdPopulated(productId)) ??
        (await this.products.findById(productId));

      if (!product || !product.isActive || !product.isAvailable) {
        if (options.failOnUnavailable) {
          throw ApiError.badRequest(
            `Product is unavailable: ${product?.productName ?? productId}`,
          );
        }
        continue;
      }

      if (options.failOnUnavailable) {
        this.assertQuantityAllowed(product, item.quantity);
      } else if (item.quantity > product.stock) {
        item.quantity = product.stock;
        if (item.quantity < (product.minimumOrderQuantity || 1)) {
          continue;
        }
      }

      const unitPrice = product.sellingPrice;
      const offerPrice =
        product.offerPrice !== undefined && product.offerPrice > 0
          ? product.offerPrice
          : undefined;
      const effectivePrice = offerPrice ?? unitPrice;

      lines.push({
        productId: product._id,
        quantity: item.quantity,
        unitPrice,
        ...(offerPrice !== undefined ? { offerPrice } : {}),
        effectivePrice,
        gstRate: product.gst ?? 0,
        total: roundMoney(effectivePrice * item.quantity),
        product,
      });
    }

    return lines;
  }

  private async refreshPricesAndStock(
    cart: ICartDocument,
    options: { failOnUnavailable?: boolean } = {},
  ): Promise<ICartDocument> {
    const lines = await this.buildPricedLines(cart, options);
    cart.items = lines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      ...(line.offerPrice !== undefined ? { offerPrice: line.offerPrice } : {}),
      total: line.total,
    })) as ICartItem[];

    this.recalculate(
      cart,
      lines.map((line) => line.product),
    );
    await this.repository.save(cart);
    const populated = await this.repository.findByRetailerIdPopulated(
      cart.retailerId.toString(),
    );
    return populated ?? cart;
  }

  private toPublic(cart: ICartDocument): PublicCart {
    const items: PublicCartItem[] = cart.items.map((item) => {
      const productRef = item.productId as unknown as
        | Types.ObjectId
        | ProductWithRelations;

      let product: PublicCartProduct | undefined;
      let productId: string;

      if (productRef && typeof productRef === 'object' && 'productName' in productRef) {
        productId = productRef._id.toString();
        const brandRef = productRef.brandId;
        const brandName =
          brandRef && typeof brandRef === 'object' && 'name' in brandRef
            ? brandRef.name
            : undefined;
        product = {
          id: productId,
          productName: productRef.productName,
          sku: productRef.sku,
          ...(productRef.images?.[0] ? { image: productRef.images[0] } : {}),
          ...(brandName ? { brandName } : {}),
          ...(productRef.unit ? { unit: productRef.unit } : {}),
          ...(productRef.weight !== undefined
            ? { weight: productRef.weight }
            : {}),
          stock: productRef.stock,
          minimumOrderQuantity: productRef.minimumOrderQuantity,
          ...(productRef.maximumOrderQuantity !== undefined
            ? { maximumOrderQuantity: productRef.maximumOrderQuantity }
            : {}),
          gst: productRef.gst,
          mrp: productRef.mrp,
          isAvailable: productRef.isAvailable && productRef.isActive,
        };
      } else {
        productId = String(item.productId);
      }

      const effectivePrice =
        item.offerPrice !== undefined && item.offerPrice > 0
          ? item.offerPrice
          : item.unitPrice;

      return {
        productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        ...(item.offerPrice !== undefined
          ? { offerPrice: item.offerPrice }
          : {}),
        effectivePrice,
        total: item.total,
        ...(product ? { product } : {}),
      };
    });

    return {
      id: cart._id.toString(),
      retailerId: cart.retailerId.toString(),
      items,
      subtotal: cart.subtotal,
      discount: cart.discount,
      gst: cart.gst,
      deliveryCharges: cart.deliveryCharges,
      grandTotal: cart.grandTotal,
      totalItems: cart.totalItems,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}

const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const cartService = new CartService();
