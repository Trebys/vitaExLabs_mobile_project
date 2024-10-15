// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ["expo", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
        "no-mixed-spaces-and-tabs": "off",
        indent: "off",
        "space-in-parens": "off",
        "space-before-function-paren": "off",
      },
    ],
    // Permitir comas finales en objetos y arrays multilínea
    "comma-dangle": ["error", "always-multiline"],
  },
};
