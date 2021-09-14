export interface DbConnection<T> {
  getClient: () => T;
}
