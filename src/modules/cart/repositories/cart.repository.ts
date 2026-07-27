import type { ICartDocument } from '../models/cart.model.js';
import { Cart } from '../models/cart.model.js';
import type { ICheckoutDocument } from '../models/checkout.model.js';
import { Checkout } from '../models/checkout.model.js';

export class CartRepository {
  findByRetailerId(retailerId: string): Promise<ICartDocument | null> {
    return Cart.findOne({ retailerId }).exec();
  }

  findByRetailerIdPopulated(retailerId: string): Promise<ICartDocument | null> {
    return Cart.findOne({ retailerId })
      .populate({
        path: 'items.productId',
        select:
          'productName slug images brandId sku mrp sellingPrice offerPrice gst stock minimumOrderQuantity maximumOrderQuantity isActive isAvailable unit weight',
        populate: { path: 'brandId', select: 'name logo slug' },
      })
      .exec();
  }

  async createEmpty(retailerId: string): Promise<ICartDocument> {
    return Cart.create({
      retailerId,
      items: [],
      subtotal: 0,
      discount: 0,
      gst: 0,
      deliveryCharges: 0,
      grandTotal: 0,
      totalItems: 0,
    });
  }

  async save(cart: ICartDocument): Promise<ICartDocument> {
    return cart.save();
  }

  async replaceCart(
    retailerId: string,
    payload: Partial<ICartDocument>,
  ): Promise<ICartDocument | null> {
    return Cart.findOneAndUpdate(
      { retailerId },
      { $set: payload },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
    ).exec();
  }

  async clear(retailerId: string): Promise<ICartDocument | null> {
    return Cart.findOneAndUpdate(
      { retailerId },
      {
        $set: {
          items: [],
          subtotal: 0,
          discount: 0,
          gst: 0,
          deliveryCharges: 0,
          grandTotal: 0,
          totalItems: 0,
        },
      },
      { returnDocument: 'after' },
    ).exec();
  }

  createCheckout(
    payload: Partial<ICheckoutDocument>,
  ): Promise<ICheckoutDocument> {
    return Checkout.create(payload);
  }
}

export const cartRepository = new CartRepository();
