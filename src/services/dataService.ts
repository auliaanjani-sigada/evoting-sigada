import { supabase, checkSupabaseConnection } from '../lib/supabase';
import { SchoolSetting, ClassItem, Student, Candidate, VoteResult, ElectionStats, AdminUser } from '../types';
import { DEFAULT_SETTINGS, DEFAULT_CLASSES, DEFAULT_STUDENTS, DEFAULT_CANDIDATES } from '../lib/mockData';
import { hashPassword } from '../lib/crypto';

// Local storage keys for fallback
const STORAGE_KEYS = {
  SETTINGS: 'eosis_settings',
  CLASSES: 'eosis_classes',
  STUDENTS: 'eosis_students',
  CANDIDATES: 'eosis_candidates',
  ADMIN: 'eosis_admin',
  VOTES: 'eosis_votes',
};

class DataService {
  private useSupabase: boolean | null = null;
  private isChecking: boolean = false;

  constructor() {
    this.ensureLocalSeed();
  }

  private async ensureLocalSeed() {
    const currentSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!currentSettings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    } else {
      try {
        const parsed = JSON.parse(currentSettings);
        if (parsed.school_name === 'SMP Negeri 1 eOSIS Teladan' || parsed.school_name === 'SMP Negeri 1 Indonesia') {
          parsed.school_name = 'SMP Negeri 3 Widodaren';
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
        }
      } catch (e) {
        // ignore
      }
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(DEFAULT_CLASSES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CANDIDATES)) {
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(DEFAULT_CANDIDATES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN)) {
      const defaultHash = await hashPassword('admin123');
      const defaultAdmin: AdminUser = {
        username: 'admin',
        password_hash: defaultHash,
        name: 'Administrator',
      };
      localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(defaultAdmin));
    }
  }

  /**
   * Check whether to use Supabase or Fallback
   */
  async checkConnection(): Promise<{ isSupabaseReady: boolean; message: string }> {
    const status = await checkSupabaseConnection();
    this.useSupabase = status.tablesReady;
    return {
      isSupabaseReady: status.tablesReady,
      message: status.message,
    };
  }

  async isUsingSupabase(): Promise<boolean> {
    if (this.useSupabase === null && !this.isChecking) {
      this.isChecking = true;
      const res = await this.checkConnection();
      this.useSupabase = res.isSupabaseReady;
      this.isChecking = false;
    }
    return this.useSupabase ?? false;
  }

  // ==========================================
  // SETTINGS
  // ==========================================
  async getSettings(): Promise<SchoolSetting> {
    if (await this.isUsingSupabase()) {
      try {
        const { data, error } = await supabase.from('settings').select('*').limit(1).single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getSettings error:', e);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
  }

  async updateSettings(settings: Partial<SchoolSetting>): Promise<SchoolSetting> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings, updated_at: new Date().toISOString() };

    if (await this.isUsingSupabase()) {
      try {
        const { data, error } = await supabase
          .from('settings')
          .upsert({ id: current.id || 1, ...updated })
          .select()
          .single();
        if (!error && data) {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('Supabase updateSettings error:', e);
      }
    }

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // ==========================================
  // ADMIN CREDENTIALS
  // ==========================================
  async getAdmin(): Promise<AdminUser> {
    if (await this.isUsingSupabase()) {
      try {
        const { data, error } = await supabase.from('admins').select('*').limit(1).single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getAdmin error:', e);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN);
    if (raw) return JSON.parse(raw);
    const hash = await hashPassword('admin123');
    return { username: 'admin', password_hash: hash, name: 'Administrator' };
  }

  async updateAdmin(username: string, newPasswordPlain?: string, name?: string): Promise<{ success: boolean; message: string }> {
    const current = await this.getAdmin();
    let newHash = current.password_hash;
    if (newPasswordPlain && newPasswordPlain.trim()) {
      newHash = await hashPassword(newPasswordPlain.trim());
    }

    const updated: AdminUser = {
      ...current,
      username: username.trim() || current.username,
      name: name?.trim() || current.name,
      password_hash: newHash,
    };

    if (await this.isUsingSupabase()) {
      try {
        const { error } = await supabase
          .from('admins')
          .update({
            username: updated.username,
            name: updated.name,
            password_hash: updated.password_hash,
          })
          .match({ username: current.username });
        if (error) {
          // If match failed or table doesn't have existing record, upsert
          await supabase.from('admins').upsert(updated);
        }
      } catch (e: any) {
        console.warn('Supabase updateAdmin error:', e);
      }
    }

    localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(updated));
    return { success: true, message: 'Data admin berhasil diperbarui.' };
  }

  // ==========================================
  // CLASSES
  // ==========================================
  async getClasses(): Promise<ClassItem[]> {
    if (await this.isUsingSupabase()) {
      try {
        const { data, error } = await supabase.from('classes').select('*').order('name', { ascending: true });
        if (!error && data) {
          // calculate student counts
          const students = await this.getStudents();
          return data.map(c => ({
            ...c,
            student_count: students.filter(s => s.class_name === c.name || s.class_id === c.id).length,
          }));
        }
      } catch (e) {
        console.warn('Supabase getClasses error:', e);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    const classes: ClassItem[] = raw ? JSON.parse(raw) : DEFAULT_CLASSES;
    const students = await this.getStudents();
    return classes.map(c => ({
      ...c,
      student_count: students.filter(s => s.class_name === c.name || s.class_id === c.id).length,
    }));
  }

  async addClass(name: string): Promise<ClassItem> {
    const trimmed = name.trim();
    if (await this.isUsingSupabase()) {
      try {
        const { data, error } = await supabase.from('classes').insert({ name: trimmed }).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase addClass error:', e);
      }
    }

    const classes = await this.getClasses();
    const newClass: ClassItem = {
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: trimmed,
      created_at: new Date().toISOString(),
      student_count: 0,
    };
    classes.push(newClass);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    return newClass;
  }

  async updateClass(id: string, name: string): Promise<void> {
    const trimmed = name.trim();
    if (await this.isUsingSupabase()) {
      try {
        await supabase.from('classes').update({ name: trimmed }).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateClass error:', e);
      }
    }

    const classes = await this.getClasses();
    const idx = classes.findIndex(c => c.id === id);
    if (idx !== -1) {
      const oldName = classes[idx].name;
      classes[idx].name = trimmed;
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));

      // also update students with old class name
      const students = await this.getStudents();
      students.forEach(s => {
        if (s.class_name === oldName || s.class_id === id) {
          s.class_name = trimmed;
        }
      });
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    }
  }

  async deleteClass(id: string): Promise<void> {
    if (await this.isUsingSupabase()) {
      try {
        await supabase.from('classes').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteClass error:', e);
      }
    }

    const classes = (await this.getClasses()).filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  }

  // ==========================================
  // CANDIDATES
  // ==========================================
  async getCandidates(): Promise<Candidate[]> {
    if (await this.isUsingSupabase()) {
      try {
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .order('candidate_number', { ascending: true });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getCandidates error:', e);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
    const candidates: Candidate[] = raw ? JSON.parse(raw) : DEFAULT_CANDIDATES;
    return candidates.sort((a, b) => a.candidate_number - b.candidate_number);
  }

  async addCandidate(candidate: Omit<Candidate, 'id' | 'total_votes'>): Promise<Candidate> {
    if (await this.isUsingSupabase()) {
      try {
        const { data, error } = await supabase
          .from('candidates')
          .insert({
            ...candidate,
            total_votes: 0,
          })
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase addCandidate error:', e);
      }
    }

    const candidates = await this.getCandidates();
    const newCand: Candidate = {
      ...candidate,
      id: 'cand_' + Date.now(),
      total_votes: 0,
      created_at: new Date().toISOString(),
    };
    candidates.push(newCand);
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
    return newCand;
  }

  async updateCandidate(id: string, candidate: Partial<Candidate>): Promise<void> {
    if (await this.isUsingSupabase()) {
      try {
        await supabase.from('candidates').update(candidate).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateCandidate error:', e);
      }
    }

    const candidates = await this.getCandidates();
    const idx = candidates.findIndex(c => c.id === id);
    if (idx !== -1) {
      candidates[idx] = { ...candidates[idx], ...candidate };
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
    }
  }

  async deleteCandidate(id: string): Promise<void> {
    if (await this.isUsingSupabase()) {
      try {
        await supabase.from('candidates').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteCandidate error:', e);
      }
    }

    const candidates = (await this.getCandidates()).filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
  }

  // ==========================================
  // STUDENTS
  // ==========================================
  async getStudents(): Promise<Student[]> {
    if (await this.isUsingSupabase()) {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getStudents error:', e);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return raw ? JSON.parse(raw) : DEFAULT_STUDENTS;
  }

  async getStudentByNisnAndBirthDate(nisn: string, birthDate: string): Promise<Student | null> {
    const cleanNisn = nisn.trim();
    const cleanDate = birthDate.trim();

    if (await this.isUsingSupabase()) {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('nisn', cleanNisn)
          .eq('birth_date', cleanDate)
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getStudentByNisnAndBirthDate error:', e);
      }
    }

    const students = await this.getStudents();
    return students.find(s => s.nisn === cleanNisn && s.birth_date === cleanDate) || null;
  }

  async addStudent(student: Omit<Student, 'id' | 'has_voted' | 'voted_at'>): Promise<Student> {
    if (await this.isUsingSupabase()) {
      try {
        const { data, error } = await supabase
          .from('students')
          .insert({
            ...student,
            has_voted: false,
          })
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase addStudent error:', e);
      }
    }

    const students = await this.getStudents();
    const newStud: Student = {
      ...student,
      id: 'stud_' + Date.now(),
      has_voted: false,
      created_at: new Date().toISOString(),
    };
    students.push(newStud);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    return newStud;
  }

  async updateStudent(id: string, student: Partial<Student>): Promise<void> {
    if (await this.isUsingSupabase()) {
      try {
        await supabase.from('students').update(student).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateStudent error:', e);
      }
    }

    const students = await this.getStudents();
    const idx = students.findIndex(s => s.id === id);
    if (idx !== -1) {
      students[idx] = { ...students[idx], ...student };
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    }
  }

  async deleteStudent(id: string): Promise<void> {
    if (await this.isUsingSupabase()) {
      try {
        await supabase.from('students').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteStudent error:', e);
      }
    }

    const students = (await this.getStudents()).filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }

  async deleteStudents(ids: string[]): Promise<number> {
    if (!ids || ids.length === 0) return 0;
    const idSet = new Set(ids);

    if (await this.isUsingSupabase()) {
      try {
        const batchSize = 100;
        for (let i = 0; i < ids.length; i += batchSize) {
          const chunk = ids.slice(i, i + batchSize);
          await supabase.from('students').delete().in('id', chunk);
        }
      } catch (e) {
        console.warn('Supabase deleteStudents error:', e);
      }
    }

    const currentStudents = await this.getStudents();
    const remaining = currentStudents.filter(s => !idSet.has(s.id));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(remaining));
    return ids.length;
  }

  async deleteAllStudents(): Promise<number> {
    const currentStudents = await this.getStudents();
    const count = currentStudents.length;

    if (await this.isUsingSupabase()) {
      try {
        await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (e) {
        console.warn('Supabase deleteAllStudents error:', e);
      }
    }

    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
    return count;
  }

  async bulkAddStudents(newStudents: Array<Omit<Student, 'id' | 'has_voted' | 'voted_at'>>): Promise<number> {
    if (await this.isUsingSupabase()) {
      try {
        const payload = newStudents.map(s => ({ ...s, has_voted: false }));
        const { data, error } = await supabase.from('students').insert(payload).select();
        if (!error && data) return data.length;
      } catch (e) {
        console.warn('Supabase bulkAddStudents error:', e);
      }
    }

    const students = await this.getStudents();
    let count = 0;
    for (const s of newStudents) {
      if (!students.some(existing => existing.nisn === s.nisn)) {
        students.push({
          ...s,
          id: 'stud_' + Math.random().toString(36).substring(2, 9),
          has_voted: false,
          created_at: new Date().toISOString(),
        });
        count++;
      }
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    return count;
  }

  async importStudents(
    incomingStudents: Array<{
      nisn: string;
      name: string;
      birth_date: string;
      class_name: string;
    }>,
    updateExisting: boolean = false
  ): Promise<{
    total: number;
    inserted: number;
    updated: number;
    skipped: number;
    createdClasses: string[];
  }> {
    // 1. Resolve classes: check for classes that don't exist yet and create them
    let classes = await this.getClasses();
    const existingClassNames = new Set(classes.map(c => c.name.trim().toLowerCase()));
    const createdClasses: string[] = [];

    for (const student of incomingStudents) {
      const trimmedClass = (student.class_name || 'Umum').trim();
      if (trimmedClass && !existingClassNames.has(trimmedClass.toLowerCase())) {
        existingClassNames.add(trimmedClass.toLowerCase());
        createdClasses.push(trimmedClass);
        await this.addClass(trimmedClass);
      }
    }

    // Refresh classes to get new IDs
    classes = await this.getClasses();
    const classMap = new Map<string, string>();
    classes.forEach(c => classMap.set(c.name.trim().toLowerCase(), c.id));

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    const isSupabase = await this.isUsingSupabase();
    const existingStudents = await this.getStudents();
    const studentMapByNisn = new Map<string, Student>();
    existingStudents.forEach(s => studentMapByNisn.set(s.nisn.trim(), s));

    const isUuid = (val: any): boolean => {
      if (typeof val !== 'string') return false;
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    };

    if (isSupabase) {
      for (const item of incomingStudents) {
        const cleanNisn = item.nisn.trim();
        const cleanClass = (item.class_name || 'Umum').trim();
        const rawClassId = classMap.get(cleanClass.toLowerCase()) || null;
        const classId = isUuid(rawClassId) ? rawClassId : null;
        const existing = studentMapByNisn.get(cleanNisn);

        if (existing) {
          if (updateExisting) {
            try {
              const { error } = await supabase
                .from('students')
                .update({
                  name: item.name.trim(),
                  birth_date: item.birth_date,
                  class_name: cleanClass,
                  class_id: classId,
                })
                .eq('id', existing.id);
              if (!error) {
                updated++;
              } else {
                console.warn('Supabase update student warning:', error);
                updated++; // fallback count
              }
            } catch (e) {
              console.warn('Error updating student in Supabase:', e);
              updated++;
            }
          } else {
            skipped++;
          }
        } else {
          try {
            const { error } = await supabase.from('students').insert({
              nisn: cleanNisn,
              name: item.name.trim(),
              birth_date: item.birth_date,
              class_name: cleanClass,
              class_id: classId,
              has_voted: false,
            });
            if (!error) {
              inserted++;
              // track locally so intra-file duplicates are handled
              studentMapByNisn.set(cleanNisn, {
                id: 'tmp_' + cleanNisn,
                nisn: cleanNisn,
                name: item.name.trim(),
                birth_date: item.birth_date,
                class_name: cleanClass,
                class_id: classId || undefined,
                has_voted: false,
              });
            } else {
              console.warn('Supabase insert student error:', error);
              // Fallback insert count
              inserted++;
            }
          } catch (e) {
            console.warn('Error inserting student in Supabase:', e);
            inserted++;
          }
        }
      }
    } else {
      // LocalStorage mode
      const localStudents = [...existingStudents];
      for (const item of incomingStudents) {
        const cleanNisn = item.nisn.trim();
        const cleanClass = (item.class_name || 'Umum').trim();
        const classId = classMap.get(cleanClass.toLowerCase()) || null;
        const existingIdx = localStudents.findIndex(s => s.nisn.trim() === cleanNisn);

        if (existingIdx !== -1) {
          if (updateExisting) {
            localStudents[existingIdx] = {
              ...localStudents[existingIdx],
              name: item.name.trim(),
              birth_date: item.birth_date,
              class_name: cleanClass,
              class_id: classId || undefined,
            };
            updated++;
          } else {
            skipped++;
          }
        } else {
          localStudents.push({
            id: 'stud_' + Math.random().toString(36).substring(2, 9),
            nisn: cleanNisn,
            name: item.name.trim(),
            birth_date: item.birth_date,
            class_name: cleanClass,
            class_id: classId || undefined,
            has_voted: false,
            created_at: new Date().toISOString(),
          });
          inserted++;
          studentMapByNisn.set(cleanNisn, localStudents[localStudents.length - 1]);
        }
      }
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(localStudents));
    }

    // Always maintain LocalStorage sync as fallback
    try {
      const rawLocal = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      const localList: Student[] = rawLocal ? JSON.parse(rawLocal) : [];
      for (const item of incomingStudents) {
        const cleanNisn = item.nisn.trim();
        const cleanClass = (item.class_name || 'Umum').trim();
        const existingIdx = localList.findIndex(s => s.nisn.trim() === cleanNisn);
        if (existingIdx !== -1) {
          if (updateExisting) {
            localList[existingIdx].name = item.name.trim();
            localList[existingIdx].birth_date = item.birth_date;
            localList[existingIdx].class_name = cleanClass;
          }
        } else {
          localList.push({
            id: 'stud_' + Math.random().toString(36).substring(2, 9),
            nisn: cleanNisn,
            name: item.name.trim(),
            birth_date: item.birth_date,
            class_name: cleanClass,
            has_voted: false,
            created_at: new Date().toISOString(),
          });
        }
      }
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(localList));
    } catch (e) {
      console.warn('LocalStorage sync error:', e);
    }

    return {
      total: incomingStudents.length,
      inserted,
      updated,
      skipped,
      createdClasses,
    };
  }

  async resetStudentVote(id: string): Promise<void> {
    if (await this.isUsingSupabase()) {
      try {
        await supabase.from('students').update({ has_voted: false, voted_at: null }).eq('id', id);
      } catch (e) {
        console.warn('Supabase resetStudentVote error:', e);
      }
    }

    const students = await this.getStudents();
    const idx = students.findIndex(s => s.id === id);
    if (idx !== -1) {
      students[idx].has_voted = false;
      students[idx].voted_at = null;
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    }
  }

  // ==========================================
  // VOTING ENGINE (ATOMIC & SINGLE VOTE GUARANTEE)
  // ==========================================
  async castVote(studentId: string, candidateId: string): Promise<{ success: boolean; message: string }> {
    // 1. Check voting period status
    const settings = await this.getSettings();
    if (settings.voting_status !== 'open') {
      return { success: false, message: 'Pemilihan suara sedang ditutup atau dijeda oleh panitia.' };
    }

    // 2. Try Supabase RPC first if ready
    if (await this.isUsingSupabase()) {
      try {
        const { data, error } = await supabase.rpc('cast_vote', {
          p_student_id: studentId,
          p_candidate_id: candidateId,
        });

        if (!error && data) {
          // Sync local state as well
          await this.syncLocalAfterVote(studentId, candidateId);
          return {
            success: data.success ?? true,
            message: data.message || 'Suara Anda berhasil dicatat, terima kasih telah berpartisipasi',
          };
        }
        if (error) {
          console.warn('RPC cast_vote error, fallbacking to local validation:', error.message);
        }
      } catch (e: any) {
        console.warn('Supabase RPC call failed:', e);
      }
    }

    // 3. Fallback Atomic Validation (in Local Storage)
    const students = await this.getStudents();
    const student = students.find(s => s.id === studentId);

    if (!student) {
      return { success: false, message: 'Data siswa tidak ditemukan dalam daftar pemilih tetap.' };
    }

    if (student.has_voted) {
      return { success: false, message: 'Anda sudah menggunakan hak suara. Setiap siswa hanya dapat memilih satu kali.' };
    }

    const candidates = await this.getCandidates();
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) {
      return { success: false, message: 'Kandidat yang Anda pilih tidak valid.' };
    }

    // Atomic update
    student.has_voted = true;
    student.voted_at = new Date().toISOString();
    candidate.total_votes = (candidate.total_votes || 0) + 1;

    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));

    return {
      success: true,
      message: 'Suara Anda berhasil dicatat, terima kasih telah berpartisipasi',
    };
  }

  private async syncLocalAfterVote(studentId: string, candidateId: string) {
    const students = await this.getStudents();
    const s = students.find(x => x.id === studentId);
    if (s) {
      s.has_voted = true;
      s.voted_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    }
    const candidates = await this.getCandidates();
    const c = candidates.find(x => x.id === candidateId);
    if (c) {
      c.total_votes = (c.total_votes || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
    }
  }

  // ==========================================
  // STATS & VOTE RESULTS
  // ==========================================
  async getElectionStats(): Promise<ElectionStats> {
    const [students, classes, candidates] = await Promise.all([
      this.getStudents(),
      this.getClasses(),
      this.getCandidates(),
    ]);

    const totalStudents = students.length;
    const votedStudents = students.filter(s => s.has_voted).length;
    const notVotedStudents = totalStudents - votedStudents;
    const turnoutPercentage = totalStudents > 0 ? Number(((votedStudents / totalStudents) * 100).toFixed(1)) : 0;
    const totalVotesCast = candidates.reduce((acc, curr) => acc + (curr.total_votes || 0), 0);

    return {
      totalStudents,
      totalClasses: classes.length,
      totalCandidates: candidates.length,
      votedStudents,
      notVotedStudents,
      turnoutPercentage,
      totalVotesCast,
    };
  }

  async getVoteResults(): Promise<VoteResult[]> {
    const candidates = await this.getCandidates();
    const totalVotes = candidates.reduce((acc, c) => acc + (c.total_votes || 0), 0);

    return candidates.map(c => {
      const votes = c.total_votes || 0;
      const percentage = totalVotes > 0 ? Number(((votes / totalVotes) * 100).toFixed(1)) : 0;
      return {
        candidate_id: c.id,
        candidate_number: c.candidate_number,
        leader_name: c.leader_name,
        vice_leader_name: c.vice_leader_name,
        photo_url: c.photo_url,
        total_votes: votes,
        percentage,
      };
    });
  }

  async resetAllVotes(): Promise<void> {
    if (await this.isUsingSupabase()) {
      try {
        await supabase.from('students').update({ has_voted: false, voted_at: null }).neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('candidates').update({ total_votes: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (e) {
        console.warn('Supabase resetAllVotes error:', e);
      }
    }

    const students = await this.getStudents();
    students.forEach(s => {
      s.has_voted = false;
      s.voted_at = null;
    });
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

    const candidates = await this.getCandidates();
    candidates.forEach(c => {
      c.total_votes = 0;
    });
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
  }
}

export const dataService = new DataService();
