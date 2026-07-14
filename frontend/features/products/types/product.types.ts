export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string | ICategory | null;
  image?: string;
  isActive: boolean;
}

export interface IVariant {
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  attributes: Record<string, string | number>;
  images: string[];
  isActive: boolean;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: ICategory;
  brand: string;
  images: string[];
  ratingsAverage: number;
  ratingsQuantity: number;
  tags: string[];
  isActive: boolean;
  type: 'jewellery' | 'cosmetics';
  specifications: Record<string, any>;
  variants: IVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search: string;
  category: string;
  brand: string[];
  minPrice?: number;
  maxPrice?: number;
  type?: 'jewellery' | 'cosmetics';
  rating?: number;
  sortBy: string;
  page: number;
  limit: number;
}
