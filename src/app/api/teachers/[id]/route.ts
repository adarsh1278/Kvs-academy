import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Teacher } from '@/models/Teacher';
import { User } from '@/models/User';
import { Section } from '@/models/Section';
import { Subject } from '@/models/Subject';
import { getSession } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    // Auth Check: only admins/super_admins can update teacher details
    const session = await getSession();
    if (!session || (session.role !== 'super_admin' && session.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      email,
      phone,
      qualification,
      experience,
      salary,
      status,
      assignedClassIds, // Array of Class IDs for Teacher.assignedClasses
      subjectIds,       // Array of Subject IDs for Teacher.subjects
      classTeacherSectionIds, // Array of Section IDs to assign this teacher as classTeacher
    } = body;

    const teacher = await Teacher.findById(id).populate('user');
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });
    }

    const user = await User.findById(teacher.user?._id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Associated user not found' }, { status: 404 });
    }

    // 1. Update basic User info
    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) {
      const emailLower = email.toLowerCase().trim();
      const duplicate = await User.findOne({ _id: { $ne: user._id }, email: emailLower });
      if (duplicate) {
        return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 400 });
      }
      user.email = emailLower;
    }
    if (phone !== undefined) {
      const phoneTrimmed = phone.trim();
      if (phoneTrimmed) {
        const duplicate = await User.findOne({ _id: { $ne: user._id }, phone: phoneTrimmed });
        if (duplicate) {
          return NextResponse.json({ success: false, error: 'Phone number already in use' }, { status: 400 });
        }
        user.phone = phoneTrimmed;
      } else {
        user.phone = undefined;
      }
    }
    await user.save();

    // 2. Update Teacher fields
    if (qualification !== undefined) teacher.qualification = qualification.trim();
    if (experience !== undefined) teacher.experience = experience.trim();
    if (salary !== undefined) teacher.salary = Number(salary);
    if (status !== undefined) teacher.employmentStatus = status;

    if (assignedClassIds !== undefined) {
      teacher.assignedClasses = assignedClassIds;
    }
    if (subjectIds !== undefined) {
      teacher.subjects = subjectIds;
    }
    await teacher.save();

    const userId = user._id.toString();

    // 3. Update Class Teacher Assignments in Section model
    if (classTeacherSectionIds !== undefined) {
      // Clear teacher from any previously assigned sections
      await Section.updateMany({ classTeacher: userId }, { $unset: { classTeacher: "" } });
      // Assign teacher to new sections
      if (classTeacherSectionIds.length > 0) {
        await Section.updateMany(
          { _id: { $in: classTeacherSectionIds } },
          { classTeacher: userId }
        );
      }
    }

    // 4. Update Subject Teacher Assignments in Subject model
    if (subjectIds !== undefined) {
      // Clear teacher from any previously assigned subjects
      await Subject.updateMany({ subjectTeacher: userId }, { $unset: { subjectTeacher: "" } });
      // Assign teacher to new subjects
      if (subjectIds.length > 0) {
        await Subject.updateMany(
          { _id: { $in: subjectIds } },
          { subjectTeacher: userId }
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Teacher details updated successfully' });
  } catch (error: any) {
    console.error('Update teacher error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
