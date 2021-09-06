import crypto from 'crypto';
import { User, UserDocument } from '../models';
import {
  UserFilterOptions,
  UserInsertOptions,
  UserUpdateOptions,
} from '../types';

export interface UsersRepository {
  insertOne(insertOptions: UserInsertOptions): Promise<UserDocument>;
  findOne(filterOptions: UserFilterOptions): Promise<UserDocument | null>;
  updateOne(
    filterOptions: UserFilterOptions,
    updateOptions: UserUpdateOptions
  ): Promise<UserDocument | null>;
  deleteOne(filterOptions: UserFilterOptions): Promise<UserDocument | null>;
  deleteMany(): Promise<void>;
}

export function createUsersRepository(): UsersRepository {
  async function insertOne(
    insertOptions: UserInsertOptions
  ): Promise<UserDocument> {
    const user: UserDocument = {
      ...insertOptions,
      id: crypto.randomUUID(),
    };

    User.create<UserDocument>([
      {
        ...user,
      },
    ]);

    return user;
  }

  async function findOne(
    options: UserFilterOptions
  ): Promise<UserDocument | null> {
    const docs = await User.aggregate<UserDocument>([
      { $match: options },
      { $project: { _id: 0, __v: 0 } },
      { $limit: 1 },
    ]);

    const user = docs[0];
    return user;
  }

  async function updateOne(
    filterOptions: UserFilterOptions,
    updateOptions: UserUpdateOptions
  ): Promise<UserDocument | null> {
    return User.findOneAndUpdate(
      filterOptions,
      {
        $set: updateOptions,
      },
      {
        new: true,
      }
    ).exec();
  }

  async function deleteOne(
    filterOptions: UserFilterOptions
  ): Promise<UserDocument | null> {
    return User.findOneAndDelete(filterOptions);
  }

  async function deleteMany(): Promise<void> {
    User.deleteMany();
  }

  return {
    insertOne,
    findOne,
    updateOne,
    deleteOne,
    deleteMany,
  };
}
