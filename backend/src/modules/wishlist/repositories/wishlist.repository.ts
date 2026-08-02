import { Wishlist, IWishlist } from '../models/wishlist.model';
import mongoose from 'mongoose';

export class WishlistRepository {
  async findByUserId(userId: string): Promise<IWishlist | null> {
    const uId = new mongoose.Types.ObjectId(userId);
    return Wishlist.findOne({ userId: uId }).populate({
      path: 'products',
      populate: { path: 'category' }
    });
  }

  async addToWishlist(userId: string, productId: string): Promise<IWishlist> {
    const uId = new mongoose.Types.ObjectId(userId);
    const prodId = new mongoose.Types.ObjectId(productId);
    return Wishlist.findOneAndUpdate(
      { userId: uId },
      { $addToSet: { products: prodId } },
      { new: true, upsert: true }
    ).populate({
      path: 'products',
      populate: { path: 'category' }
    });
  }

  async removeFromWishlist(userId: string, productId: string): Promise<IWishlist | null> {
    const uId = new mongoose.Types.ObjectId(userId);
    const prodId = new mongoose.Types.ObjectId(productId);
    return Wishlist.findOneAndUpdate(
      { userId: uId },
      { $pull: { products: prodId } },
      { new: true }
    ).populate({
      path: 'products',
      populate: { path: 'category' }
    });
  }
}
