module.exports = {
  'env': {
    'browser': true,
    'es6': true,
  },
  'extends': 'google',
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module',
  },
  'rules': {
    "require-jsdoc" : 0,
		'max-len': 'off'
  },
};