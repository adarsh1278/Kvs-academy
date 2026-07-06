import mongoose, { Schema } from 'mongoose';

// 1. Fee Category Schema
const FeeCategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. "Tuition Fee", "Transport Fee"
    description: { type: String },
  },
  { timestamps: true }
);

// 2. Fee Structure Schema (Templates for Classes)
const InstallmentTemplateSchema = new Schema({
  name: { type: String, required: true }, // e.g. "Term 1", "Quarter 1"
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'FeeCategory', required: true },
});

const FeeStructureSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g. "Class 10 Regular Fee"
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    academicSession: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true },
    installments: [InstallmentTemplateSchema],
  },
  { timestamps: true }
);

FeeStructureSchema.index({ name: 1, academicSession: 1 }, { unique: true });

// 3. Student Fee Ledger (Instantiated per Student)
const StudentFeeInstallmentSchema = new Schema({
  name: { type: String, required: true },
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  paidAmount: { type: Number, required: true, default: 0 },
  status: {
    type: String,
    required: true,
    enum: ['Unpaid', 'Partial', 'Paid'],
    default: 'Unpaid',
  },
  category: { type: Schema.Types.ObjectId, ref: 'FeeCategory', required: true },
});

const StudentFeeSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
    feeStructure: { type: Schema.Types.ObjectId, ref: 'FeeStructure', required: true },
    installments: [StudentFeeInstallmentSchema],
  },
  { timestamps: true }
);

// 4. Fee Payment Receipt Schema (Audit Trail)
const FeePaymentSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    installmentName: { type: String, required: true }, // Name of the installment paid
    amountPaid: { type: Number, required: true },
    paymentMode: {
      type: String,
      required: true,
      enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Other'],
      default: 'Cash',
    },
    receiptNo: { type: String, required: true, unique: true }, // Generated invoice reference
    paymentDate: { type: Date, required: true, default: Date.now },
    remarks: { type: String, default: '' },
    collectedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Receptionist/Admin reference
  },
  { timestamps: true }
);

export const FeeCategory = mongoose.models.FeeCategory || mongoose.model('FeeCategory', FeeCategorySchema);
export const FeeStructure = mongoose.models.FeeStructure || mongoose.model('FeeStructure', FeeStructureSchema);
export const StudentFee = mongoose.models.StudentFee || mongoose.model('StudentFee', StudentFeeSchema);
export const FeePayment = mongoose.models.FeePayment || mongoose.model('FeePayment', FeePaymentSchema);
