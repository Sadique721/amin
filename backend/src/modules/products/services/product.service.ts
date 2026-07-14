import { ProductRepository, ProductFilterParams } from '../repositories/product.repository';
import { IProduct } from '../models/product.model';
import { NotFoundException } from '@/shared/exceptions';

export class ProductService {
  private repository = new ProductRepository();

  async createProduct(data: Partial<IProduct>): Promise<IProduct> {
    return await this.repository.create(data);
  }

  async getProductById(id: string): Promise<IProduct> {
    const product = await this.repository.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async getProductBySlug(slug: string): Promise<IProduct> {
    const product = await this.repository.findBySlug(slug);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async updateProduct(id: string, data: Partial<IProduct>): Promise<IProduct> {
    const product = await this.repository.update(id, data);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.repository.delete(id);
    if (!product) throw new NotFoundException('Product not found');
  }

  async searchProducts(params: ProductFilterParams): Promise<any> {
    return await this.repository.findFilteredProducts(params);
  }

  async getSearchFacets(type?: string): Promise<any> {
    return await this.repository.getFilterFacets(type);
  }
}
