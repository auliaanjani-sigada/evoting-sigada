import { ref, computed } from 'vue';
import { Student, AdminUser } from '../types';
import { dataService } from './dataService';
import { verifyPassword } from '../lib/crypto';

const STUDENT_SESSION_KEY = 'eosis_student_session';
const ADMIN_SESSION_KEY = 'eosis_admin_session';

const currentStudent = ref<Student | null>(null);
const currentAdmin = ref<AdminUser | null>(null);

// Initialize from storage
try {
  const savedStudent = localStorage.getItem(STUDENT_SESSION_KEY);
  if (savedStudent) currentStudent.value = JSON.parse(savedStudent);

  const savedAdmin = localStorage.getItem(ADMIN_SESSION_KEY);
  if (savedAdmin) currentAdmin.value = JSON.parse(savedAdmin);
} catch (e) {
  console.warn('Error reading saved session:', e);
}

export const authService = {
  currentStudent: computed(() => currentStudent.value),
  currentAdmin: computed(() => currentAdmin.value),
  isStudentLoggedIn: computed(() => !!currentStudent.value),
  isAdminLoggedIn: computed(() => !!currentAdmin.value),

  /**
   * Login student with NISN and Tanggal Lahir (YYYY-MM-DD)
   */
  async loginStudent(nisn: string, birthDate: string): Promise<{ success: boolean; message: string; student?: Student }> {
    if (!nisn || !birthDate) {
      return { success: false, message: 'NISN dan tanggal lahir wajib diisi.' };
    }

    const student = await dataService.getStudentByNisnAndBirthDate(nisn, birthDate);
    if (!student) {
      return {
        success: false,
        message: 'NISN atau tanggal lahir tidak cocok dengan data Pemilih Tetap (DPT). Silakan periksa kembali.',
      };
    }

    currentStudent.value = student;
    localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(student));
    return {
      success: true,
      message: 'Login berhasil.',
      student,
    };
  },

  /**
   * Refresh student data (e.g. after voting or on reload)
   */
  async refreshStudentSession(): Promise<Student | null> {
    if (!currentStudent.value) return null;
    const students = await dataService.getStudents();
    const updated = students.find(s => s.id === currentStudent.value?.id || s.nisn === currentStudent.value?.nisn);
    if (updated) {
      currentStudent.value = updated;
      localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(updated));
    }
    return currentStudent.value;
  },

  logoutStudent() {
    currentStudent.value = null;
    localStorage.removeItem(STUDENT_SESSION_KEY);
  },

  /**
   * Login Admin with username and password
   */
  async loginAdmin(username: string, passwordPlain: string): Promise<{ success: boolean; message: string }> {
    if (!username || !passwordPlain) {
      return { success: false, message: 'Username dan password wajib diisi.' };
    }

    const admin = await dataService.getAdmin();
    if (admin.username.toLowerCase() !== username.trim().toLowerCase()) {
      return { success: false, message: 'Username atau password admin salah.' };
    }

    const isValid = await verifyPassword(passwordPlain.trim(), admin.password_hash);
    if (!isValid) {
      return { success: false, message: 'Username atau password admin salah.' };
    }

    currentAdmin.value = admin;
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admin));
    return { success: true, message: 'Login admin berhasil.' };
  },

  logoutAdmin() {
    currentAdmin.value = null;
    localStorage.removeItem(ADMIN_SESSION_KEY);
  },
};
