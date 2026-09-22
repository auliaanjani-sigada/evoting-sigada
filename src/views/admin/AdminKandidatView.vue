<template>
  <div id="admin-kandidat-view">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-1">Daftar Pasangan Calon Kandidat</h3>
        <p class="text-muted mb-0">Kelola nomor urut, foto, nama ketua & wakil, visi, misi, serta slogan paslon</p>
      </div>

      <button
        @click="openAddModal"
        class="btn btn-primary rounded-pill px-4 fw-semibold d-flex align-items-center gap-2 shadow-sm"
        id="btn-tambah-kandidat"
      >
        <i class="bi bi-person-plus-fill"></i>
        <span>Tambah Kandidat Paslon</span>
      </button>
    </div>

    <!-- Alert -->
    <div v-if="alertMessage" class="alert alert-success alert-dismissible fade show rounded-3 shadow-xs mb-3" role="alert">
      <i class="bi bi-check-circle-fill me-2"></i>{{ alertMessage }}
      <button type="button" class="btn-close" @click="alertMessage = ''"></button>
    </div>

    <!-- Grid of Candidate Cards -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-2">Memuat daftar kandidat...</p>
    </div>

    <div v-else-if="candidates.length === 0" class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
      <i class="bi bi-person-badge display-4 text-secondary opacity-50 mb-3"></i>
      <h5 class="fw-bold text-dark">Belum ada Calon Kandidat</h5>
      <p class="text-muted mb-3">Silakan tambahkan calon pasangan kandidat Ketua dan Wakil Ketua OSIS.</p>
      <button @click="openAddModal" class="btn btn-primary rounded-pill px-4 mx-auto fw-semibold">
        Tambah Kandidat Pertama
      </button>
    </div>

    <div v-else class="row g-4">
      <div v-for="cand in candidates" :key="cand.id" class="col-md-6 col-xl-4">
        <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <!-- Banner & Photo -->
          <div class="position-relative" style="height: 220px; background-color: #1e293b;">
            <img
              :src="cand.photo_url || defaultAvatar"
              :alt="cand.leader_name"
              class="w-100 h-100 object-fit-cover"
              @error="onPhotoError($event)"
            />
            <div class="position-absolute top-0 start-0 m-3 badge bg-primary text-white fs-5 fw-bold px-3 py-2 rounded-pill shadow border border-white">
              No. 0{{ cand.candidate_number }}
            </div>
            <div class="position-absolute bottom-0 end-0 m-3 badge bg-dark bg-opacity-75 text-white px-2.5 py-1 rounded-pill fs-8">
              <i class="bi bi-trophy-fill text-warning me-1"></i>{{ cand.total_votes || 0 }} Suara
            </div>
          </div>

          <!-- Content -->
          <div class="card-body p-4 d-flex flex-column">
            <h5 class="fw-bold text-dark mb-1">{{ cand.leader_name }}</h5>
            <h6 class="text-secondary fw-semibold mb-3">Wakil: {{ cand.vice_leader_name }}</h6>

            <div class="bg-light p-3 rounded-3 mb-3 border-start border-primary border-3 fst-italic text-secondary small">
              "{{ cand.slogan || 'Berbakti untuk almamater tercinta.' }}"
            </div>

            <!-- Visi Preview -->
            <div class="small text-muted mb-3">
              <strong class="text-dark d-block mb-1 fs-8 text-uppercase">Ringkasan Visi:</strong>
              <div class="text-truncate-2">{{ cand.vision }}</div>
            </div>

            <!-- Actions Footer -->
            <div class="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
              <button
                class="btn btn-sm btn-outline-primary rounded-pill px-3"
                @click="previewCandidate(cand)"
              >
                <i class="bi bi-eye me-1"></i>Detail Visi Misi
              </button>

              <div class="btn-group btn-group-sm">
                <button
                  class="btn btn-outline-secondary rounded-start-pill px-2.5"
                  @click="openEditModal(cand)"
                  title="Ubah Kandidat"
                >
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button
                  class="btn btn-outline-danger rounded-end-pill px-2.5"
                  @click="promptDelete(cand)"
                  title="Hapus Kandidat"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form (Tambah / Edit Kandidat) -->
    <div
      v-if="showModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5);"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div class="modal-header bg-primary text-white border-0 py-3 px-4">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-person-badge me-2"></i>{{ isEditing ? 'Ubah Data Paslon' : 'Tambah Pasangan Calon Baru' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>

          <form @submit.prevent="saveCandidate">
            <div class="modal-body p-4 max-h-75 overflow-auto">
              <div class="row g-3">
                <!-- Nomor Urut -->
                <div class="col-sm-4">
                  <label class="form-label fw-semibold text-dark fs-7">Nomor Urut</label>
                  <input
                    type="number"
                    v-model.number="form.candidate_number"
                    class="form-control"
                    min="1"
                    required
                  />
                  <small class="text-muted fs-8">1, 2, 3...</small>
                </div>

                <!-- Foto Upload / URL -->
                <div class="col-sm-8">
                  <label class="form-label fw-semibold text-dark fs-7">Foto Paslon (Supabase Storage)</label>
                  <div class="input-group mb-1">
                    <input
                      type="file"
                      class="form-control"
                      accept="image/*"
                      @change="handleFileUpload"
                    />
                  </div>
                  <input
                    type="url"
                    v-model="form.photo_url"
                    class="form-control form-control-sm"
                    placeholder="Atau tempelkan link URL foto..."
                  />
                  <small v-if="uploadingPhoto" class="text-primary fw-semibold">
                    <span class="spinner-border spinner-border-sm me-1"></span> Mengunggah ke Supabase Storage...
                  </small>
                </div>

                <!-- Nama Ketua -->
                <div class="col-sm-6">
                  <label class="form-label fw-semibold text-dark fs-7">Nama Calon Ketua OSIS</label>
                  <input
                    type="text"
                    v-model="form.leader_name"
                    class="form-control"
                    placeholder="Nama lengkap calon ketua"
                    required
                  />
                </div>

                <!-- Nama Wakil -->
                <div class="col-sm-6">
                  <label class="form-label fw-semibold text-dark fs-7">Nama Calon Wakil Ketua OSIS</label>
                  <input
                    type="text"
                    v-model="form.vice_leader_name"
                    class="form-control"
                    placeholder="Nama lengkap calon wakil"
                    required
                  />
                </div>

                <!-- Slogan -->
                <div class="col-12">
                  <label class="form-label fw-semibold text-dark fs-7">Slogan / Tagline Paslon</label>
                  <input
                    type="text"
                    v-model="form.slogan"
                    class="form-control"
                    placeholder="Contoh: Bersama Menuju OSIS Berprestasi dan Berdaya Saing"
                  />
                </div>

                <!-- Visi -->
                <div class="col-12">
                  <label class="form-label fw-semibold text-dark fs-7">Visi</label>
                  <textarea
                    v-model="form.vision"
                    class="form-control"
                    rows="3"
                    placeholder="Visi pasangan calon..."
                    required
                  ></textarea>
                </div>

                <!-- Misi -->
                <div class="col-12">
                  <label class="form-label fw-semibold text-dark fs-7">Misi (Poin-poin)</label>
                  <textarea
                    v-model="form.mission"
                    class="form-control"
                    rows="4"
                    placeholder="1. Meningkatkan kegiatan keagamaan...&#10;2. Menyelenggarakan pekan olahraga dan seni..."
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="modal-footer bg-light border-0 px-4 py-3">
              <button type="button" class="btn btn-secondary rounded-pill px-4" @click="closeModal">Batal</button>
              <button type="submit" class="btn btn-primary rounded-pill px-4 fw-semibold" :disabled="saving || uploadingPhoto">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                <span>{{ isEditing ? 'Simpan Perubahan' : 'Tambahkan Paslon' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Detail / Preview Visi Misi -->
    <div
      v-if="selectedPreview"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5);"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div class="modal-header bg-primary text-white border-0 py-3 px-4">
            <h5 class="modal-title fw-bold">
              Paslon No. 0{{ selectedPreview.candidate_number }}: {{ selectedPreview.leader_name }} & {{ selectedPreview.vice_leader_name }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="selectedPreview = null"></button>
          </div>
          <div class="modal-body p-4">
            <div class="d-flex gap-3 align-items-center mb-3 pb-3 border-bottom">
              <img
                :src="selectedPreview.photo_url || defaultAvatar"
                class="rounded-3 object-fit-cover shadow-xs"
                style="width: 80px; height: 80px;"
                @error="onPhotoError($event)"
              />
              <div>
                <div class="badge bg-warning text-dark mb-1">Nomor Urut 0{{ selectedPreview.candidate_number }}</div>
                <h5 class="fw-bold mb-0">{{ selectedPreview.leader_name }} & {{ selectedPreview.vice_leader_name }}</h5>
                <small class="text-muted">"{{ selectedPreview.slogan }}"</small>
              </div>
            </div>

            <div class="mb-3">
              <h6 class="fw-bold text-primary text-uppercase fs-8 tracking-wide">Visi</h6>
              <div class="p-3 bg-light rounded-3 text-secondary">{{ selectedPreview.vision }}</div>
            </div>

            <div>
              <h6 class="fw-bold text-primary text-uppercase fs-8 tracking-wide">Misi</h6>
              <div class="p-3 bg-light rounded-3 text-secondary" style="white-space: pre-line;">{{ selectedPreview.mission }}</div>
            </div>
          </div>
          <div class="modal-footer bg-light border-0 px-4 py-3">
            <button type="button" class="btn btn-secondary rounded-pill px-4" @click="selectedPreview = null">Tutup</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Delete Confirm -->
    <div
      v-if="candidateToDelete"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div class="modal-header bg-danger text-white border-0 py-3 px-4">
            <h5 class="modal-title fw-bold">Hapus Calon Kandidat</h5>
            <button type="button" class="btn-close btn-close-white" @click="candidateToDelete = null"></button>
          </div>
          <div class="modal-body p-4 text-center">
            <i class="bi bi-trash3-fill text-danger display-4 mb-3 d-block"></i>
            <h5 class="fw-bold text-dark">Hapus Paslon 0{{ candidateToDelete.candidate_number }}?</h5>
            <p class="text-muted mb-0">
              Data pasangan calon <strong>{{ candidateToDelete.leader_name }} & {{ candidateToDelete.vice_leader_name }}</strong> akan dihapus permanen.
            </p>
          </div>
          <div class="modal-footer bg-light border-0 px-4 py-3">
            <button type="button" class="btn btn-secondary rounded-pill px-4" @click="candidateToDelete = null">Batal</button>
            <button type="button" class="btn btn-danger rounded-pill px-4 fw-bold" @click="confirmDelete">Ya, Hapus</button>
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
import { Candidate } from '../../types';

const candidates = ref<Candidate[]>([]);
const loading = ref(true);
const saving = ref(false);
const uploadingPhoto = ref(false);
const alertMessage = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const currentId = ref('');
const candidateToDelete = ref<Candidate | null>(null);
const selectedPreview = ref<Candidate | null>(null);

const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';

const form = ref({
  candidate_number: 1,
  photo_url: '',
  leader_name: '',
  vice_leader_name: '',
  slogan: '',
  vision: '',
  mission: '',
});

const onPhotoError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.src = defaultAvatar;
};

const loadCandidates = async () => {
  loading.value = true;
  try {
    candidates.value = await dataService.getCandidates();
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  isEditing.value = false;
  currentId.value = '';
  // suggest next candidate number
  const nextNum = candidates.value.length > 0
    ? Math.max(...candidates.value.map(c => c.candidate_number)) + 1
    : 1;

  form.value = {
    candidate_number: nextNum,
    photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
    leader_name: '',
    vice_leader_name: '',
    slogan: '',
    vision: '',
    mission: '',
  };
  showModal.value = true;
};

const openEditModal = (cand: Candidate) => {
  isEditing.value = true;
  currentId.value = cand.id;
  form.value = {
    candidate_number: cand.candidate_number,
    photo_url: cand.photo_url,
    leader_name: cand.leader_name,
    vice_leader_name: cand.vice_leader_name,
    slogan: cand.slogan,
    vision: cand.vision,
    mission: cand.mission,
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const previewCandidate = (cand: Candidate) => {
  selectedPreview.value = cand;
};

const handleFileUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  uploadingPhoto.value = true;
  try {
    const url = await uploadAssetImage(file, 'candidates');
    form.value.photo_url = url;
  } catch (err: any) {
    alert('Gagal mengunggah foto: ' + err.message);
  } finally {
    uploadingPhoto.value = false;
  }
};

const saveCandidate = async () => {
  saving.value = true;
  try {
    if (isEditing.value) {
      await dataService.updateCandidate(currentId.value, {
        candidate_number: form.value.candidate_number,
        photo_url: form.value.photo_url,
        leader_name: form.value.leader_name.trim(),
        vice_leader_name: form.value.vice_leader_name.trim(),
        slogan: form.value.slogan.trim(),
        vision: form.value.vision.trim(),
        mission: form.value.mission.trim(),
      });
      alertMessage.value = `Data Paslon 0${form.value.candidate_number} berhasil diperbarui.`;
    } else {
      await dataService.addCandidate({
        candidate_number: form.value.candidate_number,
        photo_url: form.value.photo_url,
        leader_name: form.value.leader_name.trim(),
        vice_leader_name: form.value.vice_leader_name.trim(),
        slogan: form.value.slogan.trim(),
        vision: form.value.vision.trim(),
        mission: form.value.mission.trim(),
      });
      alertMessage.value = `Paslon No. 0${form.value.candidate_number} berhasil ditambahkan.`;
    }
    closeModal();
    await loadCandidates();
  } catch (e: any) {
    alert('Terjadi kesalahan: ' + e.message);
  } finally {
    saving.value = false;
  }
};

const promptDelete = (cand: Candidate) => {
  candidateToDelete.value = cand;
};

const confirmDelete = async () => {
  if (!candidateToDelete.value) return;
  try {
    await dataService.deleteCandidate(candidateToDelete.value.id);
    alertMessage.value = `Paslon No. 0${candidateToDelete.value.candidate_number} berhasil dihapus.`;
    candidateToDelete.value = null;
    await loadCandidates();
  } catch (e: any) {
    alert('Gagal menghapus: ' + e.message);
  }
};

onMounted(() => {
  loadCandidates();
});
</script>

<style scoped>
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.fs-7 {
  font-size: 0.88rem;
}
.fs-8 {
  font-size: 0.78rem;
}
</style>
