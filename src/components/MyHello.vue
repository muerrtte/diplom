<script setup>
defineProps({
  title: String,
  price: Number,
});
</script>

<template>
  <div class="product">
    <h2>Товар:{{ title }}</h2>
    <h3>Ціна:{{ price }}</h3>
    <h3>Додано: {{ isAdded }}</h3>
  </div>
</template>

<style scoped>
.<style>
