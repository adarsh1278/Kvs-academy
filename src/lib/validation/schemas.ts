import { z } from 'zod';

// 1. Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const resetPasswordSelfSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const resetPasswordAdminSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// 2. Admission Enquiry Schema
export const enquirySchema = z.object({
  studentName: z.string().min(2, 'Student name must be at least 2 characters'),
  parentName: z.string().min(2, 'Parent/Guardian name must be at least 2 characters'),
  parentPhone: z.string().regex(/^\+?[1-9]\d{1,14}$|^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number'),
  parentEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  classApplyingFor: z.string().min(1, 'Please select the class applying for'),
  previousSchool: z.string().optional(),
  address: z.string().min(5, 'Please enter the complete address'),
  documents: z.array(z.object({ name: z.string(), url: z.string() })).optional(),
  photograph: z.string().optional(),
});

// 3. Student Form Schema
export const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  admissionNo: z.string().min(1, 'Admission number is required'),
  rollNo: z.string().min(1, 'Roll number is required'),
  classId: z.string().min(1, 'Please select a class'),
  sectionId: z.string().min(1, 'Please select a section'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  parentName: z.string().min(2, 'Parent name is required'),
  parentPhone: z.string().min(10, 'Enter valid phone number'),
  parentEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  emergencyContact: z.string().min(10, 'Enter valid emergency phone number'),
  address: z.string().min(5, 'Address is required'),
  aadhaarNo: z.string().optional().or(z.literal('')),
  profileImage: z.string().optional(),
  transportDetails: z.string().optional().or(z.literal('')),
  hostelDetails: z.string().optional().or(z.literal('')),
  academicHistory: z
    .array(
      z.object({
        schoolName: z.string().optional(),
        lastClass: z.string().optional(),
        percentage: z.coerce.number().optional(),
        year: z.string().optional(),
      })
    )
    .optional(),
});

// 4. Teacher Form Schema
export const teacherSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  teacherId: z.string().min(1, 'Teacher ID is required'),
  qualification: z.string().min(2, 'Qualifications are required'),
  experience: z.string().min(1, 'Experience detail is required'),
  subjects: z.array(z.string()).min(1, 'Assign at least one subject'),
  assignedClasses: z.array(z.string()).min(1, 'Assign at least one class'),
  salary: z.coerce.number().min(0, 'Salary must be a positive number'),
  employmentStatus: z.enum(['Active', 'Resigned', 'Suspended']),
  profileImage: z.string().optional(),
  joiningDate: z.string().min(1, 'Joining date is required'),
});

// 5. Attendance Marking Schema
export const attendanceSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().min(1, 'Section is required'),
  records: z.array(
    z.object({
      student: z.string(), // Student ID
      status: z.enum(['Present', 'Absent', 'Late', 'Half Day', 'Leave']),
      remarks: z.string().optional().or(z.literal('')),
    })
  ),
});

// 6. Homework Schema
export const homeworkSchema = z.object({
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().min(1, 'Section is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  attachmentUrl: z.string().optional(),
});

// 7. Notice Schema
export const noticeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(5, 'Content is required'),
  target: z.enum(['all', 'teachers', 'students', 'class']),
  targetClass: z.string().optional().or(z.literal('')),
  expiryDate: z.string().min(1, 'Expiry date is required'),
});

// 8. Fee Collection Schema (Offline Receipt Entry)
export const feeCollectionSchema = z.object({
  studentId: z.string().min(1, 'Student selection is required'),
  installmentName: z.string().min(1, 'Installment selection is required'),
  amountPaid: z.coerce.number().min(1, 'Collected amount must be greater than 0'),
  paymentMode: z.enum(['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Other']),
  receiptNo: z.string().min(1, 'Receipt/Transaction number is required'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  remarks: z.string().optional().or(z.literal('')),
});
