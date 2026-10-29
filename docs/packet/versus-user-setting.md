---
title: VersusUserSettingNetState
description: ユーザー設定のブキ・ギア・外見・ネームプレートの通信形式
---

<script setup>
import PacketHexExample from '../components/PacketHexExample.vue'
</script>

# `VersusUserSettingNetState`

ユーザー設定には、装備したメイン・サブ・スペシャルのID、ギア、外見、ネームプレート、ステータスがあります。[`StationInfo`](/packet/index.html#station-info)の`Reliable`要素の7番目として送り、型IDは`0x9a54b478`です。未使用のギア枠のゼロ埋めを含む正常な型付き本文は1695ビットです。

この設定はシーンの参加者情報へコピーされます。バイト中に支給されるブキやスペシャルへ切り替わった結果を、そのままこの設定のIDから読むことはできません。支給の計算は[WAVE情報](/wave/index.html#weapons-specials)、攻撃時のIDは[`AttackEvent`](/packet/index.html#attack-event)で説明します。

以下のビット位置は、`VersusUserSettingNetState`の本文先頭を起点とするLSB0です。`StationInfo`内では、前に存在する要素の長さと各presenceによって本文の開始位置が変わります。名前の`Coordinates`は装備と外見の設定オブジェクトを指します。

以下は1695ビットの型付き本文を示す構造例です。実際のユーザー識別情報は含めず、表示のbit 0が本文の先頭です。末尾の格納用の1ビットは本文の外です。

<PacketHexExample kind="userSettings" />

## ユーザー情報

ユーザー識別情報と表示名を固定幅で送ります。

| 本文bit | フィールド       |        幅 | 復元方法     |
| ------- | ---------------- | --------: | ------------ |
| 0–255   | `NplnUserId`     | 256ビット | 固定バイト列 |
| 256–663 | `UserName`       | 408ビット | 固定バイト列 |
| 664–791 | `Identifier`     | 128ビット | 固定バイト列 |
| 792–794 | `UserNameSource` |   3ビット | 符号なし整数 |
| 795–808 | `CallSign`       |  14ビット | 符号なし整数 |
| 809–811 | `Team`           |   3ビット | 通信値 − 1   |

`UserName`は51バイトの名前領域です。通常形式では最初のNULまでが名前で、残りはゼロで埋めます。表示側にはUTF-8の1・2・3バイト文字をUTF-16へ変換する処理があり、この範囲の名前を復元できます。4バイト文字の扱いは`Unknown`です。名前と参加者を結ぶには、[`StationInfo`と部屋のステーション順の照合](/protocol/type.html#protocol-11)も必要です。

## モデル

`ModelType`は3ビット値です。値`0`～`3`はイカ・タコとF/Mモデルの区分に対応します。

個人のイカ・タコの表示には、対応するステーションのこの設定を使います。プレイヤー状態のヒト・イカ形式の選択や、生存・浮き輪状態とは別の区分です。

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

`MainId`・`SubId`・`SpecialId`は、それぞれ16ビットの通信値から`1`を引いて求めます。

| 本文bit | フィールド                          |       幅 | 復元方法     |
| ------- | ----------------------------------- | -------: | ------------ |
| 815–830 | `Coordinates.Weapon.MainId`         | 16ビット | 通信値 − 1   |
| 831–846 | `Coordinates.Weapon.SubId`          | 16ビット | 通信値 − 1   |
| 847–862 | `Coordinates.Weapon.SpecialId`      | 16ビット | 通信値 − 1   |
| 863–892 | `Coordinates.Weapon.TotalPaintTubo` | 30ビット | 符号なし整数 |
| 893–916 | `Coordinates.Weapon.Exp`            | 24ビット | 符号なし整数 |
| 917–920 | `Coordinates.Weapon.Level`          |  4ビット | 符号なし整数 |

## ギア

`GearHead`・`GearClothes`・`GearShoes`は、通常装備のアタマ・フク・クツの設定で、各86ビットです。`Id`は対応するギア情報を選び、`VariationId`はそのギアのバリエーション選択に使います。バイトの作業着には、後述する`CoopSkin`の選択処理もあります。各`ExSkillCount`の後には3枠分の5ビット領域があり、件数未満の枠だけ値を読みます。未使用枠もゼロで埋めるため、次の設定位置は変わりません。

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

`Hair`は髪型、`Eyebrow`は眉、`Bottom`はボトムスの選択値です。それぞれ専用データのIDとして使い、`BottomVariation`は選んだボトムスのバリエーションに関わります。モデルとの適合性やバリエーションの範囲によって、使う値が補正される経路があります。

`CoopSkin`はバイトの作業着を選ぶ値です。対応データにある`GearHeadName`と`GearClothesName`からアタマ・フクのギア情報を探し、有効なIDが得られた場合に作業着側の選択へ置き換えます。`SkinColor`は別の4ビット欄で、肌色の設定です。

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

`Byname.Adjective`と`Byname.Subject`は二つ名の前半・後半の選択値です。`Background`は背景、`Badge1`・`Badge2`・`Badge3`は3枠のバッジを選び、それぞれの情報から表示用のデータを参照します。バッジの値`0`は空枠として扱います。

`Byname.Gender`は二つ名側の別の列挙値です。`ModelType`と同じ意味で読み替えないようにします。

|  値 | `Byname.Gender` |
| --: | --------------- |
| `0` | `None`          |
| `1` | `Masculine`     |
| `2` | `Feminine`      |
| `3` | `Unknown`       |

文字列の組み立てや言語ごとの表示との詳しい対応は`Unknown`です。

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

ランクやレートのフィールドです。22ビットのレート値は通信値を`256`で割ります。

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

`GameStatus.CoopSmell`は、EX WAVEの出現抽選で参加者ごとに合算する値です。本文bit 1424–1426の3ビットにあり、上のHex Viewでも同じ名前で選択できます。

同じ値を、オカシラメーター用の`Meter`アニメーションのフレーム番号へ直接渡す表示経路があります。対応するフレームは`0`～`5`で、塗り用の描画領域の高さは均等には変わりません。表示を再現するときは、各フレームの形を使います。

通常の合算経路では、内部の`Team`値が`0`の参加者を対象に、各`CoopSmell`を`0`～`5`へ収めて加算し、合計も`0`～`20`へ収めます。合計値を`s`とすると、抽選しきい値`T`は次の計算です。

```text
s < 5  : T = 0
s >= 5 : T = s × (s − 4) / 320
```

実際の計算はfloat32です。代表的なしきい値を百分率で示します。

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

判定では、共有される128ビットの乱数状態から別の系列を作り、`0`以上`1`未満の乱数値`U`に対して`T >= U`を調べます。`U`は`k / 8388608`という離散値です。この比較では`T = 0`でも`U = 0`が当選側に入るため、表の0%はしきい値の表示です。実際の当選結果の再現には、判定時点の共有乱数状態と実効設定が必要です。

初期判定の`JobType`が`1`・`2`・`3`・`7`の場合は、この乱数抽選を行わず不当選に設定する経路を通ります。また、シナリオ設定が有効なら、参加者の合算に代えて設定の`SumSmell`を直接使う経路があります。その上書き値には通常の合計値の範囲制限を適用しません。

通常経路の当選は、4番目のラウンドを対象に`BossRoundReady`へ進む条件を設定します。実際にEX WAVEへ到達するには、それ以前のWAVEの進行条件も満たす必要があります。送信された`GameSeed`から当選結果を先読みするには、その値の採用と、抽選までに共有乱数状態がどう更新されたかを対応付けます。

## チーム設定と末尾

末尾の3ビット・4ビット欄の用途は`Unknown`です。

| 本文bit   | フィールド      |       幅 | 復元方法     |
| --------- | --------------- | -------: | ------------ |
| 1637–1652 | `TeamColorHash` | 16ビット | 符号なし整数 |
| 1653–1684 | `FestIdHash`    | 32ビット | 32ビット値   |
| 1685–1687 | `FestTeam`      |  3ビット | 通信値 − 1   |
| 1688–1690 | `Unknown`       |  3ビット | 通信値 − 1   |
| 1691–1694 | `Unknown`       |  4ビット | 符号なし整数 |
