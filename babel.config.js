module.exports = {
  presets: [
    ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    "nativewind/babel",
  ],
  plugins: [
    ['module:react-native-dotenv', {
      "moduleName": "@env",
      "path": ".env",
    }]
  ]
};