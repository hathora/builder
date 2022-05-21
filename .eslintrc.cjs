// module.exports = {
//   plugins: [
//     "import",
//   ],
//   rules: {
//     "import/order": [
//       "error",
//       {
//         groups: [
//           "index",
//           "sibling",
//           "parent",
//           "internal",
//           "external",
//           "builtin"
//         ]
//       }
//     ]
//   }
// }

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'eslint-plugin-import',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
};
