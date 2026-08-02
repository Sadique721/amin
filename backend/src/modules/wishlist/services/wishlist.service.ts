import mongoose from 'mongoose';
import { WishlistRepository } from '../repositories/wishlist.repository';
import { IWishlist, Wishlist } from '../models/wishlist.model';
import { NotFoundException } from '@/shared/exceptions';
import { Product } from '@/modules/products/models/product.model';

const memoryWishlists = new Map<string, string[]>();

export class WishlistService {
  private wishlistRepository = new WishlistRepository();

  async getWishlist(userId: string): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      try {
        let wishlist = await this.wishlistRepository.findByUserId(userId);
        if (!wishlist) {
          const uId = new mongoose.Types.ObjectId(userId);
          wishlist = await Wishlist.create({ userId: uId, products: [] });
        }
        return wishlist;
      } catch (err) {
        // Fallthrough to memory store if DB fails
      }
    }

    const productIds = memoryWishlists.get(userId) || [];
    let products: any[] = [];
    if (mongoose.connection.readyState === 1) {
      try {
        products = await Product.find({ _id: { $in: productIds } }).populate('category');
      } catch (err) {}
    }

    return {
      userId,
      products,
    };
  }

  async addToWishlist(userId: string, productId: string): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      try {
        return await this.wishlistRepository.addToWishlist(userId, productId);
      } catch (err) {
        // Fallthrough to memory store if DB fails
      }
    }

    const current = memoryWishlists.get(userId) || [];
    if (!current.includes(productId)) {
      current.push(productId);
      memoryWishlists.set(userId, current);
    }

    return this.getWishlist(userId);
  }

  async removeFromWishlist(userId: string, productId: string): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      try {
        const wishlist = await this.wishlistRepository.removeFromWishlist(userId, productId);
        if (wishlist) return wishlist;
      } catch (err) {
        // Fallthrough to memory store if DB fails
      }
    }

    const current = memoryWishlists.get(userId) || [];
    const updated = current.filter((id) => id !== productId);
    memoryWishlists.set(userId, updated);
    return this.getWishlist(userId);
  }
}
