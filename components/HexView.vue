<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  bytes: Uint8Array
  selectedIndex: number | null
  highlightedIndices: number[]
  fieldStartIndices: number[]
}>()
const emit = defineEmits<{ select: [index: number] }>()

const bytesPerRow = 0x20
const columns = Array.from({ length: bytesPerRow }, (_, index) => index)
const rows = computed(() => {
  const result: { offset: number; bytes: number[] }[] = []
  for (let offset = 0; offset < props.bytes.length; offset += bytesPerRow) {
    result.push({ offset, bytes: Array.from(props.bytes.slice(offset, offset + bytesPerRow)) })
  }
  return result
})
const highlighted = computed(() => new Set(props.highlightedIndices))
const fieldStarts = computed(() => new Set(props.fieldStartIndices))

function hex(value: number, width = 2): string {
  return value.toString(16).padStart(width, '0')
}

</script>

<template>
  <div class="hex-view">
    <table aria-label="16進数のバイト列。バイトを選ぶと値を表示します">
      <thead>
        <tr>
          <th scope="col">offset</th>
          <th v-for="column in columns" :key="column" scope="col">{{ hex(column) }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.offset">
          <th scope="row">{{ hex(row.offset, 4) }}</th>
          <td
            v-for="(byte, column) in row.bytes"
            :key="column"
            :class="{ 'is-related': highlighted.has(row.offset + column) }"
          >
            <button
              type="button"
              :class="{
                'is-selected': selectedIndex === row.offset + column,
                'is-field-start': fieldStarts.has(row.offset + column),
              }"
              :aria-label="`オフセット 0x${hex(row.offset + column, 4)}、HEX 0x${hex(byte)}、DEC ${byte}${fieldStarts.has(row.offset + column) ? '、値の先頭' : ''}`"
              :aria-pressed="selectedIndex === row.offset + column"
              @click="emit('select', row.offset + column)"
            >{{ hex(byte) }}</button>
          </td>
          <td v-for="column in bytesPerRow - row.bytes.length" :key="`empty-${column}`" aria-hidden="true"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.hex-view {
  width: 100%;
  overflow-x: auto;
}
.hex-view table {
  display: table;
  width: 100%;
  min-width: 960px;
  margin: 0;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
  white-space: nowrap;
}
.hex-view th,
.hex-view td {
  border: 0;
  padding: 0;
  text-align: center;
}
.hex-view thead th {
  padding-top: 0.35rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 0.72rem;
  font-weight: 500;
}
.hex-view thead th:first-child,
.hex-view tbody th {
  width: 4.5rem;
  color: var(--vp-c-text-2);
  font-weight: 500;
  text-align: left;
  padding-left: 1.25rem;
}
.hex-view tbody th {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}
.hex-view thead th:nth-child(10),
.hex-view thead th:nth-child(18),
.hex-view thead th:nth-child(26),
.hex-view tbody td:nth-child(10),
.hex-view tbody td:nth-child(18),
.hex-view tbody td:nth-child(26) {
  border-left: 1px solid var(--vp-c-divider);
}
.hex-view tbody tr {
  background: transparent;
}
.hex-view tbody tr + tr {
  border-top: 1px solid var(--vp-c-divider);
}
.hex-view tbody td.is-related {
  background: color-mix(in srgb, var(--vp-c-brand-1) 24%, var(--vp-c-bg));
}
.hex-view tbody td button {
  display: block;
  width: 100%;
  padding: 0.25rem 0;
  border: 0;
  color: var(--vp-c-text-1);
  background: transparent;
  font: inherit;
  cursor: pointer;
}
.hex-view tbody td button:hover {
  background: var(--vp-c-bg-soft);
}
.hex-view tbody td button.is-field-start {
  color: var(--vp-c-text-1);
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: var(--vp-c-text-2);
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
}
.hex-view tbody td button:focus-visible {
  position: relative;
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: -2px;
}
.hex-view tbody td button.is-selected {
  color: var(--vp-c-bg);
  background: var(--vp-c-text-1);
  font-weight: 700;
  text-decoration-color: currentColor;
}
</style>
