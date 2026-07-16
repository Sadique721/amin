import { WishlistRepository } from '../repositories/wishlist.repository';
import { IWishlist, Wishlist } from '../models/wishlist.model';
import { NotFoundException } from '@/shared/exceptions';

export class WishlistService {
  private wishlistRepository = new WishlistRepository();

  async getWishlist(userId: string): Promise<IWishlist> {
    let wishlist = await this.wishlistRepository.findByUserId(userId);
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [] });
    }
    return wishlist;
  }

  async addToWishlist(userId: string, productId: string): Promise<IWishlist> {
    return this.wishlistRepository.addToWishlist(userId, productId);
  }

  async removeFromWishlist(userId: string, productId: string): Promise<IWishlist> {
    const wishlist = await this.wishlistRepository.removeFromWishlist(userId, productId);
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }
    return wishlist;
  }
}
