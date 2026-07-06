import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Enquiry } from '@/models/Enquiry';
import { User } from '@/models/User';
import { Student } from '@/models/Student';
import { Section } from '@/models/Section';
import { FeeStructure, StudentFee } from '@/models/Fee';
import { hashPassword } from '@/lib/auth';
import { sendCredentialsEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { enquiryId } = body;

    if (!enquiryId) {
      return NextResponse.json({ success: false, error: 'Enquiry ID is required' }, { status: 400 });
    }

    const enquiry = await Enquiry.findById(enquiryId);
    if (!enquiry) {
      return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 });
    }

    if (enquiry.status === 'converted') {
      return NextResponse.json({ success: false, error: 'Enquiry already converted to student' }, { status: 400 });
    }

    // Find a section for the student's class
    const section = await Section.findOne({ class: enquiry.classApplyingFor });
    if (!section) {
      return NextResponse.json({
        success: false,
        error: 'Please create at least one Section for this Class before converting admission.',
      }, { status: 400 });
    }

    // Generate unique email if parent email is not provided
    const tempEmail = enquiry.parentEmail || `student.${enquiry._id.toString().slice(-5)}@excellence.edu`;
    const generatedPassword = 'Admin@123';
    const defaultPass = await hashPassword(generatedPassword);

    // Create User record
    const user = await User.create({
      name: enquiry.studentName,
      email: tempEmail.toLowerCase().trim(),
      password: defaultPass,
      role: 'student',
      status: 'active',
      profileImage: enquiry.photograph || undefined,
    });

    // Create Student profile
    const admissionNo = `ADM-2026-${Math.floor(100 + Math.random() * 900)}`;
    const rollNo = `2610A${Math.floor(10 + Math.random() * 80)}`;

    const student = await Student.create({
      user: user._id,
      admissionNo,
      rollNo,
      class: enquiry.classApplyingFor,
      section: section._id,
      dob: enquiry.dob,
      gender: enquiry.gender,
      parentName: enquiry.parentName,
      parentPhone: enquiry.parentPhone,
      parentEmail: enquiry.parentEmail || '',
      emergencyContact: enquiry.parentPhone,
      address: enquiry.address,
      profileImage: enquiry.photograph || '',
      documents: enquiry.documents || [],
    });

    // Assign Fee Structure if it exists
    const feeStructure = await FeeStructure.findOne({ class: enquiry.classApplyingFor });
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

    // Update enquiry status
    enquiry.status = 'converted';
    await enquiry.save();

    try {
      await sendCredentialsEmail(user.email, user.name, generatedPassword, user.role);
    } catch (mailError) {
      console.error('Converted student credentials email dispatch failed:', mailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Enquiry converted successfully',
      student: {
        id: student._id,
        admissionNo,
        rollNo,
        email: tempEmail,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to convert enquiry';
    console.error('Enquiry conversion error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
