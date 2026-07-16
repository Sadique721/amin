import { Wishlist, IWishlist } from '../models/wishlist.model';
import mongoose from 'mongoose';

export class WishlistRepository {
  async findByUserId(userId: string): Promise<IWishlist | null> {
    return Wishlist.findOne({ userId }).populate({
      path: 'products',
      populate: { path: 'category' } // Populate categories inside products if any
    });
  }

  async addToWishlist(userId: string, productId: string): Promise<IWishlist> {
    const prodId = new mongoose.Types.ObjectId(productId);
    return Wishlist.findOneAndUpdate(
      { userId },
      { $addToSet: { products: prodId } },
      { new: true, upsert: true }
    ).populate('products');
  }

  async removeFromWishlist(userId: string, productId: string): Promise<IWishlist | null> {
    const prodId = new mongoose.Types.ObjectId(productId);
    return Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { products: prodId } },
      { new: true }
    ).populate('products');
  }
}
