// jest.config.cjs
export default {
  testEnvironment: 'node',
  transform: {},       // no transform, or add babel-jest if needed
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // optional if using import without extension
  },
  // remove extensionsToTreatAsEsm
};
