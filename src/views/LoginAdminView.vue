<template>
  <div class="min-vh-100 d-flex flex-column bg-light" id="login-admin-page">
    <Navbar />

    <div class="container my-auto py-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-5">
          <!-- Card Login Admin -->
          <div class="card border-0 shadow-lg rounded-4 overflow-hidden">
            <!-- Header -->
            <div class="bg-dark text-white p-4 text-center position-relative">
              <div class="bg-primary text-white rounded-circle p-3 d-inline-flex align-items-center justify-content-center shadow-sm mb-3" style="width: 64px; height: 64px;">
                <i class="bi bi-shield-lock-fill fs-2"></i>
              </div>
              <h4 class="fw-bold mb-1">Login Administrator</h4>
              <p class="text-secondary small mb-0">Panel Kelola eOSIS, Data DPT, Calon & Perhitungan Suara</p>
            </div>

            <!-- Body -->
            <div class="card-body p-4 p-md-5 bg-white">
              <!-- Error Alert -->
              <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center gap-2 rounded-3 small py-2 px-3 mb-4" role="alert" id="admin-login-error-alert">
                <i class="bi bi-exclamation-triangle-fill fs-5 flex-shrink-0"></i>
                <div>{{ errorMessage }}</div>
              </div>

              <form @submit.prevent="handleLogin" id="form-login-admin">
                <!-- Username -->
                <div class="mb-3">
                  <label for="admin-username" class="form-label fw-semibold text-dark fs-7">Username</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0 text-muted">
                      <i class="bi bi-person-badge"></i>
                    </span>
                    <input
                      type="text"
                      id="admin-username"
                      v-model="username"
                      class="form-control bg-light border-start-0 py-2.5"
                      placeholder="Username admin"
                      required
                      autocomplete="username"
                    />
                  </div>
                </div>

                <!-- Password -->
                <div class="mb-4">
                  <label for="admin-password" class="form-label fw-semibold text-dark fs-7">Password</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0 text-muted">
                      <i class="bi bi-key-fill"></i>
                    </span>
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      id="admin-password"
                      v-model="password"
                      class="form-control bg-light border-start-0 border-end-0 py-2.5"
                      placeholder="Masukkan password"
                      required
                      autocomplete="current-password"
                    />
                    <button
                      type="button"
                      class="input-group-text bg-light border-start-0 text-muted"
                      @click="showPassword = !showPassword"
                    >
                      <i :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                    </button>
                  </div>
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  class="btn btn-dark w-100 py-2.5 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  :disabled="loading"
                  id="btn-submit-login-admin"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <i v-else class="bi bi-box-arrow-in-right fs-5"></i>
                  <span>{{ loading ? 'Mengautentikasi...' : 'Masuk Panel Admin' }}</span>
                </button>
              </form>

              <!-- Quick Demo Info -->
              <div class="mt-4 pt-3 border-top text-center">
                <div class="badge bg-secondary-subtle text-secondary py-1.5 px-3 rounded-pill mb-2">
                  <i class="bi bi-info-circle-fill me-1"></i>Akun Default Awal
                </div>
                <div class="small text-muted">
                  Username: <code class="text-primary fw-bold">admin</code> | Password: <code class="text-primary fw-bold">admin123</code>
                </div>
                <button
                  type="button"
                  class="btn btn-link btn-sm text-decoration-none mt-1"
                  @click="fillAdminDemo"
                >
                  Isi otomatis kredensial
                </button>
              </div>
            </div>

            <!-- Footer Card -->
            <div class="card-footer bg-light py-3 text-center border-0">
              <router-link to="/login" class="text-decoration-none text-muted small fw-medium">
                <i class="bi bi-arrow-left me-1"></i>Kembali ke Login Siswa (Pemilih)
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
const username = ref('admin');
const password = ref('admin123');
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const fillAdminDemo = () => {
  username.value = 'admin';
  password.value = 'admin123';
  errorMessage.value = '';
};

const handleLogin = async () => {
  errorMessage.value = '';
  loading.value = true;

  try {
    const result = await authService.loginAdmin(username.value, password.value);
    if (result.success) {
      router.push('/admin/beranda');
    } else {
      errorMessage.value = result.message;
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Terjadi kesalahan saat otentikasi admin.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.fs-7 {
  font-size: 0.9rem;
}
</style>
