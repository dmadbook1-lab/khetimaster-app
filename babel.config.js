module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        blacklist: null,
        whitelist: ['API_BASE_URL', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_UPLOAD_PRESET'],
        safe: false,
        allowUndefined: true,
      },
    ],
  ],
};
