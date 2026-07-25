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
      const cleanString = (val: any): string | undefined => {
        if (!val || val === 'undefined' || val === 'null' || val === '') return undefined;
        return val as string;
      };

      const cleanNumber = (val: any): number | undefined => {
        if (!val || val === 'undefined' || val === 'null' || val === '') return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
      };

      const cleanBrand = (val: any): string[] | undefined => {
        if (!val || val === 'undefined' || val === 'null' || val === '') return undefined;
        const list = (val as string)
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s && s !== 'undefined' && s !== 'null');
        return list.length > 0 ? list : undefined;
      };

      const filterParams = {
        search: cleanString(req.query.search),
        category: cleanString(req.query.category),
        brand: cleanBrand(req.query.brand),
        minPrice: cleanNumber(req.query.minPrice),
        maxPrice: cleanNumber(req.query.maxPrice),
        type: cleanString(req.query.type) as 'jewellery' | 'cosmetics' | undefined,
        rating: cleanNumber(req.query.rating),
        sortBy: cleanString(req.query.sortBy),
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
