import { BannerRepository } from '../repositories/banner.repository';
import { FaqRepository } from '../repositories/faq.repository';
import { IBanner } from '../models/banner.model';
import { IFaq } from '../models/faq.model';
import { CreateBannerDTO, UpdateBannerDTO, CreateFaqDTO, UpdateFaqDTO } from '../validators/cms.validator';
import { NotFoundException } from '@/shared/exceptions';

export class CmsService {
  private bannerRepository = new BannerRepository();
  private faqRepository = new FaqRepository();

  // Banner operations
  async createBanner(data: CreateBannerDTO): Promise<IBanner> {
    return this.bannerRepository.create(data);
  }

  async getBannerById(id: string): Promise<IBanner> {
    const banner = await this.bannerRepository.findById(id);
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    return banner;
  }

  async getActiveBanners(type?: string): Promise<IBanner[]> {
    return this.bannerRepository.findActive(type);
  }

  async getAllBanners(): Promise<IBanner[]> {
    return this.bannerRepository.findAll();
  }

  async updateBanner(id: string, data: UpdateBannerDTO): Promise<IBanner> {
    const banner = await this.bannerRepository.update(id, data);
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    return banner;
  }

  async deleteBanner(id: string): Promise<void> {
    const banner = await this.bannerRepository.delete(id);
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
  }

  // FAQ operations
  async createFaq(data: CreateFaqDTO): Promise<IFaq> {
    return this.faqRepository.create(data);
  }

  async getFaqById(id: string): Promise<IFaq> {
    const faq = await this.faqRepository.findById(id);
    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }
    return faq;
  }

  async getActiveFaqs(): Promise<IFaq[]> {
    return this.faqRepository.findActive();
  }

  async getAllFaqs(): Promise<IFaq[]> {
    return this.faqRepository.findAll();
  }

  async updateFaq(id: string, data: UpdateFaqDTO): Promise<IFaq> {
    const faq = await this.faqRepository.update(id, data);
    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }
    return faq;
  }

  async deleteFaq(id: string): Promise<void> {
    const faq = await this.faqRepository.delete(id);
    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }
  }
}
