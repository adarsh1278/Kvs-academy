import { create } from 'zustand';

interface AppState {
  selectedStudent: any | null;
  setSelectedStudent: (student: any | null) => void;
  
  selectedTeacher: any | null;
  setSelectedTeacher: (teacher: any | null) => void;
  
  selectedClass: any | null;
  setSelectedClass: (cls: any | null) => void;
}

export const useStore = create<AppState>((set) => ({
  selectedStudent: null,
  setSelectedStudent: (student) => set({ selectedStudent: student }),
  
  selectedTeacher: null,
  setSelectedTeacher: (teacher) => set({ selectedTeacher: teacher }),
  
  selectedClass: null,
  setSelectedClass: (cls) => set({ selectedClass: cls }),
}));
