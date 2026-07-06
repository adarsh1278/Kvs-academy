import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(
  fileUri: string,
  folder: string = 'school-erp'
): Promise<{ secure_url: string; public_id: string }> {
  try {
    const res = await cloudinary.uploader.upload(fileUri, {
      folder,
      resource_type: 'auto',
    });
    return {
      secure_url: res.secure_url,
      public_id: res.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Image upload failed');
  }
}

export async function deleteImage(publicId: string): Promise<unknown> {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Image deletion failed');
  }
}
