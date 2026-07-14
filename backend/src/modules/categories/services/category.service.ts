import { CategoryRepository } from '../repositories/category.repository';
import { ICategory } from '../models/category.model';
import { NotFoundException } from '@/shared/exceptions';

export class CategoryService {
  private repository = new CategoryRepository();

  async createCategory(data: Partial<ICategory>): Promise<ICategory> {
    return await this.repository.create(data);
  }

  async getCategoryById(id: string): Promise<ICategory> {
    const category = await this.repository.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<ICategory> {
    const category = await this.repository.findBySlug(slug);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async getAllCategories(filter: any = {}): Promise<ICategory[]> {
    return await this.repository.findAll(filter);
  }

  async updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory> {
    const category = await this.repository.update(id, data);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.repository.delete(id);
    if (!category) throw new NotFoundException('Category not found');
  }
}
