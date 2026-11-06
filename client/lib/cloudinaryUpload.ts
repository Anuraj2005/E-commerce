import { apiRequest } from './api';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
}

interface SignatureResponse {
  success: boolean;
  mode?: 'cloudinary' | 'dev-preview';
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

function fileToCompressedDataUrl(file: File, maxDimension = 1100): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(String(reader.result));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.84));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadToCloudinary(
  file: File,
  folder = 'artistic_fusion/products'
): Promise<CloudinaryUploadResponse> {
  // 1. Fetch cryptographic signature from Express API on Render
  const sigData = await apiRequest<SignatureResponse>('/media/upload-signature', {
    method: 'POST',
    body: JSON.stringify({ folder }),
  });

  // Graceful local preview mode if Cloudinary keys have not been pasted into server/.env yet
  if (sigData.mode === 'dev-preview') {
    const dataUrl = await fileToCompressedDataUrl(file);
    return {
      secure_url: dataUrl,
      public_id: `${folder}/local_${Date.now()}_${file.name.replace(/\s+/g, '_')}`,
    };
  }

  // 2. Direct signed upload from browser straight to Cloudinary CDN (zero server binary buffering)
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sigData.apiKey);
  formData.append('timestamp', sigData.timestamp.toString());
  formData.append('signature', sigData.signature);
  formData.append('folder', sigData.folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!uploadRes.ok) {
    const errPayload = await uploadRes.json().catch(() => ({}));
    throw new Error(errPayload?.error?.message || 'Cloudinary direct upload failed');
  }

  return (await uploadRes.json()) as CloudinaryUploadResponse;
}
