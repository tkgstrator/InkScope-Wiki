import { expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { packetExamples, fieldValue } from '../docs/components/packetExample'
import { protocolResearchCaptures } from '../docs/components/protocolResearchCaptures'

function bits(bytes: Uint8Array, start: number, width: number): number {
  let value = 0
  for (let i = 0; i < width; i++) value += ((bytes[(start + i) >> 3] >> ((start + i) & 7)) & 1) * 2 ** i
  return value
}

test('rescue, assist and enemy transition views preserve authenticated event bodies', () => {
  const cases = [
    ['coopRescued', 0xcf9be194, 4, '5dce4f9523cccc91b0b0df9b445586774e6bca4f93758dcfa722560299c02bcd', 2700, 1],
    ['goldenAssist', 0x85c563d8, 4, 'eebcacf4be5483dc4d146e26c72ff091de03bba3a04009fb1904866830ac1010', 3202, 0],
    ['enemyState', 0x4c1ecd54, 26, '414308232b042cb1f730764ca97954951ed8272276faa505098e94932bba84ab', 4159, 0],
    ['enemyDie', 0x4c1ecd54, 26, '4df2caab5c3e847b179d8ea7bb215b18599d979d965544bc339bad3c076c6586', 6630, 0],
  ] as const
  for (const [kind, type, bodyWidth, hash, frame, life] of cases) {
    const capture = protocolResearchCaptures[kind]
    const view = kind === 'enemyDie' ? packetExamples.enemyState.variants[1] : packetExamples[kind].variants[0]
    expect(view.bytes).toBe(capture.payload)
    expect(createHash('sha256').update(view.bytes).digest('hex')).toBe(hash)
    expect(new DataView(view.bytes.buffer).getUint32(21, true)).toBe(type)
    expect(view.bytes[7]).toBe(0)
    const route = view.fields.find(field => field.label === 'Group ID')!
    expect([route.startBit, route.endBit]).toEqual([136, 168])
    expect(fieldValue(view.bytes, route)).toBe(BigInt(new DataView(view.bytes.buffer).getUint32(17, true)))
    expect((view.bytes[1] << 8) | view.bytes[2]).toBe(view.bytes.length - 8)
    expect((view.bytes[13] << 8) | view.bytes[14]).toBe(view.bytes.length - 17)
    expect(bits(view.bytes, 200 + bodyWidth, 23)).toBe(frame)
    expect(bits(view.bytes, 223 + bodyWidth, 4)).toBe(life)
    expect(view.fields.at(-1)?.endBit).toBe(view.bytes.length * 8)
    const bodyIndex = view.fields.findIndex(field => field.startBit === 200)
    expect(bodyIndex).toBeGreaterThan(0)
    for (let i = bodyIndex + 1; i < view.fields.length; i++) expect(view.fields[i].startBit).toBe(view.fields[i - 1].endBit)
    expect(bits(view.bytes, 227 + bodyWidth, view.bytes.length * 8 - 227 - bodyWidth)).toBe(0)
  }
  expect(bits(protocolResearchCaptures.coopRescued.payload, 200, 4) - 1).toBe(1)
  expect(bits(protocolResearchCaptures.goldenAssist.payload, 200, 4)).toBe(0b0010)
  expect(bits(protocolResearchCaptures.enemyState.payload, 200, 6) - 1).toBe(7)
  expect(bits(protocolResearchCaptures.enemyState.payload, 206, 20)).toBe(4189)
  expect(bits(protocolResearchCaptures.enemyDie.payload, 200, 6) - 1).toBe(1)
  expect(bits(protocolResearchCaptures.enemyDie.payload, 206, 20)).toBe(0xfffff)
})

test('player state views expose named counters and fixed Human/Squid union boundaries', () => {
  for (const view of packetExamples.playerState.variants) {
    const named = (label: string) => view.fields.find(field => field.label === label)!
    expect([named('IkuraNum').startBit, named('IkuraNum').endBit]).toEqual([46, 60])
    expect([named('HeldGoldenIkuraNum').startBit, named('HeldGoldenIkuraNum').endBit]).toEqual([60, 72])
    expect([named('Position X').startBit, named('Position Z').endBit]).toEqual([280, 331])
    expect([named('Basis Z Pitch Raw').startBit, named('Basis Z Pitch Raw').endBit]).toEqual([397, 407])
    expect([named('Basis Z Yaw Raw').startBit, named('Basis Z Yaw Raw').endBit]).toEqual([407, 418])
    expect([named('Basis Y Input Pitch Raw').startBit, named('Basis Y Input Pitch Raw').endBit]).toEqual([418, 428])
    expect([named('Basis Y Input Yaw Raw').startBit, named('Basis Y Input Yaw Raw').endBit]).toEqual([428, 439])
    expect(fieldValue(view.bytes, named('Basis Z Pitch Raw'))! + (fieldValue(view.bytes, named('Basis Z Yaw Raw'))! << 10n))
      .toBe(BigInt(bits(view.bytes, 397, 21)))
    expect([named('PlayerStepPaint State').startBit, named('PlayerStepPaint State').endBit]).toEqual([560, 563])
    expect([named('PlayerStepPaint Index + 1').startBit, named('PlayerStepPaint Index + 1').endBit]).toEqual([563, 566])
    const select = named('Squid/Human Select')
    const squid = fieldValue(view.bytes, select) === 0n
    const state = named(squid ? 'Squid State' : 'Human State')
    expect(state.startBit).toBe(599)
    expect(state.endBit).toBe(squid ? 602 : 609)
    if (squid) {
      const padding = view.fields.find(field => field.label === 'Padding' && field.startBit === 602)!
      expect(padding.endBit).toBe(609)
      expect(fieldValue(view.bytes, padding)).toBe(0n)
    }
    expect(view.fields.find(field => field.startBit === 609)).toBeDefined()
  }
})

test('enemy spawn selector annotation follows the species field in the preserved payload', () => {
  for (const view of packetExamples.enemySpawn.variants) {
    const species = view.fields.find(field => field.label === 'SalmonId')!
    const selector = view.fields.find(field => field.label === 'Pool Selector + 1')!
    expect([species.startBit, species.endBit]).toEqual([328, 333])
    expect([selector.startBit, selector.endBit]).toEqual([333, 341])
    expect(fieldValue(view.bytes, selector)).toBe(BigInt(bits(view.bytes, 333, 8)))
    expect(view.fields.find(field => field.startBit === 341)).toBeDefined()
  }
})

test('enemy spawn view separates predicted slot, inner frame and counted array from the footer', () => {
  for (const view of packetExamples.enemySpawn.variants) {
    for (const [label, startBit, endBit] of [
      ['Spawn Direction Raw', 251, 272],
      ['Predicted Slot', 272, 276],
      ['Spawn Frame Raw', 276, 296],
      ['Array Count', 341, 345],
    ] as const) {
      expect(view.fields.some(field => field.label === label && field.startBit === startBit && field.endBit === endBit)).toBe(true)
    }
    const count = bits(view.bytes, 341, 4)
    expect(count).toBeLessThanOrEqual(10)
    const values = view.fields.filter(field => field.startBit >= 345 && field.endBit <= 665 && field.label === 'Unknown')
    expect(values.map(field => [field.startBit, field.endBit])).toEqual(Array.from({ length: count }, (_, index) => [345 + index * 32, 377 + index * 32]))
    if (count < 10) {
      const padding = view.fields.find(field => field.label === 'Padding' && field.startBit === 345 + count * 32)!
      expect(padding.endBit).toBe(665)
      expect(fieldValue(view.bytes, padding)).toBe(0n)
    }
    expect(view.fields.find(field => field.label === 'GameFrame')?.startBit).toBe(681)
    expect(view.fields.find(field => field.label === 'LifeNumber')?.startBit).toBe(704)
  }
})

test('dedicated player view preserves captured frames and native Human/Squid subfield boundaries', () => {
  for (const [index, view] of packetExamples.playerNetState.variants.entries()) {
    expect(view.bytes).toBe(packetExamples.playerState.variants[index].bytes)
    expect(view.provenance).toBe('captured')
    const select = view.fields.find(field => field.label === 'Squid/Human Select')!
    if (fieldValue(view.bytes, select) === 0n) {
      const flag = view.fields.find(field => field.label === 'Squid Flag')!
      expect([flag.startBit, flag.endBit]).toEqual([599, 600])
      expect(fieldValue(view.bytes, flag)).toBe(BigInt(bits(view.bytes, 599, 1)))
      expect(view.fields.some(field => field.label === 'Unknown' && field.startBit === 600 && field.endBit === 602)).toBe(true)
      expect(view.fields.some(field => field.label === 'Padding' && field.startBit === 602 && field.endBit === 609)).toBe(true)
    } else {
      const flags = view.fields.filter(field => field.label === 'Human Counter Positive')
      expect(flags.map(field => [field.startBit, field.endBit])).toEqual([[599, 600], [600, 601], [601, 602], [604, 605], [605, 606], [606, 607]])
      for (const flag of flags) expect(fieldValue(view.bytes, flag)).toBe(BigInt(bits(view.bytes, flag.startBit, 1)))
      expect(view.fields.some(field => field.label === 'Unknown' && field.startBit === 607 && field.endBit === 609)).toBe(true)
    }
  }
})

test('all player layouts expose two direction-and-length vectors before the direction-only basis', () => {
  for (const [views, start] of [
    [packetExamples.playerNetState.variants, 280],
    [packetExamples.playerState.variants, 280],
    [packetExamples.sequence.variants, 355],
  ] as const) {
    for (const view of views) {
      for (const [label, first, end] of [
        ['Vector A Pitch Raw', 51, 61], ['Vector A Yaw Raw', 61, 72], ['Vector A Length Raw', 72, 84],
        ['Vector B Pitch Raw', 84, 94], ['Vector B Yaw Raw', 94, 105], ['Vector B Length Raw', 105, 117],
      ] as const) {
        const field = view.fields.find(f => f.label === label)!
        expect(field).toBeDefined()
        expect([field.startBit, field.endBit]).toEqual([start + first, start + end])
        expect(fieldValue(view.bytes, field)).toBe(BigInt(bits(view.bytes, start + first, end - first)))
      }
      expect(view.fields.find(f => f.label === 'Basis Z Pitch Raw')?.startBit).toBe(start + 117)
    }
  }
})
