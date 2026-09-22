<template>
  <div id="admin-database-view">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-1">Status & Skema Database Supabase</h3>
        <p class="text-muted mb-0">Kelola inisialisasi tabel, RLS policy, storage bucket, dan RPC atomic voting</p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button @click="checkStatus" class="btn btn-primary rounded-pill px-3.5 fw-semibold d-flex align-items-center gap-1.5 shadow-sm" :disabled="checking">
          <i class="bi bi-arrow-clockwise" :class="{ 'spin': checking }"></i>
          <span>Uji Koneksi Supabase</span>
        </button>
      </div>
    </div>

    <!-- Status Banner Card -->
    <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-3">
          <div
            class="rounded-circle p-3 d-flex align-items-center justify-content-center shadow-xs"
            :class="isReady ? 'bg-success text-white' : 'bg-warning text-dark'"
            style="width: 56px; height: 56px;"
          >
            <i :class="isReady ? 'bi bi-database-check fs-2' : 'bi bi-database-exclamation fs-2'"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2">
              <h5 class="fw-bold mb-0 text-dark">
                {{ isReady ? 'Database Supabase Aktif & Siap Digunakan' : 'Perlu Inisialisasi Tabel di Supabase' }}
              </h5>
              <span class="badge rounded-pill" :class="isReady ? 'bg-success' : 'bg-warning text-dark'">
                {{ isReady ? 'Production Ready' : 'Fallback Mode Aktif' }}
              </span>
            </div>
            <p class="text-muted small mb-0 mt-1">
              {{ statusMessage }}
            </p>
          </div>
        </div>

        <div class="text-end text-md-start">
          <button
            @click="copySqlScript"
            class="btn btn-outline-primary rounded-pill px-4 fw-semibold d-flex align-items-center gap-2"
          >
            <i :class="copied ? 'bi bi-check-all text-success' : 'bi bi-clipboard'"></i>
            <span>{{ copied ? 'Skrip SQL Tersalin!' : 'Salin Skrip SQL Supabase' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Credentials & Config Info -->
    <div class="row g-4 mb-4">
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
          <h5 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <i class="bi bi-key-fill text-primary"></i> Konfigurasi Kredensial Supabase
          </h5>

          <div class="mb-3">
            <label class="form-label small fw-bold text-muted mb-1">SUPABASE URL</label>
            <div class="input-group">
              <input type="text" class="form-control form-control-sm font-monospace bg-light" :value="supabaseUrl" readonly />
              <button class="btn btn-outline-secondary btn-sm" @click="copyText(supabaseUrl)">
                <i class="bi bi-copy"></i>
              </button>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-bold text-muted mb-1">SUPABASE ANON PUBLIC KEY</label>
            <textarea class="form-control form-control-sm font-monospace bg-light" rows="3" :value="supabaseAnonKey" readonly></textarea>
            <small class="text-success fs-8">
              <i class="bi bi-shield-check"></i> Aman digunakan di frontend karena dilindungi Row Level Security (RLS)
            </small>
          </div>

          <div class="alert alert-light border rounded-3 small p-3 text-muted mb-0">
            <strong>Keamanan Arsitektur:</strong> Kunci rahasia <code>service_role</code> tidak pernah disimpan di frontend. Mekanisme validasi 1 suara pemilih ditangani oleh fungsi tersimpan <code>cast_vote</code> dengan transaksi <code>FOR UPDATE</code>.
          </div>
        </div>
      </div>

      <!-- Step by Step Setup Guide -->
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
          <h5 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <i class="bi bi-journal-text text-warning"></i> Panduan Eksekusi SQL di Supabase
          </h5>

          <ol class="small text-muted ps-3 mb-4 d-flex flex-column gap-2">
            <li>
              Buka dashboard proyek Anda di
              <a href="https://supabase.com/dashboard" target="_blank" class="fw-semibold text-primary text-decoration-none">
                Supabase Dashboard <i class="bi bi-box-arrow-up-right"></i>
              </a>.
            </li>
            <li>Pilih menu <strong>SQL Editor</strong> pada bilah navigasi kiri.</li>
            <li>Klik tombol <strong>+ New Query</strong>.</li>
            <li>
              Salin seluruh skrip skema di bawah menggunakan tombol <strong>"Salin Skrip SQL"</strong>.
            </li>
            <li>Tempelkan (Paste) skrip ke editor Supabase, lalu klik tombol <strong>Run</strong>.</li>
            <li>
              Kembali ke aplikasi ini dan klik <strong>"Uji Koneksi Supabase"</strong> di atas. Aplikasi akan otomatis beralih ke Supabase!
            </li>
          </ol>

          <div class="mt-auto">
            <button
              @click="downloadSql"
              class="btn btn-sm btn-outline-secondary w-100 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
            >
              <i class="bi bi-download"></i>
              <span>Unduh File Skema (supabase-schema.sql)</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- SQL Code Preview Box -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
      <div class="card-header bg-dark text-white py-3 px-4 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-filetype-sql text-warning fs-5"></i>
          <h6 class="fw-bold mb-0">Skrip Lengkap: Skema Tabel, RLS, Storage & RPC cast_vote</h6>
        </div>
        <button
          @click="copySqlScript"
          class="btn btn-sm btn-primary rounded-pill px-3 fw-semibold d-flex align-items-center gap-1.5"
        >
          <i :class="copied ? 'bi bi-check-all' : 'bi bi-clipboard'"></i>
          <span>{{ copied ? 'Tersalin!' : 'Salin Semua SQL' }}</span>
        </button>
      </div>

      <div class="p-3 bg-dark text-light">
        <pre class="mb-0 small font-monospace overflow-auto" style="max-height: 400px; line-height: 1.5; color: #38bdf8;">{{ sqlScript }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../lib/supabase';
import { SUPABASE_SQL_SCHEMA } from '../../lib/schemaSql';
import { dataService } from '../../services/dataService';

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;
const sqlScript = SUPABASE_SQL_SCHEMA;

const isReady = ref(false);
const statusMessage = ref('Memeriksa status koneksi...');
const checking = ref(false);
const copied = ref(false);

const checkStatus = async () => {
  checking.value = true;
  try {
    const res = await dataService.checkConnection();
    isReady.value = res.isSupabaseReady;
    statusMessage.value = res.message;
  } finally {
    checking.value = false;
  }
};

const copySqlScript = async () => {
  try {
    await navigator.clipboard.writeText(sqlScript);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2500);
  } catch (e) {
    alert('Gagal menyalin otomatis. Silakan seleksi teks secara manual.');
  }
};

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    alert('Teks berhasil disalin.');
  } catch (e) {
    //
  }
};

const downloadSql = () => {
  const blob = new Blob([sqlScript], { type: 'text/sql' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'eosis-supabase-schema.sql';
  a.click();
  URL.revokeObjectURL(url);
};

onMounted(() => {
  checkStatus();
});
</script>

<style scoped>
.fs-8 {
  font-size: 0.78rem;
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
