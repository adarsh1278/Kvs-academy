import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Student } from '@/models/Student';
import { FeeStructure, StudentFee } from '@/models/Fee';
import { hashPassword } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';
import { sendCredentialsEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const {
      name,
      email,
      admissionNo,
      rollNo,
      classId,
      sectionId,
      dob,
      gender,
      parentName,
      parentPhone,
      parentEmail,
      emergencyContact,
      address,
      phone,
      photographBase64,
    } = body;

    if (!name || !email || !admissionNo || !rollNo || !classId || !sectionId || !dob || !gender || !parentName || !parentPhone || !address) {
      return NextResponse.json({ success: false, error: 'Please enter all required fields' }, { status: 400 });
    }

    const trimmedPhone = phone ? String(phone).trim() : '';
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, ...(trimmedPhone ? [{ phone: trimmedPhone }] : [])],
    });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'User with this email or phone already exists' }, { status: 400 });
    }

    let profileImage = '';
    if (photographBase64) {
      const upload = await uploadImage(photographBase64, 'school-admissions/photos');
      profileImage = upload.secure_url;
    }

    const generatedPassword = 'Admin@123';
    const defaultPass = await hashPassword(generatedPassword);

    // Create User
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      phone: trimmedPhone || undefined,
      password: defaultPass,
      role: 'student',
      status: 'active',
      profileImage: profileImage || undefined,
    });

    // Create Student dossier
    const student = await Student.create({
      user: user._id,
      admissionNo,
      rollNo,
      class: classId,
      section: sectionId,
      dob: new Date(dob),
      gender,
      parentName,
      parentPhone,
      parentEmail: parentEmail || '',
      emergencyContact: emergencyContact || parentPhone,
      address,
      profileImage,
    });

    // Assign Fee ledger structure if it exists
    const feeStructure = await FeeStructure.findOne({ class: classId });
    if (feeStructure) {
      const installments = feeStructure.installments.map((inst: { name: string; dueDate: Date; amount: number; category: string }) => ({
        name: inst.name,
        dueDate: inst.dueDate,
        amount: inst.amount,
        paidAmount: 0,
        status: 'Unpaid',
        category: inst.category,
      }));

      await StudentFee.create({
        student: student._id,
        feeStructure: feeStructure._id,
        installments,
      });
    }

    try {
      await sendCredentialsEmail(user.email, user.name, generatedPassword, user.role);
    } catch (mailError) {
      console.error('Student credentials email dispatch failed:', mailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Student registered successfully',
      studentId: student._id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to register student';
    console.error('Student registration error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
