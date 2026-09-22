<template>
  <div class="min-vh-100 d-flex flex-column bg-light" id="login-siswa-page">
    <Navbar />

    <div class="container my-auto py-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-5">
          <!-- Card Login -->
          <div class="card border-0 shadow-lg rounded-4 overflow-hidden">
            <!-- Header -->
            <div class="bg-primary text-white p-4 text-center position-relative">
              <div class="bg-white text-primary rounded-circle p-3 d-inline-flex align-items-center justify-content-center shadow-sm mb-3" style="width: 64px; height: 64px;">
                <i class="bi bi-person-fill-lock fs-2"></i>
              </div>
              <h4 class="fw-bold mb-1">Masuk Pemilih Siswa</h4>
              <p class="text-white-50 small mb-0">Silakan masukkan NIS dan tanggal lahir sesuai data sekolah</p>
            </div>

            <!-- Body -->
            <div class="card-body p-4 p-md-5 bg-white">
              <!-- Error Alert -->
              <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center gap-2 rounded-3 small py-2 px-3 mb-4" role="alert" id="login-error-alert">
                <i class="bi bi-exclamation-triangle-fill fs-5 flex-shrink-0"></i>
                <div>{{ errorMessage }}</div>
              </div>

              <form @submit.prevent="handleLogin" id="form-login-siswa">
                <!-- Field NIS -->
                <div class="mb-3">
                  <label for="input-nisn" class="form-label fw-semibold text-dark fs-7">
                    Nomor Induk Siswa (NIS)
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0 text-muted">
                      <i class="bi bi-card-text"></i>
                    </span>
                    <input
                      type="text"
                      id="input-nisn"
                      v-model="nisn"
                      class="form-control bg-light border-start-0 py-2.5"
                      placeholder="Contoh: 1001"
                      maxlength="4"
                      required
                      autocomplete="off"
                    />
                  </div>
                  <small class="text-muted fs-8">4 digit nomor unik resmi siswa</small>
                </div>

                <!-- Field Tanggal Lahir -->
                <div class="mb-4">
                  <label for="input-birth-date" class="form-label fw-semibold text-dark fs-7">
                    Tanggal Lahir
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0 text-muted">
                      <i class="bi bi-calendar-event"></i>
                    </span>
                    <input
                      type="date"
                      id="input-birth-date"
                      v-model="birthDate"
                      class="form-control bg-light border-start-0 py-2.5"
                      required
                    />
                  </div>
                  <small class="text-muted fs-8">Sesuai data akta kelahiran / Dapodik</small>
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  class="btn btn-primary w-100 py-2.5 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  :disabled="loading"
                  id="btn-submit-login-siswa"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <i v-else class="bi bi-box-arrow-in-right fs-5"></i>
                  <span>{{ loading ? 'Memverifikasi Data...' : 'Masuk ke Surat Suara' }}</span>
                </button>
              </form>

              <!-- Quick Demo Credentials Box -->
              <div class="mt-4 pt-3 border-top">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="fs-8 fw-bold text-uppercase text-secondary tracking-wide">
                    <i class="bi bi-lightning-charge-fill text-warning me-1"></i>Akun Contoh Demo
                  </span>
                  <span class="badge bg-secondary-subtle text-secondary fs-8">Klik untuk isi otomatis</span>
                </div>

                <div class="d-flex flex-column gap-2">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary text-start rounded-3 p-2 d-flex align-items-center justify-content-between"
                    @click="fillDemo('1001', '2010-05-14')"
                  >
                    <div>
                      <div class="fw-bold fs-8">Aditya Pratama (VII A)</div>
                      <small class="text-muted fs-8">NIS: 1001 | Tgl: 14 Mei 2010</small>
                    </div>
                    <span class="badge bg-success-subtle text-success fs-8">Belum Memilih</span>
                  </button>

                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary text-start rounded-3 p-2 d-flex align-items-center justify-content-between"
                    @click="fillDemo('1002', '2010-08-22')"
                  >
                    <div>
                      <div class="fw-bold fs-8">Bella Safitri (VII A)</div>
                      <small class="text-muted fs-8">NIS: 1002 | Tgl: 22 Agu 2010</small>
                    </div>
                    <span class="badge bg-secondary-subtle text-secondary fs-8">Sudah Memilih</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Footer Card -->
            <div class="card-footer bg-light py-3 text-center border-0">
              <router-link to="/admin/login" class="text-decoration-none text-muted small fw-medium">
                <i class="bi bi-shield-lock me-1"></i>Masuk sebagai Panitia / Administrator
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import { authService } from '../services/authService';

const router = useRouter();
const nisn = ref('');
const birthDate = ref('');
const loading = ref(false);
const errorMessage = ref('');

const fillDemo = (demoNisn: string, demoBirthDate: string) => {
  nisn.value = demoNisn;
  birthDate.value = demoBirthDate;
  errorMessage.value = '';
};

const handleLogin = async () => {
  errorMessage.value = '';
  loading.value = true;

  try {
    const result = await authService.loginStudent(nisn.value, birthDate.value);
    if (result.success) {
      router.push('/siswa/beranda');
    } else {
      errorMessage.value = result.message;
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Terjadi kesalahan saat memproses login.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.fs-7 {
  font-size: 0.9rem;
}
.fs-8 {
  font-size: 0.8rem;
}
</style>
