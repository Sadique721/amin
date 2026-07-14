import { Request, Response, NextFunction } from 'express';
import { CmsService } from '../services/cms.service';
import { ApiResponse } from '@/shared/api/ApiResponse';

export class CmsController {
  private cmsService = new CmsService();

  // Banner controllers
  createBanner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const banner = await this.cmsService.createBanner(req.body);
      res.status(201).json(new ApiResponse(201, banner, 'Banner created successfully'));
    } catch (error) {
      next(error);
    }
  };

  getBannerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const banner = await this.cmsService.getBannerById(req.params.id);
      res.status(200).json(new ApiResponse(200, banner));
    } catch (error) {
      next(error);
    }
  };

  getActiveBanners = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type } = req.query;
      const banners = await this.cmsService.getActiveBanners(type ? String(type) : undefined);
      res.status(200).json(new ApiResponse(200, banners));
    } catch (error) {
      next(error);
    }
  };

  getAllBanners = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const banners = await this.cmsService.getAllBanners();
      res.status(200).json(new ApiResponse(200, banners));
    } catch (error) {
      next(error);
    }
  };

  updateBanner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const banner = await this.cmsService.updateBanner(req.params.id, req.body);
      res.status(200).json(new ApiResponse(200, banner, 'Banner updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteBanner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.cmsService.deleteBanner(req.params.id);
      res.status(200).json(new ApiResponse(200, null, 'Banner deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  // FAQ controllers
  createFaq = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const faq = await this.cmsService.createFaq(req.body);
      res.status(201).json(new ApiResponse(201, faq, 'FAQ created successfully'));
    } catch (error) {
      next(error);
    }
  };

  getFaqById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const faq = await this.cmsService.getFaqById(req.params.id);
      res.status(200).json(new ApiResponse(200, faq));
    } catch (error) {
      next(error);
    }
  };

  getActiveFaqs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const faqs = await this.cmsService.getActiveFaqs();
      res.status(200).json(new ApiResponse(200, faqs));
    } catch (error) {
      next(error);
    }
  };

  getAllFaqs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const faqs = await this.cmsService.getAllFaqs();
      res.status(200).json(new ApiResponse(200, faqs));
    } catch (error) {
      next(error);
    }
  };

  updateFaq = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const faq = await this.cmsService.updateFaq(req.params.id, req.body);
      res.status(200).json(new ApiResponse(200, faq, 'FAQ updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteFaq = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.cmsService.deleteFaq(req.params.id);
      res.status(200).json(new ApiResponse(200, null, 'FAQ deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}
