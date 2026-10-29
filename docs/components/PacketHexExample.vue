<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  fieldDisplayHex,
  fieldsAtByte,
  packetExamples,
  type PacketExample,
  type PacketExampleKind,
} from './packetExample'
import HexView from './HexView.vue'

const props = defineProps<{ kind?: PacketExampleKind }>()
const example = computed<PacketExample>(() => packetExamples[props.kind ?? 'directBank'])
const variantIndex = ref(0)
const selectedIndices = ref<Record<number, number | null>>({})
const variant = computed(() => example.value.variants[variantIndex.value] ?? example.value.variants[0])
const bytes = computed(() => variant.value.bytes)
const visibleFields = computed(() => variant.value.fields)
const selectedIndex = computed(() => selectedIndices.value[variantIndex.value] ?? null)
const selectedFields = computed(() => selectedIndex.value === null ? [] : fieldsAtByte(visibleFields.value, selectedIndex.value))
const fieldStartIndices = computed(() => [...new Set(
  visibleFields.value
    .filter((field) => field.markStart !== false)
    .map((field) => Math.floor(field.startBit / 8)),
) ])
const highlightedIndices = computed(() => Array.from({ length: bytes.value.length }, (_, index) => index)
  .filter((index) => selectedFields.value.some((field) => field.startBit < (index + 1) * 8 && field.endBit > index * 8)))
const details = computed(() => visibleFields.value.map((field) => {
  return {
    field,
    active: selectedFields.value.includes(field),
    hex: fieldDisplayHex(bytes.value, field),
  }
}))

function selectByte(index: number): void {
  selectedIndices.value = { ...selectedIndices.value, [variantIndex.value]: index }
}

</script>

<template>
  <div class="packet-example" :data-packet-kind="props.kind ?? 'directBank'">
    <div class="packet-example-bar">
      <div v-if="example.variants.length > 1" class="packet-example-toggle" role="group" aria-label="Data view">
        <button
          v-for="(option, index) in example.variants"
          :key="option.label"
          type="button"
          :aria-pressed="variantIndex === index"
          @click="variantIndex = index"
        >{{ option.label }}</button>
      </div>
      <span class="packet-example-scope">
        {{ variant.provenance === 'structural' ? '構造例' : '実データ' }}<template v-if="variant.origin"> · {{ variant.origin }}</template>
      </span>
      <span class="packet-example-meta">{{ bytes.length }} B<template v-if="variant.bitLength !== undefined"> · {{ variant.bitLength }} ビット</template></span>
    </div>
    <p v-if="variant.bitLength === 0" class="packet-example-empty">この型の本文は0ビットです。</p>
    <HexView
      v-else
      :bytes="bytes"
      :selected-index="selectedIndex"
      :field-start-indices="fieldStartIndices"
      :highlighted-indices="highlightedIndices"
      @select="selectByte"
    />
    <div class="packet-example-detail" aria-label="Fields">
      <div
        v-for="detail in details"
        :key="`${detail.field.startBit}-${detail.field.endBit}`"
        class="packet-example-field"
        :class="{ 'is-active': detail.active }"
      >
        <div class="packet-example-key">
          <code v-if="detail.field.codeName" class="packet-example-name">{{ detail.field.label }}</code>
          <strong v-else>{{ detail.field.label }}</strong>
          <small class="packet-example-range">{{ detail.field.startBit }}–{{ detail.field.endBit - 1 }} ({{ detail.field.endBit - detail.field.startBit }} {{ detail.field.endBit - detail.field.startBit === 1 ? 'bit' : 'bits' }})</small>
        </div>
        <span><code>{{ detail.hex }}</code></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.packet-example {
  margin: 1rem 0 1.5rem;
  overflow: hidden;
  border-top: 1px solid var(--vp-c-text-2);
  border-bottom: 1px solid var(--vp-c-text-2);
}
.packet-example-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.3rem 0.4rem;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
}
.packet-example-scope {
  flex: 1 1 12rem;
  min-width: 0;
  line-height: 1.4;
}
.packet-example-empty {
  padding: 0.75rem 0.4rem;
  margin: 0;
  color: var(--vp-c-text-2);
}
.packet-example-toggle {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}
.packet-example-meta {
  display: inline-flex;
  gap: 0.75rem;
  margin-left: auto;
  white-space: nowrap;
}
.packet-example-toggle button {
  border: 0;
  border-radius: 0;
  padding: 0.2rem 0.35rem;
  color: var(--vp-c-text-2);
  background: transparent;
  font: inherit;
  cursor: pointer;
}
.packet-example-toggle button[aria-pressed='true'] {
  color: var(--vp-c-text-1);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 0.35rem;
}
.packet-example-toggle button:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}
.packet-example-detail {
  padding: 0.45rem 0.4rem;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 0.8rem;
  line-height: 1.55;
}
.packet-example-field {
  display: grid;
  grid-template-columns: 9rem minmax(0, 1fr);
  align-items: baseline;
  gap: 0.5rem;
  margin: 0 -0.2rem;
  padding: 0.15rem 0.2rem;
}
.packet-example-field.is-active {
  background: var(--vp-c-bg-soft);
}
.packet-example-key {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.packet-example-range {
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 0.68rem;
  font-weight: 400;
  white-space: nowrap;
}
.packet-example-field > span {
  min-width: 0;
  color: var(--vp-c-text-2);
  font-size: 0.76rem;
}
.packet-example-field > span:first-of-type,
.packet-example-field > span:first-of-type code {
  white-space: normal;
  overflow-wrap: anywhere;
}
.packet-example-field code {
  padding: 0;
  border-radius: 0;
  background: transparent;
}
.packet-example-field + .packet-example-field {
  margin-top: 0.1rem;
}
.packet-example-field strong,
.packet-example-name {
  color: var(--vp-c-text-1);
  font-size: 0.8rem;
  font-weight: 700;
}
.packet-example-field code.packet-example-name {
  padding: 0;
  border-radius: 0;
  background: transparent;
  overflow-wrap: anywhere;
  white-space: normal;
}
@media (max-width: 560px) {
  .packet-example-bar {
    flex-wrap: wrap;
  }
  .packet-example-field {
    grid-template-columns: 8rem minmax(0, 1fr);
    gap: 0.1rem 0.4rem;
  }
}
</style>
