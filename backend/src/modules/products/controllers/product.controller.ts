import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { ApiResponse } from '@/shared/api/ApiResponse';

export class ProductController {
  private service = new ProductService();

  createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.service.createProduct(req.body);
      res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
    } catch (error) {
      next(error);
    }
  };

  getProductBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.service.getProductBySlug(req.params.slug);
      res.status(200).json(new ApiResponse(200, product, 'Product retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.service.getProductById(req.params.id);
      res.status(200).json(new ApiResponse(200, product, 'Product retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.service.updateProduct(req.params.id, req.body);
      res.status(200).json(new ApiResponse(200, product, 'Product updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteProduct(req.params.id);
      res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  searchProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filterParams = {
        search: req.query.search as string,
        category: req.query.category as string,
        brand: req.query.brand ? (req.query.brand as string).split(',') : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        type: req.query.type as 'jewellery' | 'cosmetics',
        rating: req.query.rating ? Number(req.query.rating) : undefined,
        sortBy: req.query.sortBy as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 12,
      };
      
      const result = await this.service.searchProducts(filterParams);
      res.status(200).json(new ApiResponse(200, result, 'Products retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getFacets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type } = req.query;
      const result = await this.service.getSearchFacets(type as string);
      res.status(200).json(new ApiResponse(200, result, 'Facets retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };
}
