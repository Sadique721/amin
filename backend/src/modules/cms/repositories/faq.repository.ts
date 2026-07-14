import { Faq, IFaq } from '../models/faq.model';

export class FaqRepository {
  async create(data: any): Promise<IFaq> {
    return Faq.create(data);
  }

  async findById(id: string): Promise<IFaq | null> {
    return Faq.findById(id);
  }

  async findActive(): Promise<IFaq[]> {
    return Faq.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  }

  async findAll(query: any = {}): Promise<IFaq[]> {
    return Faq.find(query).sort({ order: 1, createdAt: -1 });
  }

  async update(id: string, data: any): Promise<IFaq | null> {
    return Faq.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<IFaq | null> {
    return Faq.findByIdAndDelete(id);
  }
}
