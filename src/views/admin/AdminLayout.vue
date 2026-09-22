<template>
  <div class="min-vh-100 d-flex flex-column bg-light" id="admin-layout-root">
    <Navbar />

    <div class="d-flex flex-grow-1 position-relative">
      <!-- Desktop Sidebar -->
      <aside class="d-none d-lg-block">
        <AdminSidebar />
      </aside>

      <!-- Offcanvas Mobile Sidebar -->
      <div
        class="offcanvas offcanvas-start bg-dark text-white"
        tabindex="-1"
        id="adminMobileSidebar"
        aria-labelledby="adminMobileSidebarLabel"
        style="width: 280px;"
      >
        <div class="offcanvas-header border-bottom border-secondary py-3 px-4">
          <h5 class="offcanvas-title fw-bold text-white d-flex align-items-center gap-2" id="adminMobileSidebarLabel">
            <i class="bi bi-shield-check text-primary"></i> eOSIS Admin
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body p-0">
          <AdminSidebar />
        </div>
      </div>

      <!-- Main Content Area -->
      <main class="flex-grow-1 p-3 p-md-4 overflow-auto" style="min-width: 0;">
        <!-- Mobile Trigger Bar -->
        <div class="d-lg-none d-flex align-items-center justify-content-between bg-white p-2.5 rounded-3 shadow-xs mb-3">
          <button
            class="btn btn-sm btn-outline-dark d-flex align-items-center gap-2 rounded-pill px-3"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#adminMobileSidebar"
          >
            <i class="bi bi-list fs-5"></i>
            <span class="fw-semibold">Menu Admin</span>
          </button>
          <span class="badge bg-primary-subtle text-primary fw-bold">Panel Kontrol</span>
        </div>

        <!-- Database Notice Banner -->
        <DatabaseNotice />

        <!-- Child Page -->
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Navbar from '../../components/Navbar.vue';
import AdminSidebar from '../../components/AdminSidebar.vue';
import DatabaseNotice from '../../components/DatabaseNotice.vue';
</script>
