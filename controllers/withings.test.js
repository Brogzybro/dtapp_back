const { testtest } = require('./withings');

test('Should output name in appropriate format', () => {
  expect(testtest('test')).toBe('my name is test');
});
