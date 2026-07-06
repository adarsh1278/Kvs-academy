import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { AcademicSession } from '@/models/AcademicSession';
import { Class } from '@/models/Class';
import { Section } from '@/models/Section';
import { Subject } from '@/models/Subject';
import { Teacher } from '@/models/Teacher';
import { Student } from '@/models/Student';
import { CMS } from '@/models/CMS';
import { FeeCategory, FeeStructure, StudentFee } from '@/models/Fee';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Clear old data
    await User.deleteMany({});
    await AcademicSession.deleteMany({});
    await Class.deleteMany({});
    await Section.deleteMany({});
    await Subject.deleteMany({});
    await Teacher.deleteMany({});
    await Student.deleteMany({});
    await CMS.deleteMany({});
    await FeeCategory.deleteMany({});
    await FeeStructure.deleteMany({});
    await StudentFee.deleteMany({});

    // 2. Create Academic Session
    const session = await AcademicSession.create({
      name: '2026-2027',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      isCurrent: true,
    });

    // 3. Create Users
    const adminPassword = await hashPassword('Admin@123');

    const superAdminUser = await User.create({
      name: 'Dr. Rajesh Sharma',
      email: 'superadmin@excellence.edu',
      password: adminPassword,
      role: 'super_admin',
      status: 'active',
    });

    const adminUser = await User.create({
      name: 'Mrs. Anita Verma',
      email: 'admin@excellence.edu',
      password: adminPassword,
      role: 'admin',
      status: 'active',
    });

    const receptionistUser = await User.create({
      name: 'Mr. Rohan Dev',
      email: 'receptionist@excellence.edu',
      password: adminPassword,
      role: 'receptionist',
      status: 'active',
      permissions: ['admissions', 'fees'],
      employeeId: 'EMP009',
      designation: 'Front Office Desk',
      department: 'Administration',
    });

    const teacherUser = await User.create({
      name: 'Mr. Sanjay Gupta',
      email: 'teacher@excellence.edu',
      password: adminPassword,
      role: 'teacher',
      status: 'active',
      employeeId: 'EMP005',
    });

    const studentUser = await User.create({
      name: 'Aarav Mehta',
      email: 'student@excellence.edu',
      password: adminPassword,
      role: 'student',
      status: 'active',
    });

    // 4. Create Classes
    const class10 = await Class.create({
      name: 'Class 10',
      academicSession: session._id,
    });

    const class9 = await Class.create({
      name: 'Class 9',
      academicSession: session._id,
    });

    const primaryClasses = [];
    for (let i = 1; i <= 5; i++) {
      const cls = await Class.create({
        name: `Class ${i}`,
        academicSession: session._id,
      });
      primaryClasses.push(cls);
    }

    // 5. Create Sections
    const sectionA = await Section.create({
      name: 'A',
      class: class10._id,
      classTeacher: teacherUser._id,
    });

    const sectionB = await Section.create({
      name: 'B',
      class: class10._id,
    });

    await Section.create({
      name: 'A',
      class: class9._id,
    });

    const primarySections = [];
    for (const cls of primaryClasses) {
      const secA = await Section.create({
        name: 'A',
        class: cls._id,
      });
      const secB = await Section.create({
        name: 'B',
        class: cls._id,
      });
      primarySections.push(secA, secB);
    }

    // 6. Create Subjects
    const math = await Subject.create({
      name: 'Mathematics',
      code: 'MATH101',
      type: 'Theory',
      class: class10._id,
    });

    const science = await Subject.create({
      name: 'Science',
      code: 'SCI101',
      type: 'Both',
      class: class10._id,
    });

    const english = await Subject.create({
      name: 'English Literature',
      code: 'ENG101',
      type: 'Theory',
      class: class10._id,
    });

    // Create primary subjects for classes 1-5
    for (const cls of primaryClasses) {
      await Subject.create({
        name: 'General Mathematics',
        code: `MATH-${cls.name.replace('Class ', '')}`,
        type: 'Theory',
        class: cls._id,
      });
      await Subject.create({
        name: 'Environmental Studies',
        code: `EVS-${cls.name.replace('Class ', '')}`,
        type: 'Theory',
        class: cls._id,
      });
      await Subject.create({
        name: 'Elementary English',
        code: `ENG-${cls.name.replace('Class ', '')}`,
        type: 'Theory',
        class: cls._id,
      });
    }

    // 7. Create Teacher profile
    const teacherProfile = await Teacher.create({
      user: teacherUser._id,
      teacherId: 'TCH-2026-001',
      qualification: 'M.Sc. in Mathematics, B.Ed.',
      experience: '8 Years',
      subjects: [math._id, science._id],
      assignedClasses: [class10._id],
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      salary: 45000,
      employmentStatus: 'Active',
      joiningDate: new Date('2020-07-01'),
    });

    // Generate 15 more teacher users and profiles
    const teacherNames = [
      'Alok Mishra', 'Neha Sen', 'Raman Preet', 'Sanya Iyer', 'Karan Johar',
      'Meera Nair', 'Amitabh Bachchan', 'Deepika Padukone', 'Shah Rukh Khan', 'Priyanka Chopra',
      'Aishwarya Rai', 'Ranbir Kapoor', 'Katrina Kaif', 'Alia Bhatt', 'Hrithik Roshan'
    ];
    const qualifications = ['B.Ed. & M.A. in English', 'B.El.Ed., M.Sc. in Physics', 'B.Ed. & B.Sc. in Mathematics', 'M.Ed., B.A. in History', 'M.A. in Hindi Literature'];
    const activeTeacherPassword = await hashPassword('Admin@123');

    for (let i = 0; i < teacherNames.length; i++) {
      const name = teacherNames[i];
      const email = `teacher${i + 1}@excellence.edu`;
      const user = await User.create({
        name,
        email,
        password: activeTeacherPassword,
        role: 'teacher',
        status: 'active',
        phone: `99887766${50 + i}`,
      });

      const assignedClassIds = [primaryClasses[i % primaryClasses.length]._id];

      await Teacher.create({
        user: user._id,
        teacherId: `TCH-2026-${100 + i}`,
        qualification: qualifications[i % qualifications.length],
        experience: `${5 + (i * 2) % 15} Years`,
        subjects: [math._id],
        assignedClasses: assignedClassIds,
        profileImage: `https://images.unsplash.com/photo-${1500000000000 + (i + 1) * 10000000}?w=150`,
        salary: 35000 + (i * 2000),
        employmentStatus: 'Active',
        joiningDate: new Date('2021-06-01'),
      });
    }

    // 8. Create Student profile
    const studentProfile = await Student.create({
      user: studentUser._id,
      admissionNo: 'ADM-2026-049',
      rollNo: '2610A05',
      class: class10._id,
      section: sectionA._id,
      dob: new Date('2011-05-15'),
      gender: 'Male',
      parentName: 'Mr. Vikram Mehta',
      parentPhone: '9876543210',
      parentEmail: 'vikram.mehta@gmail.com',
      emergencyContact: '9876543211',
      address: '45, Palm Avenue, Sector 5, New Delhi - 110001',
      aadhaarNo: '123456789012',
      profileImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
      transportDetails: 'Route No. 4 (Bus DL-01-A-1234)',
      hostelDetails: 'N/A',
      academicHistory: [
        {
          schoolName: 'Public Modern School',
          lastClass: 'Class 9',
          percentage: 84.5,
          year: '2025-2026',
        },
      ],
    });

    // 9. Fee Management Seeds
    const tutionCategory = await FeeCategory.create({
      name: 'Tuition Fee',
      description: 'Monthly school tuition and academic instruction fees.',
    });

    const admissionCategory = await FeeCategory.create({
      name: 'Admission Fee',
      description: 'One-time admission processing fee for new registrations.',
    });

    const transportCategory = await FeeCategory.create({
      name: 'Transport Fee',
      description: 'Charges for school bus and transport service.',
    });

    const examCategory = await FeeCategory.create({
      name: 'Examination Fee',
      description: 'Annual and mid-term examination charges.',
    });

    // Create Fee Structure for Class 10
    const feeStructure10 = await FeeStructure.create({
      name: 'Class 10 Regular Fee Structure',
      class: class10._id,
      academicSession: session._id,
      installments: [
        {
          name: 'Admission Installment (Term 1)',
          dueDate: new Date('2026-04-10'),
          amount: 15000,
          category: admissionCategory._id,
        },
        {
          name: 'Quarter 1 Tuition Fee',
          dueDate: new Date('2026-07-15'),
          amount: 9000,
          category: tutionCategory._id,
        },
        {
          name: 'Quarter 2 Tuition & Exam Fee',
          dueDate: new Date('2026-10-15'),
          amount: 10500,
          category: examCategory._id,
        },
        {
          name: 'Quarter 3 Tuition & Transport Fee',
          dueDate: new Date('2027-01-15'),
          amount: 11000,
          category: transportCategory._id,
        },
      ],
    });

    // Instantiate Student Fee ledger for Aarav
    await StudentFee.create({
      student: studentProfile._id,
      feeStructure: feeStructure10._id,
      installments: [
        {
          name: 'Admission Installment (Term 1)',
          dueDate: new Date('2026-04-10'),
          amount: 15000,
          paidAmount: 15000,
          status: 'Paid',
          category: admissionCategory._id,
        },
        {
          name: 'Quarter 1 Tuition Fee',
          dueDate: new Date('2026-07-15'),
          amount: 9000,
          paidAmount: 4000,
          status: 'Partial',
          category: tutionCategory._id,
        },
        {
          name: 'Quarter 2 Tuition & Exam Fee',
          dueDate: new Date('2026-10-15'),
          amount: 10500,
          paidAmount: 0,
          status: 'Unpaid',
          category: examCategory._id,
        },
        {
          name: 'Quarter 3 Tuition & Transport Fee',
          dueDate: new Date('2027-01-15'),
          amount: 11000,
          paidAmount: 0,
          status: 'Unpaid',
          category: transportCategory._id,
        },
      ],
    });

    // Create Fee Structures for Primary Classes
    const primaryFeeStructures = [];
    for (const cls of primaryClasses) {
      const struct = await FeeStructure.create({
        name: `${cls.name} Standard Fee Structure`,
        class: cls._id,
        academicSession: session._id,
        installments: [
          {
            name: 'Monthly Tuition Fee',
            dueDate: new Date('2026-05-10'),
            amount: 3500,
            category: tutionCategory._id,
          },
          {
            name: 'Examination Fee',
            dueDate: new Date('2026-09-15'),
            amount: 1500,
            category: examCategory._id,
          }
        ]
      });
      primaryFeeStructures.push(struct);
    }

    // Generate 60 student users, profiles, and fee ledgers
    const firstNames = ['Aarav', 'Vihaan', 'Vivaan', 'Ananya', 'Diya', 'Siddharth', 'Ishaan', 'Aanya', 'Kabir', 'Aditya', 'Sai', 'Krishna', 'Ishani', 'Rohan', 'Sneha', 'Rahul', 'Priya', 'Kunal', 'Rhea', 'Vikram'];
    const lastNames = ['Mehta', 'Sharma', 'Patel', 'Verma', 'Gupta', 'Singh', 'Sen', 'Joshi', 'Bose', 'Rao', 'Nair', 'Iyer', 'Reddy', 'Choudhury', 'Das', 'Dutta'];
    const studentPassword = await hashPassword('Admin@123');

    for (let i = 1; i <= 60; i++) {
      const fName = firstNames[i % firstNames.length];
      const lName = lastNames[(i * 3) % lastNames.length];
      const name = `${fName} ${lName}`;
      const email = `student${i}@excellence.edu`;

      const user = await User.create({
        name,
        email,
        password: studentPassword,
        role: 'student',
        status: 'active',
        phone: `98765400${10 + i}`,
      });

      const targetClass = primaryClasses[(i - 1) % primaryClasses.length];
      const targetSection = primarySections.find(s => s.class.toString() === targetClass._id.toString() && s.name === (i % 2 === 0 ? 'B' : 'A'));

      const profile = await Student.create({
        user: user._id,
        admissionNo: `ADM-2026-${100 + i}`,
        rollNo: `Roll-${targetClass.name.replace('Class ', '')}-${i % 2 === 0 ? 'B' : 'A'}-${i}`,
        class: targetClass._id,
        section: targetSection?._id || primarySections[0]._id,
        dob: new Date(2015 + (i % 5), (i % 12), (5 + i * 7) % 28),
        gender: i % 2 === 0 ? 'Female' : 'Male',
        parentName: `Mr. ${lName}`,
        parentPhone: `98765411${10 + i}`,
        parentEmail: `parent${i}@gmail.com`,
        emergencyContact: `98765422${10 + i}`,
        address: `${10 + i}, Royal Enclave, New Delhi - 110001`,
        aadhaarNo: `1234567890${10 + i}`,
        profileImage: `https://images.unsplash.com/photo-${1540000000000 + i * 150000}?w=150`,
      });

      // Link Student to Fee Structure Ledger
      const struct = primaryFeeStructures[(i - 1) % primaryFeeStructures.length];
      await StudentFee.create({
        student: profile._id,
        feeStructure: struct._id,
        installments: struct.installments.map(inst => ({
          name: inst.name,
          dueDate: inst.dueDate,
          amount: inst.amount,
          paidAmount: i % 5 === 0 ? inst.amount : 0,
          status: i % 5 === 0 ? 'Paid' : 'Unpaid',
          category: inst.category,
        })),
      });
    }

    // 10. CMS Defaults for Website Content
    await CMS.create([
      {
        key: 'home_hero',
        value: {
          title: 'Excellence Academy',
          subtitle: 'Empowering minds, shaping futures, and building leaders of tomorrow.',
          bannerImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
          ctaText: 'Apply for Admission',
          ctaLink: '/admissions',
        },
      },
      {
        key: 'about_us',
        value: {
          title: 'Inspiring Academic Growth Since 1998',
          history:
            'Excellence Academy was established in 1998 with a vision to provide quality education and foster all-around development. Over the last two decades, we have grown into one of the region\'s premier educational institutions, combining rigorous academics with extensive co-curricular programs.',
          mission: 'To cultivate a learning environment that nurtures intellectual curiosity, integrity, and social responsibility.',
          vision: 'To be a globally recognized center of excellence in early and secondary education, producing empathetic leaders.',
        },
      },
      {
        key: 'principal_message',
        value: {
          name: 'Dr. Rajesh Sharma',
          title: 'Principal\'s Message',
          photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
          message:
            'Dear Parents and Students, Welcome to Excellence Academy. Our commitment is to provide a safe, nurturing, and intellectually challenging environment. We believe that every child is unique and has the potential to make a positive impact on the world. We work hand-in-hand with parents to ensure our students grow into responsible, creative, and successful global citizens.',
        },
      },
      {
        key: 'director_message',
        value: {
          name: 'Mrs. Anita Verma',
          title: 'Director\'s Message',
          photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
          message:
            'At Excellence Academy, our focus is on comprehensive development. Education goes beyond textbooks; it encompasses sports, visual and performing arts, communication skills, and character building. We are dedicated to providing state-of-the-art infrastructure and highly qualified faculty to enable our students to compete at international levels.',
        },
      },
      {
        key: 'infrastructure',
        value: {
          description:
            'Our modern 5-acre campus is designed to support the academic and extracurricular aspirations of our students. We provide a clean, secure, and digitally connected environment.',
          list: [
            {
              title: 'Smart Classrooms',
              description: 'Air-conditioned rooms equipped with interactive smart boards and high-speed internet.',
            },
            {
              title: 'Science Laboratories',
              description: 'Fully equipped separate labs for Physics, Chemistry, and Biology facilitating practical study.',
            },
            {
              title: 'Digital Computer Lab',
              description: 'Over 100 modern computer terminals with updated programming environments and internet access.',
            },
            {
              title: 'Sports Arena',
              description: 'Includes a synthetic basketball court, a football ground, indoor badminton courts, and table tennis.',
            },
            {
              title: 'Central Library',
              description: 'Housing over 20,000 books, research journals, periodicals, and a digital archive center.',
            },
          ],
        },
      },
      {
        key: 'gallery',
        value: {
          images: [
            {
              url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600',
              caption: 'Annual Science Exhibition 2026',
            },
            {
              url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600',
              caption: 'Interactive Smart Classroom Session',
            },
            {
              url: 'https://images.unsplash.com/photo-1567057419565-4349c49d8a04?w=600',
              caption: 'Inter-School Football Championship',
            },
            {
              url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600',
              caption: 'State-of-the-art School Library',
            },
            {
              url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600',
              caption: 'Computer Science Practical Exam',
            },
            {
              url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600',
              caption: 'Kindergarten Annual Activity Day',
            },
          ],
        },
      },
      {
        key: 'faqs',
        value: {
          list: [
            {
              question: 'What is the teacher-to-student ratio at Excellence Academy?',
              answer: 'We maintain an average ratio of 1:25 to ensure personalized attention for every student.',
            },
            {
              question: 'Which educational board is the school affiliated with?',
              answer: 'Excellence Academy is affiliated with the Central Board of Secondary Education (CBSE), New Delhi.',
            },
            {
              question: 'Does the school provide transport facilities?',
              answer: 'Yes, we run a fleet of GPS-enabled buses with security staff covering all major routes in the city.',
            },
            {
              question: 'Are admission enquiries accepted mid-session?',
              answer: 'Subject to vacancy, mid-session admissions are accepted for specific classes, particularly for transfer cases.',
            },
          ],
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      users: {
        super_admin: 'superadmin@excellence.edu',
        admin: 'admin@excellence.edu',
        receptionist: 'receptionist@excellence.edu',
        teacher: 'teacher@excellence.edu',
        student: 'student@excellence.edu',
        password: 'Admin@123',
      },
    });
  } catch (error: any) {
    console.error('Seeding Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
