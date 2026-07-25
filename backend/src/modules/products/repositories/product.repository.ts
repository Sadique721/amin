import mongoose from 'mongoose';
import { Product, IProduct } from '../models/product.model';
import { Category } from '../../categories/models/category.model';

export interface ProductFilterParams {
  search?: string;
  category?: string;
  brand?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  type?: 'jewellery' | 'cosmetics';
  rating?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export class ProductRepository {
  async create(data: Partial<IProduct>): Promise<IProduct> {
    return await Product.create(data);
  }

  async findById(id: string): Promise<IProduct | null> {
    return await Product.findById(id).populate('category');
  }

  async findBySlug(slug: string): Promise<IProduct | null> {
    return await Product.findOne({ slug }).populate('category');
  }

  async update(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
    return await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<IProduct | null> {
    return await Product.findByIdAndDelete(id);
  }

  async findFilteredProducts(params: ProductFilterParams): Promise<any> {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      type,
      rating,
      sortBy,
      page = 1,
      limit = 12
    } = params;

    const filter: any = { isActive: true };

    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        const catDoc = await Category.findOne({ slug: category });
        if (catDoc) {
          filter.category = catDoc._id;
        } else {
          const escapedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const catDocByName = await Category.findOne({ name: { $regex: new RegExp(`^${escapedCategory}$`, 'i') } });
          if (catDocByName) {
            filter.category = catDocByName._id;
          } else {
            filter.category = new mongoose.Types.ObjectId();
          }
        }
      } else {
        filter.category = category;
      }
    }

    if (brand) {
      if (Array.isArray(brand)) {
        filter.brand = { $in: brand };
      } else {
        filter.brand = brand;
      }
    }

    if (type) {
      filter.type = type;
    }

    if (rating) {
      filter.ratingsAverage = { $gte: Number(rating) };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: any = {};
      if (minPrice !== undefined) priceFilter.$gte = Number(minPrice);
      if (maxPrice !== undefined) priceFilter.$lte = Number(maxPrice);
      filter['variants.price'] = priceFilter;
    }

    let sort: any = { createdAt: -1 };
    if (sortBy) {
      if (sortBy === 'price-asc') {
        sort = { 'variants.price': 1 };
      } else if (sortBy === 'price-desc') {
        sort = { 'variants.price': -1 };
      } else if (sortBy === 'ratings') {
        sort = { ratingsAverage: -1 };
      } else if (sortBy === 'newest') {
        sort = { createdAt: -1 };
      }
    }

    const options = {
      page,
      limit,
      sort,
      populate: 'category',
    };

    return await Product.paginate(filter, options);
  }

  async getFilterFacets(type?: string): Promise<any> {
    const match: any = { isActive: true };
    if (type) {
      match.type = type;
    }

    const facets = await Product.aggregate([
      { $match: match },
      {
        $facet: {
          brands: [
            { $group: { _id: '$brand', count: { $sum: 1 } } },
            { $project: { name: '$_id', count: 1, _id: 0 } },
            { $sort: { name: 1 } }
          ],
          priceRange: [
            { $unwind: '$variants' },
            {
              $group: {
                _id: null,
                min: { $min: '$variants.price' },
                max: { $max: '$variants.price' }
              }
            }
          ]
        }
      }
    ]);

    const result = facets[0];
    return {
      brands: result.brands || [],
      priceRange: result.priceRange && result.priceRange[0] ? {
        min: result.priceRange[0].min,
        max: result.priceRange[0].max
      } : { min: 0, max: 100000 }
    };
  }
}
