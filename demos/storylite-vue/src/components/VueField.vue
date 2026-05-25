<script setup lang="ts">
defineProps<{
  label: string
  placeholder: string
}>()
</script>

<template>
  <label
    class="grid max-w-[380px] gap-2 rounded-[var(--vue-radius)] border border-[color:var(--vue-border)] bg-[color:var(--vue-surface)] p-[18px]"
  >
    <span class="text-[color:var(--vue-muted)]">{{ label }}</span>
    <input
      class="min-h-[38px] rounded-lg border border-[color:var(--vue-border)] px-3"
      :placeholder="placeholder"
    />
  </label>
</template>
