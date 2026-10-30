---
title: Type
description: Splatoon 3のCoop通信で確認した型と実行ファイルの登録型
---

<script setup>
import PacketHexExample from '../components/PacketHexExample.vue'
</script>

# Type

Splatoon 3のELFとLAN Play通信で確認した型の一覧です。`Coop`で始まるイベント型は54種類登録されており、そのうち25種類を`Protocol` 8で確認しています。本文のビット配置まで特定した型は[Packet](/packet/index.html)で詳しく解説します。

## `UnreliableProtocol` {#protocol-5}

| Group ID | 型名 | ELF登録ID |
| --: | --- | --: |
| `1104` | [`CoopSequenceNetState`](/packet/index.html#wave-state) | `0x135a505a` |
| `1107 / 1108` | [`CoopSeqPlayerNetState`](/packet/index.html#players) | `0x312b6d7f` |
| `200000 / 210000` | [`PlayerNetState`](/packet/index.html#player-net-state) | `0x2d9946d6` |

- `CoopSeqPlayerNetState`（本文189ビット）: 先頭に個人の`IkuraNum`と保持中の金イクラ数、続く2つの配列に全参加者のWAVE内・累計金イクラ納品数が入ります（件数が4未満でも未使用枠はゼロ埋め）。
- `PlayerNetState`（本文586ビット、明示フレーム619ビット）: `Group ID`はステーションringの論理位置から決まります。本文には位置（17ビット×3）、方向・大きさベクトル（33ビット×2）、回転基底ベクトル（21ビット×2）、水平角（13ビット）と付随float（12ビット）、`PlayerDamage`残量（10ビット）、`PlayerArmor`残量（13ビット）、足元の塗り状態（`PlayerStepPaint`、bit 280–285）、ヒト・イカ選択（bit 318）、および移動サブ状態（5種）・`InkAction`（15種）・補助動作（3種）の固定長領域が含まれます。詳細は[`PlayerNetState`](/packet/index.html#player-net-state)を参照してください。

## `BroadcastEventProtocol` {#protocol-8}

Coopプレイ中の`Protocol` 8で確認した59種類のイベント型です。

| 型ID | 型名 |
| --: | --- |
| `0xf429516a` | [`AttackEvent`](/packet/index.html#attack-event) |
| `0xde1a711a` | [`AttackEventMulti4`](/packet/index.html#attack-event) |
| `0xaef8a8b7` | [`AttackEventMulti8`](/packet/index.html#attack-event) |
| `0x6c199c2e` | `BulletNetEvent::SpawnWallDrop` |
| `0x8d0e3437` | `CoopEnemySakeCarrierSpawnSakeCopterEvent` |
| `0x838fb319` | `CoopEnemySakeDolphinTargetPosEvent` |
| `0x1efbaa50` | `CoopEnemySakeDolphinCapturedPointEvent` |
| `0x5674a28d` | `CoopEnemySakerocketJumpEvent` |
| `0x83af1b69` | `CoopEnemySakeFlyBagmanEndPickupEvent` |
| `0x4ab76ee0` | `CoopEnemySakeFlyBagmanTargetPosEvent` |
| `0x7db12439` | `CoopEnemySakeSaucerFallEvent` |
| `0x15f34197` | `CoopEnemySakeSaucerTargetPosEvent` |
| `0x5db54d9f` | `CoopEnemySakelienShieldDownEvent` |
| `0xf41baa27` | `CoopEnemySakelienShieldHitPlayerEvent` |
| `0x68411214` | `CoopEnemySakelienBomberShotEvent` |
| `0x0caefc01` | [`CoopEnemySpawnNetEvent`](/packet/index.html#enemy-spawn-event) |
| `0x4c1ecd54` | [`CoopEnemyStateEvent`](/packet/index.html#enemy-state-event) |
| `0x3d8d2c59` | [`CoopItemGoldenIkuraDirectBankEvent`](/packet/index.html#golden-ikura-direct-bank-event) |
| `0xf010cc79` | [`CoopItemGoldenIkuraShotEvent`](/packet/index.html#golden-ikura-shot-event) |
| `0x8aa4d7d5` | `CoopItemRequestGetByPlayerEvent` |
| `0xedbcbb02` | [`CoopItemResponseGetByEnemyEvent`](/packet/index.html#enemy-get-event) |
| `0x5b64bbf1` | [`CoopItemResponseGetByPlayerEvent`](/packet/index.html#player-get-event) |
| `0x1a894818` | `CoopItemShootSleepEvent` |
| `0x6e7d7386` | [`CoopItemSpawnEvent`](/packet/index.html#item-spawn-event) |
| `0x85c563d8` | [`CoopSeqPlayerGoldenIkuraAssistEvent`](/packet/index.html#golden-ikura-assist-event) |
| `0xc7cd3faf` | `CoopSeqRoundFinishEvent` |
| `0xa370430c` | `CoopSakerocketBulletHitEnemyEvent` |
| `0x82289f93` | `CoopSakerocketBulletReturnEvent` |
| `0x83f114b0` | `CoopHelicopterStopEvent` |
| `0xb28e7c61` | `GeneratorBind` |
| `0xa73057e1` | `GeneratorDestroyRequest` |
| `0x39b6e487` | `GeneratorWaveSync` |
| `0x85b99621` | `HitEffectNetEvent` |
| `0x9a1e036d` | [`OnlineCoopSetting`](/packet/index.html#online-coop-setting) |
| `0xba206257` | `PlayerNetEvent::Attack` |
| `0x0855cf93` | `PlayerNetEvent::BulletCharger` |
| `0xd63f3522` | `PlayerNetEvent::BulletClam` |
| `0xd1e6af69` | `PlayerNetEvent::BulletManeuver` |
| `0xbc4e7627` | `PlayerNetEvent::BulletShooter` |
| `0x1b6fa70c` | `PlayerNetEvent::BulletSlosher` |
| `0x917de1f9` | `PlayerNetEvent::BulletSpChariotCannon` |
| `0x89c53d2e` | `PlayerNetEvent::BulletSpShockSonar` |
| `0xd303a96b` | `PlayerNetEvent::BulletSpTripleTornadoGuide` |
| `0x0e623724` | `PlayerNetEvent::BulletSpTripleTornadoMother` |
| `0x079c2378` | `PlayerNetEvent::BulletSpinner` |
| `0xa0227aca` | `PlayerNetEvent::ChariotStart` |
| `0xcf9be194` | [`PlayerNetEvent::CoopRescued`](/packet/index.html#coop-rescued-event) |
| `0x4c4d2b61` | `PlayerNetEvent::CoopRoundSetup` |
| `0xf4d6f09e` | `PlayerNetEvent::DirectBankClam` |
| `0x13c90357` | `PlayerNetEvent::DokanWarp_End` |
| `0x9f9b5f27` | `PlayerNetEvent::DokanWarp_Start` |
| `0x25bee8f2` | `PlayerNetEvent::PerformSpecial` |
| `0x74400e72` | [`PlayerNetEvent::Revival`](/packet/index.html#revival-event) |
| `0x89e91844` | [`PlayerNetEvent::TroubleDie`](/packet/index.html#trouble-die-event) |
| `0x34e1e167` | `PlayerNetEvent::TroubleWaterFall` |
| `0x88d9aa37` | `PlayerNetEvent::SideStepStart` |
| `0x4939c1ac` | [`ColPaintEvent`](/packet/index.html#col-paint-event) |
| `0xe3f0eb9a` | [`ObjPaintEvent`](/packet/index.html#obj-paint-event) |
| `0x1c8decf9` | `TripleTornadoBind` |

主なイベントの概要は以下のとおりです（各フィールドの詳細はリンク先を参照）。

- [`ColPaintEvent`](/packet/index.html#col-paint-event)・[`ObjPaintEvent`](/packet/index.html#obj-paint-event): 位置、2つのサイズ値・方向、塗り定義、対象参照を送ります。
- [`CoopEnemyStateEvent`](/packet/index.html#enemy-state-event): 敵の状態コードと切替フレームを送ります（状態`1`は`State::Die`）。
- [`AttackEvent`](/packet/index.html#attack-event): `DamageReason`にメイン・サブ・スペシャルの区分とIDを含みます。
- [`CoopSeqPlayerGoldenIkuraAssistEvent`](/packet/index.html#golden-ikura-assist-event): 金イクラ納品のアシスト対象者を4ビットマスクで通知します。
- 射撃・スペシャル発動通知: `BulletCharger`・`BulletSlosher`・`BulletManeuver`はブキ系統、`BulletSpShockSonar`（ホップソナー）、`ChariotStart`・`BulletSpChariotCannon`（カニタンク）、`BulletSpTripleTornadoMother`・`BulletSpTripleTornadoGuide`・`TripleTornadoBind`（トリプルトルネード）は使用したスペシャルの種類を示します（[装備と使用通知](/packet/index.html#equipment-events)参照）。

### `PlayerNetEvent::CoopRoundSetup` {#coop-round-setup}

型付き本文は2ビットで、ブキIDは含まれません。以下は型付き本文のみの構造例です。

<PacketHexExample kind="coopRoundSetup" />

なお、以下の型IDはイベント形式と一致するものの、ELFの登録名と対応付けられていません。

|         型ID | 型名      |
| -----------: | --------- |
| `0xa9cd6c5a` | `Unknown` |
| `0x80c2ef2b` | `Unknown` |
| `0x9380c77b` | `Unknown` |

## `BroadcastReliableProtocol` {#protocol-11}

`PrivateSetting`（ハンドラー番号`13`）と`VersusSetting`（ハンドラー番号`1`）、およびステーション別の[`StationInfo`](/packet/index.html#station-info)（ハンドラー番号`論理index + 2`）で設定を同期します。本文では型IDを毎回送らず、各要素の有無（1ビット）に続けて存在する要素の本文を並べます。

| ハンドラー | ELF登録ID | 型名 | 要素位置 |
| --- | --: | --- | --: |
| `PrivateSetting` (`13`) | `0x00c6916a` | `VersusMasterPreSeletTeamNetState` | 2番目 |
| `PrivateSetting` (`13`) | `0xede242dc` | [`CommonPrivateSettingNetState`](/protocol/index.html#private-setting) | 3番目 |
| `PrivateSetting` (`13`) | `0x4ec5cfa6` | `VersusPrivateSettingNetState` | 4番目 |
| `PrivateSetting` (`13`) | `0x39ee8bf7` | [`CoopPrivateSettingNetState`](/protocol/index.html#private-setting) | 5番目 |
| `VersusSetting` (`1`) | `0xc056fc0f` | `StationIdArrayNetState` | 5番目 |
| `StationInfo` (`index + 2`) | `0x9a54b478` | [`VersusUserSettingNetState`](/packet/versus-user-setting.html) | 7番目 |
| `StationInfo` (`index + 2`) | `0xf8164b9a` | [`CoopUserInfoNetState`](/packet/index.html#coop-user-info) | 8番目 |
| `StationInfo` (`index + 2`) | `0x10951074` | [`RomInfoNetState`](/packet/index.html#rom-info) | 11番目 |

`PrivateSetting`の`Reliable`要素は、`is_valid`、`VersusMasterPreSeletTeamNetState`（本文34ビット）、`CommonPrivateSettingNetState`、`VersusPrivateSettingNetState`（本文77ビット）、`CoopPrivateSettingNetState`、`blocking_dsi`の計6件です。`VersusPrivateSettingNetState`（bit 43–76）と`VersusMasterPreSeletTeamNetState`（bit 0–33）はどちらも最大10件の配列を持ち、4ビットの要素数の後に3ビット値（`通信値 - 1`、未使用枠はゼロ埋め）が10枠続きます。

`StationIdArrayNetState`は最大10件のステーション識別情報配列（814ビット: 4ビットの要素数＋`64ビット値 + 16ビット値 + 1ビットフラグ`×10枠、未使用枠はゼロ埋め）と後続欄（20・1・64・32ビット、用途は`Unknown`）からなる計931ビットの本文です。

通常のサーモンランでは、有効なステーション（識別値が非ゼロかつフラグ有効）の論理順と`Session 5`のステーション識別値を64ビット値・16ビット値の組で照合し、全員の[`VersusUserSettingNetState`](/packet/versus-user-setting.html)がシーンへ採用されれば、入室時点で表示名と内部プレイヤー番号（個人集計・装備のindex）を対応付けられます。

以下は`VersusMasterPreSeletTeamNetState`、`VersusPrivateSettingNetState`、`StationIdArrayNetState`の型付き本文の構造例です。

<PacketHexExample kind="versusPreSelect" />

<PacketHexExample kind="versusPrivate" />

<PacketHexExample kind="stationIdArray" />

## Protocol ID未確認の登録型 {#registered-only}

ELFへの登録を確認したものの、通信上の`Protocol`番号が未確定のイベント型です。

|       登録ID | 型名                                                  |
| -----------: | ----------------------------------------------------- |
| `0xecc856e7` | [`DestroyEvent`](#destroyevent)                       |
| `0x5b07ba26` | `CoopBuildEvent`                                      |
| `0xb33af5aa` | `CoopEnemyBossHelperAdjustHpEvent`                    |
| `0x61e20cf7` | [`CoopEnemyFallDeathEvent`](#coopenemyfalldeathevent) |
| `0xff385e79` | `CoopEnemyRushEventNetEvent`                          |
| `0xec888261` | `CoopEnemySakeArtilleryRegisterGunPointEvent`         |
| `0x34a81cfe` | `CoopEnemySakeBigBalloonChargeEvent`                  |
| `0x30797709` | `CoopEnemySakeJawEatTargetPosEvent`                   |
| `0x3c93471f` | `CoopEnemySakeJawHideEvent`                           |
| `0x43e14cdb` | `CoopEnemySakePillarDieAirEvent`                      |
| `0x5594af01` | `CoopEnemySakeShipSpawnIkuraBoxEvent`                 |
| `0xa5858a4b` | `CoopEnemySakeTamaireAttackEvent`                     |
| `0x1451e928` | `CoopEnemySakeTamaireMoveEvent`                       |
| `0x460bec7f` | `CoopEnemySakediverEatBombEvent`                      |
| `0x8c7b6a53` | `CoopEnemySakediverReserveAttackEvent`                |
| `0xb9968b49` | `CoopEnemySakelienCupTwinsFrontDirEvent`              |
| `0xd54d7019` | `CoopEnemySakelienGeyserCureLifeEvent`                |
| `0xf25c3ca7` | `CoopEnemySakelienGeyserDeathEvent`                   |
| `0xc0391eb1` | `CoopEnemySakelienGiantJumpAttackEvent`               |
| `0xe1321cb3` | `CoopItemCorrectFailureEvent`                         |
| `0x9b322a25` | `CoopItemGoldenIkuraArtilleryEvent`                   |
| `0xbf11d186` | `CoopItemGoldenIkuraArtilleryFixedEvent`              |
| `0x0dfcb47c` | `CoopItemRequestGetByEnemyEvent`                      |
| `0x608a5274` | `CoopItemStateEvent`                                  |
| `0x42f7e69c` | `CoopSakeArtilleryGunShootGoldenIkuraEvent`           |
| `0x180138c9` | `CoopSakeShipGoldenIkuraBoxBreakEvent`                |
| `0xba5fdc00` | `CoopSeqDbgForceGameOverEvent`                        |
| `0x1e6fb025` | `CoopSeqPlayerGoldenIkuraDirectBankEvent`             |
| `0x6474f87a` | [`CoopSeqStatsEvent`](#coopseqstatsevent)             |
| `0x68ad0836` | `CoopSpawnGeyserOpenEvent`                            |
| `0xe1c48824` | `OnlineDbgCoopRecordProfile`                          |
| `0x9bd55525` | `OnlineDbgCoopRecordReport`                           |
| `0x5c9e7c22` | `OnlineDbgCoopRecordRequest`                          |
| `0x2970fcdb` | `OnlineVersusSetting`                                 |

`OnlineVersusSetting`（本文全体は753～783ビット）のbit 555–588には、最大10件の`Protocoled_SplTeam`配列（4ビットの要素数＋3ビット値×10枠、`通信値 - 1`）があります。以下はその34ビット部分の構造例です（表示内のbit 0が本文bit 555）。

<PacketHexExample kind="onlineVersusRoles" />

### `CoopEnemyFallDeathEvent`

- `CoopEnemyFallDeathEvent` (`0x61e20cf7`): 本文0ビット。敵の高度が基準値を下回った際に通知します（通常のHPゼロによる死亡判定とは別経路）。
- `CoopEnemySakePillarDieAirEvent` (`0x43e14cdb`): 本文1ビット（真偽値の意味は`Unknown`）。ハシラが受信すると値を保存して死亡状態へ遷移します。
- `CoopEnemySakelienGeyserDeathEvent` (`0xf25c3ca7`): 本文0ビット。間欠泉固有の死亡フラグを同期します。

<PacketHexExample kind="fallDeath" />

<PacketHexExample kind="pillarDieAir" />

<PacketHexExample kind="geyserDeath" />

### `DestroyEvent`

`DestroyEvent` (`0xecc856e7`)の型付き本文は4ビット（真偽値1ビット＋値3ビット）です。actorの世代を確認して処理されますが、3ビット値の意味や通常の撃破集計との関係は`Unknown`です。

<PacketHexExample kind="destroy" />

### `CoopSeqStatsEvent`

`CoopSeqStatsEvent` (`0x6474f87a`)の型付き本文は751ビットです。先頭3ビットが外側配列の要素数（最大4件）で、各要素（187ビット）は12ビット値（bit `3 + 187 × i`）、内側配列の要素数5ビット（bit `15 + 187 × i`、最大17件）、10ビット値×17枠（bit `20 + 187 × i + 10 × j`）で構成されます。未使用枠はゼロ埋めです。各値の意味や送信条件は`Unknown`です。

<PacketHexExample kind="coopSeqStats" />

### `CoopWeaponId`

`CoopWeaponId`は`WeaponId + 3`の16ビット値です。これを要素とする最大4件の配列は、3ビットの要素数に続けて各要素を送ります（[`OnlineCoopSetting`](/packet/index.html#online-coop-setting)のブキID配列とは別経路）。通信上の`Group ID`やプレイヤー装備欄との対応は`Unknown`です。

<PacketHexExample kind="coopWeaponId" />

## 参考資料 {#references}

- ELF
- LAN Play通信
