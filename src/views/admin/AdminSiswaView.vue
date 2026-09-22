<template>
  <div id="admin-siswa-view">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-1">Daftar Pemilih Tetap (Siswa)</h3>
        <p class="text-muted mb-0">Kelola data pemilih, NIS, tanggal lahir, dan pantau status hak suara</p>
      </div>

      <div class="d-flex flex-wrap align-items-center gap-2">
        <button
          @click="downloadExcelTemplate"
          class="btn btn-outline-success rounded-pill px-3.5 py-1.5 fw-semibold d-flex align-items-center gap-1.5 shadow-xs"
          id="btn-download-format-excel"
          title="Download format input data siswa dalam bentuk file Excel (.xlsx)"
        >
          <i class="bi bi-file-earmark-arrow-down-fill text-success"></i>
          <span>Download Format Excel</span>
        </button>

        <button
          @click="openImportModal"
          class="btn btn-success rounded-pill px-3.5 py-1.5 fw-semibold d-flex align-items-center gap-1.5 shadow-sm"
          id="btn-impor-siswa"
          title="Impor dan generate data siswa dari file Excel"
        >
          <i class="bi bi-file-earmark-excel-fill"></i>
          <span>Impor Data Siswa</span>
        </button>

        <button
          @click="openPdfModal('cards')"
          class="btn btn-outline-danger rounded-pill px-3.5 py-1.5 fw-semibold d-flex align-items-center gap-1.5 shadow-xs"
          id="btn-download-pdf-dpt"
          title="Download dan cetak data siswa / kartu login DPT dalam format PDF"
        >
          <i class="bi bi-file-earmark-pdf-fill text-danger"></i>
          <span>Download PDF / Kartu</span>
        </button>

        <div class="dropdown">
          <button
            class="btn btn-outline-secondary rounded-pill px-3 py-1.5 fw-semibold dropdown-toggle d-flex align-items-center gap-1.5"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i class="bi bi-three-dots"></i>
            <span>Lainnya</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow-sm rounded-3 border-0 py-2">
            <li>
              <a class="dropdown-item py-2 d-flex align-items-center gap-2 cursor-pointer" @click="openPdfModal('cards')">
                <i class="bi bi-card-heading text-danger"></i>
                <span>Cetak Kartu Login DPT (PDF Siap Potong)</span>
              </a>
            </li>
            <li>
              <a class="dropdown-item py-2 d-flex align-items-center gap-2 cursor-pointer" @click="openPdfModal('table')">
                <i class="bi bi-table text-danger"></i>
                <span>Cetak Lembar Presensi / Tabel DPT (PDF)</span>
              </a>
            </li>
            <li><hr class="dropdown-divider my-1"></li>
            <li>
              <a class="dropdown-item py-2 d-flex align-items-center gap-2 cursor-pointer" @click="exportStudentsToExcel">
                <i class="bi bi-cloud-arrow-down text-primary"></i>
                <span>Export Data DPT ke Excel</span>
              </a>
            </li>
            <li>
              <a class="dropdown-item py-2 d-flex align-items-center gap-2 cursor-pointer" @click="generateDemoStudents">
                <i class="bi bi-magic text-warning"></i>
                <span>Generate Data Contoh</span>
              </a>
            </li>
            <li v-if="students.length > 0"><hr class="dropdown-divider my-1"></li>
            <li v-if="students.length > 0">
              <a class="dropdown-item py-2 d-flex align-items-center gap-2 cursor-pointer text-danger" @click="openBulkDeleteModal('all')">
                <i class="bi bi-trash3-fill text-danger"></i>
                <span>Hapus Semua Data Siswa (Kosongkan DPT)</span>
              </a>
            </li>
          </ul>
        </div>

        <button
          @click="openAddModal"
          class="btn btn-primary rounded-pill px-4 py-1.5 fw-semibold d-flex align-items-center gap-2 shadow-sm"
          id="btn-tambah-siswa"
        >
          <i class="bi bi-person-plus-fill"></i>
          <span>Tambah Siswa Baru</span>
        </button>
      </div>
    </div>

    <!-- Alert -->
    <div v-if="alertMessage" class="alert alert-success alert-dismissible fade show rounded-3 shadow-xs mb-3" role="alert">
      <i class="bi bi-check-circle-fill me-2"></i>{{ alertMessage }}
      <button type="button" class="btn-close" @click="alertMessage = ''"></button>
    </div>

    <!-- Filters & Search Card -->
    <div class="card border-0 shadow-sm rounded-4 p-3.5 bg-white mb-4">
      <div class="row g-3 align-items-center">
        <!-- Search -->
        <div class="col-md-5">
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-search"></i></span>
            <input
              type="text"
              v-model="searchQuery"
              class="form-control bg-light border-start-0"
              placeholder="Cari berdasarkan NIS atau Nama Siswa..."
            />
          </div>
        </div>

        <!-- Filter Kelas -->
        <div class="col-sm-6 col-md-3">
          <select v-model="filterClass" class="form-select bg-light">
            <option value="">Semua Kelas</option>
            <option v-for="c in classes" :key="c.id" :value="c.name">{{ c.name }}</option>
          </select>
        </div>

        <!-- Filter Status Hak Suara -->
        <div class="col-sm-6 col-md-4">
          <select v-model="filterStatus" class="form-select bg-light">
            <option value="">Semua Status Hak Suara</option>
            <option value="voted">Sudah Memilih</option>
            <option value="not_voted">Belum Memilih</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Batch Action Toolbar (Muncul jika ada siswa yang dicentang/diseleksi) -->
    <div
      v-if="selectedStudentIds.size > 0"
      class="alert alert-primary border-primary-subtle shadow-sm rounded-4 p-3 mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3"
      id="batch-action-bar"
    >
      <div class="d-flex flex-wrap align-items-center gap-2">
        <span class="badge bg-primary rounded-pill px-3 py-2 fs-7 fw-bold shadow-xs">
          <i class="bi bi-check2-circle me-1"></i>{{ selectedStudentIds.size }} Siswa Dipilih
        </span>
        <span class="text-dark small fw-medium">
          dari total {{ students.length }} siswa di DPT
        </span>
        <button
          v-if="selectedStudentIds.size < students.length"
          @click="selectAllTotal"
          class="btn btn-sm btn-link text-primary text-decoration-none p-0 fw-semibold ms-1"
          title="Pilih seluruh siswa di seluruh kelas"
        >
          (Pilih Semua {{ students.length }} Siswa)
        </button>
      </div>

      <div class="d-flex flex-wrap align-items-center gap-2">
        <button
          @click="openPdfModal('cards', 'selected')"
          class="btn btn-outline-danger btn-sm rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5 bg-white shadow-xs"
          title="Download dan cetak kartu login untuk siswa yang dipilih saja"
        >
          <i class="bi bi-file-earmark-pdf-fill"></i>
          <span>Cetak Kartu Terpilih ({{ selectedStudentIds.size }})</span>
        </button>

        <button
          @click="openBulkDeleteModal('selected')"
          class="btn btn-danger btn-sm rounded-pill px-3.5 py-1.5 fw-bold d-flex align-items-center gap-1.5 shadow-xs"
          id="btn-bulk-delete"
          title="Hapus data siswa yang sedang dicentang"
        >
          <i class="bi bi-trash3-fill"></i>
          <span>Hapus Terpilih ({{ selectedStudentIds.size }})</span>
        </button>

        <button
          @click="clearSelection"
          class="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1.5 fw-semibold bg-white"
        >
          Batalkan Pilihan
        </button>
      </div>
    </div>

    <!-- Students Table -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
      <div class="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <h5 class="fw-bold mb-0 text-dark">Data Siswa</h5>
          <span class="badge bg-primary-subtle text-primary fs-8">
            {{ filteredStudents.length }} dari {{ students.length }}
          </span>
          <span v-if="selectedStudentIds.size > 0" class="badge bg-danger text-white fs-8">
            {{ selectedStudentIds.size }} dipilih
          </span>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button
            v-if="selectedStudentIds.size === 0 && filteredStudents.length > 0"
            @click="toggleSelectAll"
            class="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-medium"
            title="Centang semua siswa yang tampil di tabel saat ini"
          >
            <i class="bi bi-check-all me-1"></i>Pilih Semua di Tabel
          </button>
          <button
            v-else-if="selectedStudentIds.size > 0"
            @click="clearSelection"
            class="btn btn-sm btn-light border rounded-pill px-3 text-muted"
          >
            <i class="bi bi-x-circle me-1"></i>Kosongkan Pilihan
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="ps-4 pe-2 py-3" style="width: 44px;">
                <input
                  type="checkbox"
                  class="form-check-input cursor-pointer"
                  :checked="isAllSelected"
                  :indeterminate.prop="isIndeterminate"
                  @change="toggleSelectAll"
                  title="Pilih / Batalkan Semua siswa di tabel ini"
                />
              </th>
              <th scope="col" class="py-3 text-muted text-uppercase fs-8" style="width: 60px;">No</th>
              <th scope="col" class="py-3 text-muted text-uppercase fs-8">NIS</th>
              <th scope="col" class="py-3 text-muted text-uppercase fs-8">Nama Lengkap</th>
              <th scope="col" class="py-3 text-muted text-uppercase fs-8">Tanggal Lahir</th>
              <th scope="col" class="py-3 text-muted text-uppercase fs-8">Kelas</th>
              <th scope="col" class="py-3 text-muted text-uppercase fs-8">Status Memilih</th>
              <th scope="col" class="px-4 py-3 text-muted text-uppercase fs-8 text-end" style="width: 170px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm text-primary me-2"></div> Memuat data siswa...
              </td>
            </tr>

            <tr v-else-if="filteredStudents.length === 0">
              <td colspan="8" class="text-center py-5 text-muted">
                <i class="bi bi-people display-6 d-block text-secondary opacity-50 mb-2"></i>
                Tidak ada data siswa yang cocok dengan kriteria filter.
              </td>
            </tr>

            <tr
              v-for="(s, idx) in filteredStudents"
              :key="s.id"
              :class="{ 'table-primary bg-primary-subtle': selectedStudentIds.has(s.id) }"
            >
              <td class="ps-4 pe-2">
                <input
                  type="checkbox"
                  class="form-check-input cursor-pointer"
                  :checked="selectedStudentIds.has(s.id)"
                  @change="toggleSelectStudent(s.id)"
                />
              </td>
              <td class="fw-semibold text-muted">{{ idx + 1 }}</td>
              <td>
                <span class="badge bg-light text-dark font-monospace border px-2.5 py-1.5 fs-8 fw-bold">
                  {{ s.nisn }}
                </span>
              </td>
              <td>
                <span class="fw-bold text-dark">{{ s.name }}</span>
              </td>
              <td>
                <small class="text-muted">{{ formatDate(s.birth_date) }}</small>
              </td>
              <td>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle fw-semibold px-2.5 py-1 rounded-pill">
                  {{ s.class_name }}
                </span>
              </td>
              <td>
                <span
                  v-if="s.has_voted"
                  class="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-pill d-inline-flex align-items-center gap-1"
                >
                  <i class="bi bi-check-circle-fill"></i> Sudah Memilih
                </span>
                <span
                  v-else
                  class="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1.5 rounded-pill d-inline-flex align-items-center gap-1"
                >
                  <i class="bi bi-clock-history"></i> Belum Memilih
                </span>
              </td>
              <td class="px-4 text-end">
                <div class="btn-group btn-group-sm">
                  <!-- Reset vote status button if already voted -->
                  <button
                    v-if="s.has_voted"
                    class="btn btn-outline-warning"
                    @click="resetVote(s)"
                    title="Reset Status Hak Suara (Izinkan Memilih Kembali)"
                  >
                    <i class="bi bi-arrow-counterclockwise"></i>
                  </button>
                  <button
                    class="btn btn-outline-secondary"
                    @click="openEditModal(s)"
                    title="Ubah Data Siswa"
                  >
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button
                    class="btn btn-outline-danger"
                    @click="promptDelete(s)"
                    title="Hapus Siswa"
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

    <!-- Modal Form (Tambah / Edit Siswa) -->
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
              <i class="bi bi-person-fill me-2"></i>{{ isEditing ? 'Ubah Data Siswa' : 'Tambah Siswa Pemilih' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>

          <form @submit.prevent="saveStudent">
            <div class="modal-body p-4">
              <!-- NIS -->
              <div class="mb-3">
                <label class="form-label fw-semibold text-dark fs-7">Nomor Induk Siswa (NIS)</label>
                <input
                  type="text"
                  v-model="form.nisn"
                  class="form-control"
                  placeholder="Contoh: 1001"
                  maxlength="4"
                  required
                />
                <small class="text-muted fs-8">4 angka unik siswa (contoh: 1001)</small>
              </div>

              <!-- Nama Lengkap -->
              <div class="mb-3">
                <label class="form-label fw-semibold text-dark fs-7">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  v-model="form.name"
                  class="form-control"
                  placeholder="Contoh: Budi Santoso"
                  required
                />
              </div>

              <!-- Tanggal Lahir -->
              <div class="mb-3">
                <label class="form-label fw-semibold text-dark fs-7">Tanggal Lahir</label>
                <input
                  type="date"
                  v-model="form.birth_date"
                  class="form-control"
                  required
                />
                <small class="text-muted fs-8">Digunakan bersama NIS untuk autentikasi saat pemilihan</small>
              </div>

              <!-- Kelas -->
              <div class="mb-3">
                <label class="form-label fw-semibold text-dark fs-7">Kelas / Rombel</label>
                <select v-model="form.class_name" class="form-select" required>
                  <option value="" disabled>Pilih Kelas</option>
                  <option v-for="c in classes" :key="c.id" :value="c.name">{{ c.name }}</option>
                </select>
              </div>

              <!-- Status Memilih (jika mode edit) -->
              <div v-if="isEditing" class="mb-3">
                <label class="form-label fw-semibold text-dark fs-7">Status Hak Suara</label>
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="switchHasVoted"
                    v-model="form.has_voted"
                  />
                  <label class="form-check-label small" for="switchHasVoted">
                    {{ form.has_voted ? 'Sudah Memilih' : 'Belum Memilih' }}
                  </label>
                </div>
              </div>
            </div>

            <div class="modal-footer bg-light border-0 px-4 py-3">
              <button type="button" class="btn btn-secondary rounded-pill px-4" @click="closeModal">Batal</button>
              <button type="submit" class="btn btn-primary rounded-pill px-4 fw-semibold" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                <span>{{ isEditing ? 'Simpan Perubahan' : 'Tambahkan Siswa' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Delete Confirm -->
    <div
      v-if="studentToDelete"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div class="modal-header bg-danger text-white border-0 py-3 px-4">
            <h5 class="modal-title fw-bold">Hapus Data Siswa</h5>
            <button type="button" class="btn-close btn-close-white" @click="studentToDelete = null"></button>
          </div>
          <div class="modal-body p-4 text-center">
            <i class="bi bi-trash3-fill text-danger display-4 mb-3 d-block"></i>
            <h5 class="fw-bold text-dark">Hapus {{ studentToDelete.name }}?</h5>
            <p class="text-muted mb-0">
              Siswa dengan NIS <strong>{{ studentToDelete.nisn }}</strong> akan dihapus dari Daftar Pemilih Tetap (DPT).
            </p>
          </div>
          <div class="modal-footer bg-light border-0 px-4 py-3">
            <button type="button" class="btn btn-secondary rounded-pill px-4" @click="studentToDelete = null">Batal</button>
            <button type="button" class="btn btn-danger rounded-pill px-4 fw-bold" @click="confirmDelete">Ya, Hapus</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus Masal (Bulk Delete Modal) -->
    <div
      v-if="showBulkDeleteModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.55);"
      id="modal-bulk-delete"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div class="modal-header bg-danger text-white border-0 py-3 px-4">
            <h5 class="modal-title fw-bold d-flex align-items-center gap-2">
              <i class="bi bi-trash3-fill"></i>
              <span>{{ bulkDeleteTarget === 'all' ? 'Hapus Semua Data Siswa DPT' : `Hapus ${selectedStudentIds.size} Data Siswa Terpilih` }}</span>
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeBulkDeleteModal" :disabled="deletingBulk"></button>
          </div>

          <div class="modal-body p-4 text-center">
            <div class="d-inline-flex p-3 rounded-circle bg-danger-subtle text-danger mb-3 shadow-xs">
              <i class="bi bi-exclamation-triangle-fill display-5"></i>
            </div>

            <h5 class="fw-bold text-dark mb-2">
              <template v-if="bulkDeleteTarget === 'all'">
                Kosongkan Seluruh Data DPT ({{ students.length }} Siswa)?
              </template>
              <template v-else>
                Hapus {{ selectedStudentIds.size }} Data Siswa yang Dipilih?
              </template>
            </h5>

            <p class="text-muted small mb-3">
              <template v-if="bulkDeleteTarget === 'all'">
                Seluruh akun pemilih, NIS, dan hak suara di dalam sistem akan dihapus permanen. Siswa tidak akan dapat masuk atau memberikan suara sampai data DPT diisi kembali.
              </template>
              <template v-else>
                Data siswa yang dicentang akan dihapus dari Daftar Pemilih Tetap (DPT). Tindakan ini akan menghapus akun login siswa yang bersangkutan.
              </template>
            </p>

            <!-- Preview beberapa nama siswa terpilih jika hapus seleksi -->
            <div v-if="bulkDeleteTarget === 'selected'" class="bg-light rounded-3 p-3 text-start small border mb-2 max-h-40 overflow-auto">
              <div class="fw-semibold text-dark mb-1 text-uppercase fs-8">Siswa yang akan dihapus:</div>
              <ul class="list-unstyled mb-0 text-muted">
                <li v-for="st in previewSelectedStudents" :key="st.id" class="d-flex align-items-center gap-2 py-0.5">
                  <i class="bi bi-dot text-danger fs-5"></i>
                  <span class="font-monospace fw-bold text-dark">{{ st.nisn }}</span> - <span>{{ st.name }}</span> ({{ st.class_name }})
                </li>
              </ul>
              <div v-if="selectedStudentIds.size > 5" class="text-muted fst-italic mt-1 fs-8">
                ...dan {{ selectedStudentIds.size - 5 }} siswa lainnya.
              </div>
            </div>
          </div>

          <div class="modal-footer bg-light border-0 px-4 py-3 d-flex justify-content-between">
            <button type="button" class="btn btn-secondary rounded-pill px-4" @click="closeBulkDeleteModal" :disabled="deletingBulk">
              Batal
            </button>
            <button
              type="button"
              class="btn btn-danger rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm"
              @click="executeBulkDelete"
              :disabled="deletingBulk"
            >
              <span v-if="deletingBulk" class="spinner-border spinner-border-sm"></span>
              <span>{{ deletingBulk ? 'Menghapus...' : (bulkDeleteTarget === 'all' ? 'Ya, Kosongkan Semua' : `Ya, Hapus ${selectedStudentIds.size} Siswa`) }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Cetak & Download PDF DPT / Kartu Login -->
    <div
      v-if="showPdfModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.55);"
      id="modal-pdf-dpt"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div class="modal-header bg-danger text-white border-0 py-3 px-4">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-file-earmark-pdf-fill fs-4"></i>
              <div>
                <h5 class="modal-title fw-bold mb-0">Cetak & Download Data Siswa / DPT (PDF)</h5>
                <small class="text-white-50">Generate kartu login pemilih siap cetak & potong atau lembar presensi resmi</small>
              </div>
            </div>
            <button type="button" class="btn-close btn-close-white" @click="showPdfModal = false" :disabled="generatingPdf"></button>
          </div>

          <div class="modal-body p-4">
            <!-- 1. Pilihan Format PDF -->
            <div class="mb-4">
              <label class="form-label fw-bold text-dark mb-2">1. Pilih Format Dokumen PDF:</label>
              <div class="row g-3">
                <div class="col-md-6">
                  <div
                    class="card h-100 p-3 rounded-4 cursor-pointer border transition-all"
                    :class="pdfType === 'cards' ? 'border-danger bg-danger-subtle/15 shadow-sm' : 'border-light bg-light hover:bg-white'"
                    @click="pdfType = 'cards'"
                  >
                    <div class="d-flex align-items-start gap-3">
                      <div class="p-2.5 rounded-3 bg-danger text-white shadow-xs">
                        <i class="bi bi-card-heading fs-4"></i>
                      </div>
                      <div>
                        <div class="fw-bold text-dark fs-6 d-flex align-items-center gap-1.5 flex-wrap">
                          <span>Kartu Login Siswa</span>
                          <span class="badge bg-danger rounded-pill fs-8">Siap Gunting</span>
                        </div>
                        <p class="text-muted small mb-0 mt-1">
                          Grid 8 kartu per lembar A4 dengan garis potong putus-putus. Memuat NIS (ID Login), Nama, Kelas, dan Tanggal Lahir (Password) untuk dibagikan ke siswa saat masuk bilik suara.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div
                    class="card h-100 p-3 rounded-4 cursor-pointer border transition-all"
                    :class="pdfType === 'table' ? 'border-primary bg-primary-subtle/15 shadow-sm' : 'border-light bg-light hover:bg-white'"
                    @click="pdfType = 'table'"
                  >
                    <div class="d-flex align-items-start gap-3">
                      <div class="p-2.5 rounded-3 bg-primary text-white shadow-xs">
                        <i class="bi bi-table fs-4"></i>
                      </div>
                      <div>
                        <div class="fw-bold text-dark fs-6">Lembar Presensi / Tabel DPT</div>
                        <p class="text-muted small mb-0 mt-1">
                          Format tabel lengkap A4 dengan kop surat resmi, memuat No, NIS, Nama, Kelas, Tanggal Lahir, Status Suara, dan kolom Tanda Tangan / Paraf Kehadiran Siswa.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Cakupan Data Siswa -->
            <div class="mb-4">
              <label class="form-label fw-bold text-dark mb-2">2. Cakupan Data Siswa:</label>
              <div class="row g-2">
                <div class="col-md-4">
                  <label class="form-check card p-3 rounded-3 border cursor-pointer h-100 mb-0" :class="{ 'bg-primary-subtle/10 border-primary': pdfScope === 'all' }">
                    <input class="form-check-input" type="radio" v-model="pdfScope" value="all" />
                    <span class="form-check-label ms-2 fw-semibold text-dark d-block">
                      Semua Siswa
                      <small class="d-block text-muted fw-normal">Total {{ students.length }} siswa</small>
                    </span>
                  </label>
                </div>

                <div class="col-md-4">
                  <label class="form-check card p-3 rounded-3 border cursor-pointer h-100 mb-0" :class="{ 'bg-primary-subtle/10 border-primary': pdfScope === 'filtered', 'opacity-60 cursor-not-allowed': filteredStudents.length === students.length && !searchQuery && !filterClass && !filterStatus }">
                    <input class="form-check-input" type="radio" v-model="pdfScope" value="filtered" :disabled="filteredStudents.length === students.length && !searchQuery && !filterClass && !filterStatus" />
                    <span class="form-check-label ms-2 fw-semibold text-dark d-block">
                      Sesuai Filter Tabel
                      <small class="d-block text-muted fw-normal">
                        {{ filteredStudents.length }} siswa
                        <span v-if="filterClass">({{ filterClass }})</span>
                      </small>
                    </span>
                  </label>
                </div>

                <div class="col-md-4">
                  <label class="form-check card p-3 rounded-3 border cursor-pointer h-100 mb-0" :class="{ 'bg-primary-subtle/10 border-primary': pdfScope === 'selected', 'opacity-60 cursor-not-allowed': selectedStudentIds.size === 0 }">
                    <input class="form-check-input" type="radio" v-model="pdfScope" value="selected" :disabled="selectedStudentIds.size === 0" />
                    <span class="form-check-label ms-2 fw-semibold text-dark d-block">
                      Hanya Siswa Terpilih
                      <small class="d-block text-muted fw-normal">{{ selectedStudentIds.size }} siswa terpilih</small>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <!-- 3. Urutan Data & Estimasi -->
            <div class="row g-3 mb-2">
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark mb-1">3. Urutkan Berdasarkan:</label>
                <select v-model="pdfSort" class="form-select bg-light">
                  <option value="class">Urut Berdasarkan Kelas, lalu Nama</option>
                  <option value="name">Urut Berdasarkan Nama Siswa (A - Z)</option>
                  <option value="nisn">Urut Berdasarkan NIS</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-bold text-dark mb-1">Estimasi Halaman Cetak:</label>
                <div class="p-2.5 bg-light border rounded-3 text-muted small d-flex align-items-center gap-2">
                  <i class="bi bi-info-circle text-primary fs-5"></i>
                  <div>
                    Akan mencetak <strong>{{ targetPdfStudents.length }}</strong> siswa
                    <template v-if="pdfType === 'cards'">
                      (sekitar <strong>{{ Math.ceil(targetPdfStudents.length / 8) }}</strong> lembar A4)
                    </template>
                    <template v-else>
                      (sekitar <strong>{{ Math.ceil(targetPdfStudents.length / 28) }}</strong> lembar A4)
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer bg-light border-0 px-4 py-3 d-flex justify-content-between">
            <button type="button" class="btn btn-secondary rounded-pill px-4" @click="showPdfModal = false" :disabled="generatingPdf">
              Tutup
            </button>
            <button
              type="button"
              class="btn btn-danger rounded-pill px-4.5 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
              @click="downloadPdf"
              :disabled="generatingPdf || targetPdfStudents.length === 0"
            >
              <span v-if="generatingPdf" class="spinner-border spinner-border-sm"></span>
              <i v-else class="bi bi-file-earmark-pdf-fill"></i>
              <span>{{ generatingPdf ? 'Membuat PDF...' : 'Download Dokumen PDF' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Impor Siswa dari Excel -->
    <div
      v-if="showImportModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.55);"
      id="modal-impor-siswa"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div class="modal-header bg-success text-white border-0 py-3 px-4">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-file-earmark-excel-fill fs-5"></i>
              <div>
                <h5 class="modal-title fw-bold mb-0">Impor Data Siswa / DPT dari Excel</h5>
                <small class="text-white-50">Generate akun pemilih secara otomatis dari file spreadsheet (.xlsx/.xls)</small>
              </div>
            </div>
            <button type="button" class="btn-close btn-close-white" @click="closeImportModal" :disabled="importProcessing"></button>
          </div>

          <div class="modal-body p-4">
            <!-- VIEW 1: HASIL IMPOR SUKSES -->
            <div v-if="importSuccessResult" class="text-center py-3">
              <div class="mb-3">
                <div class="d-inline-flex p-3 rounded-circle bg-success-subtle text-success shadow-xs">
                  <i class="bi bi-check-circle-fill display-5"></i>
                </div>
              </div>
              <h4 class="fw-bold text-dark mb-1">Impor Data Siswa Selesai!</h4>
              <p class="text-muted fs-8 mb-4">
                Data siswa dari Excel telah diproses dan disimpan ke sistem DPT eOSIS.
              </p>

              <div class="row g-2.5 justify-content-center mb-4 text-start">
                <div class="col-6 col-md-3">
                  <div class="p-3 rounded-3 bg-success-subtle border border-success-subtle">
                    <div class="fs-8 text-success fw-semibold">Siswa Baru</div>
                    <div class="fs-3 fw-bold text-success">+{{ importSuccessResult.inserted }}</div>
                    <small class="text-success-emphasis fs-9">Ditambahkan ke DPT</small>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 rounded-3 bg-primary-subtle border border-primary-subtle">
                    <div class="fs-8 text-primary fw-semibold">Siswa Diperbarui</div>
                    <div class="fs-3 fw-bold text-primary">{{ importSuccessResult.updated }}</div>
                    <small class="text-primary-emphasis fs-9">Data lama ditimpa</small>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 rounded-3 bg-warning-subtle border border-warning-subtle">
                    <div class="fs-8 text-warning-emphasis fw-semibold">Siswa Dilewati</div>
                    <div class="fs-3 fw-bold text-warning-emphasis">{{ importSuccessResult.skipped }}</div>
                    <small class="text-warning-emphasis fs-9">NIS sudah ada</small>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 rounded-3 bg-info-subtle border border-info-subtle">
                    <div class="fs-8 text-info-emphasis fw-semibold">Kelas Baru</div>
                    <div class="fs-3 fw-bold text-info-emphasis">{{ importSuccessResult.createdClasses.length }}</div>
                    <small class="text-info-emphasis fs-9 text-truncate d-block">{{ importSuccessResult.createdClasses.join(', ') || 'Tidak ada' }}</small>
                  </div>
                </div>
              </div>

              <div v-if="importSuccessResult.inserted === 0 && importSuccessResult.updated === 0 && importSuccessResult.skipped > 0" class="alert alert-warning py-2.5 px-3 rounded-3 fs-8 mb-4 text-start mx-auto" style="max-width: 600px;">
                <i class="bi bi-info-circle-fill me-1.5"></i>
                <strong>Catatan:</strong> Semua {{ importSuccessResult.skipped }} siswa dalam file ini sudah terdaftar di DPT dan Anda memilih opsi <em>Lewati (Skip)</em>, sehingga tidak ada data yang berubah.
              </div>

              <div class="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  class="btn btn-outline-secondary rounded-pill px-4"
                  @click="resetImportFile"
                >
                  <i class="bi bi-arrow-repeat me-1"></i>Impor File Lain
                </button>
                <button
                  type="button"
                  class="btn btn-success rounded-pill px-4 fw-bold shadow-sm"
                  @click="closeImportModal"
                >
                  <i class="bi bi-check2-circle me-1"></i>Selesai & Lihat Data DPT
                </button>
              </div>
            </div>

            <!-- VIEW 2: FORM IMPOR / UPLOAD FILE -->
            <div v-else>
              <!-- Format Guide & Quick Download -->
              <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between p-3 rounded-3 bg-light border mb-3 gap-2">
                <div class="d-flex align-items-center gap-2.5">
                  <i class="bi bi-info-circle-fill text-primary fs-5 flex-shrink-0"></i>
                  <div class="fs-8 text-secondary">
                    Format kolom: <strong>NIS</strong> (4 angka unik), <strong>Nama Lengkap</strong>, <strong>Tanggal Lahir</strong> (YYYY-MM-DD), dan <strong>Kelas</strong>.
                  </div>
                </div>
                <button
                  @click="downloadExcelTemplate"
                  class="btn btn-sm btn-outline-success text-nowrap rounded-pill px-3 py-1 fw-semibold d-flex align-items-center gap-1.5 align-self-start align-self-sm-center"
                >
                  <i class="bi bi-download"></i>
                  <span>Download Format Excel</span>
                </button>
              </div>

              <!-- Drag & Drop Zone -->
              <div
                v-if="!importFile"
                class="border border-2 border-dashed rounded-4 p-4 text-center cursor-pointer transition-all bg-light"
                :class="{ 'border-success bg-success-subtle': isDragging, 'border-secondary-subtle': !isDragging }"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="onFileDrop"
                @click="triggerFileInput"
                style="cursor: pointer; min-height: 170px; display: flex; flex-direction: column; align-items: center; justify-content: center;"
              >
                <input
                  type="file"
                  ref="fileInputRef"
                  @change="onFileInputChange"
                  accept=".xlsx, .xls, .csv"
                  class="d-none"
                />
                <div class="mb-2">
                  <i class="bi bi-cloud-arrow-up-fill display-4 text-success opacity-75"></i>
                </div>
                <h6 class="fw-bold text-dark mb-1">Tarik & Lepaskan File Excel ke Sini</h6>
                <p class="text-muted fs-8 mb-2">atau klik untuk memilih file dari komputer</p>
                <span class="badge bg-white text-secondary border px-3 py-1.5 rounded-pill fs-8">
                  Mendukung file .xlsx, .xls, dan .csv (Maks. 10MB)
                </span>
              </div>

              <!-- File Selected View -->
              <div v-else>
                <!-- File Info Card -->
                <div class="p-3 rounded-3 border bg-white shadow-xs mb-3">
                  <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                    <div class="d-flex align-items-center gap-3 overflow-hidden">
                      <div class="rounded-3 bg-success-subtle text-success p-2.5 d-flex align-items-center justify-content-center">
                        <i class="bi bi-file-earmark-excel-fill fs-4"></i>
                      </div>
                      <div class="text-truncate">
                        <div class="fw-bold text-dark text-truncate">{{ importFile.name }}</div>
                        <small class="text-muted">{{ formatFileSize(importFile.size) }} • {{ sheetRawRowsCount }} baris data ditemukan</small>
                      </div>
                    </div>

                    <button
                      type="button"
                      class="btn btn-outline-danger btn-sm rounded-pill px-3 py-1 text-nowrap"
                      @click="resetImportFile"
                      :disabled="importProcessing"
                    >
                      <i class="bi bi-x-circle me-1"></i>Ganti File
                    </button>
                  </div>

                  <!-- Sheet selector if workbook has multiple sheets -->
                  <div v-if="availableSheets.length > 1" class="d-flex align-items-center gap-2 pt-2 border-top">
                    <label class="fs-8 fw-semibold text-secondary text-nowrap mb-0">Pilih Lembar Kerja (Sheet):</label>
                    <select
                      v-model="selectedSheet"
                      @change="onSheetChange"
                      class="form-select form-select-sm rounded-pill"
                      style="max-width: 260px;"
                    >
                      <option v-for="sh in availableSheets" :key="sh" :value="sh">{{ sh }}</option>
                    </select>
                  </div>
                </div>

                <!-- Error Alert -->
                <div v-if="importError" class="alert alert-danger py-2.5 px-3 rounded-3 fs-8 mb-3 d-flex align-items-center gap-2">
                  <i class="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                  <div>{{ importError }}</div>
                </div>

                <!-- Pemetaan Kolom (Column Mapping) -->
                <div class="card border rounded-3 p-3 bg-light mb-3">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-layout-three-columns text-primary"></i>
                      <span class="fw-bold text-dark fs-8">Pemetaan Kolom Excel</span>
                    </div>
                    <span v-if="autoDetectedSuccess" class="badge bg-success-subtle text-success fs-9 px-2 py-1 rounded-pill">
                      <i class="bi bi-check-circle me-1"></i>Otomatis Cocok
                    </span>
                    <span v-else class="badge bg-warning-subtle text-warning-emphasis fs-9 px-2 py-1 rounded-pill">
                      <i class="bi bi-sliders me-1"></i>Sesuaikan Kolom
                    </span>
                  </div>
                  <div class="row g-2">
                    <div class="col-12 col-md-6 col-lg-3">
                      <label class="form-label fs-9 fw-bold text-secondary mb-1">
                        Kolom NIS <span class="text-danger">*</span>
                      </label>
                      <select
                        v-model="columnMapping.nisn"
                        @change="reprocessCurrentRows"
                        class="form-select form-select-sm"
                        :class="{ 'border-success': !!columnMapping.nisn, 'border-danger': !columnMapping.nisn }"
                      >
                        <option value="">-- Pilih Kolom NIS --</option>
                        <option v-for="h in detectedHeaders" :key="h" :value="h">{{ h }}</option>
                      </select>
                    </div>

                    <div class="col-12 col-md-6 col-lg-3">
                      <label class="form-label fs-9 fw-bold text-secondary mb-1">
                        Kolom Nama Siswa <span class="text-danger">*</span>
                      </label>
                      <select
                        v-model="columnMapping.name"
                        @change="reprocessCurrentRows"
                        class="form-select form-select-sm"
                        :class="{ 'border-success': !!columnMapping.name, 'border-danger': !columnMapping.name }"
                      >
                        <option value="">-- Pilih Kolom Nama --</option>
                        <option v-for="h in detectedHeaders" :key="h" :value="h">{{ h }}</option>
                      </select>
                    </div>

                    <div class="col-12 col-md-6 col-lg-3">
                      <label class="form-label fs-9 fw-bold text-secondary mb-1">
                        Kolom Tanggal Lahir (Opsional)
                      </label>
                      <select
                        v-model="columnMapping.birth_date"
                        @change="reprocessCurrentRows"
                        class="form-select form-select-sm"
                      >
                        <option value="">-- Tanpa Kolom (Default) --</option>
                        <option v-for="h in detectedHeaders" :key="h" :value="h">{{ h }}</option>
                      </select>
                    </div>

                    <div class="col-12 col-md-6 col-lg-3">
                      <label class="form-label fs-9 fw-bold text-secondary mb-1">
                        Kolom Kelas (Opsional)
                      </label>
                      <select
                        v-model="columnMapping.class_name"
                        @change="reprocessCurrentRows"
                        class="form-select form-select-sm"
                      >
                        <option value="">-- Tanpa Kolom (Default) --</option>
                        <option v-for="h in detectedHeaders" :key="h" :value="h">{{ h }}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Summary Chips -->
                <div class="row g-2.5 mb-3">
                  <div class="col-6 col-md-3">
                    <div class="p-2.5 rounded-3 bg-light border text-center">
                      <div class="fs-8 text-muted fw-semibold">Total Terbaca</div>
                      <div class="fs-5 fw-bold text-dark">{{ parsedStudents.length }}</div>
                    </div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div class="p-2.5 rounded-3 bg-success-subtle border border-success-subtle text-center">
                      <div class="fs-8 text-success fw-semibold">Data Valid</div>
                      <div class="fs-5 fw-bold text-success">{{ validRowsCount }}</div>
                    </div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div class="p-2.5 rounded-3 bg-warning-subtle border border-warning-subtle text-center">
                      <div class="fs-8 text-warning-emphasis fw-semibold">NIS Sudah Ada</div>
                      <div class="fs-5 fw-bold text-warning-emphasis">{{ duplicateCount }}</div>
                    </div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div class="p-2.5 rounded-3 bg-info-subtle border border-info-subtle text-center">
                      <div class="fs-8 text-info-emphasis fw-semibold">Kelas Baru</div>
                      <div class="fs-5 fw-bold text-info-emphasis">{{ detectedNewClasses.length }}</div>
                    </div>
                  </div>
                </div>

                <!-- All duplicates notification -->
                <div
                  v-if="validRowsCount > 0 && duplicateCount === validRowsCount && !updateExisting"
                  class="alert alert-warning py-2.5 px-3 rounded-3 fs-8 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
                >
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-exclamation-triangle-fill text-warning flex-shrink-0"></i>
                    <span>
                      Semua ({{ duplicateCount }}) siswa sudah terdaftar di DPT. Pilih <strong>Perbarui (Update)</strong> jika ingin memperbarui data lama.
                    </span>
                  </div>
                  <button
                    type="button"
                    class="btn btn-warning btn-sm rounded-pill px-3 py-1 fw-bold text-dark"
                    @click="updateExisting = true"
                  >
                    Aktifkan Perbarui (Update)
                  </button>
                </div>

                <!-- New classes notice -->
                <div v-if="detectedNewClasses.length > 0" class="p-2.5 rounded-3 bg-light border mb-3 fs-8 d-flex align-items-center gap-2">
                  <i class="bi bi-info-circle text-info"></i>
                  <span>
                    Kelas baru yang akan otomatis ditambahkan ke sistem:
                    <strong class="text-dark">{{ detectedNewClasses.join(', ') }}</strong>
                  </span>
                </div>

                <!-- Duplicate handling options -->
                <div class="card border rounded-3 p-3 bg-light mb-3">
                  <label class="form-label fw-bold text-dark fs-8 mb-2">Penanganan Jika NIS Siswa Sudah Ada di DPT:</label>
                  <div class="d-flex flex-column flex-sm-row gap-3">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="radio"
                        name="dupOption"
                        id="optSkip"
                        :value="false"
                        v-model="updateExisting"
                      />
                      <label class="form-check-label fs-8 text-dark" for="optSkip">
                        <strong>Lewati (Skip)</strong> — Pertahankan data siswa lama
                      </label>
                    </div>
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="radio"
                        name="dupOption"
                        id="optUpdate"
                        :value="true"
                        v-model="updateExisting"
                      />
                      <label class="form-check-label fs-8 text-dark" for="optUpdate">
                        <strong>Perbarui (Update)</strong> — Timpa data siswa lama dengan data Excel
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Notice when 0 valid rows -->
                <div v-if="importFile && validRowsCount === 0" class="alert alert-danger py-2.5 px-3 rounded-3 fs-8 mb-3 d-flex align-items-center gap-2">
                  <i class="bi bi-exclamation-octagon-fill text-danger flex-shrink-0"></i>
                  <div>
                    Belum ada baris siswa yang valid terdeteksi. Silakan periksa dan pilih <strong>Kolom NIS</strong> dan <strong>Kolom Nama Siswa</strong> pada bagian pemetaan kolom di atas.
                  </div>
                </div>

                <!-- Preview Table -->
                <div class="border rounded-3 overflow-hidden mb-2">
                  <div class="bg-light py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
                    <span class="fs-8 fw-bold text-secondary">
                      Pratinjau Data (Menampilkan {{ Math.min(parsedStudents.length, 8) }} dari {{ parsedStudents.length }} siswa)
                    </span>
                    <span class="badge bg-secondary-subtle text-secondary fs-9">Pratinjau Hasil Parsing</span>
                  </div>
                  <div class="table-responsive" style="max-height: 200px;">
                    <table class="table table-sm table-hover align-middle mb-0 fs-8">
                      <thead class="table-light sticky-top">
                        <tr>
                          <th class="px-3 py-2">No</th>
                          <th class="py-2">NIS</th>
                          <th class="py-2">Nama Lengkap</th>
                          <th class="py-2">Tanggal Lahir</th>
                          <th class="py-2">Kelas</th>
                          <th class="px-3 py-2 text-end">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="parsedStudents.length === 0">
                          <td colspan="6" class="text-center py-4 text-muted">
                            Tidak ada data siswa yang terbaca. Pastikan kolom telah dipetakan.
                          </td>
                        </tr>
                        <tr v-for="(p, idx) in parsedStudents.slice(0, 8)" :key="idx">
                          <td class="px-3 text-muted">{{ idx + 1 }}</td>
                          <td class="font-monospace fw-bold">{{ p.nisn || '(Kosong)' }}</td>
                          <td class="fw-semibold">{{ p.name || '(Kosong)' }}</td>
                          <td>{{ p.birth_date }}</td>
                          <td>
                            <span class="badge bg-light text-dark border">{{ p.class_name }}</span>
                          </td>
                          <td class="px-3 text-end">
                            <span v-if="!p.isValid" class="badge bg-danger-subtle text-danger">Invalid</span>
                            <span v-else-if="p.isDuplicate" class="badge bg-warning-subtle text-warning-emphasis">
                              {{ updateExisting ? 'Akan Diupdate' : 'Sudah Ada' }}
                            </span>
                            <span v-else class="badge bg-success-subtle text-success">Siap Diimpor</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer bg-light border-0 px-4 py-3 d-flex justify-content-between" v-if="!importSuccessResult">
            <button
              type="button"
              class="btn btn-secondary rounded-pill px-4"
              @click="closeImportModal"
              :disabled="importProcessing"
            >
              Batal
            </button>

            <button
              type="button"
              class="btn btn-success rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm"
              :disabled="!importFile || validRowsCount === 0 || importProcessing"
              @click="executeImport"
              id="btn-mulai-impor"
            >
              <span v-if="importProcessing" class="spinner-border spinner-border-sm"></span>
              <i v-else class="bi bi-cloud-arrow-up-fill"></i>
              <span v-if="!importFile">Pilih File Excel</span>
              <span v-else-if="validRowsCount === 0">Pilih Kolom NIS & Nama (0 Siswa)</span>
              <span v-else-if="importProcessing">Mengimpor Data...</span>
              <span v-else>Mulai Impor ({{ validRowsCount }} Siswa)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { dataService } from '../../services/dataService';
import { Student, ClassItem, SchoolSetting } from '../../types';

const students = ref<Student[]>([]);
const classes = ref<ClassItem[]>([]);
const schoolSettings = ref<SchoolSetting | null>(null);
const loading = ref(true);
const saving = ref(false);
const alertMessage = ref('');

const searchQuery = ref('');
const filterClass = ref('');
const filterStatus = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const currentId = ref('');
const studentToDelete = ref<Student | null>(null);

// Multi-selection states (Seleksi Siswa)
const selectedStudentIds = ref<Set<string>>(new Set());

const isAllSelected = computed(() => {
  if (filteredStudents.value.length === 0) return false;
  return filteredStudents.value.every(s => selectedStudentIds.value.has(s.id));
});

const isIndeterminate = computed(() => {
  const count = filteredStudents.value.filter(s => selectedStudentIds.value.has(s.id)).length;
  return count > 0 && count < filteredStudents.value.length;
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    filteredStudents.value.forEach(s => selectedStudentIds.value.delete(s.id));
  } else {
    filteredStudents.value.forEach(s => selectedStudentIds.value.add(s.id));
  }
  selectedStudentIds.value = new Set(selectedStudentIds.value);
};

const toggleSelectStudent = (id: string) => {
  if (selectedStudentIds.value.has(id)) {
    selectedStudentIds.value.delete(id);
  } else {
    selectedStudentIds.value.add(id);
  }
  selectedStudentIds.value = new Set(selectedStudentIds.value);
};

const selectAllTotal = () => {
  students.value.forEach(s => selectedStudentIds.value.add(s.id));
  selectedStudentIds.value = new Set(selectedStudentIds.value);
};

const clearSelection = () => {
  selectedStudentIds.value = new Set();
};

// Bulk Delete States (Hapus Seleksi / Hapus Semua)
const showBulkDeleteModal = ref(false);
const bulkDeleteTarget = ref<'selected' | 'all'>('selected');
const deletingBulk = ref(false);

const previewSelectedStudents = computed(() => {
  return students.value.filter(s => selectedStudentIds.value.has(s.id)).slice(0, 5);
});

const openBulkDeleteModal = (target: 'selected' | 'all') => {
  bulkDeleteTarget.value = target;
  showBulkDeleteModal.value = true;
};

const closeBulkDeleteModal = () => {
  if (!deletingBulk.value) {
    showBulkDeleteModal.value = false;
  }
};

const executeBulkDelete = async () => {
  deletingBulk.value = true;
  try {
    if (bulkDeleteTarget.value === 'selected') {
      const ids = Array.from(selectedStudentIds.value);
      const count = await dataService.deleteStudents(ids);
      alertMessage.value = `Berhasil menghapus ${count} data siswa terpilih dari DPT.`;
      selectedStudentIds.value = new Set();
    } else {
      const count = await dataService.deleteAllStudents();
      alertMessage.value = `Seluruh data siswa (${count} siswa) berhasil dikosongkan dari DPT.`;
      selectedStudentIds.value = new Set();
    }
    showBulkDeleteModal.value = false;
    await loadData();
  } catch (err: any) {
    console.error('Bulk delete error:', err);
    alert('Gagal menghapus data siswa: ' + (err.message || 'Terjadi kesalahan sistem'));
  } finally {
    deletingBulk.value = false;
  }
};

// PDF Export & Printing States (Cetak Kartu Login & Tabel Presensi)
const showPdfModal = ref(false);
const pdfType = ref<'cards' | 'table'>('cards');
const pdfScope = ref<'all' | 'filtered' | 'selected'>('all');
const pdfSort = ref<'class' | 'name' | 'nisn'>('class');
const generatingPdf = ref(false);

const targetPdfStudents = computed(() => {
  let list: Student[] = [];
  if (pdfScope.value === 'selected') {
    list = students.value.filter(s => selectedStudentIds.value.has(s.id));
  } else if (pdfScope.value === 'filtered') {
    list = [...filteredStudents.value];
  } else {
    list = [...students.value];
  }

  // Sort list
  if (pdfSort.value === 'class') {
    list.sort((a, b) => {
      const classCompare = (a.class_name || '').localeCompare(b.class_name || '', 'id', { numeric: true });
      if (classCompare !== 0) return classCompare;
      return (a.name || '').localeCompare(b.name || '', 'id');
    });
  } else if (pdfSort.value === 'name') {
    list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id'));
  } else if (pdfSort.value === 'nisn') {
    list.sort((a, b) => (a.nisn || '').localeCompare(b.nisn || ''));
  }

  return list;
});

const openPdfModal = (type: 'cards' | 'table' = 'cards', scope?: 'all' | 'filtered' | 'selected') => {
  pdfType.value = type;
  if (scope) {
    pdfScope.value = scope;
  } else if (selectedStudentIds.value.size > 0) {
    pdfScope.value = 'selected';
  } else if (filterClass.value || searchQuery.value || filterStatus.value) {
    pdfScope.value = 'filtered';
  } else {
    pdfScope.value = 'all';
  }
  showPdfModal.value = true;
};

// Excel Import & Export States
const showImportModal = ref(false);
const isDragging = ref(false);
const importFile = ref<File | null>(null);
const importProcessing = ref(false);
const importError = ref('');
const fileInputRef = ref<HTMLInputElement | null>(null);

// Multi-sheet and Column mapping states
const availableSheets = ref<string[]>([]);
const selectedSheet = ref<string>('');
const detectedHeaders = ref<string[]>([]);
const rawSheetRows = ref<any[][]>([]);
const sheetRawRowsCount = ref(0);
const autoDetectedSuccess = ref(false);

const columnMapping = ref({
  nisn: '',
  name: '',
  birth_date: '',
  class_name: '',
});

const parsedStudents = ref<
  Array<{
    nisn: string;
    name: string;
    birth_date: string;
    class_name: string;
    isDuplicate: boolean;
    isValid: boolean;
  }>
>([]);
const updateExisting = ref(false);
const detectedNewClasses = ref<string[]>([]);

// In-modal success summary
const importSuccessResult = ref<{
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  createdClasses: string[];
} | null>(null);

const validRowsCount = computed(() => parsedStudents.value.filter(s => s.isValid).length);
const duplicateCount = computed(() => parsedStudents.value.filter(s => s.isValid && s.isDuplicate).length);

const form = ref({
  nisn: '',
  name: '',
  birth_date: '',
  class_name: '',
  has_voted: false,
});

const filteredStudents = computed(() => {
  return students.value.filter(s => {
    // Search
    const q = searchQuery.value.toLowerCase().trim();
    const matchSearch = !q || s.nisn.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);

    // Class
    const matchClass = !filterClass.value || s.class_name === filterClass.value;

    // Status
    let matchStatus = true;
    if (filterStatus.value === 'voted') matchStatus = s.has_voted;
    if (filterStatus.value === 'not_voted') matchStatus = !s.has_voted;

    return matchSearch && matchClass && matchStatus;
  });
});

const formatDate = (dStr?: string) => {
  if (!dStr) return '-';
  try {
    const d = new Date(dStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dStr;
  }
};

const formatIndonesianDate = (dStr?: string) => {
  if (!dStr) return '-';
  try {
    const d = new Date(dStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dStr;
  }
};

const loadData = async () => {
  loading.value = true;
  try {
    const [studs, cls, sett] = await Promise.all([
      dataService.getStudents(),
      dataService.getClasses(),
      dataService.getSettings(),
    ]);
    students.value = studs;
    classes.value = cls;
    schoolSettings.value = sett;

    // Bersihkan ID seleksi yang sudah tidak ada
    const currentIdSet = new Set(studs.map(s => s.id));
    const nextSelected = new Set<string>();
    selectedStudentIds.value.forEach(id => {
      if (currentIdSet.has(id)) nextSelected.add(id);
    });
    selectedStudentIds.value = nextSelected;
  } finally {
    loading.value = false;
  }
};

const downloadPdf = async () => {
  if (generatingPdf.value || targetPdfStudents.value.length === 0) return;
  generatingPdf.value = true;

  // Berikan jeda sejenak agar animasi loading spinner tampil
  await new Promise(r => setTimeout(r, 60));

  try {
    const schoolName = schoolSettings.value?.school_name || 'SMP Negeri 3 Widodaren';
    const agendaTitle = schoolSettings.value?.agenda_title || 'Pemilihan Ketua & Wakil Ketua OSIS';
    const period = schoolSettings.value?.election_period || '2026/2027';
    const studentList = targetPdfStudents.value;

    if (pdfType.value === 'cards') {
      generatePdfCards(studentList, schoolName, agendaTitle, period);
    } else {
      generatePdfTable(studentList, schoolName, agendaTitle, period);
    }

    showPdfModal.value = false;
    alertMessage.value = `Berhasil mengunduh dokumen PDF (${studentList.length} siswa). Siap dicetak untuk panitia dan siswa.`;
  } catch (err: any) {
    console.error('PDF Generation Error:', err);
    alert('Gagal membuat PDF: ' + (err.message || 'Terjadi kesalahan sistem'));
  } finally {
    generatingPdf.value = false;
  }
};

const generatePdfCards = (
  studentList: Student[],
  schoolName: string,
  agendaTitle: string,
  period: string
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const cardsPerPage = 8;
  const cardWidth = 92;
  const cardHeight = 64;
  const marginLeft = 9;
  const marginTop = 10;
  const gutterX = 8;
  const gutterY = 4;

  for (let i = 0; i < studentList.length; i++) {
    const s = studentList[i];
    const indexOnPage = i % cardsPerPage;

    if (i > 0 && indexOnPage === 0) {
      doc.addPage();
    }

    const col = indexOnPage % 2;
    const row = Math.floor(indexOnPage / 2);

    const x = marginLeft + col * (cardWidth + gutterX);
    const y = marginTop + row * (cardHeight + gutterY);

    // 1. Garis potong putus-putus
    doc.setDrawColor(180, 195, 215);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.setLineWidth(0.25);
    doc.rect(x, y, cardWidth, cardHeight);

    // 2. Ikon & teks gunting
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(140, 150, 165);
    doc.text('✂ potong', x + 1, y - 0.7);

    // 3. Header Card
    doc.setLineDashPattern([], 0);
    doc.setFillColor(238, 244, 255);
    doc.rect(x + 0.3, y + 0.3, cardWidth - 0.6, 13.5, 'F');

    // Garis pemisah header
    doc.setDrawColor(205, 220, 245);
    doc.setLineWidth(0.3);
    doc.line(x, y + 13.8, x + cardWidth, y + 13.8);

    // Nama Sekolah
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(20, 40, 80);
    doc.text(schoolName.toUpperCase(), x + cardWidth / 2, y + 5, { align: 'center' });

    // Sub-header Kartu
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(37, 99, 235);
    doc.text(`KARTU LOGIN PEMILIH DPT - OSIS ${period}`, x + cardWidth / 2, y + 9.2, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.8);
    doc.setTextColor(100, 115, 135);
    doc.text(agendaTitle, x + cardWidth / 2, y + 12.4, { align: 'center' });

    // 4. Identitas Siswa
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.2);
    doc.setTextColor(100, 115, 130);
    doc.text('NAMA PEMILIH:', x + 4, y + 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const cleanName = (s.name || '').length > 27 ? (s.name || '').substring(0, 25) + '...' : (s.name || '-');
    doc.text(cleanName, x + 4, y + 22.5);

    // Badge Kelas
    doc.setFillColor(240, 244, 255);
    doc.roundedRect(x + cardWidth - 25, y + 18, 21, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(30, 64, 175);
    doc.text(s.class_name || '-', x + cardWidth - 14.5, y + 21.6, { align: 'center' });

    // 5. Box Akun Login (NIS & Tanggal Lahir)
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(220, 230, 242);
    doc.setLineWidth(0.3);
    doc.roundedRect(x + 4, y + 25.5, cardWidth - 8, 17, 1.5, 1.5, 'FD');

    // Pemisah kolom kredensial
    doc.line(x + (cardWidth / 2), y + 26.5, x + (cardWidth / 2), y + 41.5);

    // Kolom Kiri: NIS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(100, 115, 130);
    doc.text('NIS (ID LOGIN):', x + 6.5, y + 29.5);

    doc.setFont('courier', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(s.nisn || '-', x + 6.5, y + 35);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.6);
    doc.setTextColor(120, 130, 145);
    doc.text('4 Digit NIS Siswa', x + 6.5, y + 39.5);

    // Kolom Kanan: Tanggal Lahir (Password)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(100, 115, 130);
    doc.text('PASSWORD (TGL LAHIR):', x + (cardWidth / 2) + 3, y + 29.5);

    doc.setFont('courier', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(s.birth_date || '-', x + (cardWidth / 2) + 3, y + 35);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.6);
    doc.setTextColor(120, 130, 145);
    doc.text(formatIndonesianDate(s.birth_date), x + (cardWidth / 2) + 3, y + 39.5);

    // 6. Petunjuk & Status Bar
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(4.6);
    doc.setTextColor(90, 105, 125);
    doc.text('Petunjuk: Akses eOSIS -> Ketik NIS & Tanggal Lahir -> Tentukan Pilihan.', x + 4, y + 46.5);

    // Paraf & Status
    doc.setDrawColor(225, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(x + 4, y + 49, x + cardWidth - 4, y + 49);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(100, 116, 139);
    doc.text('Status: ' + (s.has_voted ? 'SUDAH MEMILIH' : 'BELUM MEMILIH'), x + 4, y + 54);

    doc.text('Paraf Saksi:', x + cardWidth - 27, y + 53);
    doc.setLineDashPattern([0.8, 0.8], 0);
    doc.rect(x + cardWidth - 27, y + 54.5, 23, 6);
    doc.setLineDashPattern([], 0);
  }

  const cleanPeriod = (period || '2026-2027').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Kartu_Login_DPT_OSIS_${cleanPeriod}.pdf`);
};

const generatePdfTable = (
  studentList: Student[],
  schoolName: string,
  agendaTitle: string,
  period: string
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Kop Surat Resmi
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(20, 30, 50);
  doc.text(schoolName.toUpperCase(), 105, 13, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(37, 99, 235);
  doc.text('DAFTAR PEMILIH TETAP (DPT) & LEMBAR PRESENSI SISWA', 105, 18.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 80, 95);
  doc.text(`${agendaTitle} — Periode ${period}`, 105, 23.5, { align: 'center' });

  // Double Divider Line
  doc.setLineWidth(0.5);
  doc.setDrawColor(30, 50, 90);
  doc.line(14, 26, 196, 26);
  doc.setLineWidth(0.2);
  doc.line(14, 27, 196, 27);

  // Meta info
  const dateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(40, 50, 65);
  doc.text(`Total DPT: ${studentList.length} Siswa`, 14, 32);

  doc.setFont('helvetica', 'normal');
  doc.text(`Dicetak pada: ${dateStr}`, 196, 32, { align: 'right' });

  // Table Data
  const tableData = studentList.map((s, idx) => [
    idx + 1,
    s.nisn,
    s.name,
    s.class_name,
    s.birth_date,
    s.has_voted ? 'Sudah Memilih' : 'Belum Memilih',
    '', // Paraf Siswa / Saksi
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['No', 'NIS (ID Login)', 'Nama Lengkap Siswa', 'Kelas', 'Tgl Lahir (Password)', 'Status Suara', 'Paraf Kehadiran']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', fontStyle: 'bold', cellWidth: 26 },
      2: { halign: 'left', fontStyle: 'bold' },
      3: { halign: 'center', cellWidth: 18 },
      4: { halign: 'center', cellWidth: 26 },
      5: { halign: 'center', cellWidth: 25 },
      6: { halign: 'center', cellWidth: 28 },
    },
    didDrawPage: (data) => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(140, 150, 160);
      doc.text(
        `Halaman ${data.pageNumber} dari ${pageCount} — Dokumen DPT Resmi eOSIS ${schoolName}`,
        105,
        290,
        { align: 'center' }
      );
    },
  });

  const cleanPeriod = (period || '2026-2027').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Daftar_DPT_OSIS_${cleanPeriod}.pdf`);
};

const openAddModal = () => {
  isEditing.value = false;
  currentId.value = '';
  form.value = {
    nisn: '',
    name: '',
    birth_date: '2010-01-01',
    class_name: classes.value[0]?.name || '',
    has_voted: false,
  };
  showModal.value = true;
};

const openEditModal = (s: Student) => {
  isEditing.value = true;
  currentId.value = s.id;
  form.value = {
    nisn: s.nisn,
    name: s.name,
    birth_date: s.birth_date,
    class_name: s.class_name,
    has_voted: s.has_voted,
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveStudent = async () => {
  saving.value = true;
  try {
    const selectedClass = classes.value.find(c => c.name === form.value.class_name);
    if (isEditing.value) {
      await dataService.updateStudent(currentId.value, {
        nisn: form.value.nisn.trim(),
        name: form.value.name.trim(),
        birth_date: form.value.birth_date,
        class_id: selectedClass?.id || null,
        class_name: form.value.class_name,
        has_voted: form.value.has_voted,
      });
      alertMessage.value = `Data siswa ${form.value.name} berhasil diperbarui.`;
    } else {
      await dataService.addStudent({
        nisn: form.value.nisn.trim(),
        name: form.value.name.trim(),
        birth_date: form.value.birth_date,
        class_id: selectedClass?.id || null,
        class_name: form.value.class_name,
      });
      alertMessage.value = `Siswa ${form.value.name} berhasil ditambahkan ke DPT.`;
    }
    closeModal();
    await loadData();
  } catch (e: any) {
    alert('Terjadi kesalahan: ' + e.message);
  } finally {
    saving.value = false;
  }
};

const resetVote = async (s: Student) => {
  if (confirm(`Reset status hak suara ${s.name}? Siswa ini akan dapat memilih kembali.`)) {
    await dataService.resetStudentVote(s.id);
    alertMessage.value = `Status hak suara ${s.name} berhasil di-reset menjadi Belum Memilih.`;
    await loadData();
  }
};

const promptDelete = (s: Student) => {
  studentToDelete.value = s;
};

const confirmDelete = async () => {
  if (!studentToDelete.value) return;
  try {
    await dataService.deleteStudent(studentToDelete.value.id);
    alertMessage.value = `Siswa ${studentToDelete.value.name} berhasil dihapus.`;
    studentToDelete.value = null;
    await loadData();
  } catch (e: any) {
    alert('Gagal menghapus: ' + e.message);
  }
};

const generateDemoStudents = async () => {
  const sampleNames = [
    'Naufal Rizky', 'Tiara Andini', 'Bima Sakti', 'Putri Ayu',
    'Rian Ardianto', 'Siti Fatimah', 'Zaki Mubarak', 'Aulia Rahma'
  ];
  const classesList = classes.value.length > 0 ? classes.value : [{ id: 'c1', name: 'VII A' }];

  const newOnes = sampleNames.map((name, i) => {
    const randomClass = classesList[i % classesList.length];
    const pad = String(10 + i).padStart(2, '0');
    return {
      nisn: `10${pad}`,
      name,
      birth_date: `2010-0${(i % 9) + 1}-1${i + 2}`,
      class_id: randomClass.id,
      class_name: randomClass.name,
    };
  });

  const count = await dataService.bulkAddStudents(newOnes);
  alertMessage.value = `${count} data siswa contoh berhasil ditambahkan ke DPT.`;
  await loadData();
};

// ==========================================
// EXCEL TEMPLATE DOWNLOAD & EXPORT
// ==========================================
const downloadExcelTemplate = () => {
  try {
    const wb = XLSX.utils.book_new();

    // 1. Sheet Template Input Siswa
    const class1 = classes.value[0]?.name || 'VII A';
    const class2 = classes.value[1]?.name || 'VII B';
    const class3 = classes.value[2]?.name || 'VIII A';

    const sampleRows = [
      {
        'No': 1,
        'NIS': '1001',
        'Nama Lengkap': 'Ahmad Fauzi',
        'Tanggal Lahir': '2011-03-15',
        'Kelas': class1,
      },
      {
        'No': 2,
        'NIS': '1002',
        'Nama Lengkap': 'Dewi Lestari',
        'Tanggal Lahir': '2011-06-20',
        'Kelas': class1,
      },
      {
        'No': 3,
        'NIS': '1003',
        'Nama Lengkap': 'Budi Setiawan',
        'Tanggal Lahir': '2010-09-12',
        'Kelas': class2,
      },
      {
        'No': 4,
        'NIS': '1004',
        'Nama Lengkap': 'Siti Nurhaliza',
        'Tanggal Lahir': '2010-12-05',
        'Kelas': class2,
      },
      {
        'No': 5,
        'NIS': '1005',
        'Nama Lengkap': 'Rizky Pratama',
        'Tanggal Lahir': '2010-04-18',
        'Kelas': class3,
      },
    ];

    const wsTemplate = XLSX.utils.json_to_sheet(sampleRows);
    wsTemplate['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 30 },
      { wch: 18 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, wsTemplate, 'Format Input Siswa');

    // 2. Sheet Petunjuk & Daftar Kelas
    const guideRows = [
      { 'Petunjuk Pengisian Format Excel Siswa eOSIS': 'PETUNJUK PENGISIAN DATA SISWA / DPT:' },
      { 'Petunjuk Pengisian Format Excel Siswa eOSIS': '1. Kolom No: Nomor urut (opsional).' },
      { 'Petunjuk Pengisian Format Excel Siswa eOSIS': '2. Kolom NIS: Wajib diisi 4 angka unik siswa (Contoh: 1001). NIS digunakan siswa untuk login akun pemilihan.' },
      { 'Petunjuk Pengisian Format Excel Siswa eOSIS': '3. Kolom Nama Lengkap: Wajib diisi nama lengkap siswa.' },
      { 'Petunjuk Pengisian Format Excel Siswa eOSIS': '4. Kolom Tanggal Lahir: Format YYYY-MM-DD (Contoh: 2011-03-15) atau tanggal standar Excel. Digunakan siswa sebagai verifikasi login.' },
      { 'Petunjuk Pengisian Format Excel Siswa eOSIS': '5. Kolom Kelas: Nama kelas/rombel siswa (Contoh: VII A, VIII B, dll). Jika kelas belum ada di sistem, otomatis akan dibuatkan saat impor.' },
      { 'Petunjuk Pengisian Format Excel Siswa eOSIS': '' },
      { 'Petunjuk Pengisian Format Excel Siswa eOSIS': 'DAFTAR KELAS AKTIF SAAT INI DI SISTEM:' },
      ...(classes.value.length > 0
        ? classes.value.map(c => ({ 'Petunjuk Pengisian Format Excel Siswa eOSIS': `• ${c.name}` }))
        : [{ 'Petunjuk Pengisian Format Excel Siswa eOSIS': '• VII A, VII B, VIII A, VIII B, IX A (Contoh)' }]),
    ];
    const wsGuide = XLSX.utils.json_to_sheet(guideRows);
    wsGuide['!cols'] = [{ wch: 75 }];
    XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk & Kelas');

    XLSX.writeFile(wb, 'Format_Input_Data_Siswa_DPT.xlsx');
  } catch (err: any) {
    alert('Gagal mendownload template Excel: ' + err.message);
  }
};

const exportStudentsToExcel = () => {
  if (students.value.length === 0) {
    alert('Belum ada data siswa dalam DPT untuk diexport.');
    return;
  }
  try {
    const wb = XLSX.utils.book_new();
    const rows = students.value.map((s, idx) => ({
      'No': idx + 1,
      'NIS': s.nisn,
      'Nama Lengkap': s.name,
      'Tanggal Lahir': s.birth_date,
      'Kelas': s.class_name,
      'Status Hak Suara': s.has_voted ? 'Sudah Memilih' : 'Belum Memilih',
      'Waktu Memilih': s.voted_at || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 30 },
      { wch: 18 },
      { wch: 15 },
      { wch: 18 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'DPT Siswa');
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Data_DPT_Siswa_SMPN3Widodaren_${dateStr}.xlsx`);
  } catch (err: any) {
    alert('Gagal mengekspor data ke Excel: ' + err.message);
  }
};

// ==========================================
// EXCEL IMPORT WORKFLOW
// ==========================================
const openImportModal = () => {
  resetImportState();
  showImportModal.value = true;
};

const closeImportModal = () => {
  if (importProcessing.value) return;
  resetImportState();
  showImportModal.value = false;
};

let currentWorkbook: XLSX.WorkBook | null = null;

const resetImportState = () => {
  importFile.value = null;
  currentWorkbook = null;
  availableSheets.value = [];
  selectedSheet.value = '';
  detectedHeaders.value = [];
  rawSheetRows.value = [];
  sheetRawRowsCount.value = 0;
  autoDetectedSuccess.value = false;
  columnMapping.value = {
    nisn: '',
    name: '',
    birth_date: '',
    class_name: '',
  };
  parsedStudents.value = [];
  detectedNewClasses.value = [];
  updateExisting.value = false;
  importError.value = '';
  importSuccessResult.value = null;
  isDragging.value = false;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const resetImportFile = () => {
  resetImportState();
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const onFileInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    handleFile(target.files[0]);
  }
};

const onFileDrop = (e: DragEvent) => {
  isDragging.value = false;
  if (e.dataTransfer && e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const parseExcelDate = (val: any): string => {
  if (val === null || val === undefined || val === '') return '2010-01-01';
  if (typeof val === 'number') {
    // Excel serial date code
    const utc_days = Math.floor(val - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    const y = date_info.getUTCFullYear();
    const m = String(date_info.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date_info.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  const ddmmyyyy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (ddmmyyyy) {
    const d = ddmmyyyy[1].padStart(2, '0');
    const m = ddmmyyyy[2].padStart(2, '0');
    const y = ddmmyyyy[3];
    return `${y}-${m}-${d}`;
  }
  const yyyymmdd = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (yyyymmdd) {
    const y = yyyymmdd[1];
    const m = yyyymmdd[2].padStart(2, '0');
    const d = yyyymmdd[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const ID_MONTHS: Record<string, string> = {
    januari: '01', jan: '01',
    februari: '02', feb: '02', pebruari: '02',
    maret: '03', mar: '03',
    april: '04', apr: '04',
    mei: '05', may: '05',
    juni: '06', jun: '06',
    juli: '07', jul: '07',
    agustus: '08', ags: '08', agu: '08', aug: '08',
    september: '09', sep: '09', sept: '09',
    oktober: '10', okt: '10', oct: '10',
    november: '11', nopember: '11', nov: '11',
    desember: '12', des: '12', dec: '12',
  };
  const indonesianMatch = str.match(/^(\d{1,2})[\s\-\/\.\,]+([a-zA-Z]+)[\s\-\/\.\,]+(\d{4})$/);
  if (indonesianMatch) {
    const d = indonesianMatch[1].padStart(2, '0');
    const mKey = indonesianMatch[2].toLowerCase();
    const m = ID_MONTHS[mKey] || '01';
    const y = indonesianMatch[3];
    return `${y}-${m}-${d}`;
  }
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    const dateObj = new Date(parsed);
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return '2010-01-01';
};

const parseNisn = (val: any): string => {
  if (val === null || val === undefined || val === '') return '';
  let str = String(val).trim();
  if (/^[0-9]+(\.[0-9]+)?[eE]\+?[0-9]+$/.test(str)) {
    try {
      str = BigInt(Math.round(Number(str))).toString();
    } catch {
      str = Number(str).toFixed(0);
    }
  }
  if (str.endsWith('.0')) {
    str = str.slice(0, -2);
  }
  str = str.replace(/[^0-9]/g, '');
  if (str.length > 0 && str.length < 4) {
    str = str.padStart(4, '0');
  } else if (str.length > 4) {
    str = str.slice(0, 4);
  }
  return str;
};

const handleFile = (file: File) => {
  const validExtensions = ['.xlsx', '.xls', '.csv'];
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!validExtensions.includes(ext)) {
    alert('File harus berupa dokumen spreadsheet Excel (.xlsx, .xls) atau .csv.');
    return;
  }

  resetImportState();
  importFile.value = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const buffer = e.target?.result;
      const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
      currentWorkbook = wb;
      availableSheets.value = wb.SheetNames;

      // Find the most appropriate sheet
      let bestSheet = wb.SheetNames[0];
      const studentSheet = wb.SheetNames.find(name => {
        const lower = name.toLowerCase();
        return lower.includes('siswa') || lower.includes('dpt') || lower.includes('format') || lower.includes('data');
      });
      if (studentSheet) {
        bestSheet = studentSheet;
      }

      selectedSheet.value = bestSheet;
      parseCurrentSheet();
    } catch (err: any) {
      importError.value = 'Gagal memproses file Excel: ' + (err.message || 'Format tidak valid');
    }
  };
  reader.onerror = () => {
    importError.value = 'Terjadi kesalahan saat membaca file dari komputer.';
  };
  reader.readAsArrayBuffer(file);
};

const onSheetChange = () => {
  parseCurrentSheet();
};

const parseCurrentSheet = () => {
  if (!currentWorkbook || !selectedSheet.value) return;
  importError.value = '';
  const ws = currentWorkbook.Sheets[selectedSheet.value];
  if (!ws) {
    importError.value = `Lembar kerja "${selectedSheet.value}" tidak ditemukan.`;
    return;
  }

  const rawAOA: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (!rawAOA || rawAOA.length === 0) {
    importError.value = `Lembar kerja "${selectedSheet.value}" kosong atau tidak memiliki data.`;
    detectedHeaders.value = [];
    rawSheetRows.value = [];
    parsedStudents.value = [];
    sheetRawRowsCount.value = 0;
    return;
  }

  // Find header row by scoring rows 0 to min(25, length)
  let bestHeaderRowIdx = 0;
  let maxScore = -1;

  const maxScan = Math.min(25, rawAOA.length);
  for (let r = 0; r < maxScan; r++) {
    const row = rawAOA[r] || [];
    let score = 0;
    for (const cell of row) {
      const txt = String(cell || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (txt === 'nis') score += 10;
      else if (txt === 'nisn' || txt === 'noinduk' || txt === 'nomorinduk') score += 10;
      if (txt.includes('nama') || txt.includes('student') || txt.includes('peserta')) score += 8;
      if (txt.includes('kelas') || txt.includes('rombel') || txt.includes('tingkat')) score += 5;
      if (txt.includes('lahir') || txt.includes('tgl') || txt.includes('birth')) score += 5;
      if (txt === 'no' || txt === 'nomor') score += 1;
    }
    if (score > maxScore) {
      maxScore = score;
      bestHeaderRowIdx = r;
    }
  }

  const headerRow = rawAOA[bestHeaderRowIdx] || [];
  const headers: string[] = [];
  for (let c = 0; c < headerRow.length; c++) {
    const h = String(headerRow[c] || '').trim();
    headers.push(h || `Kolom_${c + 1}`);
  }
  detectedHeaders.value = headers;

  // Data rows are after the header row
  const dataRows = rawAOA.slice(bestHeaderRowIdx + 1).filter(r => {
    // Filter out completely blank rows
    return r && r.some((cell: any) => cell !== '' && cell !== null && cell !== undefined);
  });
  rawSheetRows.value = dataRows;
  sheetRawRowsCount.value = dataRows.length;

  // Auto-detect columns
  autoDetectColumns(headers);

  // Reprocess rows
  reprocessCurrentRows();
};

const autoDetectColumns = (headers: string[]) => {
  let matchedNisn = '';
  let matchedName = '';
  let matchedBirth = '';
  let matchedClass = '';

  for (const h of headers) {
    const clean = h.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!clean) continue;

    // NIS detection
    if (!matchedNisn) {
      if (clean === 'nis') {
        matchedNisn = h;
      } else if (
        (clean === 'nisn' || clean === 'noinduk' || clean === 'nomorinduk' || clean === 'nik' || clean === 'idsiswa') &&
        clean !== 'no' && clean !== 'nomor' && clean !== 'nourut'
      ) {
        matchedNisn = h;
      }
    }

    // Name detection
    if (!matchedName) {
      if (clean === 'namalengkap' || clean === 'namasiswa' || clean === 'namapesertadidik' || clean === 'nama') {
        matchedName = h;
      } else if (clean.includes('nama') && !clean.includes('ayah') && !clean.includes('ibu') && !clean.includes('wali') && !clean.includes('ortu') && !clean.includes('sekolah')) {
        matchedName = h;
      } else if (clean === 'studentname' || clean === 'fullname' || clean === 'name') {
        matchedName = h;
      }
    }

    // Birth Date detection
    if (!matchedBirth) {
      if (clean === 'tanggallahir' || clean === 'tgllahir' || clean === 'tgllhr' || clean === 'birthdate' || clean === 'dob') {
        matchedBirth = h;
      } else if ((clean.includes('tgl') || clean.includes('lahir') || clean.includes('tanggal')) && !clean.includes('tempat')) {
        matchedBirth = h;
      }
    }

    // Class detection
    if (!matchedClass) {
      if (clean === 'kelas' || clean === 'rombel' || clean === 'rombonganbelajar' || clean === 'tingkat' || clean === 'class') {
        matchedClass = h;
      } else if (clean.includes('kelas') || clean.includes('rombel')) {
        matchedClass = h;
      }
    }
  }

  columnMapping.value = {
    nisn: matchedNisn,
    name: matchedName,
    birth_date: matchedBirth,
    class_name: matchedClass,
  };

  autoDetectedSuccess.value = !!(matchedNisn && matchedName);
};

const reprocessCurrentRows = () => {
  const headers = detectedHeaders.value;
  const rows = rawSheetRows.value;

  if (rows.length === 0) {
    parsedStudents.value = [];
    return;
  }

  const nisnIdx = headers.indexOf(columnMapping.value.nisn);
  const nameIdx = headers.indexOf(columnMapping.value.name);
  const birthIdx = columnMapping.value.birth_date ? headers.indexOf(columnMapping.value.birth_date) : -1;
  const classIdx = columnMapping.value.class_name ? headers.indexOf(columnMapping.value.class_name) : -1;

  const existingNisns = new Set(students.value.map(s => s.nisn.trim()));
  const existingClassNames = new Set(classes.value.map(c => c.name.trim().toLowerCase()));
  const newClassesSet = new Set<string>();

  const results: Array<{
    nisn: string;
    name: string;
    birth_date: string;
    class_name: string;
    isDuplicate: boolean;
    isValid: boolean;
  }> = [];

  for (const r of rows) {
    const rawNisn = nisnIdx !== -1 ? r[nisnIdx] : '';
    const rawName = nameIdx !== -1 ? r[nameIdx] : '';
    const rawDate = birthIdx !== -1 ? r[birthIdx] : '';
    const rawClass = classIdx !== -1 ? r[classIdx] : '';

    const nisn = parseNisn(rawNisn);
    const name = String(rawName || '').trim();
    const birth_date = parseExcelDate(rawDate);
    const class_name = String(rawClass || '').trim() || (classes.value[0]?.name || 'VII A');

    const isValid = !!nisn && !!name;
    const isDuplicate = existingNisns.has(nisn);

    if (isValid && class_name && !existingClassNames.has(class_name.toLowerCase())) {
      newClassesSet.add(class_name);
    }

    results.push({
      nisn,
      name,
      birth_date,
      class_name,
      isDuplicate,
      isValid,
    });
  }

  parsedStudents.value = results;
  detectedNewClasses.value = Array.from(newClassesSet);
};

const executeImport = async () => {
  const validList = parsedStudents.value
    .filter(s => s.isValid)
    .map(s => ({
      nisn: s.nisn,
      name: s.name,
      birth_date: s.birth_date,
      class_name: s.class_name,
    }));

  if (validList.length === 0) {
    alert('Tidak ada data siswa yang valid untuk diimpor. Pastikan kolom NIS dan Nama Siswa sudah dipilih dengan benar.');
    return;
  }

  importProcessing.value = true;
  importError.value = '';

  try {
    const result = await dataService.importStudents(validList, updateExisting.value);
    importSuccessResult.value = result;

    let msg = `Berhasil mengimpor ${result.inserted} siswa baru ke DPT.`;
    if (result.updated > 0) {
      msg += ` Memperbarui ${result.updated} data siswa.`;
    }
    if (result.skipped > 0 && !updateExisting.value) {
      msg += ` Melewati ${result.skipped} siswa yang sudah terdaftar.`;
    }
    if (result.createdClasses.length > 0) {
      msg += ` Membuat ${result.createdClasses.length} kelas baru (${result.createdClasses.join(', ')}).`;
    }

    alertMessage.value = msg;
    await loadData();
  } catch (err: any) {
    console.error('Import error:', err);
    importError.value = 'Gagal mengimpor data: ' + (err.message || 'Terjadi kesalahan sistem');
  } finally {
    importProcessing.value = false;
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
