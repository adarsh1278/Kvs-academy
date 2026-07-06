import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { StudentFee, FeePayment } from '@/models/Fee';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    // Get cashier session details
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Cashier session not found' }, { status: 401 });
    }

    const cashier = await verifyToken(token);
    if (!cashier || !['super_admin', 'admin', 'receptionist'].includes(cashier.role)) {
      return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
    const {
      studentId,
      installmentName,
      amountPaid,
      paymentMode,
      receiptNo,
      paymentDate,
      remarks,
    } = body;

    if (!studentId || !installmentName || !amountPaid || !paymentMode || !receiptNo) {
      return NextResponse.json({ success: false, error: 'Missing required fee collection fields' }, { status: 400 });
    }

    // 1. Locate student fee ledger
    const ledger = await StudentFee.findOne({ student: studentId });
    if (!ledger) {
      return NextResponse.json({ success: false, error: 'Fee ledger not found for this student' }, { status: 404 });
    }

    // 2. Find and update the specific installment
    const installmentIndex = ledger.installments.findIndex((inst: any) => inst.name === installmentName);
    if (installmentIndex === -1) {
      return NextResponse.json({ success: false, error: `Installment '${installmentName}' not found` }, { status: 400 });
    }

    const inst = ledger.installments[installmentIndex];
    const newPaidAmount = inst.paidAmount + Number(amountPaid);

    if (newPaidAmount > inst.amount) {
      return NextResponse.json({
        success: false,
        error: `Overpayment: Cannot pay more than the outstanding balance of ₹${inst.amount - inst.paidAmount}`,
      }, { status: 400 });
    }

    // Update status
    let newStatus: 'Unpaid' | 'Partial' | 'Paid' = 'Partial';
    if (newPaidAmount >= inst.amount) {
      newStatus = 'Paid';
    } else if (newPaidAmount === 0) {
      newStatus = 'Unpaid';
    }

    ledger.installments[installmentIndex].paidAmount = newPaidAmount;
    ledger.installments[installmentIndex].status = newStatus;
    await ledger.save();

    // 3. Create payment audit log
    const payment = await FeePayment.create({
      student: studentId,
      installmentName,
      amountPaid: Number(amountPaid),
      paymentMode,
      receiptNo,
      paymentDate: new Date(paymentDate || Date.now()),
      remarks,
      collectedBy: cashier.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully',
      payment,
    });
  } catch (error: any) {
    console.error('Fee collection error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
