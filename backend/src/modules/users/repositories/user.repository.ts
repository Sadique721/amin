import mongoose from 'mongoose';
import { User, IUser } from '../models/user.model';
import { CreateUserDTO } from '../validators/user.validator';


export class UserRepository {
  async create(data: Partial<IUser>): Promise<IUser> {
    return User.create(data);
  }

  async findById(id: string): Promise<IUser | null> {
    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const user = await User.findById(id);
        if (user) return user;
      }
      return await User.findOne({ email: id.toLowerCase() });
    } catch {
      return null;
    }
  }


  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return User.findOne({ googleId });
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<IUser | null> {
    return User.findByIdAndDelete(id);
  }

  async paginate(filter: Record<string, any>, options: Record<string, any>) {
    return User.paginate(filter, options);
  }
}
