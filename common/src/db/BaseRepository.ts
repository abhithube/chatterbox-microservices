export interface BaseRepository<T> {
  insertOne(data: T): Promise<T>;
  findOne(options: Partial<T>): Promise<T | null>;
  updateOne(
    filterOptions: Partial<T>,
    updateOptions: Partial<T>
  ): Promise<T | null>;
  deleteOne(options: Partial<T>): Promise<T | null>;
  deleteMany(options: Partial<T>): Promise<void>;
}
