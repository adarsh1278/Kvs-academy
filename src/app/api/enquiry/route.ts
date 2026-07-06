import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Enquiry } from '@/models/Enquiry';
import { Class } from '@/models/Class';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const {
      studentName,
      parentName,
      parentPhone,
      parentEmail,
      dob,
      gender,
      classApplyingFor,
      previousSchool,
      address,
      photographBase64, // base64 representation of student photo
      documentBase64,   // base64 representation of transfer certificate or birth certificate
    } = body;

    // Validate required fields
    if (!studentName || !parentName || !parentPhone || !dob || !gender || !classApplyingFor || !address) {
      return NextResponse.json({ success: false, error: 'Please enter all required fields' }, { status: 400 });
    }

    // Upload photograph to Cloudinary if provided
    let photographUrl = '';
    if (photographBase64) {
      try {
        const uploadRes = await uploadImage(photographBase64, 'school-admissions/photos');
        photographUrl = uploadRes.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary photo upload failed:', uploadErr);
        // Do not crash, continue saving enquiry
      }
    }

    // Upload document to Cloudinary if provided
    const uploadedDocs = [];
    if (documentBase64) {
      try {
        const uploadRes = await uploadImage(documentBase64, 'school-admissions/documents');
        uploadedDocs.push({
          name: 'Birth Certificate / TC',
          url: uploadRes.secure_url,
        });
      } catch (uploadErr) {
        console.error('Cloudinary document upload failed:', uploadErr);
      }
    }

    // Double check if class exists
    const targetClass = await Class.findById(classApplyingFor);
    if (!targetClass) {
      return NextResponse.json({ success: false, error: 'Selected class does not exist' }, { status: 400 });
    }

    const enquiry = await Enquiry.create({
      studentName,
      parentName,
      parentPhone,
      parentEmail,
      dob: new Date(dob),
      gender,
      classApplyingFor,
      previousSchool,
      address,
      photograph: photographUrl,
      documents: uploadedDocs,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      message: 'Your admission enquiry has been submitted successfully!',
      enquiryId: enquiry._id,
    });
  } catch (error: any) {
    console.error('Enquiry Submission Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
