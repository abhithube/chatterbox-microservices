import type { Config } from '@jest/types';

const options: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './',
  testMatch: ['<rootDir>/test/**/*.ts'],
};

export default options;
