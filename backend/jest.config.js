module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./src/tests/setup.js'],
  verbose: true,
  clearMocks: true,
  testTimeout: 10000,
};
