import type {
  PacketExample,
  PacketField,
  PacketVariant,
} from "./packetExample";

// Structural examples only: chosen constants, never copied from a capture.
// Definitions use native typed-body LSB0 offsets and wire values (before bias removal).
// Sources: owned 11.3.0 native schemas in NXCTF's six-protocol evidence packages;
// UserSetting is the complete 82-field projection of user-setting-schema.json.
type Definition = readonly [
  label: string,
  startBit: number,
  width: number,
  value?: number | bigint,
];

function body(
  typeName: string,
  bitLength: number,
  definitions: readonly Definition[],
  origin = `型付き本文 · ${typeName}（本文bit0起点）`,
): PacketExample {
  const bytes = new Uint8Array(Math.ceil(bitLength / 8));
  const fields: PacketField[] = [];
  let cursor = 0;
  const append = (label: string, startBit: number, endBit: number) => {
    fields.push({
      label,
      startBit,
      endBit,
      encoding: "bits",
      codeName: label !== "Unknown" && label !== "Padding",
      markStart: label !== "Padding",
    });
  };
  for (const [label, start, width, raw = 0] of definitions) {
    if (
      !Number.isInteger(start) ||
      !Number.isInteger(width) ||
      width <= 0 ||
      start < cursor ||
      start + width > bitLength
    )
      throw new Error(`Invalid ${typeName} field at ${start}`);
    if (start > cursor) append("Unknown", cursor, start);
    const value = BigInt(raw);
    if (value < 0n || value >= 1n << BigInt(width))
      throw new Error(`Value outside ${typeName} field at ${start}`);
    for (let i = 0; i < width; i++)
      if ((value >> BigInt(i)) & 1n)
        bytes[(start + i) >> 3] |= 1 << ((start + i) & 7);
    append(label, start, start + width);
    cursor = start + width;
  }
  if (cursor < bitLength) append("Unknown", cursor, bitLength);
  if (bitLength < bytes.length * 8)
    append("Padding", bitLength, bytes.length * 8);
  const variant: PacketVariant = {
    label: typeName,
    bytes,
    fields,
    provenance: "structural",
    origin,
    bitLength,
  };
  return { variants: [variant] };
}

const userSettingDefinitions: readonly Definition[] = [
  ["NplnUserId", 0, 256],
  ["UserName", 256, 408],
  ["Identifier", 664, 128],
  ["UserNameSource", 792, 3],
  ["CallSign", 795, 14],
  ["Team", 809, 3],
  ["Coordinates.ModelType", 812, 3, 2],
  ["Coordinates.Weapon.MainId", 815, 16, 22031],
  ["Coordinates.Weapon.SubId", 831, 16],
  ["Coordinates.Weapon.SpecialId", 847, 16],
  ["Coordinates.Weapon.TotalPaintTubo", 863, 30],
  ["Coordinates.Weapon.Exp", 893, 24],
  ["Coordinates.Weapon.Level", 917, 4],
  ["Coordinates.GearHead.Id", 921, 16],
  ["Coordinates.GearHead.VariationId", 937, 4],
  ["Coordinates.GearHead.Exp", 941, 17],
  ["Coordinates.GearHead.TotalExp", 958, 24],
  ["Coordinates.GearHead.Rarity", 982, 3],
  ["Coordinates.GearHead.MainSkill", 985, 5],
  ["Coordinates.GearHead.ExSkillCount", 990, 2, 1],
  ["Coordinates.GearHead.ExSkillSlot0", 992, 5, 4],
  ["Coordinates.GearHead.ExSkillSlot1", 997, 5],
  ["Coordinates.GearHead.ExSkillSlot2", 1002, 5],
  ["Coordinates.GearClothes.Id", 1007, 16],
  ["Coordinates.GearClothes.VariationId", 1023, 4],
  ["Coordinates.GearClothes.Exp", 1027, 17],
  ["Coordinates.GearClothes.TotalExp", 1044, 24],
  ["Coordinates.GearClothes.Rarity", 1068, 3],
  ["Coordinates.GearClothes.MainSkill", 1071, 5],
  ["Coordinates.GearClothes.ExSkillCount", 1076, 2],
  ["Coordinates.GearClothes.ExSkillSlot0", 1078, 5],
  ["Coordinates.GearClothes.ExSkillSlot1", 1083, 5],
  ["Coordinates.GearClothes.ExSkillSlot2", 1088, 5],
  ["Coordinates.GearShoes.Id", 1093, 16],
  ["Coordinates.GearShoes.VariationId", 1109, 4],
  ["Coordinates.GearShoes.Exp", 1113, 17],
  ["Coordinates.GearShoes.TotalExp", 1130, 24],
  ["Coordinates.GearShoes.Rarity", 1154, 3],
  ["Coordinates.GearShoes.MainSkill", 1157, 5],
  ["Coordinates.GearShoes.ExSkillCount", 1162, 2],
  ["Coordinates.GearShoes.ExSkillSlot0", 1164, 5],
  ["Coordinates.GearShoes.ExSkillSlot1", 1169, 5],
  ["Coordinates.GearShoes.ExSkillSlot2", 1174, 5],
  ["Coordinates.Hair", 1179, 10, 20],
  ["Coordinates.Bottom", 1189, 10],
  ["Coordinates.BottomVariation", 1199, 4],
  ["Coordinates.SkinColor", 1203, 4],
  ["Coordinates.EyeColor", 1207, 5],
  ["Coordinates.Eyebrow", 1212, 5, 1],
  ["Coordinates.CoopSkin", 1217, 6],
  ["Coordinates.WinEmote", 1223, 10],
  ["NamePlate.Byname.Adjective", 1233, 17],
  ["NamePlate.Byname.Subject", 1250, 17],
  ["NamePlate.Byname.Gender", 1267, 2],
  ["NamePlate.Badge1", 1269, 32],
  ["NamePlate.Badge2", 1301, 32],
  ["NamePlate.Badge3", 1333, 32],
  ["NamePlate.Background", 1365, 17],
  ["GameStatus.PlayerRank", 1382, 10],
  ["GameStatus.Udemae", 1392, 8],
  ["GameStatus.CoopOnlineEvalRaw", 1400, 24],
  ["GameStatus.CoopSmell", 1424, 3],
  ["GameStatus.XRateVar", 1427, 22],
  ["GameStatus.XRateVgl", 1449, 22],
  ["GameStatus.XRateVlf", 1471, 22],
  ["GameStatus.XRateVcl", 1493, 22],
  ["GameStatus.Rate", 1515, 22],
  ["GameStatus.FestRank", 1537, 7],
  ["GameStatus.FesWinProof", 1544, 2],
  ["GameStatus.WinStreak", 1546, 10],
  ["GameStatus.DisconnectNum", 1556, 6],
  ["GameStatus.HasXCrown", 1562, 1],
  ["GameStatus.IsMeasuredRate", 1563, 1],
  ["GameStatus.ChallengeVictoryStreak", 1564, 7],
  ["GameStatus.InnerMmrRate", 1571, 22],
  ["GameStatus.SprRate", 1593, 22],
  ["GameStatus.XmmrRate", 1615, 22],
  ["TeamColorHash", 1637, 16],
  ["FestIdHash", 1653, 32],
  ["FestTeam", 1685, 3],
  ["Unknown", 1688, 3],
  ["Unknown", 1691, 4],
];

const attackDefinitions: readonly Definition[] = [
  ["Packed Direction", 0, 21],
  ["Vector Magnitude Raw", 21, 12],
  ["Unknown", 33, 3],
  ["Damage Contribution + 1", 36, 17, 101],
  ["Unknown", 53, 3],
  ["DamageReason Kind + 1", 56, 2, 1],
  ["Unknown", 58, 4],
  ["DamageReason ID + 1", 62, 16, 22031],
  ["Unknown", 78, 1],
  ["Unknown", 79, 1],
  ["Source Reference Raw", 80, 31],
  ["Unknown", 111, 4],
];
const paintDefinitions: readonly Definition[] = [
  ["X Raw", 0, 17, 65537],
  ["Y Raw", 17, 17],
  ["Z Raw", 34, 17],
  ["Size A Raw", 51, 12, 256],
  ["Size B Raw", 63, 12, 128],
  ["Direction A Pitch", 75, 7],
  ["Direction A Yaw", 82, 8],
  ["Direction B Pitch", 90, 7],
  ["Direction B Yaw", 97, 8],
  ["Unknown", 105, 2],
  ["Paint Definition", 107, 6],
  ["Unknown", 113, 3],
  // Chosen pattern: not a captured random input or a room GameSeed.
  ["Pattern Input", 116, 21, 0x15555],
  ["Unknown", 137, 4],
];
const positionDefinitions: readonly Definition[] = [
  ["X Raw", 0, 17],
  ["Y Raw", 17, 17],
  ["Z Raw", 34, 17],
];

// Reliable serializes each presence flag immediately before its optional body.
// With only slots 6/7 present: 7 + 1695 + 1 + 17 + 4 = 1724 bits.
const stationDefinitions: readonly Definition[] = [
  ...Array.from({ length: 6 }, (_, i): Definition => [
    `Slot[${i}] Present`,
    i,
    1,
  ]),
  ["Slot[6] Present", 6, 1, 1],
  ...userSettingDefinitions.map(([label, start, width, value]): Definition => [
    label,
    start + 7,
    width,
    value,
  ]),
  ["Slot[7] Present", 1702, 1, 1],
  ["Unknown", 1703, 17, 47],
  ...Array.from({ length: 4 }, (_, i): Definition => [
    `Slot[${i + 8}] Present`,
    1720 + i,
    1,
  ]),
];
function roles(start: number): Definition[] {
  return [
    ["Count", start, 4, 2],
    ["Unknown", start + 4, 3, 3],
    ["Unknown", start + 7, 3, 1],
    ["Padding", start + 10, 24],
  ];
}

// Native decoder tag order, size methods and fixed parent budgets.
// Tags are array indices; native 32-bit type IDs are not encoded here.
export interface PlayerUnionDefinition {
  kind: "playerActionStates" | "playerInkActions" | "playerAuxActions";
  bodyStart: number;
  tagBits: number;
  budget: number;
  variants: readonly { name: string; payloadBits: number }[];
}

export const playerUnionDefinitions = [
  {
    kind: "playerActionStates",
    bodyStart: 329,
    tagBits: 3,
    budget: 108,
    variants: [
      {
        name: "PlayerNetState_Jump",
        payloadBits: 108,
      },
      {
        name: "PlayerNetState_DokanWarp",
        payloadBits: 1,
      },
      {
        name: "PlayerNetState_Sitting",
        payloadBits: 5,
      },
      {
        name: "PlayerNetState_RespawnLand",
        payloadBits: 64,
      },
      {
        name: "PlayerNetState_DeckEdit",
        payloadBits: 0,
      },
    ],
  },
  {
    kind: "playerInkActions",
    bodyStart: 440,
    tagBits: 4,
    budget: 16,
    variants: [
      {
        name: "PlayerNetState_InkActionNone",
        payloadBits: 0,
      },
      {
        name: "PlayerNetState_InkActionShooter",
        payloadBits: 1,
      },
      {
        name: "PlayerNetState_InkActionRoller",
        payloadBits: 8,
      },
      {
        name: "PlayerNetState_InkActionCharger",
        payloadBits: 15,
      },
      {
        name: "PlayerNetState_InkActionSpinner",
        payloadBits: 13,
      },
      {
        name: "PlayerNetState_InkActionSlosher",
        payloadBits: 5,
      },
      {
        name: "PlayerNetState_InkActionBrush",
        payloadBits: 11,
      },
      {
        name: "PlayerNetState_InkActionManeuver",
        payloadBits: 2,
      },
      {
        name: "PlayerNetState_InkActionShelter",
        payloadBits: 13,
      },
      {
        name: "PlayerNetState_InkActionStringer",
        payloadBits: 9,
      },
      {
        name: "PlayerNetState_InkActionSaber",
        payloadBits: 6,
      },
      {
        name: "PlayerNetState_InkActionSpChariot",
        payloadBits: 14,
      },
      {
        name: "PlayerNetState_InkActionSpNiceBall",
        payloadBits: 10,
      },
      {
        name: "PlayerNetState_InkActionSpCastle",
        payloadBits: 16,
      },
      {
        name: "PlayerNetState_InkActionGachihoko",
        payloadBits: 1,
      },
    ],
  },
  {
    kind: "playerAuxActions",
    bodyStart: 460,
    tagBits: 2,
    budget: 1,
    variants: [
      {
        name: "PlayerNetState_InkActionNone",
        payloadBits: 0,
      },
      {
        name: "PlayerNetState_InkActionBombFizzy",
        payloadBits: 1,
      },
      {
        name: "PlayerNetState_InkActionSuperHook",
        payloadBits: 1,
      },
    ],
  },
] as const satisfies readonly PlayerUnionDefinition[];

export function playerUnionPayloadLayout(
  name: string,
  payloadBits: number,
): readonly (readonly [string, number])[] {
  if (name === "PlayerNetState_Jump")
    return [
      ["Unknown", 1],
      ["Unknown", 24],
      ["Unknown", 24],
      ["Jump Vector Pitch Raw", 10],
      ["Jump Vector Yaw Raw", 11],
      ["Jump Vector Length Raw", 12],
      ["Unknown", 25],
      ["Unknown", 1],
    ];
  if (name === "PlayerNetState_RespawnLand")
    return [17, 17, 17, 10, 3].map((width) => ["Unknown", width] as const);
  return payloadBits ? [["Unknown", payloadBits]] : [];
}

function playerUnionFragment(definition: PlayerUnionDefinition): PacketExample {
  const { bodyStart, tagBits, budget } = definition;
  const bitLength = tagBits + budget;
  return {
    variants: definition.variants.map(({ name, payloadBits }, tag) => {
      const fields: Definition[] = [["Variant Select", 0, tagBits, tag]];
      let cursor = tagBits;
      for (const [label, width] of playerUnionPayloadLayout(
        name,
        payloadBits,
      )) {
        fields.push([label, cursor, width, 1]);
        cursor += width;
      }
      if (payloadBits < budget)
        fields.push(["Padding", cursor, budget - payloadBits]);
      return body(
        name,
        bitLength,
        fields,
        `分岐部分 · ${name} · 本文bit${bodyStart}–${bodyStart + bitLength - 1}（表示内bit0は本文bit${bodyStart}）`,
      ).variants[0];
    }),
  };
}

export const schemaPacketExamples = {
  romInfo: {
    variants: Array.from({ length: 5 }, (_, count) => {
      const fields: Definition[] = [
        ...Array.from({ length: 7 }, (_, i): Definition => [
          "Unknown",
          i * 32,
          32,
          1,
        ]),
        ["Unknown", 224, 1, 1],
        ["Unknown", 225, 2, 1],
        ["Array Count", 227, 3, count],
        ...Array.from({ length: count }, (_, i): Definition => [
          "Unknown",
          230 + i * 64,
          64,
          1,
        ]),
      ];
      if (count < 4)
        fields.push(["Padding", 230 + count * 64, (4 - count) * 64]);
      fields.push(["Unknown", 486, 32, 1], ["Unknown", 518, 32, 1]);
      return body(`RomInfoNetState · Count${count}`, 550, fields).variants[0];
    }),
  },
  playerActionStates: playerUnionFragment(playerUnionDefinitions[0]),
  playerInkActions: playerUnionFragment(playerUnionDefinitions[1]),
  playerAuxActions: playerUnionFragment(playerUnionDefinitions[2]),
  playerForms: {
    variants: [
      ...body(
        "PlayerNetState_Squid",
        11,
        [
          ["Squid/Human Select", 0, 1, 0],
          ["Squid Flag", 1, 1, 1],
          ["Unknown", 2, 2, 2],
          ["Padding", 4, 7],
        ],
        "分岐部分 · PlayerNetState_Squid · 本文bit318–328（表示内bit0は本文bit318）",
      ).variants,
      ...body(
        "PlayerNetState_Human",
        11,
        [
          ["Squid/Human Select", 0, 1, 1],
          ["Human Counter Positive", 1, 1, 1],
          ["Human Counter Positive", 2, 1, 0],
          ["Human Counter Positive", 3, 1, 1],
          ["Unknown", 4, 1, 0],
          ["Unknown", 5, 1, 1],
          ["Human Counter Positive", 6, 1, 1],
          ["Human Counter Positive", 7, 1, 0],
          ["Human Counter Positive", 8, 1, 1],
          ["Unknown", 9, 2, 2],
        ],
        "分岐部分 · PlayerNetState_Human · 本文bit318–328（表示内bit0は本文bit318）",
      ).variants,
    ],
  },
  attackEvent: body("AttackEvent", 115, attackDefinitions),
  attackMulti4: body("AttackEventMulti4", 119, [
    ...attackDefinitions,
    ["Recipient Mask", 115, 4, 5],
  ]),
  attackMulti8: body("AttackEventMulti8", 123, [
    ...attackDefinitions,
    ["Recipient Mask", 115, 8, 129],
  ]),
  colPaint: body("ColPaintEvent", 154, [
    ...paintDefinitions,
    ["Surface Reference", 141, 13, 3],
  ]),
  objPaint: body("ObjPaintEvent", 155, [
    ...paintDefinitions,
    ["Object Reference", 141, 8, 3],
    ["Unknown", 149, 6],
  ]),
  troubleDie: body("PlayerNetEvent::TroubleDie", 78, [
    ...positionDefinitions,
    ["Unknown", 51, 4, 2],
    ["Unknown", 55, 1],
    ["Unknown", 56, 2],
    ["Unknown", 58, 4],
    ["Unknown", 62, 16, 1],
  ]),
  revival: body("PlayerNetEvent::Revival", 110, [
    ...positionDefinitions,
    ["Unknown", 51, 16],
    ["Packed Vector A", 67, 12],
    ["Packed Vector B", 79, 13],
    ["Unknown", 92, 9],
    ["Unknown", 101, 9],
  ]),
  stationInfo: body(
    "StationInfo",
    1724,
    stationDefinitions,
    "StationInfo Reliable要素列（要素列bit0起点・slot 6/7のみ存在）",
  ),
  userSettings: body("VersusUserSettingNetState", 1695, userSettingDefinitions),
  coopUserInfo: body("CoopUserInfoNetState", 17, [["Unknown", 0, 17, 47]]),
  versusUserDbg: body("VersusUserDbgNetState", 3, [["Unknown", 0, 3, 2]]),
  coopSeqStats: body("CoopSeqStatsEvent", 751, [
    ["Outer Count", 0, 3, 1],
    ["Unknown", 3, 12, 0x345],
    ["Inner Count", 15, 5, 2],
    ["Unknown", 20, 10, 17],
    ["Unknown", 30, 10, 1023],
    ["Padding", 40, 150],
    ["Padding", 190, 561],
  ]),
  fallDeath: body("CoopEnemyFallDeathEvent", 0, []),
  pillarDieAir: body("CoopEnemySakePillarDieAirEvent", 1, [
    ["Unknown", 0, 1, 1],
  ]),
  geyserDeath: body("CoopEnemySakelienGeyserDeathEvent", 0, []),
  destroy: body("DestroyEvent", 4, [
    ["Unknown", 0, 1],
    ["Unknown", 1, 3, 1],
  ]),
  coopWeaponId: body("CoopWeaponId", 16, [["WeaponId + 3", 0, 16, 22033]]),
  coopRoundSetup: body("PlayerNetEvent::CoopRoundSetup", 2, [
    ["Unknown", 0, 2, 1],
  ]),
  stationIdArray: body("StationIdArrayNetState", 931, [
    ["Count", 0, 4, 1],
    ["Station[0] Value64", 4, 64, 0x0123456789abcdefn],
    ["Station[0] Value16", 68, 16, 0x1234],
    ["Station[0] Flag", 84, 1, 1],
    ["Padding", 85, 729],
    ["Unknown", 814, 20, 0x54321],
    ["Unknown", 834, 1, 1],
    ["Unknown", 835, 64, 0xfedcba9876543210n],
    ["Unknown", 899, 32, 0x13579bdf],
  ]),
  versusPrivate: body("VersusPrivateSettingNetState", 77, [
    ["Unknown", 0, 43],
    ...roles(43),
  ]),
  versusPreSelect: body("VersusMasterPreSeletTeamNetState", 34, roles(0)),
  onlineVersusRoles: body(
    "OnlineVersusSetting",
    34,
    roles(0),
    "配列部分 · OnlineVersusSetting · 本文bit555–588（表示内bit0起点）",
  ),
} satisfies Record<string, PacketExample>;
