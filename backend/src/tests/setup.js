const AppDataSource = require('../config/data-source');

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    console.log('Test Setup: Connecting to DB...');
    await AppDataSource.initialize();
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    console.log('Test Teardown: Disconnecting from DB...');
    await AppDataSource.destroy();
  }
});
