export interface PasswordHasher {
  hash(data: string): Promise<string>;
  hashSync(data: string): string;
  compare(data: string, hashed: string): Promise<boolean>;
  compareSync(data: string, hashed: string): boolean;
}
