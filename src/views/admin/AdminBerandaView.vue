<template>
  <div id="admin-beranda-view">
    <!-- Page Header -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-1">Beranda Dashboard</h3>
        <p class="text-muted mb-0">Statistik real-time pelaksanaan {{ settings?.agenda_title || 'Pemilihan OSIS' }} Periode {{ settings?.election_period }}</p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button @click="loadData" class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold d-flex align-items-center gap-1.5" :disabled="loading">
          <i class="bi bi-arrow-clockwise" :class="{ 'spin': loading }"></i>
          <span>Segarkan Data</span>
        </button>

        <router-link to="/admin/perolehan-suara" class="btn btn-sm btn-primary rounded-pill px-3 fw-semibold d-flex align-items-center gap-1.5 shadow-sm">
          <i class="bi bi-bar-chart-line-fill"></i>
          <span>Lihat Perolehan Suara</span>
        </router-link>
      </div>
    </div>

    <!-- 6 Primary Metric Cards -->
    <div class="row g-3 mb-4">
      <!-- 1. Total Siswa (DPT) -->
      <div class="col-sm-6 col-xl-4">
        <div class="card border-0 shadow-sm rounded-4 p-3.5 bg-white h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-muted fs-7 fw-semibold text-uppercase tracking-wider">Total Siswa (DPT)</span>
            <div class="bg-primary-subtle text-primary p-2.5 rounded-3">
              <i class="bi bi-people-fill fs-5"></i>
            </div>
          </div>
          <h2 class="fw-bold text-dark mb-1">{{ stats.totalStudents }}</h2>
          <small class="text-muted fs-8">Terdaftar dalam daftar pemilih tetap</small>
        </div>
      </div>

      <!-- 2. Total Kelas -->
      <div class="col-sm-6 col-xl-4">
        <div class="card border-0 shadow-sm rounded-4 p-3.5 bg-white h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-muted fs-7 fw-semibold text-uppercase tracking-wider">Total Kelas</span>
            <div class="bg-info-subtle text-info p-2.5 rounded-3">
              <i class="bi bi-building fs-5"></i>
            </div>
          </div>
          <h2 class="fw-bold text-dark mb-1">{{ stats.totalClasses }}</h2>
          <small class="text-muted fs-8">Rombongan belajar terdata</small>
        </div>
      </div>

      <!-- 3. Total Kandidat -->
      <div class="col-sm-6 col-xl-4">
        <div class="card border-0 shadow-sm rounded-4 p-3.5 bg-white h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-muted fs-7 fw-semibold text-uppercase tracking-wider">Calon Kandidat</span>
            <div class="bg-warning-subtle text-warning p-2.5 rounded-3">
              <i class="bi bi-person-badge-fill fs-5"></i>
            </div>
          </div>
          <h2 class="fw-bold text-dark mb-1">{{ stats.totalCandidates }}</h2>
          <small class="text-muted fs-8">Paslon Ketua & Wakil OSIS</small>
        </div>
      </div>

      <!-- 4. Sudah Memilih -->
      <div class="col-sm-6 col-xl-4">
        <div class="card border-0 shadow-sm rounded-4 p-3.5 bg-white h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-muted fs-7 fw-semibold text-uppercase tracking-wider">Sudah Memilih</span>
            <div class="bg-success-subtle text-success p-2.5 rounded-3">
              <i class="bi bi-check-circle-fill fs-5"></i>
            </div>
          </div>
          <h2 class="fw-bold text-success mb-1">{{ stats.votedStudents }}</h2>
          <small class="text-success fs-8 fw-semibold">
            <i class="bi bi-check2"></i> Hak suara telah digunakan
          </small>
        </div>
      </div>

      <!-- 5. Belum Memilih -->
      <div class="col-sm-6 col-xl-4">
        <div class="card border-0 shadow-sm rounded-4 p-3.5 bg-white h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-muted fs-7 fw-semibold text-uppercase tracking-wider">Belum Memilih</span>
            <div class="bg-danger-subtle text-danger p-2.5 rounded-3">
              <i class="bi bi-hourglass-split fs-5"></i>
            </div>
          </div>
          <h2 class="fw-bold text-danger mb-1">{{ stats.notVotedStudents }}</h2>
          <small class="text-danger fs-8 fw-semibold">
            <i class="bi bi-exclamation-circle"></i> Menunggu partisipasi pemilih
          </small>
        </div>
      </div>

      <!-- 6. Persentase Partisipasi -->
      <div class="col-sm-6 col-xl-4">
        <div class="card border-0 shadow-sm rounded-4 p-3.5 bg-primary text-white h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-white-50 fs-7 fw-semibold text-uppercase tracking-wider">Partisipasi Suara</span>
            <div class="bg-white bg-opacity-20 text-white p-2.5 rounded-3">
              <i class="bi bi-pie-chart-fill fs-5"></i>
            </div>
          </div>
          <h2 class="fw-bold text-white mb-1">{{ stats.turnoutPercentage }}%</h2>
          <small class="text-white-50 fs-8">Tingkat kehadiran pemilih (Turnout)</small>
        </div>
      </div>
    </div>

    <!-- Participation Progress Card -->
    <div class="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
      <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3">
        <div>
          <h5 class="fw-bold text-dark mb-1">Progres Partisipasi Pemilihan</h5>
          <p class="text-muted small mb-0">
            {{ stats.votedStudents }} dari total {{ stats.totalStudents }} siswa telah menyalurkan hak suaranya
          </p>
        </div>
        <span class="badge bg-primary fs-6 px-3 py-1.5 rounded-pill">{{ stats.turnoutPercentage }}% Tercapai</span>
      </div>

      <div class="progress rounded-pill mb-3" style="height: 14px;">
        <div
          class="progress-bar bg-success progress-bar-striped progress-bar-animated"
          role="progressbar"
          :style="{ width: `${stats.turnoutPercentage}%` }"
          :aria-valuenow="stats.turnoutPercentage"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>

      <div class="d-flex align-items-center justify-content-between fs-8 text-muted">
        <span>0% (Mulai)</span>
        <span>Target: 100% Partisipasi Siswa</span>
      </div>
    </div>

    <!-- Quick Shortcuts & System Status -->
    <div class="row g-4">
      <!-- Quick Actions -->
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
          <h5 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <i class="bi bi-lightning-charge-fill text-warning"></i> Akses Cepat Panitia
          </h5>

          <div class="list-group list-group-flush gap-2">
            <router-link to="/admin/siswa" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 rounded-3 border">
              <div class="d-flex align-items-center gap-3">
                <div class="bg-primary-subtle text-primary p-2.5 rounded-3">
                  <i class="bi bi-person-plus-fill fs-5"></i>
                </div>
                <div>
                  <div class="fw-bold text-dark">Kelola Data Siswa (DPT)</div>
                  <small class="text-muted">Tambah, ubah, atau cari data siswa & status hak suara</small>
                </div>
              </div>
              <i class="bi bi-chevron-right text-muted"></i>
            </router-link>

            <router-link to="/admin/kandidat" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 rounded-3 border">
              <div class="d-flex align-items-center gap-3">
                <div class="bg-warning-subtle text-warning p-2.5 rounded-3">
                  <i class="bi bi-person-badge-fill fs-5"></i>
                </div>
                <div>
                  <div class="fw-bold text-dark">Kelola Calon Kandidat</div>
                  <small class="text-muted">Atur nomor urut, foto, nama ketua/wakil, visi, misi, slogan</small>
                </div>
              </div>
              <i class="bi bi-chevron-right text-muted"></i>
            </router-link>

            <router-link to="/admin/kelas" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 rounded-3 border">
              <div class="d-flex align-items-center gap-3">
                <div class="bg-info-subtle text-info p-2.5 rounded-3">
                  <i class="bi bi-building fs-5"></i>
                </div>
                <div>
                  <div class="fw-bold text-dark">Data Kelas / Rombel</div>
                  <small class="text-muted">Tambah atau ubah nama kelas untuk pengelompokan siswa</small>
                </div>
              </div>
              <i class="bi bi-chevron-right text-muted"></i>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Information & Security Rules -->
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
          <h5 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <i class="bi bi-shield-check text-success"></i> Integritas & Keamanan Sistem
          </h5>

          <div class="p-3 bg-light rounded-3 mb-3 border-start border-success border-3">
            <div class="fw-bold text-dark fs-7 mb-1">Prinsip Asas Rahasia (Secret Ballot)</div>
            <p class="small text-muted mb-0">
              Sistem eOSIS secara ketat memisahkan identitas siswa dengan pilihan kandidat. Panitia admin hanya dapat memantau status partisipasi (sudah/belum memilih) dan akumulasi total suara masing-masing kandidat.
            </p>
          </div>

          <div class="p-3 bg-light rounded-3 mb-3 border-start border-primary border-3">
            <div class="fw-bold text-dark fs-7 mb-1">Validasi Anti-Duplikasi Suara</div>
            <p class="small text-muted mb-0">
              Database Supabase mengunci baris siswa (row-locking) saat RPC eksekusi voting berlangsung, menjamin tidak terjadi pemilihan ganda meski siswa me-refresh atau membuka tab baru.
            </p>
          </div>

          <div class="mt-auto pt-2 text-end">
            <router-link to="/admin/database" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
              <i class="bi bi-database-check me-1"></i>Periksa Skema Database
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { dataService } from '../../services/dataService';
import { ElectionStats, SchoolSetting } from '../../types';

const stats = ref<ElectionStats>({
  totalStudents: 0,
  totalClasses: 0,
  totalCandidates: 0,
  votedStudents: 0,
  notVotedStudents: 0,
  turnoutPercentage: 0,
  totalVotesCast: 0,
});
const settings = ref<SchoolSetting | null>(null);
const loading = ref(false);

const loadData = async () => {
  loading.value = true;
  try {
    const [st, sett] = await Promise.all([
      dataService.getElectionStats(),
      dataService.getSettings(),
    ]);
    stats.value = st;
    settings.value = sett;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.fs-7 {
  font-size: 0.85rem;
}
.fs-8 {
  font-size: 0.75rem;
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
