<template>
  <div id="admin-pengaturan-view">
    <!-- Header -->
    <div class="mb-4">
      <h3 class="fw-bold text-dark mb-1">Pengaturan Sistem eOSIS</h3>
      <p class="text-muted mb-0">Konfigurasi identitas sekolah, periode pemilihan, status voting, dan kredensial admin</p>
    </div>

    <!-- Alert -->
    <div v-if="alertMessage" class="alert alert-success alert-dismissible fade show rounded-3 shadow-xs mb-4" role="alert">
      <i class="bi bi-check-circle-fill me-2"></i>{{ alertMessage }}
      <button type="button" class="btn-close" @click="alertMessage = ''"></button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show rounded-3 shadow-xs mb-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
      <button type="button" class="btn-close" @click="errorMessage = ''"></button>
    </div>

    <div class="row g-4">
      <!-- Section 1: Identitas Sekolah & Pemilihan -->
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
          <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
            <div class="bg-primary-subtle text-primary p-2 rounded-3">
              <i class="bi bi-building-gear fs-5"></i>
            </div>
            <h5 class="fw-bold text-dark mb-0">Identitas Sekolah & Periode</h5>
          </div>

          <form @submit.prevent="saveSchoolSettings">
            <!-- Nama Sekolah/Instansi -->
            <div class="mb-3">
              <label class="form-label fw-semibold text-dark fs-7">Nama Sekolah / Instansi</label>
              <input
                type="text"
                v-model="schoolForm.school_name"
                class="form-control py-2"
                placeholder="Contoh: SMP Negeri 1 Indonesia"
                required
              />
              <small class="text-muted fs-8">Ditampilkan di header aplikasi, kartu suara, dan laporan</small>
            </div>

            <!-- Judul Agenda Pemilihan -->
            <div class="mb-3">
              <label class="form-label fw-semibold text-dark fs-7">Judul Agenda Pemilihan</label>
              <input
                type="text"
                v-model="schoolForm.agenda_title"
                class="form-control py-2"
                placeholder="Contoh: Pemilihan Ketua & Wakil Ketua OSIS"
                required
              />
              <small class="text-muted fs-8">Ditampilkan pada kop berita acara rekapitulasi, kartu suara, dan agenda pemilihan</small>
            </div>

            <!-- Periode Pemilihan -->
            <div class="mb-3">
              <label class="form-label fw-semibold text-dark fs-7">Periode Pemilihan</label>
              <input
                type="text"
                v-model="schoolForm.election_period"
                class="form-control py-2"
                placeholder="Contoh: 2026/2027"
                required
              />
              <small class="text-muted fs-8">Tahun ajaran pemilihan OSIS aktif</small>
            </div>

            <!-- Logo Sekolah -->
            <div class="mb-3">
              <label class="form-label fw-semibold text-dark fs-7">Logo Sekolah (Supabase Storage)</label>

              <!-- Preview -->
              <div class="d-flex align-items-center gap-3 mb-2">
                <div class="bg-light rounded-circle p-1 border d-flex align-items-center justify-content-center shadow-xs" style="width: 56px; height: 56px;">
                  <img
                    v-if="schoolForm.logo_url"
                    :src="schoolForm.logo_url"
                    alt="Logo"
                    class="rounded-circle object-fit-cover"
                    style="width: 48px; height: 48px;"
                    @error="schoolForm.logo_url = ''"
                  />
                  <i v-else class="bi bi-mortarboard-fill text-muted fs-4"></i>
                </div>
                <div class="flex-grow-1">
                  <input
                    type="file"
                    class="form-control form-control-sm mb-1"
                    accept="image/*"
                    @change="handleLogoUpload"
                  />
                  <input
                    type="url"
                    v-model="schoolForm.logo_url"
                    class="form-control form-control-sm"
                    placeholder="Atau tautan URL logo eksternal..."
                  />
                </div>
              </div>
              <small v-if="uploadingLogo" class="text-primary fw-semibold">
                <span class="spinner-border spinner-border-sm me-1"></span> Mengunggah logo ke Supabase...
              </small>
            </div>

            <!-- Status Pemilihan -->
            <div class="mb-4">
              <label class="form-label fw-semibold text-dark fs-7">Status Pelaksanaan Pemilihan</label>
              <select v-model="schoolForm.voting_status" class="form-select py-2">
                <option value="open">Aktif / Dibuka (Siswa dapat memberikan suara)</option>
                <option value="paused">Dijeda Sementara (Proses voting ditahan)</option>
                <option value="closed">Ditutup (Pemilihan berakhir, hanya melihat hasil)</option>
              </select>
            </div>

            <button
              type="submit"
              class="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm"
              :disabled="savingSchool || uploadingLogo"
            >
              <span v-if="savingSchool" class="spinner-border spinner-border-sm me-1"></span>
              <span>Simpan Pengaturan Sekolah</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Section 2: Kredensial Akun Administrator -->
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
          <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
            <div class="bg-dark text-white p-2 rounded-3">
              <i class="bi bi-shield-lock-fill fs-5"></i>
            </div>
            <h5 class="fw-bold text-dark mb-0">Keamanan Akun Administrator</h5>
          </div>

          <form @submit.prevent="saveAdminCredentials">
            <!-- Nama Admin -->
            <div class="mb-3">
              <label class="form-label fw-semibold text-dark fs-7">Nama Panitia / Administrator</label>
              <input
                type="text"
                v-model="adminForm.name"
                class="form-control py-2"
                placeholder="Administrator Utama"
                required
              />
            </div>

            <!-- Username -->
            <div class="mb-3">
              <label class="form-label fw-semibold text-dark fs-7">Username Login Admin</label>
              <input
                type="text"
                v-model="adminForm.username"
                class="form-control py-2"
                placeholder="Username admin"
                required
              />
            </div>

            <!-- Password Baru -->
            <div class="mb-3">
              <label class="form-label fw-semibold text-dark fs-7">Password Baru (Opsional)</label>
              <input
                type="password"
                v-model="adminForm.newPassword"
                class="form-control py-2"
                placeholder="Kosongkan jika tidak ingin mengubah password"
              />
              <small class="text-muted fs-8">Dienkripsi otomatis dengan SHA-256 + Salt sebelum disimpan</small>
            </div>

            <!-- Konfirmasi Password -->
            <div class="mb-4" v-if="adminForm.newPassword">
              <label class="form-label fw-semibold text-dark fs-7">Konfirmasi Password Baru</label>
              <input
                type="password"
                v-model="adminForm.confirmPassword"
                class="form-control py-2"
                placeholder="Ulangi password baru"
              />
            </div>

            <button
              type="submit"
              class="btn btn-dark rounded-pill px-4 fw-semibold shadow-sm"
              :disabled="savingAdmin"
            >
              <span v-if="savingAdmin" class="spinner-border spinner-border-sm me-1"></span>
              <span>Perbarui Akun Admin</span>
            </button>
          </form>

          <!-- Danger Zone: Reset Perolehan Suara -->
          <div class="mt-4 pt-4 border-top">
            <h6 class="text-danger fw-bold d-flex align-items-center gap-1 mb-2 fs-7">
              <i class="bi bi-exclamation-octagon-fill"></i> Zona Bahaya: Reset Suara Pemilihan
            </h6>
            <p class="text-muted small mb-3">
              Menghapus seluruh perolehan suara dan mengembalikan status seluruh siswa ke <strong>Belum Memilih</strong>. Gunakan hanya saat memulai periode pemilihan baru.
            </p>
            <button
              type="button"
              class="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold"
              @click="openResetVotesModal"
            >
              <i class="bi bi-arrow-counterclockwise me-1"></i>Reset Seluruh Suara Pemilihan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Reset Suara -->
    <div
      v-if="showResetModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.6);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div class="modal-header bg-danger text-white border-0 py-3 px-4">
            <h5 class="modal-title fw-bold">Konfirmasi Reset Suara Pemilihan</h5>
            <button type="button" class="btn-close btn-close-white" @click="showResetModal = false"></button>
          </div>
          <div class="modal-body p-4 text-center">
            <i class="bi bi-exclamation-triangle-fill text-danger display-4 mb-3 d-block"></i>
            <h5 class="fw-bold text-dark">Tindakan ini tidak dapat dibatalkan!</h5>
            <p class="text-muted small mb-3">
              Semua suara yang telah tercatat untuk seluruh calon kandidat akan di-nol-kan, dan seluruh siswa akan diizinkan memilih kembali.
            </p>
            <div class="text-start mb-3">
              <label class="form-label small fw-bold">Ketik teks <code>RESET</code> untuk mengonfirmasi:</label>
              <input
                type="text"
                v-model="resetConfirmationText"
                class="form-control text-center font-monospace"
                placeholder="RESET"
              />
            </div>
          </div>
          <div class="modal-footer bg-light border-0 px-4 py-3">
            <button type="button" class="btn btn-secondary rounded-pill px-4" @click="showResetModal = false">Batal</button>
            <button
              type="button"
              class="btn btn-danger rounded-pill px-4 fw-bold"
              :disabled="resetConfirmationText !== 'RESET' || resettingVotes"
              @click="confirmResetVotes"
            >
              <span v-if="resettingVotes" class="spinner-border spinner-border-sm me-1"></span>
              <span>Reset Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { dataService } from '../../services/dataService';
import { uploadAssetImage } from '../../lib/supabase';
import { SchoolSetting, AdminUser } from '../../types';

const alertMessage = ref('');
const errorMessage = ref('');
const savingSchool = ref(false);
const savingAdmin = ref(false);
const uploadingLogo = ref(false);

const schoolForm = ref<SchoolSetting>({
  school_name: '',
  agenda_title: '',
  election_period: '',
  logo_url: '',
  voting_status: 'open',
});

const adminForm = ref({
  name: '',
  username: '',
  newPassword: '',
  confirmPassword: '',
});

const showResetModal = ref(false);
const resetConfirmationText = ref('');
const resettingVotes = ref(false);

const loadData = async () => {
  try {
    const [sett, adm] = await Promise.all([
      dataService.getSettings(),
      dataService.getAdmin(),
    ]);
    schoolForm.value = { ...sett };
    adminForm.value.name = adm.name;
    adminForm.value.username = adm.username;
  } catch (e: any) {
    console.warn('Failed to load settings:', e);
  }
};

const handleLogoUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  uploadingLogo.value = true;
  try {
    const url = await uploadAssetImage(file, 'school');
    schoolForm.value.logo_url = url;
  } catch (err: any) {
    errorMessage.value = 'Gagal upload logo: ' + err.message;
  } finally {
    uploadingLogo.value = false;
  }
};

const saveSchoolSettings = async () => {
  savingSchool.value = true;
  alertMessage.value = '';
  errorMessage.value = '';
  try {
    const updated = await dataService.updateSettings({
      school_name: schoolForm.value.school_name.trim(),
      agenda_title: (schoolForm.value.agenda_title || '').trim(),
      election_period: schoolForm.value.election_period.trim(),
      logo_url: schoolForm.value.logo_url,
      voting_status: schoolForm.value.voting_status,
    });
    schoolForm.value = { ...updated };
    alertMessage.value = 'Pengaturan identitas sekolah & pemilihan berhasil disimpan.';

    // Dispatch global event so navbar updates
    window.dispatchEvent(new Event('eosis_settings_updated'));
  } catch (e: any) {
    errorMessage.value = 'Gagal menyimpan: ' + e.message;
  } finally {
    savingSchool.value = false;
  }
};

const saveAdminCredentials = async () => {
  if (adminForm.value.newPassword && adminForm.value.newPassword !== adminForm.value.confirmPassword) {
    errorMessage.value = 'Konfirmasi password baru tidak cocok!';
    return;
  }

  savingAdmin.value = true;
  alertMessage.value = '';
  errorMessage.value = '';
  try {
    const res = await dataService.updateAdmin(
      adminForm.value.username,
      adminForm.value.newPassword,
      adminForm.value.name
    );
    if (res.success) {
      alertMessage.value = 'Kredensial admin berhasil diperbarui secara aman.';
      adminForm.value.newPassword = '';
      adminForm.value.confirmPassword = '';
    } else {
      errorMessage.value = res.message;
    }
  } catch (e: any) {
    errorMessage.value = 'Gagal memperbarui admin: ' + e.message;
  } finally {
    savingAdmin.value = false;
  }
};

const openResetVotesModal = () => {
  resetConfirmationText.value = '';
  showResetModal.value = true;
};

const confirmResetVotes = async () => {
  resettingVotes.value = true;
  try {
    await dataService.resetAllVotes();
    alertMessage.value = 'Seluruh data suara berhasil di-reset menjadi 0.';
    showResetModal.value = false;
  } catch (e: any) {
    errorMessage.value = 'Gagal reset suara: ' + e.message;
  } finally {
    resettingVotes.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.fs-7 {
  font-size: 0.88rem;
}
.fs-8 {
  font-size: 0.78rem;
}
</style>
