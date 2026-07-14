import { UserRepository } from '../repositories/user.repository';
import { AddressDTO, UpdateUserDTO } from '../validators/user.validator';
import { NotFoundException } from '@/shared/exceptions';
import { IUser } from '../models/user.model';
import crypto from 'crypto';

export class UserService {
  private userRepository = new UserRepository();

  async getProfile(userId: string): Promise<IUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User profile not found');
    }
    return user;
  }

  async updateProfile(userId: string, data: UpdateUserDTO): Promise<IUser> {
    const { name, phone, password } = data;
    const updateData: any = { name, phone };
    if (password) {
      updateData.password = crypto.createHash('sha256').update(password).digest('hex');
    }
    const user = await this.userRepository.update(userId, updateData);
    if (!user) {
      throw new NotFoundException('User profile not found');
    }
    return user;
  }

  async addAddress(userId: string, addressData: AddressDTO): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (addressData.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(addressData as any);
    await user.save();
    return user.addresses;
  }

  async deleteAddress(userId: string, addressId: string): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.addresses = user.addresses.filter((addr: any) => addr._id.toString() !== addressId) as any;
    await user.save();
    return user.addresses;
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let found = false;
    user.addresses.forEach((addr: any) => {
      if (addr._id.toString() === addressId) {
        addr.isDefault = true;
        found = true;
      } else {
        addr.isDefault = false;
      }
    });

    if (!found) {
      throw new NotFoundException('Address not found');
    }

    await user.save();
    return user.addresses;
  }
}
