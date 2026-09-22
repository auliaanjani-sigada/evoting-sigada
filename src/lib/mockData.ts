import { SchoolSetting, ClassItem, Student, Candidate } from '../types';
import { hashPassword } from './crypto';

export const DEFAULT_SETTINGS: SchoolSetting = {
  id: 1,
  school_name: 'SMP Negeri 3 Widodaren',
  agenda_title: 'Pemilihan Ketua & Wakil Ketua OSIS',
  election_period: '2026/2027',
  logo_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
  voting_status: 'open',
  updated_at: new Date().toISOString(),
};

export const DEFAULT_CLASSES: ClassItem[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'VII A', created_at: new Date().toISOString() },
  { id: '22222222-2222-2222-2222-222222222222', name: 'VII B', created_at: new Date().toISOString() },
  { id: '33333333-3333-3333-3333-333333333333', name: 'VIII A', created_at: new Date().toISOString() },
  { id: '44444444-4444-4444-4444-444444444444', name: 'VIII B', created_at: new Date().toISOString() },
  { id: '55555555-5555-5555-5555-555555555555', name: 'IX A', created_at: new Date().toISOString() },
  { id: '66666666-6666-6666-6666-666666666666', name: 'IX B', created_at: new Date().toISOString() },
];

export const DEFAULT_CANDIDATES: Candidate[] = [
  {
    id: 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    candidate_number: 1,
    leader_name: 'Ahmad Fauzan Pratama',
    vice_leader_name: 'Siti Nurhaliza',
    photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
    slogan: 'Bersinergi Membangun Generasi Unggul, Kreatif, dan Berakhlak Mulia',
    vision: 'Mewujudkan OSIS sebagai wadah aspirasi siswa yang inklusif, inovatif, berkarakter, dan berdaya saing tinggi di era digital.',
    mission: '1. Menyelenggarakan kegiatan keagamaan dan pembinaan budi pekerti luhur.\n2. Mengoptimalkan platform digital untuk transparansi aspirasi siswa.\n3. Mengembangkan bakat ekstrakurikuler di bidang seni, sains, dan olahraga.\n4. Mewujudkan program peduli lingkungan sekolah hijau dan asri.',
    total_votes: 14,
    created_at: new Date().toISOString(),
  },
  {
    id: 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    candidate_number: 2,
    leader_name: 'Raditya Danendra',
    vice_leader_name: 'Clarissa Putri Anggraini',
    photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    slogan: 'Aksi Nyata, Suara Kita, Prestasi Tiada Tara',
    vision: 'Menjadikan OSIS yang aktif, solutif, kolaboratif, serta menjadi jembatan harmonis antara siswa dan guru.',
    mission: '1. Membangun ruang apresiasi karya siswa lewat festival kreatif tahunan.\n2. Meningkatkan solidaritas antarkelas melalui program mentoring sahabat belajar.\n3. Menciptakan iklim sekolah yang bebas perundungan (anti-bullying).\n4. Menjalin kemitraan positif dengan komunitas edukasi luar sekolah.',
    total_votes: 21,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c3333333-cccc-cccc-cccc-cccccccccccc',
    candidate_number: 3,
    leader_name: 'Bagas Wicaksono',
    vice_leader_name: 'Dewi Sartika Ananda',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    slogan: 'Inovasi Bersama untuk Sekolah yang Menginspirasi',
    vision: 'Mewujudkan iklim sekolah yang cerdas, berprestasi, ramah teknologi, dan berwawasan lingkungan global.',
    mission: '1. Menyelenggarakan pekan inovasi teknologi dan literasi digital sekolah.\n2. Menerapkan sistem zero waste dan bank sampah mandiri di sekolah.\n3. Mengadakan kompetisi e-sport dan akademik antarkelas secara berkala.\n4. Mendukung penuh setiap kegiatan minat bakat seluruh siswa tanpa terkecuali.',
    total_votes: 9,
    created_at: new Date().toISOString(),
  },
];

export const DEFAULT_STUDENTS: Student[] = [
  { id: 's01', nisn: '1001', name: 'Aditya Pratama Putra', birth_date: '2010-05-14', class_name: 'VII A', has_voted: false },
  { id: 's02', nisn: '1002', name: 'Bella Safitri', birth_date: '2010-08-22', class_name: 'VII A', has_voted: true, voted_at: new Date().toISOString() },
  { id: 's03', nisn: '1003', name: 'Cahya Ramadhani', birth_date: '2010-01-10', class_name: 'VII B', has_voted: false },
  { id: 's04', nisn: '1004', name: 'Dimas Arya Pamungkas', birth_date: '2010-11-03', class_name: 'VII B', has_voted: true, voted_at: new Date().toISOString() },
  { id: 's05', nisn: '1005', name: 'Eka Nurtjahyo', birth_date: '2009-04-18', class_name: 'VIII A', has_voted: false },
  { id: 's06', nisn: '1006', name: 'Fani Rahmawati', birth_date: '2009-07-29', class_name: 'VIII A', has_voted: true, voted_at: new Date().toISOString() },
  { id: 's07', nisn: '1007', name: 'Gilang Mahendra', birth_date: '2009-12-05', class_name: 'VIII B', has_voted: false },
  { id: 's08', nisn: '1008', name: 'Hana Zakiyah', birth_date: '2009-03-15', class_name: 'VIII B', has_voted: false },
  { id: 's09', nisn: '1009', name: 'Irfan Hakim Setiawan', birth_date: '2008-06-20', class_name: 'IX A', has_voted: false },
  { id: 's10', nisn: '1010', name: 'Jasmine Aurelia', birth_date: '2008-09-11', class_name: 'IX A', has_voted: false },
  { id: 's11', nisn: '1011', name: 'Kevin Christian', birth_date: '2008-02-28', class_name: 'IX B', has_voted: false },
  { id: 's12', nisn: '1012', name: 'Larasati Dewi', birth_date: '2008-10-17', class_name: 'IX B', has_voted: false },
];
