import { Banner, IBanner } from '../models/banner.model';

export class BannerRepository {
  async create(data: any): Promise<IBanner> {
    return Banner.create(data);
  }

  async findById(id: string): Promise<IBanner | null> {
    return Banner.findById(id);
  }

  async findActive(type?: string): Promise<IBanner[]> {
    const query: any = { isActive: true };
    if (type) {
      query.type = type;
    }
    return Banner.find(query).sort({ order: 1, createdAt: -1 });
  }

  async findAll(query: any = {}): Promise<IBanner[]> {
    return Banner.find(query).sort({ order: 1, createdAt: -1 });
  }

  async update(id: string, data: any): Promise<IBanner | null> {
    return Banner.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<IBanner | null> {
    return Banner.findByIdAndDelete(id);
  }
}
