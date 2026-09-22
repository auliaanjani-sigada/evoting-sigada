<template>
  <div id="eosis-app" class="font-sans antialiased text-dark">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { dataService } from './services/dataService';

onMounted(() => {
  // Pre-check connection quietly in background
  dataService.checkConnection().catch(console.warn);
});
</script>

<style>
/* Global Modern Aesthetic Tweaks */
:root {
  --bs-font-sans-serif: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --bs-primary: #1d4ed8;
  --bs-primary-rgb: 29, 78, 216;
}

body {
  font-family: var(--bs-font-sans-serif);
  background-color: #f8fafc;
  color: #1e293b;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Rounded Utilities */
.rounded-4 {
  border-radius: 1rem !important;
}

/* Subtle Shadows */
.shadow-xs {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Custom Scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
