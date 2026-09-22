<template>
  <div class="min-vh-100 d-flex flex-column bg-light" id="siswa-voting-page">
    <Navbar />

    <!-- SUCCESS 4-SECOND OVERLAY -->
    <div
      v-if="voteSuccess"
      class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3 z-3"
      style="background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px);"
      id="vote-success-overlay"
    >
      <div class="card border-0 rounded-4 shadow-lg text-center p-4 p-md-5 max-w-lg bg-white" style="max-width: 520px;">
        <div class="bg-success text-white rounded-circle p-4 d-inline-flex align-items-center justify-content-center shadow-lg mb-3 mx-auto" style="width: 88px; height: 88px;">
          <i class="bi bi-check-lg display-4 fw-bold"></i>
        </div>

        <h3 class="fw-bold text-dark mb-2">Pilihan Anda Berhasil!</h3>
        <p class="fs-5 text-success fw-bold mb-3">
          "Suara Anda berhasil dicatat, terima kasih telah berpartisipasi"
        </p>
        <p class="text-muted small mb-4">
          Hak suara Anda telah sah digunakan dan tersimpan secara anonim. Anda akan otomatis dialihkan ke halaman utama dalam <strong>{{ countdown }} detik</strong>.
        </p>

        <!-- Animated countdown progress bar -->
        <div class="progress rounded-pill mb-3" style="height: 8px;">
          <div
            class="progress-bar bg-success progress-bar-striped progress-bar-animated transition-all"
            role="progressbar"
            :style="{ width: `${(countdown / 4) * 100}%` }"
          ></div>
        </div>

        <button
          @click="finishVotingImmediately"
          class="btn btn-outline-secondary btn-sm rounded-pill px-4 mx-auto"
        >
          Keluar Sekarang ({{ countdown }}s)
        </button>
      </div>
    </div>

    <!-- MAIN VOTING INTERFACE -->
    <main class="container py-4 flex-grow-1">
      <!-- Title Header -->
      <div class="text-center mb-4">
        <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5 rounded-pill fw-semibold mb-2">
          Surat Suara Digital • {{ settings?.election_period || '2026/2027' }}
        </span>
        <h2 class="fw-bold text-dark mb-1">{{ settings?.agenda_title || 'Pilih Pasangan Calon Ketua & Wakil Ketua OSIS' }}</h2>
        <p class="text-muted mb-0">
          Pemilih: <strong>{{ student?.name }}</strong> ({{ student?.class_name }}) • Tentukan pilihan terbaik untuk kemajuan sekolah
        </p>
      </div>

      <!-- Error Alert if any -->
      <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center gap-2 rounded-3 shadow-sm mb-4" role="alert">
        <i class="bi bi-exclamation-octagon-fill fs-4 text-danger flex-shrink-0"></i>
        <div class="flex-grow-1">{{ errorMessage }}</div>
        <button type="button" class="btn-close" @click="errorMessage = ''"></button>
      </div>

      <!-- Candidate Cards Grid -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2">Memuat surat suara kandidat...</p>
      </div>

      <div v-else class="row g-4 justify-content-center">
        <div v-for="cand in candidates" :key="cand.id" class="col-md-6 col-lg-4">
          <div
            class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden candidate-box transition-all"
            :class="{ 'border border-primary border-2 shadow': selectedCandidate?.id === cand.id }"
          >
            <!-- Nomor Urut & Foto Banner -->
            <div class="position-relative" style="height: 280px; background-color: #1e293b;">
              <img
                :src="cand.photo_url || defaultAvatar"
                :alt="cand.leader_name"
                class="w-100 h-100 object-fit-cover"
                @error="onPhotoError($event)"
              />
              <div class="position-absolute top-0 start-0 m-3 badge bg-primary text-white fs-4 fw-bold px-3 py-2 rounded-pill shadow-lg border border-white">
                0{{ cand.candidate_number }}
              </div>
            </div>

            <!-- Body Information -->
            <div class="card-body p-4 d-flex flex-column">
              <div class="mb-2">
                <span class="badge bg-light text-primary border fw-semibold fs-8 px-2.5 py-1 rounded-pill">
                  Pasangan Calon No. 0{{ cand.candidate_number }}
                </span>
              </div>

              <h5 class="fw-bold text-dark mb-1">{{ cand.leader_name }}</h5>
              <h6 class="text-secondary fw-semibold mb-3">Wakil: {{ cand.vice_leader_name }}</h6>

              <!-- Slogan -->
              <div class="bg-light p-3 rounded-3 mb-3 border-start border-primary border-3 fst-italic text-secondary small">
                "{{ cand.slogan || 'Berdedikasi untuk seluruh siswa.' }}"
              </div>

              <!-- Collapsible Visi & Misi -->
              <div class="mb-4">
                <button
                  class="btn btn-sm btn-link text-decoration-none p-0 fw-semibold text-primary d-flex align-items-center gap-1"
                  type="button"
                  @click="toggleExpand(cand.id)"
                >
                  <i :class="expanded[cand.id] ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
                  <span>{{ expanded[cand.id] ? 'Sembunyikan Visi & Misi' : 'Baca Visi & Misi Paslon' }}</span>
                </button>

                <div v-if="expanded[cand.id]" class="mt-3 p-3 bg-light rounded-3 small text-muted border">
                  <div class="fw-bold text-dark mb-1">Visi:</div>
                  <p class="mb-2">{{ cand.vision }}</p>
                  <div class="fw-bold text-dark mb-1">Misi:</div>
                  <p class="mb-0" style="white-space: pre-line;">{{ cand.mission }}</p>
                </div>
              </div>

              <!-- Action Button: Coblos / Pilih -->
              <div class="mt-auto">
                <button
                  class="btn btn-primary w-100 py-2.5 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  @click="promptConfirmVote(cand)"
                  :id="`btn-pilih-cand-${cand.candidate_number}`"
                >
                  <i class="bi bi-check2-circle fs-5"></i>
                  <span>Coblos Paslon 0{{ cand.candidate_number }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Secret Ballot Guarantee Banner -->
      <div class="card border-0 bg-white shadow-xs rounded-4 p-3 mt-5 text-center">
        <div class="d-flex flex-wrap align-items-center justify-content-center gap-4 text-muted small">
          <div class="d-flex align-items-center gap-1.5">
            <i class="bi bi-shield-lock-fill text-success fs-5"></i>
            <span>Pilihan Bersifat Rahasia (Anonim)</span>
          </div>
          <div class="d-flex align-items-center gap-1.5">
            <i class="bi bi-patch-check-fill text-primary fs-5"></i>
            <span>Tervalidasi Database Supabase</span>
          </div>
          <div class="d-flex align-items-center gap-1.5">
            <i class="bi bi-1-circle-fill text-warning fs-5"></i>
            <span>Tepat 1 Suara per Siswa</span>
          </div>
        </div>
      </div>
    </main>

    <!-- CONFIRMATION MODAL -->
    <div
      v-if="showConfirmModal && candidateToVote"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.6);"
      id="confirm-vote-modal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div class="modal-header bg-primary text-white border-0 py-3 px-4">
            <h5 class="modal-title fw-bold d-flex align-items-center gap-2">
              <i class="bi bi-question-circle-fill"></i> Konfirmasi Pilihan Anda
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="cancelConfirmVote"></button>
          </div>

          <div class="modal-body p-4 text-center">
            <div class="bg-primary-subtle text-primary rounded-circle p-3 d-inline-flex align-items-center justify-content-center shadow-sm mb-3" style="width: 70px; height: 70px;">
              <i class="bi bi-envelope-check-fill fs-2"></i>
            </div>

            <h5 class="fw-bold text-dark mb-1">
              Apakah Anda yakin memilih Paslon No. 0{{ candidateToVote.candidate_number }}?
            </h5>

            <div class="card bg-light border p-3 rounded-3 my-3 text-start">
              <div class="d-flex align-items-center gap-3">
                <img
                  :src="candidateToVote.photo_url || defaultAvatar"
                  class="rounded-3 object-fit-cover"
                  style="width: 60px; height: 60px;"
                  @error="onPhotoError($event)"
                />
                <div>
                  <div class="badge bg-primary mb-1">Nomor Urut 0{{ candidateToVote.candidate_number }}</div>
                  <div class="fw-bold text-dark">{{ candidateToVote.leader_name }}</div>
                  <small class="text-muted">& {{ candidateToVote.vice_leader_name }}</small>
                </div>
              </div>
            </div>

            <div class="alert alert-warning small py-2 px-3 mb-0 text-start d-flex align-items-center gap-2 rounded-3">
              <i class="bi bi-exclamation-triangle-fill text-warning flex-shrink-0 fs-5"></i>
              <div>
                <strong>Perhatian:</strong> Pilihan Anda bersifat final dan <strong>tidak dapat diubah</strong> setelah disimpan.
              </div>
            </div>
          </div>

          <div class="modal-footer bg-light border-0 px-4 py-3 d-flex justify-content-between">
            <button
              type="button"
              class="btn btn-outline-secondary rounded-pill px-4"
              @click="cancelConfirmVote"
              :disabled="submitting"
            >
              Batal
            </button>

            <button
              type="button"
              class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
              @click="executeVote"
              :disabled="submitting"
              id="btn-confirm-submit-vote"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <i v-else class="bi bi-check2-circle"></i>
              <span>{{ submitting ? 'Menyimpan Suara...' : 'Ya, Saya Yakin Pilih' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import confetti from 'canvas-confetti';
import Navbar from '../../components/Navbar.vue';
import { dataService } from '../../services/dataService';
import { authService } from '../../services/authService';
import { Candidate, Student, SchoolSetting } from '../../types';

const router = useRouter();
const student = ref<Student | null>(null);
const candidates = ref<Candidate[]>([]);
const settings = ref<SchoolSetting | null>(null);
const loading = ref(true);
const submitting = ref(false);
const errorMessage = ref('');

const selectedCandidate = ref<Candidate | null>(null);
const candidateToVote = ref<Candidate | null>(null);
const showConfirmModal = ref(false);

const expanded = ref<Record<string, boolean>>({});

// 4-second success state
const voteSuccess = ref(false);
const countdown = ref(4);
let countdownTimer: any = null;

const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';

const onPhotoError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.src = defaultAvatar;
};

const toggleExpand = (id: string) => {
  expanded.value[id] = !expanded.value[id];
};

const promptConfirmVote = (cand: Candidate) => {
  candidateToVote.value = cand;
  showConfirmModal.value = true;
};

const cancelConfirmVote = () => {
  candidateToVote.value = null;
  showConfirmModal.value = false;
};

const executeVote = async () => {
  if (!student.value || !candidateToVote.value) return;

  submitting.value = true;
  errorMessage.value = '';

  try {
    const res = await dataService.castVote(student.value.id, candidateToVote.value.id);

    if (res.success) {
      showConfirmModal.value = false;
      voteSuccess.value = true;
      countdown.value = 4;

      // Launch joyful celebratory confetti!
      triggerConfetti();

      // Start 4-second countdown
      countdownTimer = setInterval(() => {
        countdown.value -= 1;
        if (countdown.value <= 0) {
          finishVotingImmediately();
        }
      }, 1000);
    } else {
      errorMessage.value = res.message;
      showConfirmModal.value = false;
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal merekam suara ke database.';
    showConfirmModal.value = false;
  } finally {
    submitting.value = false;
  }
};

const triggerConfetti = () => {
  try {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  } catch (e) {
    // Non-fatal
  }
};

const finishVotingImmediately = () => {
  if (countdownTimer) clearInterval(countdownTimer);
  authService.logoutStudent();
  router.push('/login');
};

onMounted(async () => {
  const current = await authService.refreshStudentSession();
  student.value = current;

  if (!student.value) {
    router.push('/login');
    return;
  }

  if (student.value.has_voted) {
    router.push('/siswa/beranda');
    return;
  }

  try {
    const [cands, sett] = await Promise.all([
      dataService.getCandidates(),
      dataService.getSettings(),
    ]);
    candidates.value = cands;
    settings.value = sett;
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});
</script>

<style scoped>
.candidate-box {
  transition: all 0.25s ease;
}
.candidate-box:hover {
  transform: translateY(-4px);
  box-shadow: 0 0.8rem 1.8rem rgba(0, 0, 0, 0.08) !important;
}
.fs-8 {
  font-size: 0.78rem;
}
.transition-all {
  transition: all 0.3s ease;
}
</style>
