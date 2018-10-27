module.exports = {
  env: {
    browser: true,
    node: true
  },
  'extends': [
    'eslint:recommended'
  ],
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',
    'semi': ['warn', 'never'],
    'no-unused-vars': 'warn'
  },
  parserOptions: {
    "ecmaVersion": 6,
    "sourceType": "module"
  }
}
