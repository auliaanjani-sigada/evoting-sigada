import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { authService } from '../services/authService';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/login',
    name: 'LoginSiswa',
    component: () => import('../views/LoginSiswaView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/admin/login',
    name: 'LoginAdmin',
    component: () => import('../views/LoginAdminView.vue'),
    meta: { guestAdminOnly: true },
  },
  // Siswa Protected Routes
  {
    path: '/siswa/beranda',
    name: 'SiswaBeranda',
    component: () => import('../views/siswa/SiswaBerandaView.vue'),
    meta: { requiresStudent: true },
  },
  {
    path: '/siswa/voting',
    name: 'SiswaVoting',
    component: () => import('../views/siswa/SiswaVotingView.vue'),
    meta: { requiresStudent: true, checkNotVoted: true },
  },
  // Admin Protected Routes
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: { name: 'AdminBeranda' },
      },
      {
        path: 'beranda',
        name: 'AdminBeranda',
        component: () => import('../views/admin/AdminBerandaView.vue'),
      },
      {
        path: 'kelas',
        name: 'AdminKelas',
        component: () => import('../views/admin/AdminKelasView.vue'),
      },
      {
        path: 'siswa',
        name: 'AdminSiswa',
        component: () => import('../views/admin/AdminSiswaView.vue'),
      },
      {
        path: 'kandidat',
        name: 'AdminKandidat',
        component: () => import('../views/admin/AdminKandidatView.vue'),
      },
      {
        path: 'perolehan-suara',
        name: 'AdminPerolehanSuara',
        component: () => import('../views/admin/AdminPerolehanSuaraView.vue'),
      },
      {
        path: 'pengaturan',
        name: 'AdminPengaturan',
        component: () => import('../views/admin/AdminPengaturanView.vue'),
      },
      {
        path: 'database',
        name: 'AdminDatabase',
        component: () => import('../views/admin/AdminDatabaseView.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// Route Guard
router.beforeEach(async (to, from, next) => {
  const isStudent = authService.isStudentLoggedIn.value;
  const isAdmin = authService.isAdminLoggedIn.value;

  if (to.meta.requiresAdmin && !isAdmin) {
    return next({ name: 'LoginAdmin' });
  }

  if (to.meta.requiresStudent && !isStudent) {
    return next({ name: 'LoginSiswa' });
  }

  // Prevent voted student from accessing voting ballot page
  if (to.meta.checkNotVoted) {
    const student = await authService.refreshStudentSession();
    if (student?.has_voted) {
      return next({ name: 'SiswaBeranda' });
    }
  }

  // If already logged in as student and trying to access student login
  if (to.meta.guestOnly && isStudent) {
    return next({ name: 'SiswaBeranda' });
  }

  // If already logged in as admin and trying to access admin login
  if (to.meta.guestAdminOnly && isAdmin) {
    return next({ name: 'AdminBeranda' });
  }

  next();
});
