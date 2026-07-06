import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Enquiry } from '@/models/Enquiry';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { enquiryId, status } = body;

    if (!enquiryId || !status) {
      return NextResponse.json({ success: false, error: 'Enquiry ID and status are required' }, { status: 450 });
    }

    const enq = await Enquiry.findById(enquiryId);
    if (!enq) {
      return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 });
    }

    enq.status = status;
    await enq.save();

    return NextResponse.json({ success: true, message: 'Status updated successfully' });
  } catch (error: any) {
    console.error('Enquiry status update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
