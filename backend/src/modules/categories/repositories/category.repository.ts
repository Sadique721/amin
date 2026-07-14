import { Category, ICategory } from '../models/category.model';

export class CategoryRepository {
  async create(data: Partial<ICategory>): Promise<ICategory> {
    return await Category.create(data);
  }

  async findById(id: string): Promise<ICategory | null> {
    return await Category.findById(id).populate('parent');
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    return await Category.findOne({ slug }).populate('parent');
  }

  async findAll(filter: any = {}): Promise<ICategory[]> {
    return await Category.find(filter).populate('parent');
  }

  async update(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
    return await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<ICategory | null> {
    return await Category.findByIdAndDelete(id);
  }
}
