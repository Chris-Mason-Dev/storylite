<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  body: string
}>()
</script>

<template>
  <article
    class="max-w-[380px] rounded-[var(--vue-radius)] border border-[color:var(--vue-border)] bg-[color:var(--vue-surface)] p-[18px]"
  >
    <p class="text-[color:var(--vue-muted)]">{{ eyebrow }}</p>
    <h2>{{ title }}</h2>
    <p class="text-[color:var(--vue-muted)]">{{ body }}</p>
  </article>
</template>
