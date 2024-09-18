/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
    setupFilesAfterEnv: ['./jest.setup.ts']
};
   

  