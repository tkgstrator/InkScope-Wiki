import { packetCaptures, type PacketCapture } from './packetCaptures'
import { browseReply, browseReplyPlaintext, browseRequest, browseRequestPlaintext } from './browseCaptures'
import { protocolCaptures } from './protocolCaptures'
import { protocolResearchCaptures } from './protocolResearchCaptures'
import { playerUnionDefinitions, playerUnionPayloadLayout, schemaPacketExamples } from './protocolSchemaExamples'

export const directBankPayload = packetCaptures.directBank.payload

type Encoding = 'bits' | 'be' | 'le'

export interface PacketField {
  label: string
  startBit: number
  endBit: number
  encoding?: Encoding
  codeName?: boolean
  markStart?: boolean
  asText?: boolean
}

export const plaintextFields: PacketField[] = [
  { label: 'Message Length', startBit: 8, endBit: 24, encoding: 'be' },
  { label: 'Event Length', startBit: 104, endBit: 120, encoding: 'be' },
  { label: 'Group ID', startBit: 136, endBit: 168, encoding: 'le' },
  { label: 'Type ID', startBit: 168, endBit: 200, encoding: 'le' },
  { label: 'Value + 1', startBit: 200, endBit: 204, encoding: 'bits' },
  { label: 'GameFrame', startBit: 204, endBit: 227, encoding: 'bits', codeName: true },
  { label: 'LifeNumber', startBit: 227, endBit: 231, encoding: 'bits', codeName: true },
  { label: 'Padding', startBit: 231, endBit: 232, encoding: 'bits', markStart: false },
]

function udpFields(length: number): PacketField[] {
  return [
    { label: 'Magic Byte', startBit: 0, endBit: 32 },
    { label: 'Record Type', startBit: 32, endBit: 40, encoding: 'be' },
    { label: 'Flags', startBit: 40, endBit: 48, encoding: 'be' },
    { label: 'Destination ID', startBit: 48, endBit: 64 },
    { label: 'Source ID', startBit: 64, endBit: 80 },
    { label: 'Packet ID', startBit: 80, endBit: 96 },
    { label: 'Footer Length', startBit: 96, endBit: 104, encoding: 'be' },
    { label: 'Nonce Suffix', startBit: 104, endBit: 168 },
    { label: 'Auth Tag', startBit: 168, endBit: 232 },
    { label: 'CipherText', startBit: 232, endBit: length * 8 },
  ]
}

function packetLayoutVariant(): PacketVariant {
  const bytes = packetCaptures.sequence.encryptedUdp
  return { label: 'UDP', bytes, fields: udpFields(bytes.length) }
}

function byteField(label: string, start: number, end: number, encoding?: Encoding): PacketField {
  return { label, startBit: start * 8, endBit: end * 8, encoding, codeName: true }
}

function browseRequestVariant(): PacketVariant {
  return {
    label: 'UDP/35000',
    bytes: browseRequest,
    fields: [
      byteField('Type', 0, 1, 'be'),
      byteField('HeaderLength', 1, 5, 'be'),
      byteField('MatchmakeKey', 5, 13),
      byteField('Upper', 13, 15, 'be'),
      byteField('Lower', 15, 17, 'be'),
      byteField('Flags', 17, 19, 'be'),
      byteField('TitleId', 19, 27),
      byteField('ChallengeVersion', 27, 28, 'be'),
      byteField('CryptoFlag', 28, 29, 'be'),
      byteField('Counter', 29, 37),
      byteField('Challenge', 37, 53),
      byteField('AuthTag', 53, 69),
      byteField('CipherText', 69, 325),
    ],
  }
}

function browseRequestPlaintextVariant(): PacketVariant {
  return {
    label: 'Plaintext',
    bytes: browseRequestPlaintext,
    fields: Array.from({ length: 8 }, (_, index) =>
      unknownField(index * 256, (index + 1) * 256)),
  }
}

function browseReplyVariant(): PacketVariant {
  return {
    label: 'UDP/35000',
    bytes: browseReply,
    fields: [
      byteField('Type', 0, 1, 'be'),
      byteField('PropertyLength', 1, 5, 'be'),
      unknownField(5 * 8, 105 * 8),
      byteField('SessionParameter', 105, 137),
      unknownField(137 * 8, 544 * 8),
      byteField('HostIPv4', 544, 548),
      unknownField(548 * 8, 560 * 8),
      byteField('PiaPort', 560, 562, 'be'),
      byteField('ChallengeVersion', 562, 563, 'be'),
      byteField('CryptoFlag', 563, 564, 'be'),
      byteField('Counter', 564, 572),
      byteField('ServerRandom', 572, 588),
      byteField('AuthTag', 588, 604),
      byteField('CipherText', 604, 620),
    ],
  }
}

function browseReplyPlaintextVariant(): PacketVariant {
  return {
    label: 'Plaintext',
    bytes: browseReplyPlaintext,
    fields: [byteField('ChallengeProof', 0, 16)],
  }
}

function netVariant(): PacketVariant {
  return {
    label: 'Net 0x11',
    bytes: protocolCaptures.net.payload,
    fields: [
      byteField('Protocol', 0, 1, 'be'),
      byteField('Type', 1, 2, 'be'),
      byteField('EntriesLength', 2, 4, 'be'),
      byteField('Sequence', 4, 8, 'be'),
      byteField('HostTemporaryId', 8, 10, 'be'),
      byteField('HostConstantId', 10, 18),
      byteField('NetworkId', 18, 26),
      byteField('Mode', 26, 27, 'be'),
      byteField('StationCount', 27, 29, 'be'),
      byteField('FeatureFlag', 29, 30, 'be'),
      ...Array.from({ length: 10 }, (_, index) =>
        byteField(`Station[${index}]`, 30 + index * 22, 52 + index * 22)),
    ],
  }
}

function netVariants(): PacketVariant[] {
  const header = (): PacketField[] => [
    byteField('Protocol', 0, 1, 'be'),
    byteField('Type', 1, 2, 'be'),
    byteField('EntriesLength', 2, 4, 'be'),
  ]
  return [
    {
      label: 'Net 0x32', bytes: protocolCaptures.net32.payload,
      fields: [...header(), unknownField(32, 24 * 8)],
    },
    netVariant(),
    {
      label: 'Net 0x33', bytes: protocolCaptures.net33.payload,
      fields: [...header(), unknownField(32, 38 * 8),
        byteField('Reason', 38, 39, 'be'), byteField('Detail', 39, 41, 'be'),
        unknownField(41 * 8, 484 * 8)],
    },
    {
      label: 'Net 0x12', bytes: protocolCaptures.net12.payload,
      fields: [...header(), byteField('Sequence', 4, 8, 'be')],
    },
    {
      label: 'Net 0x50', bytes: protocolCaptures.net50.payload,
      fields: [...header(), byteField('Generation', 4, 8, 'be'),
        unknownField(8 * 8, 264 * 8)],
    },
    {
      label: 'Net 0x51', bytes: protocolCaptures.net51.payload,
      fields: [...header(), byteField('Generation', 4, 8, 'be')],
    },
  ]
}

function rttVariants(): PacketVariant[] {
  const fields = [
    byteField('Type', 0, 1, 'be'),
    byteField('OriginTick', 1, 9, 'be'),
    byteField('ElapsedMicroseconds', 9, 17, 'be'),
    byteField('DestinationVariableId', 17, 19, 'be'),
    byteField('ProtocolStationVariableId', 19, 21, 'be'),
  ]
  return [
    { label: 'Request', bytes: protocolCaptures.rttRequest.payload, fields },
    { label: 'Reply', bytes: protocolCaptures.rtt.payload, fields },
  ]
}

function broadcastReliableHeader(): PacketField[] {
  return [
    byteField('Flags', 0, 1, 'be'),
    byteField('BodyLength', 1, 3, 'be'),
    byteField('Sequence', 3, 5, 'be'),
    byteField('Acknowledgment', 5, 7, 'be'),
    byteField('BitmapBitCount', 7, 8, 'be'),
  ]
}

function broadcastReliableVariants(): PacketVariant[] {
  const data = (label: string, bytes: Uint8Array): PacketVariant => ({
    label, bytes,
    fields: [...broadcastReliableHeader(), unknownField(8 * 8, bytes.length * 8)],
  })
  return [
    {
      label: 'Control',
      bytes: protocolCaptures.broadcastReliable.payload,
      fields: [...broadcastReliableHeader(),
        unknownField(8 * 8, 9 * 8),
        byteField('SlotCount', 9, 10, 'be'),
        ...Array.from({ length: 10 }, (_, index) =>
          byteField(`Slot[${index}]`, 10 + index * 18, 28 + index * 18))],
    },
    data('Data 18 B', protocolCaptures.broadcastReliableData18.payload),
    data('Data 83 B', protocolCaptures.broadcastReliableData83.payload),
  ]
}

function privateSettingVariants(): PacketVariant[] {
  const prefix = () => [...broadcastReliableHeader(), unknownField(64, 97)]
  return [
    {
      label: 'Common', bytes: protocolCaptures.privateCommon.payload,
      fields: [...prefix(), unknownField(97, 99), bitField('CommonPresent', 99, 100, true),
        { ...bitField('StageResource', 100, 612, true), asText: true }, unknownField(612, 616),
        bitField('CoopPresent', 616, 617, true), unknownField(617, 78 * 8)],
    },
    {
      label: 'Coop', bytes: protocolCaptures.privateCoop.payload,
      fields: [...prefix(), unknownField(97, 101), bitField('CoopPresent', 101, 102, true),
        bitField('Difficulty', 102, 113, true), bitField('ScenarioActive', 113, 114, true),
        bitField('CoopScenario', 114, 1256, true), unknownField(1256, 161 * 8)],
    },
    {
      label: 'Combined', bytes: protocolCaptures.privateCombined.payload,
      fields: [...prefix(), unknownField(97, 99), bitField('CommonPresent', 99, 100, true),
        { ...bitField('StageResource', 100, 612, true), asText: true }, unknownField(612, 616),
        bitField('CoopPresent', 616, 617, true), bitField('Difficulty', 617, 628, true),
        bitField('ScenarioActive', 628, 629, true),
        bitField('CoopScenario', 629, 1771, true), unknownField(1771, 226 * 8)],
    },
  ]
}

function sessionVariant(): PacketVariant {
  return {
    label: 'Session 0',
    bytes: protocolCaptures.session.payload,
    fields: [
      byteField('Type', 0, 1, 'be'),
      byteField('ProtocolCount', 1, 2, 'be'),
      byteField('ProtocolVersions', 2, 18),
      byteField('Random', 18, 22),
      byteField('ClientConstantId', 22, 30),
      byteField('ClientTemporaryId', 30, 32, 'be'),
      byteField('NatIpv6Flags', 32, 34),
      byteField('Token', 34, 66),
      byteField('AddressType', 66, 67, 'be'),
      byteField('ClientIPv4', 67, 71),
      byteField('ClientPort', 71, 73, 'be'),
      byteField('HostConstantId', 73, 81),
      byteField('HostTemporaryId', 81, 83, 'be'),
      byteField('PlayerCount', 83, 84, 'be'),
      byteField('ParticipantCount', 84, 85, 'be'),
      byteField('UidData', 85, 101),
      byteField('NameLength', 101, 105, 'be'),
      byteField('NameMarker', 105, 106, 'be'),
      byteField('Name', 106, 112),
    ],
  }
}

function sessionVariants(): PacketVariant[] {
  return [
    sessionVariant(),
    {
      label: 'Session 2', bytes: protocolCaptures.session2.payload,
      fields: [byteField('Type', 0, 1, 'be'), unknownField(8, 12 * 8),
        byteField('HostConstantId', 12, 20), byteField('HostTemporaryId', 20, 22, 'be'),
        byteField('ClientConstantId', 22, 30), byteField('ClientTemporaryId', 30, 32, 'be'),
        unknownField(32 * 8, 37 * 8)],
    },
    {
      label: 'Session 5', bytes: protocolCaptures.session5.payload,
      fields: [byteField('Type', 0, 1, 'be'), byteField('Sequence', 1, 3, 'be'),
        byteField('FragmentHeader', 3, 7), byteField('HostConstantId', 7, 15),
        byteField('HostTemporaryId', 15, 17, 'be'), byteField('RecordCount', 17, 18, 'be'),
        unknownField(18 * 8, 19 * 8),
        byteField('Acknowledgment', 19, 21, 'be'), unknownField(21 * 8, 27 * 8),
        byteField('StationHeader[0]', 27, 84), byteField('Member[0]', 84, 100),
        byteField('NameLength[0]', 100, 104, 'be'), byteField('NameMarker[0]', 104, 105, 'be'),
        byteField('Name[0]', 105, 115), byteField('StationHeader[1]', 115, 172),
        byteField('Member[1]', 172, 188), byteField('NameLength[1]', 188, 192, 'be'),
        byteField('NameMarker[1]', 192, 193, 'be'), byteField('Name[1]', 193, 199)],
    },
    {
      label: 'Session 6', bytes: protocolCaptures.session6.payload,
      fields: [byteField('Type', 0, 1, 'be'), byteField('ClientConstantId', 1, 9),
        byteField('Sequence', 9, 13, 'be'), byteField('Acknowledgment', 13, 15, 'be')],
    },
  ]
}

export function fieldsAtByte(fields: PacketField[], index: number): PacketField[] {
  return fields.filter((field) => field.startBit < (index + 1) * 8 && field.endBit > index * 8)
}

export function fieldValue(bytes: Uint8Array, field: PacketField): bigint | undefined {
  if (!field.encoding) return undefined
  if (field.encoding === 'bits') {
    let value = 0n
    for (let bit = field.startBit; bit < field.endBit; bit++) {
      value |= BigInt((bytes[bit >> 3] >> (bit & 7)) & 1) << BigInt(bit - field.startBit)
    }
    return value
  }
  let value = 0n
  const start = field.startBit / 8
  const end = field.endBit / 8
  if (field.encoding === 'be') {
    for (let index = start; index < end; index++) value = (value << 8n) | BigInt(bytes[index])
  } else {
    for (let index = end - 1; index >= start; index--) value = (value << 8n) | BigInt(bytes[index])
  }
  return value
}

export function fieldHex(field: PacketField, value: bigint): string {
  return `0x${value.toString(16).padStart(Math.ceil((field.endBit - field.startBit) / 4), '0')}`
}

export function fieldDisplayHex(bytes: Uint8Array, field: PacketField): string {
  const value = fieldValue(bytes, field)
  if (field.asText && value !== undefined) {
    const width = Math.floor((field.endBit - field.startBit) / 8)
    const chars = Uint8Array.from({ length: width }, (_, index) =>
      Number((value >> BigInt(index * 8)) & 0xffn))
    const end = chars.indexOf(0)
    return new TextDecoder().decode(end < 0 ? chars : chars.slice(0, end))
  }
  if (value !== undefined) return fieldHex(field, value)
  if (field.startBit % 8 || field.endBit % 8) {
    return fieldHex(field, fieldValue(bytes, { ...field, encoding: 'bits' })!)
  }
  return Array.from(bytes.slice(field.startBit / 8, field.endBit / 8),
    (byte) => byte.toString(16).padStart(2, '0')).join(' ')
}

export interface PacketVariant {
  label: string
  bytes: Uint8Array
  fields: PacketField[]
  provenance?: 'captured' | 'structural'
  origin?: string
  bitLength?: number
}

export interface PacketExample {
  variants: PacketVariant[]
}

function eventFields(bodyBits: number, length: number, bodyFields: PacketField[]): PacketField[] {
  const result: PacketField[] = [
    { label: 'Message Length', startBit: 8, endBit: 24, encoding: 'be' },
    { label: 'Event Length', startBit: 104, endBit: 120, encoding: 'be' },
    { label: 'Group ID', startBit: 136, endBit: 168, encoding: 'le' },
    { label: 'Type ID', startBit: 168, endBit: 200, encoding: 'le' },
  ]
  let cursor = 200
  for (const field of bodyFields) {
    if (field.startBit > cursor) {
      result.push(unknownField(cursor, field.startBit))
    }
    result.push(field)
    cursor = field.endBit
  }
  if (cursor < 200 + bodyBits) {
    result.push(unknownField(cursor, 200 + bodyBits))
  }
  result.push({ label: 'GameFrame', startBit: 200 + bodyBits, endBit: 223 + bodyBits, encoding: 'bits', codeName: true })
  result.push({ label: 'LifeNumber', startBit: 223 + bodyBits, endBit: 227 + bodyBits, encoding: 'bits', codeName: true })
  if (227 + bodyBits < length * 8) {
    result.push({ label: 'Padding', startBit: 227 + bodyBits, endBit: length * 8, encoding: 'bits', markStart: false })
  }
  return result
}

function capturedEventVariant(capture: Pick<PacketCapture, 'payload'>, bodyBits: number, bodyFields: PacketField[]): PacketVariant {
  return {
    label: 'Plaintext',
    bytes: capture.payload,
    fields: eventFields(bodyBits, capture.payload.length, bodyFields),
  }
}

function onlineCoopSettingVariant(): PacketVariant {
  const bodyFields: PacketField[] = [
    { label: 'Stage Resource', startBit: 200, endBit: 712, codeName: true },
    bitField('JobType', 712, 715, true),
    bitField('UnlockedSeason', 715, 725, true),
    bitField('WeaponId Count', 725, 728, true),
    ...Array.from({ length: 4 }, (_, index) =>
      bitField(`WeaponId[${index}]`, 728 + index * 16, 744 + index * 16, true)),
    bitField('Difficulty', 1064, 1075, true),
    ...Array.from({ length: 4 }, (_, index) =>
      bitField(`GameSeed[${index}]`, 1075 + index * 32, 1107 + index * 32, true)),
    bitField('ScenarioAppVersion', 1559, 1591, true),
    bitField('ScenarioCompetitionType', 1591, 1592, true),
    bitField('ScenarioOriginalWeaponIdArray Count', 1592, 1595, true),
  ]
  return {
    label: 'Plaintext',
    bytes: packetCaptures.onlineCoopSetting.payload,
    fields: eventFields(1459, packetCaptures.onlineCoopSetting.payload.length, bodyFields),
  }
}

function bitField(label: string, startBit: number, endBit: number, codeName = false): PacketField {
  return { label, startBit, endBit, encoding: 'bits', codeName }
}

function unknownField(startBit: number, endBit: number): PacketField {
  return { label: 'Unknown', startBit, endBit, markStart: false }
}

function xyz(start: number, name: string): PacketField[] {
  return [
    bitField(`${name} X`, start, start + 17),
    bitField(`${name} Y`, start + 17, start + 34),
    bitField(`${name} Z`, start + 34, start + 51),
  ]
}

function coopStatsFields(start: number): PacketField[] {
  return [
    bitField('IkuraNum', start, start + 14, true),
    bitField('HeldGoldenIkuraNum', start + 14, start + 26, true),
    bitField('Array A Count', start + 26, start + 29),
    ...Array.from({ length: 4 }, (_, index) => bitField(`Array A [${index}]`, start + 29 + index * 12, start + 41 + index * 12)),
    bitField('Array B Count', start + 77, start + 80),
    ...Array.from({ length: 4 }, (_, index) => bitField(`Array B [${index}]`, start + 80 + index * 12, start + 92 + index * 12)),
    bitField('Sequence', start + 128, start + 131, true),
    unknownField(start + 131, start + 133),
    bitField('GameFrame', start + 133, start + 153, true),
    unknownField(start + 153, start + 179),
    unknownField(start + 179, start + 189),
  ]
}

export function playerNetUnionFields(bytes: Uint8Array, start: number): PacketField[] {
  return playerUnionDefinitions.flatMap(definition => {
    const first = start + definition.bodyStart
    const payloadStart = first + definition.tagBits
    const end = payloadStart + definition.budget
    const select = bitField('Variant Select', first, payloadStart)
    const tag = Number(fieldValue(bytes, select))
    const variant = definition.variants[tag]
    if (!variant) return [select, unknownField(payloadStart, end)]
    const fields = [select]
    let cursor = payloadStart
    for (const [label, width] of playerUnionPayloadLayout(variant.name, variant.payloadBits)) {
      fields.push(label === 'Unknown' ? unknownField(cursor, cursor + width) : bitField(label, cursor, cursor + width))
      cursor += width
    }
    if (cursor < end) fields.push({ ...bitField('Padding', cursor, end), markStart: false })
    return fields
  })
}

function playerNetFields(bytes: Uint8Array, start: number): PacketField[] {
  const squid = ((bytes[(start + 318) >> 3] >> ((start + 318) & 7)) & 1) === 0
  return [
    ...xyz(start, 'Position'),
    bitField('Vector A Pitch Raw', start + 51, start + 61),
    bitField('Vector A Yaw Raw', start + 61, start + 72),
    bitField('Vector A Length Raw', start + 72, start + 84),
    bitField('Vector B Pitch Raw', start + 84, start + 94),
    bitField('Vector B Yaw Raw', start + 94, start + 105),
    bitField('Vector B Length Raw', start + 105, start + 117),
    bitField('Basis Z Pitch Raw', start + 117, start + 127),
    bitField('Basis Z Yaw Raw', start + 127, start + 138),
    bitField('Basis Y Input Pitch Raw', start + 138, start + 148),
    bitField('Basis Y Input Yaw Raw', start + 148, start + 159),
    bitField('Horizontal Angle Raw', start + 159, start + 172),
    bitField('Direction Float Raw', start + 172, start + 184),
    unknownField(start + 184, start + 280),
    bitField('PlayerStepPaint State', start + 280, start + 283),
    bitField('PlayerStepPaint Index + 1', start + 283, start + 286),
    unknownField(start + 286, start + 304),
    bitField('Current State Label + 1', start + 304, start + 309),
    unknownField(start + 309, start + 318),
    bitField('Squid/Human Select', start + 318, start + 319),
    bitField(squid ? 'Squid State' : 'Human State', start + 319, start + (squid ? 322 : 329)),
    ...(squid ? [{ ...bitField('Padding', start + 322, start + 329), markStart: false }] : []),
    ...playerNetUnionFields(bytes, start),
    unknownField(start + 463, start + 586),
    { ...bitField('Padding', start + 586, bytes.length * 8), markStart: false },
  ]
}

function p5Fields(capture: PacketCapture, group: number): PacketVariant {
  const sequence = group === 1104
  const bytes = capture.payload
  const fields: PacketField[] = [
    bitField('Frame Mode', 0, 1),
    bitField('Frame Length', 1, 13),
    bitField('Group ID', 13, 45),
    bitField('Present', 45, 46),
  ]
  if (sequence) {
    fields.push(
      bitField('Sequence', 46, 49, true),
      bitField('Quota', 49, 55),
      bitField('Baseline A', 55, 65),
      bitField('Baseline B', 65, 75),
      unknownField(75, 76),
      bitField('Next Frame Length', 76, 88),
      bitField('Next Group ID', 88, 120),
      bitField('Next Present', 120, 121),
      ...coopStatsFields(121),
      bitField('Frame 3 Length', 310, 322),
      bitField('Frame 3 Group ID', 322, 354),
      bitField('Frame 3 Present', 354, 355),
      ...playerNetFields(bytes, 355),
    )
  } else {
    fields.push(
      ...coopStatsFields(46),
      bitField('Next Frame Length', 235, 247),
      bitField('Next Group ID', 247, 279),
      bitField('Next Present', 279, 280),
      ...playerNetFields(bytes, 280),
    )
  }
  return { label: `Group ${group}`, bytes, fields }
}

function capturedVariants(capture: PacketCapture, bodyBits: number, bodyFields: PacketField[]): PacketVariant[] {
  return [capturedEventVariant(capture, bodyBits, bodyFields)]
}

function enemySpawnVariant(): PacketVariant {
  const capture = packetCaptures.enemySpawn
  const count = Number(fieldValue(capture.payload, bitField('Array Count', 341, 345)))
  if (count > 10) throw new Error('Invalid recorded enemy-spawn array count')
  return capturedEventVariant(capture, 481, [
    ...xyz(200, 'Spawn'),
    bitField('Spawn Direction Raw', 251, 272),
    bitField('Predicted Slot', 272, 276),
    bitField('Spawn Frame Raw', 276, 296),
    bitField('SalmonId', 328, 333, true),
    bitField('Pool Selector + 1', 333, 341),
    bitField('Array Count', 341, 345),
    ...Array.from({ length: count }, (_, index) => bitField('Unknown', 345 + index * 32, 377 + index * 32)),
    ...(count < 10 ? [{ ...bitField('Padding', 345 + count * 32, 665), markStart: false }] : []),
  ])
}

function playerNetVariant(capture: PacketCapture, group: number): PacketVariant {
  const variant = p5Fields(capture, group)
  return {
    ...variant,
    label: `Player Group ${group === 1107 ? 200000 : 210000}`,
    provenance: 'captured',
    origin: 'Protocolペイロード · PlayerNetState本文はbit 280から',
    fields: variant.fields.flatMap(field => {
      if (field.label === 'Human State') return [
        ...Array.from({ length: 3 }, (_, index) => bitField('Human Counter Positive', field.startBit + index, field.startBit + index + 1)),
        unknownField(field.startBit + 3, field.startBit + 4),
        unknownField(field.startBit + 4, field.startBit + 5),
        ...Array.from({ length: 3 }, (_, index) => bitField('Human Counter Positive', field.startBit + 5 + index, field.startBit + 6 + index)),
        unknownField(field.startBit + 8, field.endBit),
      ]
      if (field.label === 'Squid State') return [
        bitField('Squid Flag', field.startBit, field.startBit + 1),
        unknownField(field.startBit + 1, field.endBit),
      ]
      return [field]
    }),
  }
}
// Browseは保存したUDP/35000ペイロード、Pia通知は復号後のProtocolペイロード。
export const packetExamples = {
  coopRescued: { variants: [capturedEventVariant(protocolResearchCaptures.coopRescued, 4,
    [bitField('Rescuer Index + 1', 200, 204)])] },
  goldenAssist: { variants: [capturedEventVariant(protocolResearchCaptures.goldenAssist, 4,
    [bitField('Assist Mask', 200, 204)])] },
  enemyState: { variants: [
    capturedEventVariant(protocolResearchCaptures.enemyState, 26,
      [bitField('State + 1', 200, 206), bitField('Transition Frame', 206, 226)]),
    { ...capturedEventVariant(protocolResearchCaptures.enemyDie, 26,
      [bitField('State + 1', 200, 206), bitField('Transition Frame', 206, 226)]), label: 'Die' },
  ] },
  browseRequest: { variants: [browseRequestVariant(), browseRequestPlaintextVariant()] },
  browseReply: { variants: [browseReplyVariant(), browseReplyPlaintextVariant()] },
  net: { variants: netVariants() },
  rtt: { variants: rttVariants() },
  broadcastReliable: { variants: broadcastReliableVariants() },
  privateSetting: { variants: privateSettingVariants() },
  session: { variants: sessionVariants() },
  packetLayout: { variants: [packetLayoutVariant()] },
  onlineCoopSetting: { variants: [
    onlineCoopSettingVariant(),
  ] },
  enemySpawn: { variants: [enemySpawnVariant()] },
  itemSpawn: { variants: capturedVariants(packetCaptures.itemSpawn, 252,
    [...xyz(200, 'Spawn'), bitField('Transform Value', 336, 352), bitField('Link Byte', 385, 393),
      bitField('Link Nibble', 393, 397), bitField('Link Bits', 397, 400), ...xyz(401, 'Other')]) },
  playerGet: { variants: capturedVariants(packetCaptures.playerGet, 73,
    [bitField('Link Value', 200, 232), bitField('Value + 1', 232, 236),
      unknownField(236, 268), unknownField(268, 270), unknownField(270, 273)]) },
  enemyGet: { variants: capturedVariants(packetCaptures.enemyGet, 69,
    [bitField('Link Value', 200, 232), unknownField(232, 264),
      unknownField(264, 266), unknownField(266, 269)]) },
  goldenShot: { variants: capturedVariants(packetCaptures.goldenShot, 195,
    [...xyz(200, 'XYZ A'), bitField('Vector A', 251, 263), bitField('Vector B', 263, 276),
      bitField('Vector Length', 276, 292), ...xyz(292, 'XYZ B'),
      unknownField(343, 359), bitField('Value + 1', 359, 363)]) },
  directBank: { variants: [
    { label: 'Plaintext', bytes: directBankPayload, fields: plaintextFields },
  ] },
  sequence: { variants: [
    p5Fields(packetCaptures.sequence, 1104),
  ] },
  playerState: { variants: [
    p5Fields(packetCaptures.playerStateHost, 1107),
    p5Fields(packetCaptures.playerStateClient, 1108),
  ] },
  playerNetState: { variants: [
    playerNetVariant(packetCaptures.playerStateHost, 1107),
    playerNetVariant(packetCaptures.playerStateClient, 1108),
  ] },
  ...schemaPacketExamples,
} satisfies Record<string, PacketExample>
export type PacketExampleKind = keyof typeof packetExamples
