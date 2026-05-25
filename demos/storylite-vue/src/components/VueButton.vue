<script setup lang="ts">
defineProps<{
  label: string
  disabled: boolean
}>()
</script>

<template>
  <button
    class="min-h-10 rounded-[var(--vue-radius)] border border-transparent bg-[color:var(--vue-accent)] px-4 font-bold text-white"
    :disabled="disabled"
    type="button"
  >
    {{ label }}
  </button>
</template>
