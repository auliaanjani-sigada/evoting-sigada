export const SUPABASE_SQL_SCHEMA = `-- =======================================================
-- eOSIS - Skrip Skema Database Supabase PostgreSQL
-- Aplikasi Pemilihan Ketua dan Wakil Ketua OSIS
-- =======================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABEL PENGATURAN SEKOLAH (settings)
CREATE TABLE IF NOT EXISTS public.settings (
    id SERIAL PRIMARY KEY,
    school_name TEXT NOT NULL DEFAULT 'SMP Negeri 3 Widodaren',
    agenda_title TEXT NOT NULL DEFAULT 'Pemilihan Ketua & Wakil Ketua OSIS',
    election_period TEXT NOT NULL DEFAULT '2026/2027',
    logo_url TEXT DEFAULT '',
    voting_status TEXT NOT NULL DEFAULT 'open' CHECK (voting_status IN ('open', 'closed', 'paused')),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan kolom agenda_title tersedia jika tabel sudah ada sebelumnya
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS agenda_title TEXT DEFAULT 'Pemilihan Ketua & Wakil Ketua OSIS';

-- 3. TABEL ADMIN (admins)
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Administrator',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL KELAS (classes)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL SISWA (students)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nisn TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    class_name TEXT NOT NULL DEFAULT '',
    has_voted BOOLEAN NOT NULL DEFAULT FALSE,
    voted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pencarian siswa cepat
CREATE INDEX IF NOT EXISTS idx_students_nisn ON public.students(nisn);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_has_voted ON public.students(has_voted);

-- 6. TABEL CALON KANDIDAT (candidates)
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_number INTEGER UNIQUE NOT NULL,
    photo_url TEXT DEFAULT '',
    leader_name TEXT NOT NULL,
    vice_leader_name TEXT NOT NULL,
    vision TEXT NOT NULL,
    mission TEXT NOT NULL,
    slogan TEXT DEFAULT '',
    total_votes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidates_number ON public.candidates(candidate_number);

-- 7. TABEL KOTAK SUARA ANONYMOUS (votes)
-- Menjamin asas LUBER & JURDIL: Identitas siswa TIDAK dihubungkan dengan kandidat yang dipilih!
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Buat policy publik untuk anon role (Aplikasi eOSIS client)
DROP POLICY IF EXISTS "Public can read and update settings" ON public.settings;
CREATE POLICY "Public can read and update settings" ON public.settings
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read and manage admins" ON public.admins;
CREATE POLICY "Public can read and manage admins" ON public.admins
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can manage classes" ON public.classes;
CREATE POLICY "Public can manage classes" ON public.classes
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can manage students" ON public.students;
CREATE POLICY "Public can manage students" ON public.students
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can manage candidates" ON public.candidates;
CREATE POLICY "Public can manage candidates" ON public.candidates
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read votes" ON public.votes;
CREATE POLICY "Public can read votes" ON public.votes
    FOR SELECT TO anon, authenticated USING (true);

-- 9. RPC FUNCTION: cast_vote (VALIDASI HAK SUARA 1 KALI & TRANSAKSI AMAN)
-- Menjamin atomisitas, pencegahan double voting via database lock (FOR UPDATE),
-- dan kerahasiaan pilihan pemilih.
CREATE OR REPLACE FUNCTION public.cast_vote(p_student_id UUID, p_candidate_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_has_voted BOOLEAN;
    v_status TEXT;
    v_candidate_exists BOOLEAN;
BEGIN
    -- 1. Cek status periode voting pada settings
    SELECT voting_status INTO v_status FROM public.settings LIMIT 1;
    IF v_status IS NOT NULL AND v_status != 'open' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pemilihan suara sedang ditutup atau dijeda oleh panitia.');
    END IF;

    -- 2. Kunci baris siswa untuk mencegah race condition (multiple tab / refresh)
    SELECT has_voted INTO v_has_voted
    FROM public.students
    WHERE id = p_student_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Data siswa tidak ditemukan dalam daftar pemilih tetap (DPT).');
    END IF;

    IF v_has_voted THEN
        RETURN jsonb_build_object('success', false, 'message', 'Anda sudah menggunakan hak suara Anda. Setiap siswa hanya dapat memilih satu kali.');
    END IF;

    -- 3. Cek validitas kandidat
    SELECT EXISTS(SELECT 1 FROM public.candidates WHERE id = p_candidate_id) INTO v_candidate_exists;
    IF NOT v_candidate_exists THEN
        RETURN jsonb_build_object('success', false, 'message', 'Kandidat yang dipilih tidak valid.');
    END IF;

    -- 4. Masukkan ke kotak suara anonim (TIDAK menyertakan p_student_id demi kerahasiaan)
    INSERT INTO public.votes (candidate_id, created_at)
    VALUES (p_candidate_id, NOW());

    -- 5. Tambah counter perolehan suara kandidat
    UPDATE public.candidates
    SET total_votes = total_votes + 1
    WHERE id = p_candidate_id;

    -- 6. Tandai status siswa sudah memilih
    UPDATE public.students
    SET has_voted = TRUE, voted_at = NOW()
    WHERE id = p_student_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Suara Anda berhasil dicatat, terima kasih telah berpartisipasi'
    );
END;
$$;

-- Berikan izin eksekusi RPC ke anon dan authenticated
GRANT EXECUTE ON FUNCTION public.cast_vote(UUID, UUID) TO anon, authenticated;

-- 10. STORAGE BUCKET UNTUK FOTO & LOGO
INSERT INTO storage.buckets (id, name, public)
VALUES ('eosis-assets', 'eosis-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy Storage Publik
DROP POLICY IF EXISTS "Public access to eosis-assets" ON storage.objects;
CREATE POLICY "Public access to eosis-assets" ON storage.objects
    FOR ALL TO anon, authenticated USING (bucket_id = 'eosis-assets') WITH CHECK (bucket_id = 'eosis-assets');

-- 11. DATA AWAL (SEEDING)
-- Setting Awal
INSERT INTO public.settings (id, school_name, agenda_title, election_period, logo_url, voting_status)
VALUES (1, 'SMP Negeri 3 Widodaren', 'Pemilihan Ketua & Wakil Ketua OSIS', '2026/2027', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80', 'open')
ON CONFLICT (id) DO NOTHING;

-- Admin Awal (Username: admin | Password default: admin123)
-- SHA-256 hash dari "admin123" + salt "eosis_salt_2026"
INSERT INTO public.admins (username, password_hash, name)
VALUES ('admin', 'b819e917d5268c7438e367e9ab0a6042db5ec0c436b75fbc999e525048d0859a', 'Administrator Utama')
ON CONFLICT (username) DO NOTHING;

-- Kelas Contoh
INSERT INTO public.classes (id, name) VALUES
('11111111-1111-1111-1111-111111111111', 'VII A'),
('22222222-2222-2222-2222-222222222222', 'VII B'),
('33333333-3333-3333-3333-333333333333', 'VIII A'),
('44444444-4444-4444-4444-444444444444', 'VIII B'),
('55555555-5555-5555-5555-555555555555', 'IX A'),
('66666666-6666-6666-6666-666666666666', 'IX B')
ON CONFLICT (name) DO NOTHING;

-- Calon Kandidat Paslon 01, 02, 03
INSERT INTO public.candidates (id, candidate_number, leader_name, vice_leader_name, photo_url, slogan, vision, mission, total_votes) VALUES
(
    'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    1,
    'Ahmad Fauzan Pratama',
    'Siti Nurhaliza',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
    'Bersinergi Membangun Generasi Unggul, Kreatif, dan Berakhlak Mulia',
    'Mewujudkan OSIS sebagai wadah aspirasi siswa yang inklusif, inovatif, berkarakter, dan berdaya saing tinggi di era digital.',
    '1. Menyelenggarakan kegiatan keagamaan dan pembinaan budi pekerti luhur.
2. Mengoptimalkan platform digital untuk transparansi aspirasi siswa.
3. Mengembangkan bakat ekstrakurikuler di bidang seni, sains, dan olahraga.
4. Mewujudkan program peduli lingkungan sekolah hijau dan asri.',
    0
),
(
    'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    2,
    'Raditya Danendra',
    'Clarissa Putri Anggraini',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    'Aksi Nyata, Suara Kita, Prestasi Tiada Tara',
    'Menjadikan OSIS yang aktif, solutif, kolaboratif, serta menjadi jembatan harmonis antara siswa dan guru.',
    '1. Membangun ruang apresiasi karya siswa lewat festival kreatif tahunan.
2. Meningkatkan solidaritas antarkelas melalui program mentoring sahabat belajar.
3. Menciptakan iklim sekolah yang bebas perundungan (anti-bullying).
4. Menjalin kemitraan positif dengan komunitas edukasi luar sekolah.',
    0
),
(
    'c3333333-cccc-cccc-cccc-cccccccccccc',
    3,
    'Bagas Wicaksono',
    'Dewi Sartika Ananda',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    'Inovasi Bersama untuk Sekolah yang Menginspirasi',
    'Mewujudkan iklim sekolah yang cerdas, berprestasi, ramah teknologi, dan berwawasan lingkungan global.',
    '1. Menyelenggarakan pekan inovasi teknologi dan literasi digital sekolah.
2. Menerapkan sistem zero waste dan bank sampah mandiri di sekolah.
3. Mengadakan kompetisi e-sport dan akademik antarkelas secara berkala.
4. Mendukung penuh setiap kegiatan minat bakat seluruh siswa tanpa terkecuali.',
    0
)
ON CONFLICT (candidate_number) DO NOTHING;

-- Data Siswa Contoh (untuk langsung uji coba login)
INSERT INTO public.students (nisn, name, birth_date, class_name, has_voted) VALUES
('0081234561', 'Aditya Pratama Putra', '2010-05-14', 'VII A', FALSE),
('0081234562', 'Bella Safitri', '2010-08-22', 'VII A', FALSE),
('0081234563', 'Cahya Ramadhani', '2010-01-10', 'VII B', FALSE),
('0081234564', 'Dimas Arya Pamungkas', '2010-11-03', 'VII B', FALSE),
('0072345671', 'Eka Nurtjahyo', '2009-04-18', 'VIII A', FALSE),
('0072345672', 'Fani Rahmawati', '2009-07-29', 'VIII A', FALSE),
('0072345673', 'Gilang Mahendra', '2009-12-05', 'VIII B', FALSE),
('0072345674', 'Hana Zakiyah', '2009-03-15', 'VIII B', FALSE),
('0063456781', 'Irfan Hakim Setiawan', '2008-06-20', 'IX A', FALSE),
('0063456782', 'Jasmine Aurelia', '2008-09-11', 'IX A', FALSE),
('0063456783', 'Kevin Christian', '2008-02-28', 'IX B', FALSE),
('0063456784', 'Larasati Dewi', '2008-10-17', 'IX B', FALSE)
ON CONFLICT (nisn) DO NOTHING;
`;
