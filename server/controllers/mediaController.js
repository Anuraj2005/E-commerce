const { cloudinary, configureCloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

exports.getUploadSignature = (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const allowedFolders = [
      'artistic_fusion/products',
      'artistic_fusion/customer_uploads',
      'artistic_fusion/highlights',
    ];
    const requestedFolder = req.body?.folder || 'artistic_fusion/products';
    const folder = allowedFolders.includes(requestedFolder)
      ? requestedFolder
      : 'artistic_fusion/products';

    if (!isCloudinaryConfigured()) {
      return res.status(200).json({
        success: true,
        mode: 'dev-preview',
        signature: 'dev_preview_signature',
        timestamp,
        apiKey: 'dev_preview_key',
        cloudName: 'dev-preview',
        folder,
      });
    }

    configureCloudinary();

    const paramsToSign = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return res.status(200).json({
      success: true,
      mode: 'cloudinary',
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Signature generation failed',
      error: err.message,
    });
  }
};
