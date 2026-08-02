const cloudinary = require('cloudinary').v2;

if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
  throw new Error('Missing Cloudinary environment variables. Set CLOUD_NAME, CLOUD_API_KEY, and CLOUD_API_SECRET.');
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

module.exports = {
  cloudinary,
};