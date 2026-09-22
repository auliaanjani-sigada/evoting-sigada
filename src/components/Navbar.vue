<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top border-bottom border-primary-subtle" id="main-navbar">
    <div class="container-fluid px-3 px-md-4">
      <!-- Brand & School Info -->
      <router-link to="/" class="navbar-brand d-flex align-items-center gap-2 text-decoration-none py-1" id="navbar-brand-link">
        <div class="bg-white rounded-circle p-1 d-flex align-items-center justify-content-center shadow-sm" style="width: 40px; height: 40px;">
          <img
            v-if="settings.logo_url"
            :src="settings.logo_url"
            alt="Logo Sekolah"
            class="rounded-circle object-fit-cover"
            style="width: 32px; height: 32px;"
            @error="onLogoError"
          />
          <i v-else class="bi bi-mortarboard-fill text-primary fs-5"></i>
        </div>
        <div class="lh-1">
          <div class="fw-bold fs-5 text-white tracking-wide d-flex align-items-center gap-1">
            <span>eOSIS</span>
            <span class="badge bg-warning text-dark fs-8 fw-semibold px-2 py-0.5 rounded-pill">v2.0</span>
          </div>
          <small class="text-white-50 fs-8 d-none d-sm-block">{{ settings.school_name }} • {{ settings.election_period }}</small>
        </div>
      </router-link>

      <!-- Right Actions / Status -->
      <div class="d-flex align-items-center gap-2 ms-auto">
        <!-- Voting Status Indicator -->
        <span
          class="badge rounded-pill px-2.5 py-1.5 d-none d-md-inline-flex align-items-center gap-1.5 fs-8"
          :class="{
            'bg-success text-white': settings.voting_status === 'open',
            'bg-danger text-white': settings.voting_status === 'closed',
            'bg-warning text-dark': settings.voting_status === 'paused'
          }"
          id="voting-status-badge"
        >
          <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true" style="width: 8px; height: 8px;" v-if="settings.voting_status === 'open'"></span>
          <i class="bi bi-pause-circle-fill" v-else-if="settings.voting_status === 'paused'"></i>
          <i class="bi bi-x-circle-fill" v-else></i>
          <span>{{ statusLabel }}</span>
        </span>

        <!-- Student Session Pill -->
        <div v-if="authService.isStudentLoggedIn.value" class="d-flex align-items-center gap-2" id="student-session-nav">
          <div class="bg-white bg-opacity-10 text-white px-2.5 py-1 rounded-pill d-flex align-items-center gap-2 fs-7">
            <i class="bi bi-person-circle fs-6 text-warning"></i>
            <span class="fw-medium d-none d-sm-inline">{{ currentStudent?.name }}</span>
            <span class="badge bg-light text-dark fw-bold">{{ currentStudent?.class_name }}</span>
          </div>
          <button
            @click="logoutStudent"
            class="btn btn-sm btn-outline-light d-flex align-items-center gap-1 rounded-pill px-3"
            title="Keluar"
            id="btn-logout-siswa-nav"
          >
            <i class="bi bi-box-arrow-right"></i>
            <span class="d-none d-md-inline">Keluar</span>
          </button>
        </div>

        <!-- Admin Session Info -->
        <div v-else-if="authService.isAdminLoggedIn.value" class="d-flex align-items-center gap-2" id="admin-session-nav">
          <div class="bg-white bg-opacity-10 text-white px-2.5 py-1 rounded-pill d-flex align-items-center gap-2 fs-7">
            <i class="bi bi-shield-lock-fill text-warning"></i>
            <span class="fw-medium">{{ currentAdmin?.name || 'Admin' }}</span>
          </div>
          <button
            @click="logoutAdmin"
            class="btn btn-sm btn-light text-danger fw-semibold d-flex align-items-center gap-1 rounded-pill px-3 shadow-sm"
            title="Keluar"
            id="btn-logout-admin-nav"
          >
            <i class="bi bi-box-arrow-right"></i>
            <span>Keluar</span>
          </button>
        </div>

        <!-- Guest Links -->
        <div v-else class="d-flex align-items-center gap-2">
          <router-link to="/login" class="btn btn-sm btn-light text-primary fw-semibold rounded-pill px-3 shadow-sm" id="nav-btn-login-siswa">
            <i class="bi bi-person-fill me-1"></i>Login Siswa
          </router-link>
          <router-link to="/admin/login" class="btn btn-sm btn-outline-light rounded-pill px-3" id="nav-btn-login-admin">
            <i class="bi bi-shield-lock me-1"></i>Admin
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import { SchoolSetting } from '../types';

const router = useRouter();
const settings = ref<SchoolSetting>({
  school_name: 'SMP Negeri 3 Widodaren',
  election_period: '2026/2027',
  logo_url: '',
  voting_status: 'open',
});

const currentStudent = authService.currentStudent;
const currentAdmin = authService.currentAdmin;

const statusLabel = computed(() => {
  if (settings.value.voting_status === 'open') return 'Pemilihan Aktif';
  if (settings.value.voting_status === 'paused') return 'Pemilihan Dijeda';
  return 'Pemilihan Ditutup';
});

const onLogoError = () => {
  settings.value.logo_url = '';
};

const loadSettings = async () => {
  try {
    settings.value = await dataService.getSettings();
  } catch (e) {
    console.warn('Failed to load settings in navbar:', e);
  }
};

const logoutStudent = () => {
  authService.logoutStudent();
  router.push('/login');
};

const logoutAdmin = () => {
  authService.logoutAdmin();
  router.push('/admin/login');
};

onMounted(() => {
  loadSettings();
  window.addEventListener('eosis_settings_updated', loadSettings);
});
</script>

<style scoped>
.fs-8 {
  font-size: 0.75rem;
}
.fs-7 {
  font-size: 0.85rem;
}
</style>
