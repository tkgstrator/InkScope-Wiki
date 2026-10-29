import { expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import {
  directBankPayload,
  fieldDisplayHex,
  fieldValue,
  fieldsAtByte,
  packetExamples,
  playerNetUnionFields,
  plaintextFields,
} from '../docs/components/packetExample'
import { packetCaptures } from '../docs/components/packetCaptures'
import { browseReply, browseReplyPlaintext, browseRequest, browseRequestPlaintext } from '../docs/components/browseCaptures'
import { protocolCaptures } from '../docs/components/protocolCaptures'

function readBits(bytes: Uint8Array, offset: number, width: number): number {
  let value = 0
  for (let bit = 0; bit < width; bit++) {
    value += ((bytes[(offset + bit) >> 3] >> ((offset + bit) & 7)) & 1) * 2 ** bit
  }
  return value
}

test('paired browse examples retain the authenticated request and matching reply', () => {
  const request = packetExamples.browseRequest.variants[0]
  const reply = packetExamples.browseReply.variants[0]
  expect(request.bytes).toBe(browseRequest)
  expect(reply.bytes).toBe(browseReply)
  expect(request.bytes.length).toBe(325)
  expect(reply.bytes.length).toBe(620)
  expect(createHash('sha256').update(request.bytes).digest('hex'))
    .toBe('91b1ce9b4bd26d16b293577e59d9db214376e0bc78e42e87247db5c7f16bda1d')
  expect(createHash('sha256').update(reply.bytes).digest('hex'))
    .toBe('b4715cdb29103d913af827e55d5301ec4dbb26b9b154616984a601a804d1b48e')
  expect(request.bytes[0]).toBe(0)
  expect(new DataView(request.bytes.buffer).getUint32(1)).toBe(22)
  expect(request.bytes.slice(27, 29)).toEqual(Uint8Array.from([3, 1]))
  expect(reply.bytes[0]).toBe(1)
  expect(new DataView(reply.bytes.buffer).getUint32(1)).toBe(557)
  expect(reply.bytes.slice(562, 564)).toEqual(Uint8Array.from([3, 1]))
  expect(new DataView(reply.bytes.buffer).getUint16(560)).toBe(49152)
  expect(fieldsAtByte(request.fields, 37).map((field) => field.label)).toEqual(['Challenge'])
  expect(fieldsAtByte(reply.fields, 105).map((field) => field.label)).toEqual(['SessionParameter'])
  expect(fieldsAtByte(reply.fields, 604).map((field) => field.label)).toEqual(['CipherText'])
  expect(request.fields.at(-1)?.endBit).toBe(325 * 8)
  expect(reply.fields.at(-1)?.endBit).toBe(620 * 8)
})

test('BrowseRequest Plaintext matches the authenticated saved decryption', () => {
  const [wire, plaintext] = packetExamples.browseRequest.variants
  expect(wire.bytes).toBe(browseRequest)
  expect(plaintext.label).toBe('Plaintext')
  expect(plaintext.bytes).toBe(browseRequestPlaintext)
  expect(plaintext.bytes.length).toBe(256)
  expect(createHash('sha256').update(plaintext.bytes).digest('hex'))
    .toBe('8ca62f53ed28a3024d01fb2832a3499558f1711abda8e0e24b991d6fdb284aac')
  expect(plaintext.bytes).not.toEqual(wire.bytes.slice(69, 325))
  expect(plaintext.fields.map((field) => field.endBit - field.startBit))
    .toEqual(Array(8).fill(256))
  expect(plaintext.fields.at(-1)?.endBit).toBe(256 * 8)
})

test('BrowseReply Plaintext is the matched 16-byte ChallengeProof', () => {
  const [wire, plaintext] = packetExamples.browseReply.variants
  expect(wire.bytes).toBe(browseReply)
  expect(plaintext.label).toBe('Plaintext')
  expect(plaintext.bytes).toBe(browseReplyPlaintext)
  expect(plaintext.bytes.length).toBe(16)
  expect(createHash('sha256').update(plaintext.bytes).digest('hex'))
    .toBe('b7fd00aba4618dd87615031dfc247232a8e2756780625038824b96ad4e6c0a3d')
  expect(plaintext.bytes).not.toEqual(wire.bytes.slice(604, 620))
  expect(plaintext.fields.map((field) => field.label)).toEqual(['ChallengeProof'])
  expect(plaintext.fields[0].endBit).toBe(128)
})

test('join protocol views retain authenticated payloads and complete field ranges', () => {
  const cases = [
    ['net', 2, 0, 1, 250, '07ef685c482fcab3a8b94bbc1b5f99b73abc2484e448ae4e9f2b86695e16057e'],
    ['broadcastReliable', 9, 7, 11, 190, 'fb5f93c50f9f2aaca7786419460fdc3495bd15ef0dbde1790ec8d8b7503d5f90'],
    ['session', 4, 1, 13, 112, '56a0677bef2aafb4a160be1447b7920f0a6561fa2ce1abb9297fe92379549524'],
  ] as const
  for (const [kind, record, chunkIndex, protocolId, length, digest] of cases) {
    const capture = protocolCaptures[kind]
    const variant = packetExamples[kind].variants.find((item) => item.bytes === capture.payload)!
    expect([capture.record, capture.chunkIndex, capture.protocolId]).toEqual([record, chunkIndex, protocolId])
    expect(variant.bytes).toBe(capture.payload)
    expect(capture.payload.length).toBe(length)
    expect(createHash('sha256').update(capture.payload).digest('hex')).toBe(digest)
    expect(variant.fields[0].startBit).toBe(0)
    expect(variant.fields.at(-1)?.endBit).toBe(length * 8)
    for (let index = 1; index < variant.fields.length; index++) {
      expect(variant.fields[index].startBit).toBe(variant.fields[index - 1].endBit)
    }
  }
  expect(fieldValue(protocolCaptures.net.payload,
    packetExamples.net.variants.find((item) => item.label === 'Net 0x11')!.fields[8])).toBe(10n)
  expect(fieldValue(protocolCaptures.broadcastReliable.payload,
    packetExamples.broadcastReliable.variants[0].fields.find((item) => item.label === 'SlotCount')!)).toBe(10n)
})

test('PrivateSetting and reliable data views use authenticated saved payloads', () => {
  const cases = [
    ['privateCommon', 'privateSetting', 'Common', 295, 78, '8b6c1b8e73a166214f76fd6f68a4c9f20ad5c127d80f0c94fb97035cfdd18bff'],
    ['privateCoop', 'privateSetting', 'Coop', 419, 161, 'a9d1d174ff63713b00252c599cc83e6c12ffa0bf53e47cddd7763b66a8b45df9'],
    ['privateCombined', 'privateSetting', 'Combined', 479, 226, '8ed1b4ac9e9c4dcc89ac3b92f2d3f31d289ee25c7c3fe35fb01cf95b2c5b40de'],
    ['broadcastReliableData18', 'broadcastReliable', 'Data 18 B', 26025, 18, '65ab708acc0ab694f178ba03fbeff16bc6c233fd6372197313d88db3dd937fdf'],
    ['broadcastReliableData83', 'broadcastReliable', 'Data 83 B', 28992, 83, 'e51c3d2ed49c13226b440e2882a29cf36edc95cdf4e87f4a816c7be644d66d83'],
  ] as const
  for (const [captureName, kind, label, record, length, digest] of cases) {
    const capture = protocolCaptures[captureName]
    const variant = packetExamples[kind].variants.find((item) => item.label === label)!
    expect([capture.record, capture.chunkIndex, capture.protocolId]).toEqual([record, 1, 11])
    expect(variant.bytes).toBe(capture.payload)
    expect(variant.bytes.length).toBe(length)
    expect(createHash('sha256').update(variant.bytes).digest('hex')).toBe(digest)
    expect(variant.fields[0].startBit).toBe(0)
    expect(variant.fields.at(-1)?.endBit).toBe(length * 8)
    for (let index = 1; index < variant.fields.length; index++) {
      expect(variant.fields[index].startBit).toBe(variant.fields[index - 1].endBit)
    }
    expect(fieldValue(variant.bytes, variant.fields[0])).toBe(7n)
    expect(fieldValue(variant.bytes, variant.fields[1])).toBe(BigInt(length - 8))
  }
  const common = packetExamples.privateSetting.variants[0]
  const coop = packetExamples.privateSetting.variants[1]
  const combined = packetExamples.privateSetting.variants[2]
  expect(readBits(common.bytes, 99, 1)).toBe(1)
  expect(readBits(common.bytes, 616, 1)).toBe(0)
  expect(readBits(coop.bytes, 101, 1)).toBe(1)
  expect(readBits(coop.bytes, 102, 11)).toBe(26)
  expect(readBits(combined.bytes, 99, 1)).toBe(1)
  expect(readBits(combined.bytes, 616, 1)).toBe(1)
  expect(readBits(combined.bytes, 617, 11)).toBe(776)
  expect(readBits(combined.bytes, 628, 1)).toBe(0)
  for (const variant of [common, combined]) {
    const stage = variant.fields.find((item) => item.label === 'StageResource')!
    expect(fieldDisplayHex(variant.bytes, stage)).toBe('Cop_Shakeup')
    const raw = fieldValue(variant.bytes, stage)!
    const stageBytes = Uint8Array.from({ length: 64 }, (_, index) => Number((raw >> BigInt(index * 8)) & 0xffn))
    expect(new TextDecoder().decode(stageBytes.slice(0, 11))).toBe('Cop_Shakeup')
  }
})

test('Net and Session variants retain the saved join messages', () => {
  const cases = [
    ['net32', 'net', 'Net 0x32', 1, 0, 1, 24, '777e35eb7b3c4cecfda3adf69560e134197148681e04082529474ac04fd0c00b'],
    ['net33', 'net', 'Net 0x33', 2, 1, 1, 484, 'a1489a2079e2823c8875c8cd98b3dbf7468ef711f4683e511eac5626d41c8636'],
    ['net12', 'net', 'Net 0x12', 4, 0, 1, 8, '25fe5aed54af46393919707020fcbc4765c7a85552db3706612a195ea0ff92bd'],
    ['net50', 'net', 'Net 0x50', 7, 0, 1, 264, '0a16a8615b98119f9207f279fb2c443974be9532603207685920799d6070d20f'],
    ['net51', 'net', 'Net 0x51', 10, 0, 1, 8, '6c682e7a4d2f8d3227ca9e07f1a0f758276bc4610637b6dd449997f45b4443b4'],
    ['session2', 'session', 'Session 2', 5, 0, 13, 37, '6320000a238e7c5382e6b3f15c81e25dd629f1de7261fefafeb0894504051e64'],
    ['session5', 'session', 'Session 5', 5, 1, 13, 199, '29e78027bafe7769a7f6118e24366996476d55cffddc658ef9d96ac00949f69c'],
    ['session6', 'session', 'Session 6', 6, 0, 13, 15, 'abab41be0ba9bf3270f3345ecd362af37b14019655dd859a4f00be83feaa4e9c'],
  ] as const
  for (const [captureName, kind, label, record, chunkIndex, protocolId, length, digest] of cases) {
    const capture = protocolCaptures[captureName]
    const variant = packetExamples[kind].variants.find((item) => item.label === label)!
    expect([capture.record, capture.chunkIndex, capture.protocolId]).toEqual([record, chunkIndex, protocolId])
    expect(variant.bytes).toBe(capture.payload)
    expect(variant.bytes.length).toBe(length)
    expect(createHash('sha256').update(variant.bytes).digest('hex')).toBe(digest)
    expect(variant.fields[0].startBit).toBe(0)
    expect(variant.fields.at(-1)?.endBit).toBe(length * 8)
    for (let index = 1; index < variant.fields.length; index++) {
      expect(variant.fields[index].startBit).toBe(variant.fields[index - 1].endBit)
    }
  }
  const net = packetExamples.net.variants
  const value = (label: string, field: string) => {
    const variant = net.find((item) => item.label === label)!
    return fieldValue(variant.bytes, variant.fields.find((item) => item.label === field)!)
  }
  expect(value('Net 0x11', 'Sequence')).toBe(value('Net 0x12', 'Sequence'))
  expect(value('Net 0x50', 'Generation')).toBe(value('Net 0x51', 'Generation'))
  const session5 = packetExamples.session.variants.find((item) => item.label === 'Session 5')!
  const recordCount = session5.fields.find((item) => item.label === 'RecordCount')!
  expect([recordCount.startBit, recordCount.endBit]).toEqual([17 * 8, 18 * 8])
  expect(fieldValue(session5.bytes, recordCount)).toBe(2n)
  expect(fieldValue(session5.bytes, session5.fields.find((item) => item.label === 'NameLength[0]')!)).toBe(10n)
  expect(fieldValue(session5.bytes, session5.fields.find((item) => item.label === 'NameLength[1]')!)).toBe(6n)
})

test('RTT request and reply retain the authenticated echo pair', () => {
  const [request, reply] = packetExamples.rtt.variants
  expect([request.label, reply.label]).toEqual(['Request', 'Reply'])
  expect(request.bytes).toBe(protocolCaptures.rttRequest.payload)
  expect(reply.bytes).toBe(protocolCaptures.rtt.payload)
  expect([protocolCaptures.rttRequest.record, protocolCaptures.rttRequest.chunkIndex,
    protocolCaptures.rtt.record, protocolCaptures.rtt.chunkIndex]).toEqual([8, 0, 9, 1])
  expect([request.bytes.length, reply.bytes.length]).toEqual([21, 21])
  expect(createHash('sha256').update(request.bytes).digest('hex'))
    .toBe('bfa3891447de383cbd67dc0c684349ed53d4ef39a64519e0c10ad79a1cff133c')
  expect(createHash('sha256').update(reply.bytes).digest('hex'))
    .toBe('1fcfcfec31d75270c7a7e5bde77614d49d68ca62f0eabd52774e572ac8ae1e7c')
  expect([fieldValue(request.bytes, request.fields[0]), fieldValue(reply.bytes, reply.fields[0])])
    .toEqual([0n, 1n])
  expect(fieldValue(request.bytes, request.fields[1]))
    .toBe(fieldValue(reply.bytes, reply.fields[1]))
  expect([fieldValue(request.bytes, request.fields[3]), fieldValue(reply.bytes, reply.fields[3])])
    .toEqual([0n, 0x7314n])
  expect(fieldValue(request.bytes, request.fields[4]))
    .toBe(fieldValue(reply.bytes, reply.fields[4]))
  for (const variant of [request, reply]) {
    expect(variant.fields[0].startBit).toBe(0)
    expect(variant.fields.at(-1)?.endBit).toBe(21 * 8)
    for (let index = 1; index < variant.fields.length; index++) {
      expect(variant.fields[index].startBit).toBe(variant.fields[index - 1].endBit)
    }
  }
})

test('captured DirectBank payload follows the validated event layout', () => {
  const bytes = directBankPayload
  expect(bytes.length).toBe(29)
  expect(bytes[7]).toBe(0)
  expect((bytes[1] << 8) | bytes[2]).toBe(bytes.length - 8)
  expect((bytes[13] << 8) | bytes[14]).toBe(bytes.length - 17)
  expect(bytes.slice(21, 25)).toEqual(Uint8Array.from([0x59, 0x2c, 0x8d, 0x3d]))
  expect(readBits(bytes, 200, 4)).toBe(1)
  expect(readBits(bytes, 204, 23)).toBe(3492)
  expect(readBits(bytes, 227, 4)).toBe(0)
})

test('authenticated snapshot fixtures retain payload and wire bytes', () => {
  const cases = [
    ['onlineCoopSetting', 211, '5714b913589edcc8038b5cb63944c539a232d41ec241a2831e0dc055b053371c', 237, '737b03e1880230bc42a228442463f53b961f88c93feddca9f454b8e9c5eef4bc'],
    ['enemySpawn', 89, '111e26ab93845c02e6206ee108e5a06d192781403681b7f58899b2f8180df59a', 253, 'c9aa19cea9c5aa778c2f19944ae9f358b486dc12bcb0c79d3a58b44c04c68a49'],
    ['itemSpawn', 60, 'ae6c190716ea96420ed3c84dca1f56b022c41c59b52c3bf0c6dc778b5bfbda91', 397, '5cca4d971d41f0c9d068bd91a779bab170a6ce0d60891ca75f3b9366eed65343'],
    ['playerGet', 38, '33a3583830f680bb06c89d72e13dd5957700d04babc84e53fd519abc4bb4e457', 397, 'fba55f9311932511006e2b9e2bb44e50054a92994f3fc4e396b0c9b35c749275'],
    ['enemyGet', 37, 'c135eac2c5270d350039be7dccbf9d6c4bb92bbf35be5c3140fb9ab1222812cc', 285, '796a34c1b8ddced746f3755e641cc494c923c3155f4d64ce77eae6069cb6a1f2'],
    ['goldenShot', 53, 'fb1baa730dcab36fda17ba82bcac2256686e674caad55b63a97f766dbac476b9', 333, 'c52e5aabd2e7bb82e51d9f4d29207e5b7aedc88f110c097692f4ad3f9194485b'],
    ['directBank', 29, 'b5c668a46e2840aab391165866655c72830be451d27c9efe1307d7218785af44', 333, '8d5751fff514dbd6c21c22f5b3039df904803a8d7a409652ef80296ac67cecc3'],
    ['sequence', 118, '34c03173df51f9d524f6e48fc44ac3f08058780aa043d6ffdfa0a7ddd12e12db', 173, '1d8f8a7f02511d853c3db4ffb6feb5d8113c2f5971d0c7d32090b5126085b7fd'],
    ['playerStateHost', 109, '332e298bf83e46d6de35447d04637a2d566c174f6b4a3696c7f8f2657017a5bd', 173, 'd185feba58ee461175c6728f85bbcadd6d017b74388510d93e6e9eb0cf4135c1'],
    ['playerStateClient', 109, 'b1dd53df928fe97ca281d0c37b02e5eb2f9b5edb0613735ad9468f6201370db3', 205, '5777c31fb9472f5e60ad5505e9df79185dd768faa94f550a6afc133dd53207a2'],
  ] as const
  for (const [kind, length, digest, wireLength, wireDigest] of cases) {
    const capture = packetCaptures[kind]
    expect(capture.payload.length).toBe(length)
    expect(createHash('sha256').update(capture.payload).digest('hex')).toBe(digest)
    expect(capture.encryptedUdp.length).toBe(wireLength)
    expect(createHash('sha256').update(capture.encryptedUdp).digest('hex')).toBe(wireDigest)
    expect(capture.encryptedUdp.slice(0, 5)).toEqual(Uint8Array.from([0x32, 0xab, 0x98, 0x64, 0x8f]))
    expect(capture.encryptedUdp[5] & 1).toBe(1)
  }
})

test('byte inspection exposes every overlapping field and decodes values', () => {
  const byte25 = fieldsAtByte(plaintextFields, 25)
  expect(byte25.map((field) => field.label)).toEqual(['Value + 1', 'GameFrame'])
  expect(byte25.map((field) => fieldValue(directBankPayload, field))).toEqual([1n, 3492n])
  expect(fieldsAtByte(plaintextFields, 28).map((field) => field.label)).toEqual([
    'GameFrame', 'LifeNumber', 'Padding',
  ])
})

test('shared UDP layout uses a saved packet and marks the encrypted body', () => {
  const variant = packetExamples.packetLayout.variants[0]
  expect(variant.bytes).toEqual(packetCaptures.sequence.encryptedUdp)
  expect(fieldsAtByte(variant.fields, 0).map((field) => field.label)).toEqual(['Magic Byte'])
  expect(fieldsAtByte(variant.fields, 28).map((field) => field.label)).toEqual(['Auth Tag'])
  expect(fieldsAtByte(variant.fields, 29).map((field) => field.label)).toEqual(['CipherText'])
  expect(variant.fields.at(-1)?.endBit).toBe(variant.bytes.length * 8)
})

test('response examples retain distinct unknown field widths', () => {
  expect(packetExamples.playerGet.variants.at(-1)!.fields
    .filter((field) => field.label === 'Unknown')
    .map((field) => field.endBit - field.startBit)).toEqual([32, 2, 3])
  expect(packetExamples.enemyGet.variants.at(-1)!.fields
    .filter((field) => field.label === 'Unknown')
    .map((field) => field.endBit - field.startBit)).toEqual([32, 2, 3])
})

test('every event example has its documented type, size, metadata, and padding', () => {
  const cases = [
    ['enemySpawn', 89, 0x0caefc01, 481],
    ['itemSpawn', 60, 0x6e7d7386, 252],
    ['playerGet', 38, 0x5b64bbf1, 73],
    ['enemyGet', 37, 0xedbcbb02, 69],
    ['goldenShot', 53, 0xf010cc79, 195],
    ['directBank', 29, 0x3d8d2c59, 4],
  ] as const
  for (const [kind, length, typeId, bodyBits] of cases) {
    const variant = packetExamples[kind].variants.at(-1)!
    expect(variant.bytes.length).toBe(length)
    expect((variant.bytes[1] << 8) | variant.bytes[2]).toBe(length - 8)
    expect((variant.bytes[13] << 8) | variant.bytes[14]).toBe(length - 17)
    expect(new DataView(variant.bytes.buffer).getUint32(21, true)).toBe(typeId)
    const frameBit = 200 + bodyBits
    expect(variant.fields.find((field) => field.label === 'GameFrame')?.startBit).toBe(frameBit)
    expect(variant.fields.find((field) => field.label === 'LifeNumber')?.startBit).toBe(frameBit + 23)
    expect(variant.fields.at(-1)?.endBit).toBe(length * 8)
  }
})

test('captured OnlineCoopSetting payload matches the saved authenticated record', () => {
  const { bytes, fields } = packetExamples.onlineCoopSetting.variants[0]
  expect(bytes.length).toBe(211)
  expect(createHash('sha256').update(bytes).digest('hex'))
    .toBe('5714b913589edcc8038b5cb63944c539a232d41ec241a2831e0dc055b053371c')
  expect(new DataView(bytes.buffer).getUint32(21, true)).toBe(0x9a1e036d)
  expect(new TextDecoder().decode(bytes.slice(25, 38))).toBe('Cop_Shakedent')
  expect(readBits(bytes, 712, 3)).toBe(1)
  expect(readBits(bytes, 715, 10) - 1).toBe(1)
  expect(fields.find((field) => field.label === 'UnlockedSeason')?.startBit).toBe(715)
  expect(readBits(bytes, 725, 3)).toBe(4)
  expect(Array.from({ length: 4 }, (_, index) => readBits(bytes, 728 + index * 16, 16) - 3))
    .toEqual([-1, -1, -1, -1])
  expect(fields.find((field) => field.label === 'WeaponId Count')?.startBit).toBe(725)
  expect(fields.filter((field) => /^WeaponId\[\d\]$/.test(field.label)).length).toBe(4)
  expect(readBits(bytes, 1064, 11)).toBe(151)
  expect(fields.find((field) => field.label === 'Difficulty')?.startBit).toBe(1064)
  expect(readBits(bytes, 1559, 32)).toBe(0x000b0300)
  expect(fields.find((field) => field.label === 'ScenarioAppVersion')?.startBit).toBe(1559)
  expect(readBits(bytes, 1591, 1)).toBe(0)
  expect(readBits(bytes, 1592, 3)).toBe(0)
  expect(fields.find((field) => field.label === 'ScenarioCompetitionType')?.startBit).toBe(1591)
  expect(fields.find((field) => field.label === 'ScenarioOriginalWeaponIdArray Count')?.startBit).toBe(1592)
  expect(fields.find((field) => field.label === 'GameFrame')?.startBit).toBe(1659)
  expect(fields.find((field) => field.label === 'LifeNumber')?.startBit).toBe(1682)
  expect(fields.at(-1)?.endBit).toBe(1688)
})

test('P5 examples use payload-relative framing and preserve array boundaries', () => {
  const sequence = packetExamples.sequence.variants[0]
  expect(sequence.bytes.length).toBe(118)
  expect(readBits(sequence.bytes, 0, 1)).toBe(1)
  expect(readBits(sequence.bytes, 1, 12)).toBe(63)
  expect(readBits(sequence.bytes, 13, 32)).toBe(1104)
  expect(readBits(sequence.bytes, 45, 1)).toBe(1)
  expect(readBits(sequence.bytes, 46, 3)).toBe(0)
  expect(readBits(sequence.bytes, 49, 6)).toBe(4)
  expect(readBits(sequence.bytes, 75, 1)).toBe(0)
  expect(readBits(sequence.bytes, 76, 12)).toBe(222)
  expect(readBits(sequence.bytes, 88, 32)).toBe(1107)
  expect(readBits(sequence.bytes, 120, 1)).toBe(1)
  expect(readBits(sequence.bytes, 310, 12)).toBe(619)
  expect(readBits(sequence.bytes, 322, 32)).toBe(200000)
  expect(readBits(sequence.bytes, 354, 1)).toBe(1)
  expect(sequence.fields.find((field) => field.label === 'Frame 3 Length')?.startBit).toBe(310)
  expect(sequence.fields.find((field) => field.label === 'Frame 3 Group ID')?.startBit).toBe(322)
  expect(sequence.fields.find((field) => field.label === 'Frame 3 Present')?.startBit).toBe(354)
  expect(readBits(sequence.bytes, 941, 3)).toBe(0)
  expect(sequence.fields.filter((field) => field.label.startsWith('Position ') && field.startBit >= 355 && field.endBit <= 406)
    .map((field) => [field.startBit, field.endBit])).toEqual([[355, 372], [372, 389], [389, 406]])
  expect(sequence.fields.find((field) => field.label === 'Horizontal Angle Raw')?.startBit).toBe(514)
  expect(sequence.fields.find((field) => field.label === 'Squid/Human Select')?.startBit).toBe(673)
  expect(sequence.fields.at(-1)?.startBit).toBe(941)
  expect(sequence.fields.at(-1)?.endBit).toBe(118 * 8)
  for (const [variant, group, nextGroup] of [[packetExamples.playerState.variants[0], 1107, 200000],
    [packetExamples.playerState.variants[1], 1108, 210000]] as const) {
    expect(variant.bytes.length).toBe(109)
    expect(readBits(variant.bytes, 1, 12)).toBe(222)
    expect(readBits(variant.bytes, 13, 32)).toBe(group)
    expect(readBits(variant.bytes, 45, 1)).toBe(1)
    expect(readBits(variant.bytes, 72, 3)).toBe(4)
    expect(readBits(variant.bytes, 123, 3)).toBe(4)
    expect(readBits(variant.bytes, 235, 12)).toBe(619)
    expect(readBits(variant.bytes, 247, 32)).toBe(nextGroup)
    expect(readBits(variant.bytes, 279, 1)).toBe(1)
    expect(variant.fields.find((field) => field.label === 'Next Frame Length')?.startBit).toBe(235)
    expect(variant.fields.find((field) => field.label === 'Next Group ID')?.startBit).toBe(247)
    expect(variant.fields.find((field) => field.label === 'Next Present')?.startBit).toBe(279)
    expect(readBits(variant.bytes, 866, 6)).toBe(0)
    expect(variant.fields.filter((field) => field.label.startsWith('Position ') && field.startBit >= 280 && field.endBit <= 331)
      .map((field) => [field.startBit, field.endBit])).toEqual([[280, 297], [297, 314], [314, 331]])
    expect(variant.fields.find((field) => field.label === 'Horizontal Angle Raw')?.startBit).toBe(439)
    expect(variant.fields.find((field) => field.label === 'Squid/Human Select')?.startBit).toBe(598)
    expect(variant.fields.at(-1)?.startBit).toBe(866)
    expect(variant.fields.at(-1)?.endBit).toBe(109 * 8)
  }
})

test('player current-reference label keeps its five-bit bias and both payload origins', () => {
  for (const [variants, start] of [
    [packetExamples.playerState.variants, 280],
    [packetExamples.playerNetState.variants, 280],
    [packetExamples.sequence.variants, 355],
  ] as const) {
    for (const variant of variants) {
      const field = variant.fields.find((f) => f.label === 'Current State Label + 1')
      expect(field?.startBit).toBe(start + 304)
      expect(field?.endBit).toBe(start + 309)
      expect(fieldValue(variant.bytes, field!)).toBe(BigInt(readBits(variant.bytes, start + 304, 5)))
      const fields = variant.fields.filter((f) => f.startBit < start + 318 && f.endBit > start + 286)
      expect(fields.map((f) => [f.label, f.startBit, f.endBit])).toEqual([
        ['Unknown', start + 286, start + 304],
        ['Current State Label + 1', start + 304, start + 309],
        ['Unknown', start + 309, start + 318],
      ])
    }
  }
})

test('player union layouts distinguish supported payloads, fixed padding and unsupported tags', () => {
  const registries = [
    { start: 329, width: 3, budget: 108, sizes: [108, 1, 5, 64, 0] },
    { start: 440, width: 4, budget: 16, sizes: [0, 1, 8, 15, 13, 5, 11, 2, 13, 9, 6, 14, 10, 16, 1] },
    { start: 460, width: 2, budget: 1, sizes: [0, 1, 1] },
  ]
  for (const registry of registries) {
    for (let tag = 0; tag <= registry.sizes.length; tag++) {
      const bytes = new Uint8Array(74)
      for (let bit = 0; bit < registry.width; bit++) {
        if (tag & (1 << bit)) bytes[(registry.start + bit) >> 3] |= 1 << ((registry.start + bit) & 7)
      }
      const end = registry.start + registry.width + registry.budget
      const fields = playerNetUnionFields(bytes, 0).filter((f) => f.startBit >= registry.start && f.endBit <= end)
      expect(fields[0]).toMatchObject({ label: 'Variant Select', startBit: registry.start, endBit: registry.start + registry.width })
      expect(fields.at(-1)?.endBit).toBe(end)
      expect(fields.every((f) => f.endBit > f.startBit)).toBe(true)
      for (let index = 1; index < fields.length; index++) expect(fields[index].startBit).toBe(fields[index - 1].endBit)
      const payload = fields.filter((f) => f.label !== 'Variant Select' && f.label !== 'Padding')
      const payloadBits = payload.reduce((n, f) => n + f.endBit - f.startBit, 0)
      const paddingBits = fields.filter((f) => f.label === 'Padding').reduce((n, f) => n + f.endBit - f.startBit, 0)
      if (tag === registry.sizes.length) {
        expect(payload.map((f) => [f.startBit, f.endBit])).toEqual([[registry.start + registry.width, end]])
        expect(paddingBits).toBe(0)
      } else {
        expect(payloadBits).toBe(registry.sizes[tag])
        expect(paddingBits).toBe(registry.budget - registry.sizes[tag])
        if (registry.start === 329 && tag === 0) expect(payload.map((f) => [f.label, f.startBit, f.endBit])).toEqual([
          ['Unknown', 332, 333], ['Unknown', 333, 357], ['Unknown', 357, 381],
          ['Jump Vector Pitch Raw', 381, 391], ['Jump Vector Yaw Raw', 391, 402], ['Jump Vector Length Raw', 402, 414],
          ['Unknown', 414, 439], ['Unknown', 439, 440],
        ])
        if (registry.start === 329 && tag === 3) expect(payload.map((f) => f.endBit - f.startBit)).toEqual([17, 17, 17, 10, 3])
      }
    }
  }
})

test('unaligned unknown fields exclude adjacent bits', () => {
  const variant = packetExamples.enemySpawn.variants.at(-1)!
  const unknown = variant.fields.find((field) => field.label === 'Unknown' && field.startBit === 345)!
  expect([unknown.startBit, unknown.endBit]).toEqual([345, 377])
  expect(fieldDisplayHex(variant.bytes, unknown)).toMatch(/^0x[0-9a-f]{8}$/)
  const marked = variant.bytes.slice()
  for (const bit of [unknown.startBit - 1, unknown.endBit]) marked[bit >> 3] |= 1 << (bit & 7)
  expect(fieldDisplayHex(marked, unknown)).toBe(`0x${readBits(variant.bytes, 345, 32).toString(16).padStart(8, '0')}`)
})

test('captured item spawn links to the selected player response', () => {
  const spawn = packetExamples.itemSpawn.variants.at(-1)!.bytes
  const link = (readBits(spawn, 393, 4) << 24) + readBits(spawn, 385, 8)
  expect(link).toBe(5)
  expect(link).toBe(readBits(packetExamples.playerGet.variants.at(-1)!.bytes, 200, 32))
  expect(link).not.toBe(readBits(packetExamples.enemyGet.variants.at(-1)!.bytes, 200, 32))
})
