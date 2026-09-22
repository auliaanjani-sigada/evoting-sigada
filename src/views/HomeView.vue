<template>
  <div class="min-vh-100 d-flex flex-column bg-light" id="home-view-page">
    <Navbar />

    <!-- Hero Section -->
    <header class="py-5 bg-white border-bottom shadow-xs">
      <div class="container px-4">
        <div class="row align-items-center gy-4">
          <div class="col-lg-7">
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5 rounded-pill mb-3 fw-semibold">
              <i class="bi bi-patch-check-fill me-1"></i> Sistem E-Voting Resmi & Terverifikasi
            </span>
            <h1 class="display-5 fw-bold text-dark mb-3 lh-sm">
              Pemilihan Ketua & Wakil Ketua OSIS <span class="text-primary">{{ settings.school_name }}</span>
            </h1>
            <p class="lead text-muted mb-4">
              Gunakan hak pilih Anda secara Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil (LUBER & JURDIL) dalam periode <strong>{{ settings.election_period }}</strong>.
            </p>

            <div class="d-flex flex-wrap gap-3">
              <router-link
                to="/login"
                class="btn btn-primary btn-lg px-4 py-2.5 rounded-pill shadow-sm d-flex align-items-center gap-2 fw-semibold"
                id="hero-btn-login-siswa"
              >
                <i class="bi bi-person-check-fill fs-5"></i>
                <span>Masuk sebagai Siswa (Pemilih)</span>
              </router-link>

              <router-link
                to="/admin/login"
                class="btn btn-outline-secondary btn-lg px-4 py-2.5 rounded-pill d-flex align-items-center gap-2 fw-semibold"
                id="hero-btn-login-admin"
              >
                <i class="bi bi-shield-lock fs-5"></i>
                <span>Portal Panitia / Admin</span>
              </router-link>
            </div>
          </div>

          <div class="col-lg-5 text-center">
            <div class="position-relative d-inline-block">
              <div class="card border-0 shadow-lg rounded-4 overflow-hidden" style="max-width: 420px;">
                <div class="bg-primary p-4 text-white text-center">
                  <i class="bi bi-box2-heart-fill display-3 mb-2"></i>
                  <h4 class="fw-bold mb-1">eOSIS Voting Center</h4>
                  <p class="small text-white-50 mb-0">1 Siswa = 1 Suara Sah Terjamin</p>
                </div>
                <div class="card-body p-4 text-start bg-white">
                  <div class="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                    <div class="bg-success-subtle text-success p-2.5 rounded-3">
                      <i class="bi bi-shield-shaded fs-4"></i>
                    </div>
                    <div>
                      <div class="fw-bold">Kerahasiaan Terjamin</div>
                      <small class="text-muted">Pilihan Anda dienkripsi dan anonim di database</small>
                    </div>
                  </div>
                  <div class="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                    <div class="bg-primary-subtle text-primary p-2.5 rounded-3">
                      <i class="bi bi-fingerprint fs-4"></i>
                    </div>
                    <div>
                      <div class="fw-bold">Anti Duplikasi Suara</div>
                      <small class="text-muted">Validasi ketat tingkat basis data Supabase</small>
                    </div>
                  </div>
                  <div class="d-flex align-items-center gap-3">
                    <div class="bg-info-subtle text-info p-2.5 rounded-3">
                      <i class="bi bi-pie-chart-fill fs-4"></i>
                    </div>
                    <div>
                      <div class="fw-bold">Hasil Akurat Real-Time</div>
                      <small class="text-muted">Tabulasi otomatis dan transparan</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Kandidat Showcase Section -->
    <section class="py-5">
      <div class="container px-4">
        <div class="text-center mb-5">
          <span class="badge bg-secondary-subtle text-secondary px-3 py-1 rounded-pill fw-semibold mb-2">Daftar Pasangan Calon</span>
          <h2 class="fw-bold text-dark">Kandidat Ketua & Wakil Ketua OSIS</h2>
          <p class="text-muted">Kenali visi, misi, dan program kerja terbaik sebelum memberikan hak suara Anda</p>
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted">Memuat daftar kandidat...</p>
        </div>

        <div v-else class="row g-4 justify-content-center">
          <div v-for="cand in candidates" :key="cand.id" class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden candidate-card">
              <!-- Header Nomor Urut & Foto -->
              <div class="position-relative" style="height: 260px; background-color: #1a202c;">
                <img
                  :src="cand.photo_url || defaultAvatar"
                  :alt="cand.leader_name"
                  class="w-100 h-100 object-fit-cover opacity-90"
                  @error="onPhotoError($event)"
                />
                <!-- Nomor Urut Badge -->
                <div class="position-absolute top-0 start-0 m-3 badge bg-primary shadow-lg fs-5 px-3 py-2 rounded-pill fw-bold border border-white">
                  No. 0{{ cand.candidate_number }}
                </div>
              </div>

              <!-- Card Body -->
              <div class="card-body p-4 d-flex flex-column">
                <div class="mb-2">
                  <span class="badge bg-light text-primary border border-primary-subtle fw-bold fs-8 px-2.5 py-1 rounded-pill">
                    Calon Ketua & Wakil
                  </span>
                </div>
                <h5 class="fw-bold text-dark mb-1">{{ cand.leader_name }}</h5>
                <h6 class="fw-semibold text-secondary mb-3">& {{ cand.vice_leader_name }}</h6>

                <div class="bg-light p-3 rounded-3 mb-3 fst-italic text-muted small border-start border-primary border-3">
                  "{{ cand.slogan || 'Bersama mewujudkan sekolah yang lebih berprestasi.' }}"
                </div>

                <div class="mt-auto">
                  <button
                    class="btn btn-outline-primary w-100 rounded-pill fw-semibold py-2"
                    @click="openDetailModal(cand)"
                  >
                    <i class="bi bi-eye me-1"></i>Lihat Visi & Misi Lengkap
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-5">
          <router-link to="/login" class="btn btn-primary btn-lg rounded-pill px-5 shadow-sm fw-bold">
            <i class="bi bi-box-arrow-in-right me-2"></i>Masuk dan Berikan Suara Sekarang
          </router-link>
        </div>
      </div>
    </section>

    <!-- Detail Visi Misi Modal -->
    <div
      v-if="selectedCandidate"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5);"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
          <div class="modal-header bg-primary text-white border-0 py-3 px-4">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-warning text-dark fs-6 fw-bold px-2.5 py-1 rounded-pill">
                Kandidat No. 0{{ selectedCandidate.candidate_number }}
              </span>
              <h5 class="modal-title fw-bold mb-0">Visi & Misi Paslon</h5>
            </div>
            <button type="button" class="btn-close btn-close-white" @click="selectedCandidate = null"></button>
          </div>
          <div class="modal-body p-4">
            <div class="d-flex flex-column flex-sm-row gap-4 align-items-start mb-4 pb-3 border-bottom">
              <img
                :src="selectedCandidate.photo_url || defaultAvatar"
                class="rounded-4 object-fit-cover shadow-sm"
                style="width: 120px; height: 120px;"
                @error="onPhotoError($event)"
              />
              <div>
                <h4 class="fw-bold text-dark mb-1">{{ selectedCandidate.leader_name }}</h4>
                <h6 class="text-secondary fw-semibold mb-2">Calon Wakil: {{ selectedCandidate.vice_leader_name }}</h6>
                <div class="badge bg-info-subtle text-info border border-info-subtle px-3 py-1.5 rounded-pill">
                  Slogan: "{{ selectedCandidate.slogan }}"
                </div>
              </div>
            </div>

            <div class="mb-4">
              <h6 class="fw-bold text-primary text-uppercase fs-7 tracking-wide d-flex align-items-center gap-2 mb-2">
                <i class="bi bi-bullseye"></i> Visi
              </h6>
              <div class="bg-light p-3 rounded-3 text-secondary lh-base">
                {{ selectedCandidate.vision }}
              </div>
            </div>

            <div>
              <h6 class="fw-bold text-primary text-uppercase fs-7 tracking-wide d-flex align-items-center gap-2 mb-2">
                <i class="bi bi-list-check"></i> Misi
              </h6>
              <div class="bg-light p-3 rounded-3 text-secondary lh-base" style="white-space: pre-line;">
                {{ selectedCandidate.mission }}
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light border-0 px-4 py-3">
            <button type="button" class="btn btn-secondary rounded-pill px-4" @click="selectedCandidate = null">Tutup</button>
            <router-link to="/login" class="btn btn-primary rounded-pill px-4 fw-semibold">
              <i class="bi bi-check2-circle me-1"></i>Pilih Paslon Ini
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="mt-auto py-4 bg-dark text-white border-top border-secondary">
      <div class="container px-4 text-center">
        <p class="mb-1 text-white-50 small">
          © 2026 eOSIS - Aplikasi Pemilihan Ketua & Wakil Ketua OSIS Digital Berbasis Supabase.
        </p>
        <p class="mb-0 text-white-50 small">
          {{ settings.school_name }} • Asas Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Navbar from '../components/Navbar.vue';
import { dataService } from '../services/dataService';
import { Candidate, SchoolSetting } from '../types';

const candidates = ref<Candidate[]>([]);
const settings = ref<SchoolSetting>({
  school_name: 'SMP Negeri 3 Widodaren',
  election_period: '2026/2027',
  logo_url: '',
  voting_status: 'open',
});
const loading = ref(true);
const selectedCandidate = ref<Candidate | null>(null);

const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';

const openDetailModal = (cand: Candidate) => {
  selectedCandidate.value = cand;
};

const onPhotoError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.src = defaultAvatar;
};

onMounted(async () => {
  try {
    const [cands, setts] = await Promise.all([
      dataService.getCandidates(),
      dataService.getSettings(),
    ]);
    candidates.value = cands;
    settings.value = setts;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.candidate-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.candidate-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.1) !important;
}
.fs-8 {
  font-size: 0.75rem;
}
.fs-7 {
  font-size: 0.85rem;
}
</style>
