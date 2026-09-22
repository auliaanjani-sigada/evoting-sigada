<template>
  <div class="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark shadow-sm admin-sidebar h-100" id="admin-sidebar-container">
    <!-- Header Admin Info -->
    <div class="d-flex align-items-center gap-3 pb-3 mb-3 border-bottom border-secondary">
      <div class="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 44px; height: 44px;">
        <i class="bi bi-shield-check fs-4"></i>
      </div>
      <div class="overflow-hidden">
        <div class="fw-bold text-white text-truncate">{{ admin?.name || 'Administrator' }}</div>
        <small class="text-secondary text-truncate d-block">Panel Kontrol Pemilihan</small>
      </div>
    </div>

    <!-- Navigation Menu -->
    <ul class="nav nav-pills flex-column mb-auto gap-1" id="admin-sidebar-nav">
      <!-- 1. Beranda -->
      <li class="nav-item">
        <router-link
          to="/admin/beranda"
          class="nav-link text-white d-flex align-items-center gap-2.5 py-2 px-3 rounded-3"
          active-class="active bg-primary shadow-sm"
          id="sidebar-link-beranda"
        >
          <i class="bi bi-speedometer2 fs-5"></i>
          <span>Beranda</span>
        </router-link>
      </li>

      <!-- 2. Kelas -->
      <li class="nav-item">
        <router-link
          to="/admin/kelas"
          class="nav-link text-white d-flex align-items-center gap-2.5 py-2 px-3 rounded-3"
          active-class="active bg-primary shadow-sm"
          id="sidebar-link-kelas"
        >
          <i class="bi bi-building fs-5"></i>
          <span>Data Kelas</span>
        </router-link>
      </li>

      <!-- 3. Siswa/User -->
      <li class="nav-item">
        <router-link
          to="/admin/siswa"
          class="nav-link text-white d-flex align-items-center gap-2.5 py-2 px-3 rounded-3"
          active-class="active bg-primary shadow-sm"
          id="sidebar-link-siswa"
        >
          <i class="bi bi-people-fill fs-5"></i>
          <span>Siswa / DPT</span>
        </router-link>
      </li>

      <!-- 4. Calon Kandidat -->
      <li class="nav-item">
        <router-link
          to="/admin/kandidat"
          class="nav-link text-white d-flex align-items-center gap-2.5 py-2 px-3 rounded-3"
          active-class="active bg-primary shadow-sm"
          id="sidebar-link-kandidat"
        >
          <i class="bi bi-person-badge-fill fs-5"></i>
          <span>Calon Kandidat</span>
        </router-link>
      </li>

      <!-- 5. Perolehan Suara -->
      <li class="nav-item">
        <router-link
          to="/admin/perolehan-suara"
          class="nav-link text-white d-flex align-items-center gap-2.5 py-2 px-3 rounded-3"
          active-class="active bg-primary shadow-sm"
          id="sidebar-link-perolehan-suara"
        >
          <i class="bi bi-bar-chart-line-fill fs-5"></i>
          <span>Perolehan Suara</span>
          <span class="badge bg-danger rounded-pill ms-auto animate-pulse">Live</span>
        </router-link>
      </li>

      <!-- 6. Pengaturan -->
      <li class="nav-item">
        <router-link
          to="/admin/pengaturan"
          class="nav-link text-white d-flex align-items-center gap-2.5 py-2 px-3 rounded-3"
          active-class="active bg-primary shadow-sm"
          id="sidebar-link-pengaturan"
        >
          <i class="bi bi-gear-fill fs-5"></i>
          <span>Pengaturan</span>
        </router-link>
      </li>

      <!-- 7. Database Supabase Helper -->
      <li class="nav-item">
        <router-link
          to="/admin/database"
          class="nav-link text-white d-flex align-items-center gap-2.5 py-2 px-3 rounded-3"
          active-class="active bg-info text-dark shadow-sm"
          id="sidebar-link-database"
        >
          <i class="bi bi-database-fill-gear fs-5 text-warning"></i>
          <span>Setup Database SQL</span>
        </router-link>
      </li>
    </ul>

    <!-- Footer / Keluar -->
    <div class="pt-3 border-top border-secondary mt-auto">
      <button
        @click="logout"
        class="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3"
        id="sidebar-btn-keluar"
      >
        <i class="bi bi-box-arrow-right fs-5"></i>
        <span class="fw-semibold">Keluar</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { authService } from '../services/authService';

const router = useRouter();
const admin = authService.currentAdmin;

const logout = () => {
  authService.logoutAdmin();
  router.push('/admin/login');
};
</script>

<style scoped>
.admin-sidebar {
  min-height: calc(100vh - 60px);
  width: 260px;
}

.nav-link {
  color: #adb5bd !important;
  transition: all 0.2s ease-in-out;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #ffffff !important;
}

.nav-link.active {
  color: #ffffff !important;
  font-weight: 600;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
