<template>
  <div class="min-vh-100 d-flex flex-column bg-light" id="siswa-beranda-page">
    <Navbar />

    <main class="container my-auto py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Biodata Card -->
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <!-- Card Header -->
            <div class="bg-primary text-white p-4 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
              <div class="d-flex align-items-center gap-3">
                <div class="bg-white text-primary rounded-circle p-3 d-flex align-items-center justify-content-center shadow-sm" style="width: 58px; height: 58px;">
                  <i class="bi bi-person-badge-fill fs-3"></i>
                </div>
                <div>
                  <span class="badge bg-warning text-dark fw-bold rounded-pill px-2.5 py-1 mb-1">
                    Daftar Pemilih Tetap (DPT)
                  </span>
                  <h4 class="fw-bold mb-0">{{ student?.name }}</h4>
                  <small class="text-white-50">Siswa Kelas {{ student?.class_name }}</small>
                </div>
              </div>

              <!-- Status Hak Suara Pill -->
              <div>
                <span
                  v-if="student?.has_voted"
                  class="badge bg-secondary text-white fs-7 px-3 py-2 rounded-pill shadow-sm d-inline-flex align-items-center gap-1.5"
                  id="status-sudah-memilih"
                >
                  <i class="bi bi-check-circle-fill text-success fs-6"></i>
                  <span>Sudah Memilih</span>
                </span>
                <span
                  v-else
                  class="badge bg-success text-white fs-7 px-3 py-2 rounded-pill shadow-sm d-inline-flex align-items-center gap-1.5 animate-pulse"
                  id="status-belum-memilih"
                >
                  <i class="bi bi-exclamation-circle-fill text-warning fs-6"></i>
                  <span>Belum Memilih</span>
                </span>
              </div>
            </div>

            <!-- Card Body - Detail Biodata -->
            <div class="card-body p-4 p-md-5 bg-white">
              <h6 class="fw-bold text-dark text-uppercase fs-8 tracking-wider mb-3">
                <i class="bi bi-info-circle-fill text-primary me-1"></i> Data Identitas Pemilih
              </h6>

              <div class="row g-3 mb-4">
                <div class="col-sm-6">
                  <div class="p-3 bg-light rounded-3 border">
                    <small class="text-muted d-block mb-1 fs-8">NIS</small>
                    <div class="fw-bold text-dark fs-6 font-monospace">{{ student?.nisn }}</div>
                  </div>
                </div>

                <div class="col-sm-6">
                  <div class="p-3 bg-light rounded-3 border">
                    <small class="text-muted d-block mb-1 fs-8">Nama Lengkap</small>
                    <div class="fw-bold text-dark fs-6">{{ student?.name }}</div>
                  </div>
                </div>

                <div class="col-sm-6">
                  <div class="p-3 bg-light rounded-3 border">
                    <small class="text-muted d-block mb-1 fs-8">Kelas</small>
                    <div class="fw-bold text-dark fs-6">{{ student?.class_name }}</div>
                  </div>
                </div>

                <div class="col-sm-6">
                  <div class="p-3 bg-light rounded-3 border">
                    <small class="text-muted d-block mb-1 fs-8">Tanggal Lahir</small>
                    <div class="fw-bold text-dark fs-6">{{ formatDate(student?.birth_date) }}</div>
                  </div>
                </div>
              </div>

              <!-- Conditional Alert & Actions -->
              <!-- KONDISI 1: SUDAH MEMILIH -->
              <div v-if="student?.has_voted" class="alert alert-secondary border-0 p-4 rounded-4 text-center shadow-xs" id="alert-sudah-memilih">
                <div class="bg-success text-white rounded-circle p-3 d-inline-flex align-items-center justify-content-center shadow-sm mb-3" style="width: 60px; height: 60px;">
                  <i class="bi bi-check2-all fs-2"></i>
                </div>
                <h5 class="fw-bold text-dark mb-1">Anda sudah menggunakan hak suara</h5>
                <p class="text-muted small mb-3">
                  Terima kasih! Suara Anda telah tercatat dengan aman dan rahasia di dalam database.
                  <span v-if="student?.voted_at">Dicatat pada: {{ formatDateTime(student.voted_at) }}</span>
                </p>
                <div class="d-inline-flex align-items-center gap-2 text-muted fs-8 bg-white px-3 py-1.5 rounded-pill border">
                  <i class="bi bi-shield-check text-success"></i>
                  <span>Asas Langsung, Umum, Bebas, Rahasia, Jujur & Adil</span>
                </div>
              </div>

              <!-- KONDISI 2: BELUM MEMILIH -->
              <div v-else class="text-center p-4 bg-primary-subtle rounded-4 border border-primary-subtle" id="box-belum-memilih">
                <div class="bg-primary text-white rounded-circle p-3 d-inline-flex align-items-center justify-content-center shadow-sm mb-3" style="width: 60px; height: 60px;">
                  <i class="bi bi-envelope-paper-heart-fill fs-2"></i>
                </div>
                <h5 class="fw-bold text-primary mb-1">Hak Suara Anda Siap Digunakan</h5>
                <p class="text-secondary small mb-4 mx-auto" style="max-width: 500px;">
                  Setiap siswa memiliki <strong>1 (satu) kali kesempatan</strong> untuk memilih pasangan calon Ketua dan Wakil Ketua OSIS. Pilihan bersifat rahasia dan tidak dapat diubah setelah disimpan.
                </p>

                <!-- Tombol Berikan Suara -->
                <router-link
                  to="/siswa/voting"
                  class="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold shadow d-inline-flex align-items-center gap-2"
                  id="btn-berikan-suara"
                >
                  <i class="bi bi-hand-index-thumb-fill fs-4"></i>
                  <span>Berikan Suara Sekarang</span>
                </router-link>
              </div>
            </div>

            <!-- Footer -->
            <div class="card-footer bg-light px-4 py-3 d-flex align-items-center justify-content-between border-0">
              <span class="text-muted fs-8">
                <i class="bi bi-clock-history me-1"></i> Periode Pemilihan Aktif
              </span>
              <button @click="logout" class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-semibold">
                <i class="bi bi-box-arrow-right me-1"></i>Keluar Sesi
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../../components/Navbar.vue';
import { authService } from '../../services/authService';
import { Student } from '../../types';

const router = useRouter();
const student = ref<Student | null>(null);

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

const logout = () => {
  authService.logoutStudent();
  router.push('/login');
};

onMounted(async () => {
  const updated = await authService.refreshStudentSession();
  student.value = updated || authService.currentStudent.value;
  if (!student.value) {
    router.push('/login');
  }
});
</script>

<style scoped>
.fs-7 {
  font-size: 0.9rem;
}
.fs-8 {
  font-size: 0.8rem;
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>
