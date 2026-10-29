import { expect, test } from "bun:test";
import type { PacketVariant } from "../docs/components/packetExample";
import {
  schemaPacketExamples,
  playerUnionDefinitions,
} from "../docs/components/protocolSchemaExamples";
import { hexViewCoverage as coverage } from "../docs/components/hexViewCoverage";
const examples: Record<string, { variants: PacketVariant[] }> =
  schemaPacketExamples;
const sizes: Record<string, number> = {
  playerForms: 11,
  playerActionStates: 111,
  playerInkActions: 20,
  playerAuxActions: 3,
  attackEvent: 115,
  attackMulti4: 119,
  attackMulti8: 123,
  colPaint: 154,
  objPaint: 155,
  troubleDie: 78,
  revival: 110,
  stationInfo: 1724,
  userSettings: 1695,
  coopUserInfo: 17,
  romInfo: 550,
  versusUserDbg: 3,
  coopSeqStats: 751,
  fallDeath: 0,
  pillarDieAir: 1,
  geyserDeath: 0,
  destroy: 4,
  coopWeaponId: 16,
  coopRoundSetup: 2,
  stationIdArray: 931,
  versusPrivate: 77,
  versusPreSelect: 34,
  onlineVersusRoles: 34,
};
const v = (kind: string): PacketVariant => examples[kind]?.variants[0];
// Independent wide-value oracle; no production reader or packing helper.
function read(b: Uint8Array, start: number, width: number): bigint {
  expect(start).toBeGreaterThanOrEqual(0);
  expect(start + width).toBeLessThanOrEqual(b.length * 8);
  let n = 0n;
  for (let i = width - 1; i >= 0; i--) {
    const p = start + i;
    n = n * 2n + BigInt((b[Math.floor(p / 8)] >> (p % 8)) & 1);
  }
  return n;
}
const nativeFields: [string, number, number][] = [
  ["NplnUserId", 0, 256],
  ["UserName", 256, 664],
  ["Identifier", 664, 792],
  ["UserNameSource", 792, 795],
  ["CallSign", 795, 809],
  ["Team", 809, 812],
  ["Coordinates.ModelType", 812, 815],
  ["Coordinates.Weapon.MainId", 815, 831],
  ["Coordinates.Weapon.SubId", 831, 847],
  ["Coordinates.Weapon.SpecialId", 847, 863],
  ["Coordinates.Weapon.TotalPaintTubo", 863, 893],
  ["Coordinates.Weapon.Exp", 893, 917],
  ["Coordinates.Weapon.Level", 917, 921],
  ["Coordinates.GearHead.Id", 921, 937],
  ["Coordinates.GearHead.VariationId", 937, 941],
  ["Coordinates.GearHead.Exp", 941, 958],
  ["Coordinates.GearHead.TotalExp", 958, 982],
  ["Coordinates.GearHead.Rarity", 982, 985],
  ["Coordinates.GearHead.MainSkill", 985, 990],
  ["Coordinates.GearHead.ExSkillCount", 990, 992],
  ["Coordinates.GearHead.ExSkillSlot0", 992, 997],
  ["Coordinates.GearHead.ExSkillSlot1", 997, 1002],
  ["Coordinates.GearHead.ExSkillSlot2", 1002, 1007],
  ["Coordinates.GearClothes.Id", 1007, 1023],
  ["Coordinates.GearClothes.VariationId", 1023, 1027],
  ["Coordinates.GearClothes.Exp", 1027, 1044],
  ["Coordinates.GearClothes.TotalExp", 1044, 1068],
  ["Coordinates.GearClothes.Rarity", 1068, 1071],
  ["Coordinates.GearClothes.MainSkill", 1071, 1076],
  ["Coordinates.GearClothes.ExSkillCount", 1076, 1078],
  ["Coordinates.GearClothes.ExSkillSlot0", 1078, 1083],
  ["Coordinates.GearClothes.ExSkillSlot1", 1083, 1088],
  ["Coordinates.GearClothes.ExSkillSlot2", 1088, 1093],
  ["Coordinates.GearShoes.Id", 1093, 1109],
  ["Coordinates.GearShoes.VariationId", 1109, 1113],
  ["Coordinates.GearShoes.Exp", 1113, 1130],
  ["Coordinates.GearShoes.TotalExp", 1130, 1154],
  ["Coordinates.GearShoes.Rarity", 1154, 1157],
  ["Coordinates.GearShoes.MainSkill", 1157, 1162],
  ["Coordinates.GearShoes.ExSkillCount", 1162, 1164],
  ["Coordinates.GearShoes.ExSkillSlot0", 1164, 1169],
  ["Coordinates.GearShoes.ExSkillSlot1", 1169, 1174],
  ["Coordinates.GearShoes.ExSkillSlot2", 1174, 1179],
  ["Coordinates.Hair", 1179, 1189],
  ["Coordinates.Bottom", 1189, 1199],
  ["Coordinates.BottomVariation", 1199, 1203],
  ["Coordinates.SkinColor", 1203, 1207],
  ["Coordinates.EyeColor", 1207, 1212],
  ["Coordinates.Eyebrow", 1212, 1217],
  ["Coordinates.CoopSkin", 1217, 1223],
  ["Coordinates.WinEmote", 1223, 1233],
  ["NamePlate.Byname.Adjective", 1233, 1250],
  ["NamePlate.Byname.Subject", 1250, 1267],
  ["NamePlate.Byname.Gender", 1267, 1269],
  ["NamePlate.Badge1", 1269, 1301],
  ["NamePlate.Badge2", 1301, 1333],
  ["NamePlate.Badge3", 1333, 1365],
  ["NamePlate.Background", 1365, 1382],
  ["GameStatus.PlayerRank", 1382, 1392],
  ["GameStatus.Udemae", 1392, 1400],
  ["GameStatus.CoopOnlineEvalRaw", 1400, 1424],
  ["GameStatus.CoopSmell", 1424, 1427],
  ["GameStatus.XRateVar", 1427, 1449],
  ["GameStatus.XRateVgl", 1449, 1471],
  ["GameStatus.XRateVlf", 1471, 1493],
  ["GameStatus.XRateVcl", 1493, 1515],
  ["GameStatus.Rate", 1515, 1537],
  ["GameStatus.FestRank", 1537, 1544],
  ["GameStatus.FesWinProof", 1544, 1546],
  ["GameStatus.WinStreak", 1546, 1556],
  ["GameStatus.DisconnectNum", 1556, 1562],
  ["GameStatus.HasXCrown", 1562, 1563],
  ["GameStatus.IsMeasuredRate", 1563, 1564],
  ["GameStatus.ChallengeVictoryStreak", 1564, 1571],
  ["GameStatus.InnerMmrRate", 1571, 1593],
  ["GameStatus.SprRate", 1593, 1615],
  ["GameStatus.XmmrRate", 1615, 1637],
  ["TeamColorHash", 1637, 1653],
  ["FestIdHash", 1653, 1685],
  ["FestTeam", 1685, 1688],
  ["Unknown", 1688, 1691],
  ["Unknown", 1691, 1695],
];

test("all approved structural layouts expose truthful sizes, provenance and contiguous bounded fields", () => {
  expect(Object.keys(examples).sort()).toEqual(Object.keys(sizes).sort());
  for (const [kind, bits] of Object.entries(sizes))
    for (const x of examples[kind].variants) {
      expect(x.provenance).toBe("structural");
      expect(x.origin).toContain(x.label);
      expect(x.bitLength).toBe(bits);
      expect(x.bytes.length).toBe(Math.ceil(bits / 8));
      expect(x.origin).toContain(
        kind === "stationInfo"
          ? "Reliable"
          : kind === "onlineVersusRoles"
            ? "本文bit555"
            : kind === "playerActionStates"
              ? "本文bit329"
              : kind === "playerInkActions"
                ? "本文bit440"
                : kind === "playerAuxActions"
                  ? "本文bit460"
                  : kind === "playerForms"
                    ? "本文bit318"
                    : "型付き本文",
      );
      if (!bits) expect(x.fields).toEqual([]);
      let end = 0;
      for (const f of x.fields) {
        expect(f.startBit).toBe(end);
        expect(f.endBit).toBeGreaterThan(f.startBit);
        expect(f.endBit).toBeLessThanOrEqual(x.bytes.length * 8);
        if (f.label.startsWith("Unknown")) expect(f.label).toBe("Unknown");
        end = f.endBit;
      }
      expect(end).toBe(x.bytes.length * 8);
      expect(read(x.bytes, bits, x.bytes.length * 8 - bits)).toBe(0n);
    }
});
test("Attack bodies preserve common offsets, masks and no fabricated transport/footer", () => {
  for (const kind of ["attackEvent", "attackMulti4", "attackMulti8"]) {
    const x = v(kind);
    expect(read(x.bytes, 36, 17)).toBe(101n);
    expect(read(x.bytes, 56, 2)).toBe(1n);
    expect(read(x.bytes, 62, 16)).toBe(22031n);
    expect(read(x.bytes, 80, 31)).toBe(0n);
    expect(x.fields.some((f) => f.startBit === 80 && f.endBit === 111)).toBe(
      true,
    );
    expect(
      x.fields.some((f) =>
        ["GameFrame", "LifeNumber", "Group ID", "Type ID"].includes(f.label),
      ),
    ).toBe(false);
  }
  expect(read(v("attackMulti4").bytes, 115, 4)).toBe(5n);
  expect(read(v("attackMulti8").bytes, 115, 8)).toBe(129n);
});
test("paint and life examples preserve exact nonbyte boundaries", () => {
  for (const k of ["colPaint", "objPaint"]) {
    expect(read(v(k).bytes, 0, 17)).toBe(65537n);
    expect(read(v(k).bytes, 51, 12)).toBe(256n);
    expect(read(v(k).bytes, 116, 21)).toBe(87381n);
  }
  expect(read(v("colPaint").bytes, 141, 13)).toBe(3n);
  expect(read(v("objPaint").bytes, 141, 8)).toBe(3n);
  expect(
    v("troubleDie").fields.some((f) => f.startBit === 62 && f.endBit === 78),
  ).toBe(true);
  for (const [a, b] of [
    [67, 79],
    [79, 92],
  ])
    expect(
      v("revival").fields.some((f) => f.startBit === a && f.endBit === b),
    ).toBe(true);
});
test("UserSetting has all82 native fields, exact tail, appearance/loadout and sparse gear padding", () => {
  const x = v("userSettings");
  expect(
    x.fields
      .filter((f) => f.endBit <= 1695)
      .map((f) => [f.label, f.startBit, f.endBit]),
  ).toEqual(nativeFields);
  for (const [a, w, n] of [
    [812, 3, 2],
    [815, 16, 22031],
    [1179, 10, 20],
    [1212, 5, 1],
    [1267, 2, 0],
    [990, 2, 1],
    [992, 5, 4],
    [997, 10, 0],
  ])
    expect(read(x.bytes, a, w)).toBe(BigInt(n));
  expect(read(x.bytes, 0, 792)).toBe(0n);
});
test("StationInfo interleaves12 presence flags and only6/7 bodies at7/1703", () => {
  const x = v("stationInfo");
  expect(read(x.bytes, 0, 6)).toBe(0n);
  expect(read(x.bytes, 6, 1)).toBe(1n);
  for (let i = 0; i < 1695; i++)
    expect(read(x.bytes, 7 + i, 1)).toBe(read(v("userSettings").bytes, i, 1));
  expect(read(x.bytes, 1702, 1)).toBe(1n);
  expect(read(x.bytes, 1703, 17)).toBe(47n);
  expect(read(x.bytes, 1720, 4)).toBe(0n);
  expect(x.fields.filter((f) => f.label.includes("Present")).length).toBe(12);
  expect(
    x.fields.some(
      (f) => f.label === "Group ID" || f.label === "Message Length",
    ),
  ).toBe(false);
});
test("CoopSeqStats keeps nested sparse padding and751bit footprint", () => {
  const b = v("coopSeqStats").bytes;
  for (const [a, w, n] of [
    [0, 3, 1],
    [3, 12, 837],
    [15, 5, 2],
    [20, 10, 17],
    [30, 10, 1023],
    [40, 150, 0],
    [190, 561, 0],
  ])
    expect(read(b, a, w)).toBe(BigInt(n));
});
test("StationIdArray includes117bit tail and exact64bit patterns", () => {
  const x = v("stationIdArray");
  for (const [a, w, n] of [
    [0, 4, 1n],
    [4, 64, 0x0123456789abcdefn],
    [68, 16, 0x1234n],
    [84, 1, 1n],
    [85, 729, 0n],
    [814, 20, 0x54321n],
    [834, 1, 1n],
    [835, 64, 0xfedcba9876543210n],
    [899, 32, 0x13579bdfn],
  ] as const)
    expect(read(x.bytes, a, w)).toBe(n);
  expect(
    x.fields
      .filter((f) => f.startBit >= 814 && f.endBit <= 931)
      .map((f) => f.endBit - f.startBit),
  ).toEqual([20, 1, 64, 32]);
});
test("role rings preserve sparse padding, fragment origin555 and scalar biases", () => {
  for (const [k, s] of [
    ["versusPrivate", 43],
    ["versusPreSelect", 0],
    ["onlineVersusRoles", 0],
  ] as const) {
    const b = v(k).bytes;
    for (const [a, w, n] of [
      [0, 4, 2],
      [4, 3, 3],
      [7, 3, 1],
      [10, 24, 0],
    ])
      expect(read(b, s + a, w)).toBe(BigInt(n));
  }
  expect(v("onlineVersusRoles").origin).toContain("555–588");
  expect(read(v("coopWeaponId").bytes, 0, 16)).toBe(22033n);
  expect(read(v("coopUserInfo").bytes, 0, 17)).toBe(47n);
  expect(read(v("versusUserDbg").bytes, 0, 3)).toBe(2n);
});
test("coverage manifests every schema and distinct PlayerNetState without duplicate page-kind", () => {
  for (const kind of Object.keys(sizes))
    expect(
      coverage.some(
        (e: any) => e.kind === kind && e.provenance === "structural",
      ),
    ).toBe(true);
  expect(
    coverage.some(
      (e: any) =>
        e.kind === "playerNetState" &&
        e.bodyBits === 586 &&
        e.bodyOriginBit === 280,
    ),
  ).toBe(true);
  expect(new Set(coverage.map((e: any) => e.page + ":" + e.kind)).size).toBe(
    coverage.length,
  );
  const r = coverage.find((e: any) => e.kind === "onlineVersusRoles");
  expect([r.scope, r.bodyOriginBit, r.bodyBits]).toEqual([
    "body-fragment",
    555,
    34,
  ]);
});

test("small event layouts preserve native component widths", () => {
  expect(
    v("destroy")
      .fields.filter((f) => f.endBit <= 4)
      .map((f) => [f.startBit, f.endBit]),
  ).toEqual([
    [0, 1],
    [1, 4],
  ]);
  expect(read(v("destroy").bytes, 0, 1)).toBe(0n);
  expect(read(v("destroy").bytes, 1, 3)).toBe(1n);
  expect(read(v("pillarDieAir").bytes, 0, 1)).toBe(1n);
  expect(read(v("coopRoundSetup").bytes, 0, 2)).toBe(1n);
});

test("Human and Squid fragments preserve selector, ten-bit union budget and branch padding", () => {
  const [squid, human] = examples.playerForms.variants;
  expect(read(squid.bytes, 0, 1)).toBe(0n);
  expect(read(human.bytes, 0, 1)).toBe(1n);
  expect(read(squid.bytes, 1, 1)).toBe(1n);
  expect(read(squid.bytes, 2, 2)).toBe(2n);
  expect(read(squid.bytes, 4, 7)).toBe(0n);
  expect(
    squid.fields.some(
      (f) => f.label === "Padding" && f.startBit === 4 && f.endBit === 11,
    ),
  ).toBe(true);
  expect(
    human.fields
      .filter((f) => f.label === "Human Counter Positive")
      .map((f) => f.startBit),
  ).toEqual([1, 2, 3, 6, 7, 8]);
  expect(read(human.bytes, 9, 2)).toBe(2n);
  for (const x of [squid, human]) expect(read(x.bytes, 11, 5)).toBe(0n);
});

// Literal native expectations are independent from production metadata/factory.
const expectedUnions = [
  {
    kind: "playerActionStates",
    bodyStart: 329,
    tagBits: 3,
    budget: 108,
    variants: [
      { name: "PlayerNetState_Jump", payloadBits: 108 },
      { name: "PlayerNetState_DokanWarp", payloadBits: 1 },
      { name: "PlayerNetState_Sitting", payloadBits: 5 },
      { name: "PlayerNetState_RespawnLand", payloadBits: 64 },
      { name: "PlayerNetState_DeckEdit", payloadBits: 0 },
    ],
  },
  {
    kind: "playerInkActions",
    bodyStart: 440,
    tagBits: 4,
    budget: 16,
    variants: [
      { name: "PlayerNetState_InkActionNone", payloadBits: 0 },
      { name: "PlayerNetState_InkActionShooter", payloadBits: 1 },
      { name: "PlayerNetState_InkActionRoller", payloadBits: 8 },
      { name: "PlayerNetState_InkActionCharger", payloadBits: 15 },
      { name: "PlayerNetState_InkActionSpinner", payloadBits: 13 },
      { name: "PlayerNetState_InkActionSlosher", payloadBits: 5 },
      { name: "PlayerNetState_InkActionBrush", payloadBits: 11 },
      { name: "PlayerNetState_InkActionManeuver", payloadBits: 2 },
      { name: "PlayerNetState_InkActionShelter", payloadBits: 13 },
      { name: "PlayerNetState_InkActionStringer", payloadBits: 9 },
      { name: "PlayerNetState_InkActionSaber", payloadBits: 6 },
      { name: "PlayerNetState_InkActionSpChariot", payloadBits: 14 },
      { name: "PlayerNetState_InkActionSpNiceBall", payloadBits: 10 },
      { name: "PlayerNetState_InkActionSpCastle", payloadBits: 16 },
      { name: "PlayerNetState_InkActionGachihoko", payloadBits: 1 },
    ],
  },
  {
    kind: "playerAuxActions",
    bodyStart: 460,
    tagBits: 2,
    budget: 1,
    variants: [
      { name: "PlayerNetState_InkActionNone", payloadBits: 0 },
      { name: "PlayerNetState_InkActionBombFizzy", payloadBits: 1 },
      { name: "PlayerNetState_InkActionSuperHook", payloadBits: 1 },
    ],
  },
] as const;

test("action union metadata preserves exact native names, tag order and three body origins", () => {
  expect(playerUnionDefinitions).toEqual(expectedUnions);
  for (const expected of expectedUnions) {
    const variants = examples[expected.kind].variants;
    expect(variants.map((v) => v.label)).toEqual(
      expected.variants.map((v) => v.name),
    );
    variants.forEach((x, tag) => {
      const payload = expected.variants[tag].payloadBits;
      const end = expected.tagBits + expected.budget;
      expect(x.bitLength).toBe(end);
      expect(x.provenance).toBe("structural");
      expect(x.origin).toContain(x.label);
      expect(x.origin).toContain(
        `本文bit${expected.bodyStart}–${expected.bodyStart + end - 1}`,
      );
      expect(x.origin).toContain(`表示内bit0は本文bit${expected.bodyStart}`);
      expect(x.fields[0]).toMatchObject({
        label: "Variant Select",
        startBit: 0,
        endBit: expected.tagBits,
      });
      expect(read(x.bytes, 0, expected.tagBits)).toBe(BigInt(tag));
      const fields = x.fields.filter(
        (f) => f.label !== "Variant Select" && f.label !== "Padding",
      );
      expect(fields.reduce((n, f) => n + f.endBit - f.startBit, 0)).toBe(
        payload,
      );
      expect(fields.length).toBe(
        payload === 0
          ? 0
          : x.label === "PlayerNetState_Jump"
            ? 8
            : x.label === "PlayerNetState_RespawnLand"
              ? 5
              : 1,
      );
      for (const f of fields)
        expect(read(x.bytes, f.startBit, f.endBit - f.startBit)).toBe(1n);
      expect(
        x.fields.every((f) =>
          [
            "Variant Select",
            "Unknown",
            "Padding",
            "Jump Vector Pitch Raw",
            "Jump Vector Yaw Raw",
            "Jump Vector Length Raw",
          ].includes(f.label),
        ),
      ).toBe(true);
      const innerPad = x.fields.find(
        (f) =>
          f.label === "Padding" &&
          f.startBit === expected.tagBits + payload &&
          f.endBit === end,
      );
      if (payload === expected.budget) expect(innerPad).toBeUndefined();
      else expect(innerPad).toBeDefined();
      expect(
        read(x.bytes, expected.tagBits + payload, expected.budget - payload),
      ).toBe(0n);
      expect(read(x.bytes, end, x.bytes.length * 8 - end)).toBe(0n);
    });
  }
});

test("Jump structural fragment preserves scalar cuts and the33bit vector without union padding", () => {
  const x = examples.playerActionStates.variants[0];
  expect(x.fields.map((f) => [f.label, f.startBit, f.endBit])).toEqual([
    ["Variant Select", 0, 3],
    ["Unknown", 3, 4],
    ["Unknown", 4, 28],
    ["Unknown", 28, 52],
    ["Jump Vector Pitch Raw", 52, 62],
    ["Jump Vector Yaw Raw", 62, 73],
    ["Jump Vector Length Raw", 73, 85],
    ["Unknown", 85, 110],
    ["Unknown", 110, 111],
    ["Padding", 111, 112],
  ]);
  expect(read(x.bytes, 0, 3)).toBe(0n);
  for (const f of x.fields.slice(1, -1))
    expect(read(x.bytes, f.startBit, f.endBit - f.startBit)).toBe(1n);
  expect(read(x.bytes, 111, 1)).toBe(0n);
});

test("RespawnLand structural fragment preserves five Unknown cuts before44bit padding", () => {
  const x = examples.playerActionStates.variants[3];
  expect(
    x.fields
      .filter((f) => f.label === "Unknown")
      .map((f) => [f.startBit, f.endBit]),
  ).toEqual([
    [3, 20],
    [20, 37],
    [37, 54],
    [54, 64],
    [64, 67],
  ]);
  expect(
    x.fields
      .filter((f) => f.label === "Padding")
      .map((f) => [f.startBit, f.endBit]),
  ).toEqual([
    [67, 111],
    [111, 112],
  ]);
});

test("RomInfo normal counts preserve550bit bodies, active64bit cuts and separate zero padding", () => {
  const variants = examples.romInfo?.variants;
  expect(variants).toHaveLength(5);
  const cases = [
    { count: 0, active: [], unusedStart: 230 },
    { count: 1, active: [[230, 294]], unusedStart: 294 },
    {
      count: 2,
      active: [
        [230, 294],
        [294, 358],
      ],
      unusedStart: 358,
    },
    {
      count: 3,
      active: [
        [230, 294],
        [294, 358],
        [358, 422],
      ],
      unusedStart: 422,
    },
    {
      count: 4,
      active: [
        [230, 294],
        [294, 358],
        [358, 422],
        [422, 486],
      ],
      unusedStart: 486,
    },
  ];
  for (const { count, active, unusedStart } of cases) {
    const x = variants![count];
    expect(x.label).toBe(`RomInfoNetState · Count${count}`);
    expect(x.provenance).toBe("structural");
    expect(x.origin).toContain("型付き本文");
    expect(x.origin).toContain("RomInfoNetState");
    expect(x.origin).toContain(x.label);
    expect(x.origin).toContain("本文bit0起点");
    expect(x.bitLength).toBe(550);
    expect(x.bytes.length).toBe(69);
    expect(
      x.fields
        .filter((f) => f.label === "Unknown")
        .map((f) => [f.startBit, f.endBit]),
    ).toEqual([
      [0, 32],
      [32, 64],
      [64, 96],
      [96, 128],
      [128, 160],
      [160, 192],
      [192, 224],
      [224, 225],
      [225, 227],
      ...active,
      [486, 518],
      [518, 550],
    ]);
    expect(x.fields.find((f) => f.label === "Array Count")).toMatchObject({
      startBit: 227,
      endBit: 230,
    });
    expect(read(x.bytes, 227, 3)).toBe(BigInt(count));
    expect(
      x.fields
        .filter((f) => f.label === "Padding")
        .map((f) => [f.startBit, f.endBit]),
    ).toEqual(
      count < 4
        ? [
            [unusedStart, 486],
            [550, 552],
          ]
        : [[550, 552]],
    );
    expect(read(x.bytes, unusedStart, 486 - unusedStart)).toBe(0n);
    expect(read(x.bytes, 550, 2)).toBe(0n);
    expect(
      x.fields.every((f) =>
        ["Unknown", "Array Count", "Padding"].includes(f.label),
      ),
    ).toBe(true);
    expect(x.fields.every((f) => f.endBit > f.startBit)).toBe(true);
    for (const f of x.fields.filter((f) => f.label === "Unknown")) {
      expect(f.codeName).toBe(false);
      expect(read(x.bytes, f.startBit, f.endBit - f.startBit)).toBe(1n);
    }
  }
});
