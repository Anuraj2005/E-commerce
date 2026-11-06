const cloudinary = require('cloudinary').v2;

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function isCloudinaryConfigured() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return false;
  }
  const placeholders = [
    'your_cloudinary_cloud_name',
    'your_cloudinary_api_key',
    'your_cloudinary_api_secret',
    'your_production_cloudinary_secret',
    'artistic-fusion-cloud',
  ];
  return (
    !placeholders.includes(CLOUDINARY_CLOUD_NAME.trim()) &&
    !placeholders.includes(CLOUDINARY_API_KEY.trim()) &&
    !placeholders.includes(CLOUDINARY_API_SECRET.trim())
  );
}

module.exports = {
  cloudinary,
  configureCloudinary,
  isCloudinaryConfigured,
};
