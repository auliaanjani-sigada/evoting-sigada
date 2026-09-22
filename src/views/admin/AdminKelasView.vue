<template>
  <div id="admin-kelas-view">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-1">Manajemen Data Kelas</h3>
        <p class="text-muted mb-0">Kelola daftar kelas / rombel untuk pengelompokan pemilih siswa</p>
      </div>

      <button
        @click="openAddModal"
        class="btn btn-primary rounded-pill px-4 fw-semibold d-flex align-items-center gap-2 shadow-sm"
        id="btn-tambah-kelas"
      >
        <i class="bi bi-plus-circle-fill"></i>
        <span>Tambah Kelas Baru</span>
      </button>
    </div>

    <!-- Alert Message -->
    <div v-if="alertMessage" class="alert alert-success alert-dismissible fade show rounded-3 shadow-xs mb-3" role="alert">
      <i class="bi bi-check-circle-fill me-2"></i>{{ alertMessage }}
      <button type="button" class="btn-close" @click="alertMessage = ''"></button>
    </div>

    <!-- Kelas Table Card -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
      <div class="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center justify-content-between">
        <h5 class="fw-bold mb-0 text-dark">Daftar Kelas ({{ classes.length }})</h5>
        <div class="input-group input-group-sm" style="max-width: 260px;">
          <span class="input-group-text bg-light border-end-0"><i class="bi bi-search"></i></span>
          <input
            type="text"
            v-model="searchQuery"
            class="form-control bg-light border-start-0"
            placeholder="Cari nama kelas..."
          />
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="px-4 py-3 text-muted text-uppercase fs-8" style="width: 80px;">No</th>
              <th scope="col" class="py-3 text-muted text-uppercase fs-8">Nama Kelas / Rombel</th>
              <th scope="col" class="py-3 text-muted text-uppercase fs-8">Jumlah Siswa</th>
              <th scope="col" class="px-4 py-3 text-muted text-uppercase fs-8 text-end" style="width: 160px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="4" class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm text-primary me-2"></div> Memuat data kelas...
              </td>
            </tr>

            <tr v-else-if="filteredClasses.length === 0">
              <td colspan="4" class="text-center py-5 text-muted">
                <i class="bi bi-building-slash display-6 d-block text-secondary opacity-50 mb-2"></i>
                Tidak ada kelas yang sesuai pencarian.
              </td>
            </tr>

            <tr v-for="(cls, idx) in filteredClasses" :key="cls.id">
              <td class="px-4 fw-semibold text-muted">{{ idx + 1 }}</td>
              <td>
                <div class="d-flex align-items-center gap-2.5">
                  <div class="bg-primary-subtle text-primary rounded-3 p-2 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                    <i class="bi bi-building fw-bold"></i>
                  </div>
                  <span class="fw-bold text-dark fs-6">{{ cls.name }}</span>
                </div>
              </td>
              <td>
                <span class="badge bg-light text-dark border px-2.5 py-1.5 rounded-pill fw-medium">
                  <i class="bi bi-people me-1 text-primary"></i>{{ cls.student_count || 0 }} Siswa
                </span>
              </td>
              <td class="px-4 text-end">
                <div class="btn-group btn-group-sm">
                  <button
                    class="btn btn-outline-secondary rounded-start-pill px-2.5"
                    @click="openEditModal(cls)"
                    title="Ubah Kelas"
                  >
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button
                    class="btn btn-outline-danger rounded-end-pill px-2.5"
                    @click="promptDelete(cls)"
                    title="Hapus Kelas"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form (Tambah / Ubah) -->
    <div
      v-if="showModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div class="modal-header bg-primary text-white border-0 py-3 px-4">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-building me-2"></i>{{ isEditing ? 'Ubah Nama Kelas' : 'Tambah Kelas Baru' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>

          <form @submit.prevent="saveClass">
            <div class="modal-body p-4">
              <div class="mb-3">
                <label class="form-label fw-semibold text-dark">Nama Kelas / Rombel</label>
                <input
                  type="text"
                  v-model="classNameInput"
                  class="form-control py-2.5"
                  placeholder="Contoh: VII A, VIII C, IX Unggulan"
                  required
                  autofocus
                />
                <small class="text-muted">Masukkan nama kelas yang unik dan mudah diidentifikasi.</small>
              </div>
            </div>

            <div class="modal-footer bg-light border-0 px-4 py-3">
              <button type="button" class="btn btn-secondary rounded-pill px-4" @click="closeModal">Batal</button>
              <button type="submit" class="btn btn-primary rounded-pill px-4 fw-semibold" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                <span>{{ isEditing ? 'Simpan Perubahan' : 'Tambahkan' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Delete Confirm -->
    <div
      v-if="classToDelete"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div class="modal-header bg-danger text-white border-0 py-3 px-4">
            <h5 class="modal-title fw-bold">Hapus Data Kelas</h5>
            <button type="button" class="btn-close btn-close-white" @click="classToDelete = null"></button>
          </div>
          <div class="modal-body p-4 text-center">
            <i class="bi bi-exclamation-triangle-fill text-danger display-4 mb-3 d-block"></i>
            <h5 class="fw-bold text-dark">Konfirmasi Penghapusan</h5>
            <p class="text-muted mb-0">
              Apakah Anda yakin ingin menghapus kelas <strong>{{ classToDelete.name }}</strong>? Siswa di kelas ini tidak akan terhapus namun kelasnya perlu disesuaikan kembali.
            </p>
          </div>
          <div class="modal-footer bg-light border-0 px-4 py-3">
            <button type="button" class="btn btn-secondary rounded-pill px-4" @click="classToDelete = null">Batal</button>
            <button type="button" class="btn btn-danger rounded-pill px-4 fw-bold" @click="confirmDelete">Ya, Hapus</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { dataService } from '../../services/dataService';
import { ClassItem } from '../../types';

const classes = ref<ClassItem[]>([]);
const loading = ref(true);
const saving = ref(false);
const searchQuery = ref('');
const alertMessage = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const currentId = ref('');
const classNameInput = ref('');
const classToDelete = ref<ClassItem | null>(null);

const filteredClasses = computed(() => {
  if (!searchQuery.value.trim()) return classes.value;
  const q = searchQuery.value.toLowerCase();
  return classes.value.filter(c => c.name.toLowerCase().includes(q));
});

const loadClasses = async () => {
  loading.value = true;
  try {
    classes.value = await dataService.getClasses();
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  isEditing.value = false;
  currentId.value = '';
  classNameInput.value = '';
  showModal.value = true;
};

const openEditModal = (cls: ClassItem) => {
  isEditing.value = true;
  currentId.value = cls.id;
  classNameInput.value = cls.name;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  classNameInput.value = '';
};

const saveClass = async () => {
  if (!classNameInput.value.trim()) return;
  saving.value = true;
  try {
    if (isEditing.value) {
      await dataService.updateClass(currentId.value, classNameInput.value);
      alertMessage.value = `Kelas berhasil diperbarui menjadi "${classNameInput.value}".`;
    } else {
      await dataService.addClass(classNameInput.value);
      alertMessage.value = `Kelas "${classNameInput.value}" berhasil ditambahkan.`;
    }
    closeModal();
    await loadClasses();
  } catch (e: any) {
    alert('Terjadi kesalahan: ' + e.message);
  } finally {
    saving.value = false;
  }
};

const promptDelete = (cls: ClassItem) => {
  classToDelete.value = cls;
};

const confirmDelete = async () => {
  if (!classToDelete.value) return;
  try {
    await dataService.deleteClass(classToDelete.value.id);
    alertMessage.value = `Kelas "${classToDelete.value.name}" berhasil dihapus.`;
    classToDelete.value = null;
    await loadClasses();
  } catch (e: any) {
    alert('Gagal menghapus: ' + e.message);
  }
};

onMounted(() => {
  loadClasses();
});
</script>

<style scoped>
.fs-8 {
  font-size: 0.78rem;
}
</style>
