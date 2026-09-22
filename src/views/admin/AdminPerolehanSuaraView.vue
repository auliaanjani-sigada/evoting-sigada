<template>
  <div id="admin-perolehan-suara-view">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <h3 class="fw-bold text-dark mb-0">Hasil Perolehan Suara</h3>
          <span class="badge bg-danger rounded-pill px-2.5 py-1 animate-pulse">
            <i class="bi bi-broadcast me-1"></i>Live Tabulasi
          </span>
        </div>
        <p class="text-muted mb-0">Tabulasi real-time perolehan suara {{ settings?.agenda_title || 'Pemilihan OSIS' }} Periode {{ settings?.election_period }}</p>
      </div>

      <div class="d-flex flex-wrap align-items-center gap-2">
        <!-- Auto Refresh Toggle -->
        <div class="form-check form-switch bg-white px-3 py-1.5 rounded-pill shadow-xs border d-flex align-items-center gap-2 m-0">
          <input
            class="form-check-input ms-0"
            type="checkbox"
            role="switch"
            id="switchAutoRefresh"
            v-model="autoRefresh"
          />
          <label class="form-check-label fs-8 fw-semibold text-muted" for="switchAutoRefresh">
            Auto Refresh (5s)
          </label>
        </div>

        <button
          @click="loadResults"
          class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold d-flex align-items-center gap-1.5"
          :disabled="loading"
        >
          <i class="bi bi-arrow-clockwise" :class="{ 'spin': loading }"></i>
          <span>Perbarui</span>
        </button>

        <button
          @click="downloadPdfReport"
          class="btn btn-sm btn-primary rounded-pill px-3.5 py-1.5 fw-semibold d-flex align-items-center gap-2 shadow-sm"
          :disabled="downloadingPdf || loading"
          id="btn-download-rekap-pdf"
        >
          <span v-if="downloadingPdf" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <i v-else class="bi bi-file-earmark-pdf-fill"></i>
          <span>{{ downloadingPdf ? 'Menyiapkan PDF...' : 'Download Rekap Suara' }}</span>
        </button>
      </div>
    </div>

    <!-- Summary Stats Header -->
    <div class="row g-3 mb-4">
      <div class="col-sm-4">
        <div class="card border-0 shadow-sm rounded-4 p-3.5 bg-primary text-white">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="text-white-50 fs-8 fw-bold text-uppercase">Total Suara Masuk</span>
            <i class="bi bi-inboxes-fill fs-4 text-white-50"></i>
          </div>
          <h2 class="fw-bold mb-0">{{ totalVotes }}</h2>
          <small class="text-white-50 fs-8">Dari {{ stats.totalStudents }} hak suara terdaftar</small>
        </div>
      </div>

      <div class="col-sm-4">
        <div class="card border-0 shadow-sm rounded-4 p-3.5 bg-white">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="text-muted fs-8 fw-bold text-uppercase">Tingkat Partisipasi</span>
            <i class="bi bi-pie-chart-fill fs-4 text-success"></i>
          </div>
          <h2 class="fw-bold text-success mb-0">{{ stats.turnoutPercentage }}%</h2>
          <small class="text-muted fs-8">{{ stats.votedStudents }} siswa telah memilih</small>
        </div>
      </div>

      <div class="col-sm-4">
        <div class="card border-0 shadow-sm rounded-4 p-3.5 bg-white">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="text-muted fs-8 fw-bold text-uppercase">Suara Belum Digunakan</span>
            <i class="bi bi-hourglass-split fs-4 text-danger"></i>
          </div>
          <h2 class="fw-bold text-danger mb-0">{{ stats.notVotedStudents }}</h2>
          <small class="text-muted fs-8">Siswa belum memberikan suara</small>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row g-4 mb-4">
      <!-- Bar Chart -->
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
          <h5 class="fw-bold text-dark mb-1">Grafik Perbandingan Suara</h5>
          <p class="text-muted small mb-3">Diagram batang perolehan suara masing-masing pasangan calon</p>
          <div class="chart-container position-relative" style="height: 280px;">
            <canvas ref="barCanvasRef"></canvas>
          </div>
        </div>
      </div>

      <!-- Doughnut Chart -->
      <div class="col-lg-5">
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
          <h5 class="fw-bold text-dark mb-1">Persentase Proporsi Suara</h5>
          <p class="text-muted small mb-3">Distribusi perolehan suara total</p>
          <div class="chart-container position-relative d-flex align-items-center justify-content-center" style="height: 280px;">
            <canvas ref="pieCanvasRef"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Table of Results -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
      <div class="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center justify-content-between">
        <h5 class="fw-bold mb-0 text-dark">Tabel Rincian Hasil Perolehan Suara</h5>
        <span class="badge bg-secondary-subtle text-secondary fs-8">Urut berdasarkan Nomor Paslon</span>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="px-4 py-3 text-muted text-uppercase fs-8" style="width: 110px;">Nomor Urut</th>
              <th scope="col" class="py-3 text-muted text-uppercase fs-8">Pasangan Calon</th>
              <th scope="col" class="py-3 text-muted text-uppercase fs-8 text-center" style="width: 140px;">Total Suara</th>
              <th scope="col" class="py-3 text-muted text-uppercase fs-8" style="min-width: 200px;">Persentase Suara</th>
              <th scope="col" class="px-4 py-3 text-muted text-uppercase fs-8 text-end" style="width: 140px;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="res in results" :key="res.candidate_id">
              <td class="px-4">
                <span class="badge bg-primary text-white fs-6 fw-bold px-3 py-1.5 rounded-pill shadow-xs">
                  0{{ res.candidate_number }}
                </span>
              </td>
              <td>
                <div class="d-flex align-items-center gap-3">
                  <img
                    :src="res.photo_url || defaultAvatar"
                    class="rounded-circle object-fit-cover shadow-xs"
                    style="width: 44px; height: 44px;"
                    @error="onPhotoError($event)"
                  />
                  <div>
                    <div class="fw-bold text-dark fs-6">{{ res.leader_name }}</div>
                    <small class="text-muted">Wakil: {{ res.vice_leader_name }}</small>
                  </div>
                </div>
              </td>
              <td class="text-center">
                <span class="fw-bold fs-5 text-dark font-monospace">{{ res.total_votes }}</span>
                <small class="text-muted d-block fs-8">Suara Sah</small>
              </td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="progress flex-grow-1 rounded-pill" style="height: 10px;">
                    <div
                      class="progress-bar bg-primary"
                      role="progressbar"
                      :style="{ width: `${res.percentage}%` }"
                      :aria-valuenow="res.percentage"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <span class="fw-bold text-dark fs-7 font-monospace" style="width: 50px;">
                    {{ res.percentage }}%
                  </span>
                </div>
              </td>
              <td class="px-4 text-end">
                <span
                  v-if="isHighest(res)"
                  class="badge bg-warning text-dark border border-warning px-2.5 py-1.5 rounded-pill fw-bold"
                >
                  <i class="bi bi-trophy-fill me-1"></i>Unggul
                </span>
                <span v-else class="badge bg-light text-muted border px-2.5 py-1 rounded-pill fs-8">
                  Kandidat
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Asas Rahasia Information Note -->
    <div class="alert alert-light border shadow-xs rounded-4 p-3 text-muted small d-flex align-items-center gap-3">
      <div class="bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center">
        <i class="bi bi-shield-check fs-5"></i>
      </div>
      <div>
        <strong>Jaminan Kerahasiaan Pilihan (Secret Ballot):</strong>
        Aplikasi eOSIS tidak pernah mengaitkan data identitas siswa pemilih dengan pilihan kandidat tertentu di dalam database. Panitia dan administrator hanya berwenang melihat total akumulasi suara yang sah.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { dataService } from '../../services/dataService';
import { VoteResult, ElectionStats, SchoolSetting } from '../../types';

Chart.register(...registerables);

const results = ref<VoteResult[]>([]);
const stats = ref<ElectionStats>({
  totalStudents: 0,
  totalClasses: 0,
  totalCandidates: 0,
  votedStudents: 0,
  notVotedStudents: 0,
  turnoutPercentage: 0,
  totalVotesCast: 0,
});
const settings = ref<SchoolSetting | null>(null);
const totalVotes = ref(0);
const loading = ref(false);
const downloadingPdf = ref(false);
const autoRefresh = ref(true);
let timer: any = null;

const barCanvasRef = ref<HTMLCanvasElement | null>(null);
const pieCanvasRef = ref<HTMLCanvasElement | null>(null);
let barChartInstance: Chart | null = null;
let pieChartInstance: Chart | null = null;

const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';

const onPhotoError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.src = defaultAvatar;
};

const isHighest = (item: VoteResult) => {
  if (item.total_votes === 0) return false;
  const max = Math.max(...results.value.map(r => r.total_votes));
  return item.total_votes === max;
};

const loadResults = async () => {
  loading.value = true;
  try {
    const [res, st, sett] = await Promise.all([
      dataService.getVoteResults(),
      dataService.getElectionStats(),
      dataService.getSettings(),
    ]);
    results.value = res;
    stats.value = st;
    settings.value = sett;
    totalVotes.value = res.reduce((acc, c) => acc + c.total_votes, 0);

    await nextTick();
    renderCharts();
  } finally {
    loading.value = false;
  }
};

const renderCharts = () => {
  const labels = results.value.map(r => `Paslon 0${r.candidate_number}`);
  const data = results.value.map(r => r.total_votes);
  const colors = ['#0d6efd', '#198754', '#ffc107', '#0dcaf0', '#6f42c1', '#d63384'];

  // Bar Chart
  if (barCanvasRef.value) {
    if (barChartInstance) barChartInstance.destroy();
    barChartInstance = new Chart(barCanvasRef.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Perolehan Suara',
            data,
            backgroundColor: colors.slice(0, data.length),
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.raw} Suara (${totalVotes.value > 0 ? ((Number(ctx.raw) / totalVotes.value) * 100).toFixed(1) : 0}%)`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { color: '#f1f5f9' },
          },
          x: {
            grid: { display: false },
          },
        },
      },
    });
  }

  // Pie / Doughnut Chart
  if (pieCanvasRef.value) {
    if (pieChartInstance) pieChartInstance.destroy();
    const hasVotes = totalVotes.value > 0;
    pieChartInstance = new Chart(pieCanvasRef.value, {
      type: 'doughnut',
      data: {
        labels: hasVotes ? labels : ['Belum Ada Suara'],
        datasets: [
          {
            data: hasVotes ? data : [1],
            backgroundColor: hasVotes ? colors.slice(0, data.length) : ['#e2e8f0'],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 15 },
          },
        },
        cutout: '65%',
      },
    });
  }
};

const downloadPdfReport = async () => {
  if (downloadingPdf.value) return;
  downloadingPdf.value = true;

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const schoolName = settings.value?.school_name || 'SMP Negeri 3 Widodaren';
    const agendaTitle = settings.value?.agenda_title || 'PEMILIHAN KETUA & WAKIL KETUA OSIS';
    const period = settings.value?.election_period || '2026/2027';
    const currentDateStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const currentTimeStr =
      new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';

    // 1. KOP SURAT RESMI
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(29, 78, 216); // Primary Blue
    doc.text(schoolName.toUpperCase(), 105, 17, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(agendaTitle.toUpperCase(), 105, 23, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`TAHUN PELAKSANAAN / PERIODE: ${period}`, 105, 28, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('BERITA ACARA & REKAPITULASI HASIL PEROLEHAN SUARA', 105, 34, { align: 'center' });

    // Double rule kop surat
    doc.setDrawColor(29, 78, 216);
    doc.setLineWidth(0.8);
    doc.line(14, 38, 196, 38);

    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.line(14, 39.5, 196, 39.5);

    // 2. RINGKASAN INFORMASI PELAKSANAAN (Table)
    const statusText =
      settings.value?.voting_status === 'open'
        ? 'SEDANG BERLANGSUNG (BUKA)'
        : settings.value?.voting_status === 'paused'
        ? 'DIJEDA SEMENTARA'
        : 'SELESAI / RESMI DITUTUP';

    autoTable(doc, {
      startY: 43,
      margin: { left: 14, right: 14 },
      theme: 'plain',
      styles: {
        fontSize: 8.5,
        cellPadding: 2,
        font: 'helvetica',
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 42 },
        1: { textColor: [15, 23, 42], cellWidth: 50 },
        2: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 46 },
        3: { textColor: [15, 23, 42], cellWidth: 44 },
      },
      body: [
        [
          'Tanggal & Waktu Unduh:',
          `${currentDateStr}, ${currentTimeStr}`,
          'Total Pemilih Terdaftar (DPT):',
          `${stats.value.totalStudents} Siswa`,
        ],
        [
          'Status Pemilihan:',
          statusText,
          'Total Suara Sah Masuk:',
          `${totalVotes.value} Suara (${stats.value.turnoutPercentage}%)`,
        ],
        [
          'Jumlah Pasangan Calon:',
          `${results.value.length} Pasangan Calon`,
          'Hak Suara Belum Digunakan:',
          `${stats.value.notVotedStudents} Siswa`,
        ],
      ],
    });

    const summaryFinalY = (doc as any).lastAutoTable?.finalY || 62;

    // Section title: Hasil Perolehan Suara
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('A. TABEL RINCIAN HASIL PEROLEHAN SUARA PASANGAN CALON', 14, summaryFinalY + 6);

    // 3. TABEL UTAMA HASIL KANDIDAT
    const winnerCandidate =
      results.value.length > 0 && totalVotes.value > 0
        ? results.value.reduce((prev, curr) => (curr.total_votes > prev.total_votes ? curr : prev), results.value[0])
        : null;

    const tableRows = results.value.map(r => {
      const isWinner = winnerCandidate && r.candidate_id === winnerCandidate.candidate_id && r.total_votes > 0;
      return [
        `0${r.candidate_number}`,
        `${r.leader_name}\nWakil: ${r.vice_leader_name}`,
        r.total_votes.toString(),
        `${r.percentage}%`,
        isWinner ? 'PEROLEHAN TERTINGGI' : 'Kandidat',
      ];
    });

    // Append Total row
    tableRows.push([
      'TOTAL',
      'Akumulasi Seluruh Suara Sah Masuk',
      totalVotes.value.toString(),
      totalVotes.value > 0 ? '100%' : '0%',
      '-',
    ]);

    autoTable(doc, {
      startY: summaryFinalY + 9,
      margin: { left: 14, right: 14 },
      head: [['No.', 'Pasangan Calon Ketua & Wakil', 'Suara Sah', 'Persentase', 'Keterangan']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [29, 78, 216],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
        valign: 'middle',
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 2.8,
        valign: 'middle',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 16, fontStyle: 'bold' },
        1: { cellWidth: 80 },
        2: { halign: 'center', cellWidth: 26, fontStyle: 'bold' },
        3: { halign: 'center', cellWidth: 26, fontStyle: 'bold' },
        4: { halign: 'center', cellWidth: 34 },
      },
      didParseCell: function (data: any) {
        // Highlight total row
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [241, 245, 249];
        }
        // Highlight winner row keterangan
        if (
          winnerCandidate &&
          data.row.raw &&
          data.row.raw[0] === `0${winnerCandidate.candidate_number}` &&
          winnerCandidate.total_votes > 0
        ) {
          if (data.column.index === 4) {
            data.cell.styles.textColor = [22, 101, 52];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });

    let currentY = (doc as any).lastAutoTable?.finalY || 120;

    // 4. HIGHLIGHT BOX KANDIDAT TERPILIH / UNGGUL
    if (winnerCandidate && winnerCandidate.total_votes > 0) {
      doc.setFillColor(239, 246, 255); // Blue 50
      doc.setDrawColor(191, 219, 254); // Blue 200
      doc.roundedRect(14, currentY + 4, 182, 14, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(29, 78, 216);
      doc.text('PENETAPAN HASIL PEROLEHAN SUARA TERTINGGI:', 18, currentY + 9);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(
        `Pasangan Calon No. Urut 0${winnerCandidate.candidate_number} (${winnerCandidate.leader_name} & ${winnerCandidate.vice_leader_name}) unggul dengan ${winnerCandidate.total_votes} suara (${winnerCandidate.percentage}%).`,
        18,
        currentY + 14
      );

      currentY += 21;
    } else {
      currentY += 6;
    }

    // 5. DIAGRAM BATANG GRAFIK JIKA TERSEDIA
    if (barCanvasRef.value && currentY + 46 <= 235) {
      try {
        const chartDataUrl = barCanvasRef.value.toDataURL('image/png', 1.0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        doc.text('B. GRAFIK VISUAL PEROLEHAN SUARA', 14, currentY);

        doc.addImage(chartDataUrl, 'PNG', 14, currentY + 2, 182, 38);
        currentY += 44;
      } catch (e) {
        console.warn('Could not add chart image to PDF:', e);
      }
    }

    // 6. LEMBAR PENGESAHAN & TANDA TANGAN PANITIA
    if (currentY + 45 > 280) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    doc.text('Ditetapkan di:', 196, currentY + 2.5, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text('SMP Negeri 3 Widodaren', 196, currentY + 7, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(currentDateStr, 196, currentY + 11.5, { align: 'right' });

    currentY += 18;

    // 3 Signatures: Saksi Siswa, Pembina OSIS, Ketua Panitia
    const col1X = 36;
    const col2X = 105;
    const col3X = 174;

    doc.setFont('helvetica', 'normal');
    doc.text('Saksi / Perwakilan Siswa,', col1X, currentY, { align: 'center' });
    doc.text('Pembina OSIS / Kesiswaan,', col2X, currentY, { align: 'center' });
    doc.text('Ketua Panitia Pemilihan OSIS,', col3X, currentY, { align: 'center' });

    currentY += 18;
    doc.setFont('helvetica', 'bold');
    doc.text('( ......................................... )', col1X, currentY, { align: 'center' });
    doc.text('( ......................................... )', col2X, currentY, { align: 'center' });
    doc.text('( ......................................... )', col3X, currentY, { align: 'center' });

    // 7. FOOTER PADA SETIAP HALAMAN
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(14, 287, 196, 287);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Dokumen Resmi Rekapitulasi eOSIS - Pemilihan Ketua & Wakil Ketua OSIS LUBER JURDIL', 14, 291);
      doc.text(`Halaman ${i} dari ${totalPages}`, 196, 291, { align: 'right' });
    }

    // 8. SAVE & TRIGGER DOWNLOAD
    const cleanSchoolName = (settings.value?.school_name || 'Sekolah').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanPeriod = (settings.value?.election_period || '2026').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Rekap_Suara_eOSIS_${cleanSchoolName}_${cleanPeriod}.pdf`;

    doc.save(fileName);
  } catch (err: any) {
    console.error('Gagal generate PDF:', err);
    alert('Terjadi kesalahan saat mengunduh PDF: ' + (err.message || 'Error'));
  } finally {
    downloadingPdf.value = false;
  }
};

onMounted(() => {
  loadResults();
  timer = setInterval(() => {
    if (autoRefresh.value) {
      loadResults();
    }
  }, 5000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  if (barChartInstance) barChartInstance.destroy();
  if (pieChartInstance) pieChartInstance.destroy();
});
</script>

<style scoped>
.fs-7 {
  font-size: 0.88rem;
}
.fs-8 {
  font-size: 0.78rem;
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@media print {
  aside, nav, .btn, .form-check {
    display: none !important;
  }
  main {
    padding: 0 !important;
  }
}
</style>
