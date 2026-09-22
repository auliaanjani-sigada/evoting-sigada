<template>
  <div v-if="!isReady && showBanner" class="alert alert-warning alert-dismissible fade show border-0 shadow-sm rounded-3 mb-4 d-flex align-items-center justify-content-between p-3" role="alert" id="db-notice-banner">
    <div class="d-flex align-items-center gap-3">
      <div class="bg-warning text-dark rounded-circle p-2 d-flex align-items-center justify-content-center">
        <i class="bi bi-database-exclamation fs-4"></i>
      </div>
      <div>
        <h6 class="alert-heading fw-bold mb-0">Status Database Supabase</h6>
        <p class="mb-0 small text-dark opacity-75">
          {{ message || 'Tabel Supabase belum dibuat di SQL Editor. Aplikasi berjalan lancar menggunakan penyimpanan lokal & siap disinkronkan.' }}
        </p>
      </div>
    </div>
    <div class="d-flex align-items-center gap-2">
      <router-link to="/admin/database" class="btn btn-sm btn-dark text-nowrap rounded-pill px-3 fw-semibold">
        <i class="bi bi-terminal me-1"></i>Setup Skrip SQL
      </router-link>
      <button type="button" class="btn-close ms-2" @click="showBanner = false" aria-label="Close"></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { dataService } from '../services/dataService';

const isReady = ref(true);
const message = ref('');
const showBanner = ref(true);

onMounted(async () => {
  const res = await dataService.checkConnection();
  isReady.value = res.isSupabaseReady;
  message.value = res.message;
});
</script>
