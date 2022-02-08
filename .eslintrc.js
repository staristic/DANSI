module.exports = {
  'env': {
    'browser': true,
    'es6': true,
  },
  'extends': ['eslint:recommended', 'google'],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parserOptions': {
    'ecmaVersion': "2021",
    'sourceType': 'module',
  },
  'rules': {
    "require-jsdoc" : 0,
		'max-len': 'off',
    "linebreak-style": 0,
    "no-prototype-builtins": 0,
  },
};
