import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { FeeStructure, FeeCategory } from '@/models/Fee';
import { Class } from '@/models/Class';

export async function GET() {
  try {
    await connectToDatabase();
    const structures = await FeeStructure.find({}).populate('class').sort({ createdAt: -1 });

    const flatList: any[] = [];
    structures.forEach((struct) => {
      struct.installments.forEach((inst: any) => {
        flatList.push({
          id: `${struct._id}-${inst._id || inst.name}`,
          className: struct.class?.name || 'Class',
          category: inst.name,
          amount: inst.amount,
          dueDate: inst.dueDate.toISOString().split('T')[0],
        });
      });
    });

    return NextResponse.json({ success: true, feeStructures: flatList });
  } catch (error: any) {
    console.error('Fee structures fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { className, category, amount, dueDate } = body;

    if (!className || !category || !amount || !dueDate) {
      return NextResponse.json({ success: false, error: 'Please enter all required fields' }, { status: 400 });
    }

    const classObj = await Class.findOne({ name: className });
    if (!classObj) {
      return NextResponse.json({ success: false, error: 'Target Class does not exist' }, { status: 400 });
    }

    // Resolve Category ObjectId
    let feeCat = await FeeCategory.findOne({ name: { $regex: new RegExp(category, 'i') } });
    if (!feeCat) {
      feeCat = await FeeCategory.findOne({});
    }
    if (!feeCat) {
      feeCat = await FeeCategory.create({
        name: 'Tuition Fee',
        code: 'tuition-fee',
        description: 'Academic tuition installment',
      });
    }

    // Create installment
    const newInstallment = {
      name: category,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      category: feeCat._id,
    };

    // Check if structure exists for class, if so append, else create
    let structure = await FeeStructure.findOne({ class: classObj._id });
    if (structure) {
      structure.installments.push(newInstallment);
      await structure.save();
    } else {
      let activeSession = await mongoose.model('AcademicSession').findOne({ isCurrent: true });
      if (!activeSession) {
        activeSession = await mongoose.model('AcademicSession').findOne({});
      }
      if (!activeSession) {
        return NextResponse.json({ success: false, error: 'No active academic session found' }, { status: 400 });
      }
      structure = await FeeStructure.create({
        name: `${className} Standard Fee Template`,
        class: classObj._id,
        academicSession: activeSession._id,
        installments: [newInstallment],
      });
    }

    return NextResponse.json({ success: true, structure });
  } catch (error: any) {
    console.error('Fee structure creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || '';

    if (!id) {
      return NextResponse.json({ success: false, error: 'id query parameter is required' }, { status: 400 });
    }

    const [structId, instId] = id.split('-');
    if (!structId || !instId) {
      return NextResponse.json({ success: false, error: 'Invalid fee structure ID format' }, { status: 400 });
    }

    const structure = await FeeStructure.findById(structId);
    if (!structure) {
      return NextResponse.json({ success: false, error: 'Fee structure not found' }, { status: 404 });
    }

    // Filter out the installment
    structure.installments = structure.installments.filter(
      (inst: any) => (inst._id ? inst._id.toString() : inst.name) !== instId
    );

    if (structure.installments.length === 0) {
      await FeeStructure.findByIdAndDelete(structId);
    } else {
      await structure.save();
    }

    return NextResponse.json({ success: true, message: 'Fee structure item deleted successfully' });
  } catch (error: any) {
    console.error('Fee structure delete error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id, amount, dueDate } = body;

    if (!id || amount === undefined || !dueDate) {
      return NextResponse.json({ success: false, error: 'Please enter all required fields' }, { status: 400 });
    }

    const [structId, instId] = id.split('-');
    if (!structId || !instId) {
      return NextResponse.json({ success: false, error: 'Invalid fee structure ID format' }, { status: 400 });
    }

    const structure = await FeeStructure.findById(structId);
    if (!structure) {
      return NextResponse.json({ success: false, error: 'Fee structure not found' }, { status: 404 });
    }

    const installment = structure.installments.find(
      (inst: any) => (inst._id ? inst._id.toString() : inst.name) === instId
    );

    if (!installment) {
      return NextResponse.json({ success: false, error: 'Installment not found' }, { status: 404 });
    }

    installment.amount = parseFloat(amount);
    installment.dueDate = new Date(dueDate);

    await structure.save();

    return NextResponse.json({ success: true, message: 'Fee structure item updated successfully', structure });
  } catch (error: any) {
    console.error('Fee structure patch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
