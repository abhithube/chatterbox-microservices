export interface DbConnection<T = any> {
  getClient: () => T;
}
