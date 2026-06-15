<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
    <div class="text-8xl mb-6 select-none">👟</div>
    <h1 class="text-8xl font-extrabold text-gray-900 mb-3">404</h1>
    <p class="text-2xl font-bold text-gray-700 mb-2">Сторінку не знайдено</p>
    <p class="text-gray-400 mb-10 max-w-sm">Схоже, ця сторінка кудись зникла — можливо, її перемістили або видалили.</p>
    <div class="flex flex-wrap gap-3 justify-center">
      <RouterLink
        to="/"
        class="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full transition-all shadow-lg shadow-orange-500/25 hover:scale-105"
      >
        На головну
      </RouterLink>
      <button
        @click="$router.back()"
        class="px-8 py-3 border-2 border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500 font-semibold rounded-full transition-all"
      >
        ← Назад
      </button>
    </div>
  </div>
</template>
