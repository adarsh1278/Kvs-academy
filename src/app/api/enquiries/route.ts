import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Enquiry } from '@/models/Enquiry';

export async function GET() {
  try {
    await connectToDatabase();
    const enquiries = await Enquiry.find({})
      .populate('classApplyingFor')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, enquiries });
  } catch (error: any) {
    console.error('Enquiries fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
