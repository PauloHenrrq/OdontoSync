// ============================================================
// OdontoSync — Mock/Polyfill de Assert para Mobile
// Resolve a ausência de bibliotecas padrão do Node em React Native.
// ============================================================

const assert = function(condition: any, message?: string) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
};

assert.ok = function(val: any, msg?: string) {
  if (!val) throw new Error(msg || 'Assertion failed');
};

assert.equal = function(a: any, b: any, msg?: string) {
  if (a != b) throw new Error(msg || `Assertion failed: ${a} != ${b}`);
};

assert.strictEqual = function(a: any, b: any, msg?: string) {
  if (a !== b) throw new Error(msg || `Assertion failed: ${a} !== ${b}`);
};

module.exports = assert;
