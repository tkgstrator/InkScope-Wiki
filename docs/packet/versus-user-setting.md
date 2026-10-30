---
title: VersusUserSettingNetState
description: ユーザー設定のブキ・ギア・外見・ネームプレートの通信形式
---

<script setup>
import PacketHexExample from '../components/PacketHexExample.vue'
</script>

# `VersusUserSettingNetState`

ユーザー設定（型ID `0x9a54b478`）は、装備したメイン・サブ・スペシャルのID、ギア、外見、ネームプレート、ステータスを保持します。[`StationInfo`](/packet/index.html#station-info)の`Reliable`要素の7番目として送信され、型付き本文は1695ビット（未使用ギア枠のゼロ埋めを含む）です。

この設定はシーンの参加者情報へコピーされます。なお、バイト中に支給されるブキやスペシャルはここには入らないため、支給装備の計算は[WAVE 情報](/wave/index.html#weapons-specials)、攻撃時のIDは[`AttackEvent`](/packet/index.html#attack-event)を参照してください。

以下のビット位置は、`VersusUserSettingNetState`の本文先頭を起点とするLSB0です（`StationInfo`内での開始位置は先行要素の有無により変化します）。フィールド名の`Coordinates`は装備・外見の設定オブジェクトを指します。

以下は1695ビットの型付き本文の構造例です（表示のbit 0が本文先頭、末尾1ビットはバイト境界のパディング）。

<PacketHexExample kind="userSettings" />

## ユーザー情報

ユーザー識別情報と表示名を固定長で送ります。

| 本文bit | フィールド       |        幅 | 復元方法     |
| ------- | ---------------- | --------: | ------------ |
| 0–255   | `NplnUserId`     | 256ビット | 固定バイト列 |
| 256–663 | `UserName`       | 408ビット | 固定バイト列 |
| 664–791 | `Identifier`     | 128ビット | 固定バイト列 |
| 792–794 | `UserNameSource` |   3ビット | 符号なし整数 |
| 795–808 | `CallSign`       |  14ビット | 符号なし整数 |
| 809–811 | `Team`           |   3ビット | 通信値 − 1   |

`UserName`は51バイトの領域で、最初のNULまでが名前、残りはゼロ埋めです。表示処理ではUTF-8の1～3バイト文字をUTF-16へ変換します（4バイト文字の扱いは`Unknown`）。名前と参加者を結ぶには、[`StationInfo`と部屋のステーション順の照合](/protocol/type.html#protocol-11)が必要です。

## モデル

`ModelType`は3ビット値で、`0`～`3`がイカ・タコとF/Mモデルの区分に対応します（プレイ中のヒト・イカ状態や生存・浮き輪状態とは別です）。

| 本文bit | フィールド              |      幅 | 復元方法     |
| ------- | ----------------------- | ------: | ------------ |
| 812–814 | `Coordinates.ModelType` | 3ビット | 符号なし整数 |

|  値 | 内部名     | 区分            |
| --: | ---------- | --------------- |
| `0` | `SquidF`   | イカ・Fモデル   |
| `1` | `SquidM`   | イカ・Mモデル   |
| `2` | `OctopusF` | タコ・Fモデル   |
| `3` | `OctopusM` | タコ・Mモデル   |
| `4` | `Rival`    | 用途は`Unknown` |
| `5` | `RSF`      | 用途は`Unknown` |
| `6` | `RSM`      | 用途は`Unknown` |
| `7` | `Unknown`  | 列挙名は未確定  |

## ブキ

`MainId`・`SubId`・`SpecialId`は、16ビットの通信値から`1`を引いて復元します。

| 本文bit | フィールド                          |       幅 | 復元方法     |
| ------- | ----------------------------------- | -------: | ------------ |
| 815–830 | `Coordinates.Weapon.MainId`         | 16ビット | 通信値 − 1   |
| 831–846 | `Coordinates.Weapon.SubId`          | 16ビット | 通信値 − 1   |
| 847–862 | `Coordinates.Weapon.SpecialId`      | 16ビット | 通信値 − 1   |
| 863–892 | `Coordinates.Weapon.TotalPaintTubo` | 30ビット | 符号なし整数 |
| 893–916 | `Coordinates.Weapon.Exp`            | 24ビット | 符号なし整数 |
| 917–920 | `Coordinates.Weapon.Level`          |  4ビット | 符号なし整数 |

## ギア

`GearHead`・`GearClothes`・`GearShoes`は通常装備のアタマ・フク・クツの設定（各86ビット）です。各`ExSkillCount`の後に3枠分の5ビット領域があり、件数未満の枠のみ有効で、未使用枠はゼロ埋めです。

| 本文bit | フィールド | 幅 | 復元方法 |
| --- | --- | --: | --- |
| 921–936 | `Coordinates.GearHead.Id` | 16ビット | 通信値 − 1 |
| 937–940 | `Coordinates.GearHead.VariationId` | 4ビット | 符号なし整数 |
| 941–957 | `Coordinates.GearHead.Exp` | 17ビット | 符号なし整数 |
| 958–981 | `Coordinates.GearHead.TotalExp` | 24ビット | 符号なし整数 |
| 982–984 | `Coordinates.GearHead.Rarity` | 3ビット | 符号なし整数 |
| 985–989 | `Coordinates.GearHead.MainSkill` | 5ビット | 0～26の列挙値 |
| 990–991 | `Coordinates.GearHead.ExSkillCount` | 2ビット | 0～3の件数 |
| 992–996 | `Coordinates.GearHead.ExSkillSlot0` | 5ビット | 件数内は値、未使用枠はゼロ埋め |
| 997–1001 | `Coordinates.GearHead.ExSkillSlot1` | 5ビット | 件数内は値、未使用枠はゼロ埋め |
| 1002–1006 | `Coordinates.GearHead.ExSkillSlot2` | 5ビット | 件数内は値、未使用枠はゼロ埋め |
| 1007–1022 | `Coordinates.GearClothes.Id` | 16ビット | 通信値 − 1 |
| 1023–1026 | `Coordinates.GearClothes.VariationId` | 4ビット | 符号なし整数 |
| 1027–1043 | `Coordinates.GearClothes.Exp` | 17ビット | 符号なし整数 |
| 1044–1067 | `Coordinates.GearClothes.TotalExp` | 24ビット | 符号なし整数 |
| 1068–1070 | `Coordinates.GearClothes.Rarity` | 3ビット | 符号なし整数 |
| 1071–1075 | `Coordinates.GearClothes.MainSkill` | 5ビット | 0～26の列挙値 |
| 1076–1077 | `Coordinates.GearClothes.ExSkillCount` | 2ビット | 0～3の件数 |
| 1078–1082 | `Coordinates.GearClothes.ExSkillSlot0` | 5ビット | 件数内は値、未使用枠はゼロ埋め |
| 1083–1087 | `Coordinates.GearClothes.ExSkillSlot1` | 5ビット | 件数内は値、未使用枠はゼロ埋め |
| 1088–1092 | `Coordinates.GearClothes.ExSkillSlot2` | 5ビット | 件数内は値、未使用枠はゼロ埋め |
| 1093–1108 | `Coordinates.GearShoes.Id` | 16ビット | 通信値 − 1 |
| 1109–1112 | `Coordinates.GearShoes.VariationId` | 4ビット | 符号なし整数 |
| 1113–1129 | `Coordinates.GearShoes.Exp` | 17ビット | 符号なし整数 |
| 1130–1153 | `Coordinates.GearShoes.TotalExp` | 24ビット | 符号なし整数 |
| 1154–1156 | `Coordinates.GearShoes.Rarity` | 3ビット | 符号なし整数 |
| 1157–1161 | `Coordinates.GearShoes.MainSkill` | 5ビット | 0～26の列挙値 |
| 1162–1163 | `Coordinates.GearShoes.ExSkillCount` | 2ビット | 0～3の件数 |
| 1164–1168 | `Coordinates.GearShoes.ExSkillSlot0` | 5ビット | 件数内は値、未使用枠はゼロ埋め |
| 1169–1173 | `Coordinates.GearShoes.ExSkillSlot1` | 5ビット | 件数内は値、未使用枠はゼロ埋め |
| 1174–1178 | `Coordinates.GearShoes.ExSkillSlot2` | 5ビット | 件数内は値、未使用枠はゼロ埋め |

## 外見

`Hair`（髪型）、`Bottom`（ボトムス）、`BottomVariation`（ボトムスのバリエーション）、`SkinColor`（肌色）、`EyeColor`（目の色）、`Eyebrow`（眉）は外見の選択値です。`CoopSkin`はバイト用の作業着を選び、対応データの`GearHeadName`・`GearClothesName`から有効なIDが見つかればアタマ・フクを作業着へ置き換えます。

| 本文bit   | フィールド                    |       幅 | 復元方法     |
| --------- | ----------------------------- | -------: | ------------ |
| 1179–1188 | `Coordinates.Hair`            | 10ビット | 符号なし整数 |
| 1189–1198 | `Coordinates.Bottom`          | 10ビット | 符号なし整数 |
| 1199–1202 | `Coordinates.BottomVariation` |  4ビット | 符号なし整数 |
| 1203–1206 | `Coordinates.SkinColor`       |  4ビット | 符号なし整数 |
| 1207–1211 | `Coordinates.EyeColor`        |  5ビット | 符号なし整数 |
| 1212–1216 | `Coordinates.Eyebrow`         |  5ビット | 符号なし整数 |
| 1217–1222 | `Coordinates.CoopSkin`        |  6ビット | 符号なし整数 |
| 1223–1232 | `Coordinates.WinEmote`        | 10ビット | 通信値 − 1   |

## ネームプレート

`Byname.Adjective`と`Byname.Subject`は二つ名の前半・後半、`Background`はプレート背景、`Badge1`～`Badge3`は3枠のバッジ（`0`は空枠）です。`Byname.Gender`は二つ名用の列挙値で、`ModelType`とは別です。言語ごとの文字列組み立ての詳細は`Unknown`です。

|  値 | `Byname.Gender` |
| --: | --------------- |
| `0` | `None`          |
| `1` | `Masculine`     |
| `2` | `Feminine`      |
| `3` | `Unknown`       |

| 本文bit   | フィールド                   |       幅 | 復元方法     |
| --------- | ---------------------------- | -------: | ------------ |
| 1233–1249 | `NamePlate.Byname.Adjective` | 17ビット | 通信値 − 1   |
| 1250–1266 | `NamePlate.Byname.Subject`   | 17ビット | 通信値 − 1   |
| 1267–1268 | `NamePlate.Byname.Gender`    |  2ビット | 符号なし整数 |
| 1269–1300 | `NamePlate.Badge1`           | 32ビット | 32ビット値   |
| 1301–1332 | `NamePlate.Badge2`           | 32ビット | 32ビット値   |
| 1333–1364 | `NamePlate.Badge3`           | 32ビット | 32ビット値   |
| 1365–1381 | `NamePlate.Background`       | 17ビット | 符号なし整数 |

## ステータス

ランクやレートのフィールドです。22ビットのレート値は通信値を`256`で割って復元します。

| 本文bit   | フィールド                          |       幅 | 復元方法     |
| --------- | ----------------------------------- | -------: | ------------ |
| 1382–1391 | `GameStatus.PlayerRank`             | 10ビット | 符号なし整数 |
| 1392–1399 | `GameStatus.Udemae`                 |  8ビット | 通信値 − 1   |
| 1400–1423 | `GameStatus.CoopOnlineEvalRaw`      | 24ビット | 通信値 − 1   |
| 1424–1426 | `GameStatus.CoopSmell`              |  3ビット | 符号なし整数 |
| 1427–1448 | `GameStatus.XRateVar`               | 22ビット | 通信値 / 256 |
| 1449–1470 | `GameStatus.XRateVgl`               | 22ビット | 通信値 / 256 |
| 1471–1492 | `GameStatus.XRateVlf`               | 22ビット | 通信値 / 256 |
| 1493–1514 | `GameStatus.XRateVcl`               | 22ビット | 通信値 / 256 |
| 1515–1536 | `GameStatus.Rate`                   | 22ビット | 通信値 / 256 |
| 1537–1543 | `GameStatus.FestRank`               |  7ビット | 符号なし整数 |
| 1544–1545 | `GameStatus.FesWinProof`            |  2ビット | 符号なし整数 |
| 1546–1555 | `GameStatus.WinStreak`              | 10ビット | 符号なし整数 |
| 1556–1561 | `GameStatus.DisconnectNum`          |  6ビット | 符号なし整数 |
| 1562      | `GameStatus.HasXCrown`              |  1ビット | 真偽値       |
| 1563      | `GameStatus.IsMeasuredRate`         |  1ビット | 真偽値       |
| 1564–1570 | `GameStatus.ChallengeVictoryStreak` |  7ビット | 符号なし整数 |
| 1571–1592 | `GameStatus.InnerMmrRate`           | 22ビット | 通信値 / 256 |
| 1593–1614 | `GameStatus.SprRate`                | 22ビット | 通信値 / 256 |
| 1615–1636 | `GameStatus.XmmrRate`               | 22ビット | 通信値 / 256 |

### EX WAVEの抽選に使う値 {#ex-wave}

`GameStatus.CoopSmell`（bit 1424–1426、3ビット）はオカシラメーターの値で、表示上は`Meter`アニメーションのフレーム番号（`0`～`5`）に対応します。

EX WAVEの出現抽選では、内部の`Team`値が`0`の参加者の`CoopSmell`（各`0`～`5`）を合算し、`0`～`20`に収めた合計値`s`からしきい値`T`（float32）を計算します。

```text
s < 5  : T = 0
s >= 5 : T = s × (s − 4) / 320
```

| 合計値`s` | しきい値の百分率 |
| --------- | ---------------: |
| 0～4      |               0% |
| 5         |          1.5625% |
| 8         |            約10% |
| 10        |           18.75% |
| 12        |            約30% |
| 15        |         51.5625% |
| 18        |         約78.75% |
| 20        |             100% |

抽選時は、共有乱数状態（128ビット）から派生した乱数値`U = k / 8388608`（`0 <= U < 1`）に対して`T >= U`を判定します（`T = 0`でも`U = 0`なら成立）。ただし、`JobType`が`1`・`2`・`3`・`7`の場合は乱数抽選を行わず不当選となります。また、シナリオ設定が有効な場合は、合算値ではなく設定の`SumSmell`（上限20の制限なし）を直接使います。

当選すると4番目のラウンドに`BossRoundReady`が設定され、WAVE 3までクリアするとEX WAVEへ進みます。

## チーム設定と末尾

| 本文bit   | フィールド      |       幅 | 復元方法     |
| --------- | --------------- | -------: | ------------ |
| 1637–1652 | `TeamColorHash` | 16ビット | 符号なし整数 |
| 1653–1684 | `FestIdHash`    | 32ビット | 32ビット値   |
| 1685–1687 | `FestTeam`      |  3ビット | 通信値 − 1   |
| 1688–1690 | `Unknown`       |  3ビット | 通信値 − 1   |
| 1691–1694 | `Unknown`       |  4ビット | 符号なし整数 |
