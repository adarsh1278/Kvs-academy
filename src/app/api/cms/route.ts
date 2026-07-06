import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { CMS } from '@/models/CMS';
import { uploadImage } from '@/lib/cloudinary';

export async function GET() {
  try {
    await connectToDatabase();
    let config = await CMS.findOne({ key: 'school_settings' });
    
    if (!config) {
      config = await CMS.create({
        key: 'school_settings',
        value: {
          heroTitle: 'Excellence Academy, New Delhi',
          heroSubtitle: 'Nurturing Leaders of Tomorrow. Affiliated to CBSE.',
          bannerImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
          aboutUs: 'Founded in 2005, Excellence Academy is a premier co-educational institution committed to academic excellence, character development, and social responsibility.',
          address: '45, Palm Avenue, Sector 5, New Delhi - 110001',
          phone: '+91 11 2345 6789',
          toppers: [
            { name: 'Aditya Sen', score: '98.6%', className: 'Class 12', photograph: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300' },
            { name: 'Riya Gupta', score: '98.2%', className: 'Class 10', photograph: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' }
          ],
          achievements: [
            { title: 'National Science Bowl Champion', description: 'Awarded first place in national level robotics and science prototyping.', year: '2025' },
            { title: 'Best CBSE Infrastructure Award', description: 'Recognized for state-of-the-art labs and digital smart classrooms.', year: '2024' }
          ]
        },
      });
    }

    return NextResponse.json({ success: true, config: config.value });
  } catch (error: any) {
    console.error('CMS config fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { heroTitle, heroSubtitle, bannerImageBase64, aboutUs, address, phone, toppers, achievements } = body;

    let config = await CMS.findOne({ key: 'school_settings' });
    const existingValue = config ? config.value : {};

    // Upload banner image if provided
    let bannerImageUrl = existingValue.bannerImage || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200';
    if (bannerImageBase64) {
      try {
        const uploadRes = await uploadImage(bannerImageBase64, 'school-cms/banners');
        bannerImageUrl = uploadRes.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary CMS banner upload failed:', uploadErr);
      }
    }

    // Process toppers photographs if any are base64
    const processedToppers = [];
    if (toppers && Array.isArray(toppers)) {
      for (const topper of toppers) {
        let photoUrl = topper.photograph;
        if (topper.photographBase64) {
          try {
            const uploadRes = await uploadImage(topper.photographBase64, 'school-cms/toppers');
            photoUrl = uploadRes.secure_url;
          } catch (err) {
            console.error('Cloudinary CMS topper photo upload failed:', err);
          }
        }
        processedToppers.push({
          name: topper.name,
          score: topper.score,
          className: topper.className,
          photograph: photoUrl,
        });
      }
    }

    const newValue = {
      heroTitle,
      heroSubtitle,
      bannerImage: bannerImageUrl,
      aboutUs,
      address,
      phone,
      toppers: processedToppers.length > 0 ? processedToppers : (existingValue.toppers || []),
      achievements: achievements || (existingValue.achievements || []),
    };

    if (config) {
      config.value = { ...config.value, ...newValue };
      config.markModified('value');
      await config.save();
    } else {
      config = await CMS.create({
        key: 'school_settings',
        value: newValue,
      });
    }

    return NextResponse.json({ success: true, config: config.value });
  } catch (error: any) {
    console.error('CMS config update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
