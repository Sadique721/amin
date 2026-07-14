import { Schema } from 'mongoose';

export interface QueryOptions {
  sortBy?: string;
  populate?: string;
  limit?: number;
  page?: number;
}

export interface QueryResult<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export const paginatePlugin = (schema: Schema) => {
  schema.statics.paginate = async function <T>(
    this: any,
    filter: Record<string, any>,
    options: QueryOptions
  ): Promise<QueryResult<T>> {
    let sort = '';
    if (options.sortBy) {
      const sortingCriteria: string[] = [];
      options.sortBy.split(',').forEach((sortOption) => {
        const [key, order] = sortOption.split(':');
        sortingCriteria.push((order === 'desc' ? '-' : '') + key);
      });
      sort = sortingCriteria.join(' ');
    } else {
      sort = '-createdAt';
    }

    const limit = options.limit && parseInt(options.limit.toString(), 10) > 0 ? parseInt(options.limit.toString(), 10) : 10;
    const page = options.page && parseInt(options.page.toString(), 10) > 0 ? parseInt(options.page.toString(), 10) : 1;
    const skip = (page - 1) * limit;

    const countPromise = this.countDocuments(filter).exec();
    let docsPromise: any = this.find(filter).sort(sort).skip(skip).limit(limit);

    if (options.populate) {
      options.populate.split(',').forEach((populateOption) => {
        docsPromise = docsPromise.populate(
          populateOption
            .split('.')
            .reverse()
            .reduce((a, b) => ({ path: b, populate: a }) as any)
        );
      });
    }

    const [totalResults, results] = await Promise.all([countPromise, docsPromise.exec()]);
    const totalPages = Math.ceil(totalResults / limit);

    return {
      results: results as T[],
      page,
      limit,
      totalPages,
      totalResults,
    };
  };
};
