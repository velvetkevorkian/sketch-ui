module.exports = {
  env: {
    browser: true
  },
  'extends': [
    'eslint:recommended'
  ],
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',
    'semi': ['warn', 'never']
  },
  parserOptions: {
    "ecmaVersion": 6,
    "sourceType": "module"
  }
}
