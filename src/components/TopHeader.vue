<template>
  <header class="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-5 h-16 bg-white/80 backdrop-blur-md border-b border-blue-50/50 shadow-sm">
    <div class="flex items-center gap-2">
      <span class="material-symbols-outlined text-blue-500">calendar_today</span>
      <h1 class="text-lg font-semibold tracking-tight text-blue-400">Today's Schedule</h1>
    </div>
    <div class="flex items-center gap-1">
      <button class="p-2 rounded-full active:scale-95 transition-transform duration-200 hover:bg-blue-50/50">
        <span class="material-symbols-outlined text-slate-400">search</span>
      </button>
      <button class="p-2 rounded-full active:scale-95 transition-transform duration-200 hover:bg-blue-50/50">
        <span class="material-symbols-outlined text-slate-400">more_vert</span>
      </button>
    </div>
  </header>
</template>
