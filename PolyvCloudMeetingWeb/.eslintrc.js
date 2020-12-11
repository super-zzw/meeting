const devWarnProdError = process.env.NODE_ENV === 'production' ? 'error' : 'warn';


module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  plugins: ['sonarjs'],
  extends: [
    'plugin:vue/essential',
    '@vue/standard',
    'eslint:recommended',
    'plugin:sonarjs/recommended'
  ],
  // add your custom rules here
  rules: {
    // 调试
    'no-console': [
      devWarnProdError,
      { 'allow': ['info', 'log', 'warn', 'error', 'time', 'timeEnd'] }
    ],
    'no-debugger': devWarnProdError,

    // 基本
    'semi': ['error', 'always'],
    'indent': ['error', 2, {
      'SwitchCase': 1
    }],
    'brace-style': ['error', '1tbs', {
      'allowSingleLine': true
    }],
    'quotes': ['error', 'single'],

    // 变量
    'new-cap': 'error',
    'camelcase': 'error',
    'no-use-before-define': ['error', {
      'functions': false,
      'classes': false,
      'variables': true
    }],
    'no-unused-vars': devWarnProdError,

    // 空白与换行
    'semi-spacing': 'error',
    'array-bracket-spacing': ['error', 'never'],
    'block-spacing': ['error', 'always'],
    'computed-property-spacing': 'error',
    'comma-spacing': 'error',
    'func-call-spacing': 'error',
    'key-spacing': 'error',
    'keyword-spacing': 'error',
    'no-trailing-spaces': 'error',
    'no-whitespace-before-property': 'error',
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', {
      anonymous: 'never',
      named: 'never',
      asyncArrow: 'always'
    }],
    'space-in-parens': 'error',
    'space-infix-ops': 'error',
    'space-unary-ops': 'error',
    'spaced-comment': ['error', 'always', {
      'block': {
        'markers': ['!'],
        'balanced': true
      }
    }],
    'object-curly-spacing': ['error', 'always'],
    'object-property-newline': ['error', {
      allowAllPropertiesOnSameLine: true
    }],
    'operator-linebreak': ['error', 'after'],
    'eol-last': ['error', 'always'],

    // 逗号
    'comma-dangle': ['error', 'only-multiline'],
    'comma-style': 'error',

    // 其他
    'no-extra-bind': 'error',
    'no-extra-label': 'error',
    'no-floating-decimal': 'error',
    'no-implied-eval': 'error',
    'no-iterator': 'error',
    'no-loop-func': 'error',
    'no-multi-spaces': 'error',
    'no-proto': 'error',
    'no-script-url': 'error',
    'no-throw-literal': 'error',
    'no-useless-call': 'error',
    'no-with': 'error',
    'no-constant-condition': devWarnProdError,
    'no-empty': [devWarnProdError, {
      'allowEmptyCatch': true
    }],
    'curly': ['error', 'multi-line'],
    'wrap-iife': ['error', 'inside'],

    // ES6
    'no-var': 'error',
    'prefer-const': 'error',
    'no-duplicate-imports': 'error',
    'prefer-promise-reject-errors': 'error',
    'template-curly-spacing': ['error', 'never'],
    'arrow-spacing': 'error',
    'no-confusing-arrow': 'error',

    // Vue.js
    'vue/html-indent': ['error', 2],
    'vue/html-self-closing': ['error', {
      html: {
        'void': 'always',
        normal: 'never',
        component: 'always'
      }
    }],
    'vue/no-v-html': 0,
    'vue/max-attributes-per-line': ['error', {
      singleline: 3,
      multiline: 1
    }],
    'vue/singleline-html-element-content-newline': 0
  }
};
