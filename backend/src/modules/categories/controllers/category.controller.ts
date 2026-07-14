import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';
import { ApiResponse } from '@/shared/api/ApiResponse';

export class CategoryController {
  private service = new CategoryService();

  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.service.createCategory(req.body);
      res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
    } catch (error) {
      next(error);
    }
  };

  getCategoryBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.service.getCategoryBySlug(req.params.slug);
      res.status(200).json(new ApiResponse(200, category, 'Category retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.service.getAllCategories(req.query);
      res.status(200).json(new ApiResponse(200, categories, 'Categories retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.service.updateCategory(req.params.id, req.body);
      res.status(200).json(new ApiResponse(200, category, 'Category updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteCategory(req.params.id);
      res.status(200).json(new ApiResponse(200, null, 'Category deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}
