---
title: Type
description: Splatoon 3のCoop通信で確認した型と実行ファイルの登録型
---

<script setup>
import PacketHexExample from '../components/PacketHexExample.vue'
</script>

# Type

Splatoon 3のELFとLAN Play通信で確認した型です。`Coop`で始まるイベント型は54種類登録され、このうち25種類を`Protocol` 8で確認しています。登録名があることと、通信上の本文を読めることは別です。

## `UnreliableProtocol` {#protocol-5}

| Group ID | 型名 | ELF登録ID |
| --: | --- | --: |
| `1104` | [`CoopSequenceNetState`](/packet/index.html#wave-state) | `0x135a505a` |
| `1107 / 1108` | [`CoopSeqPlayerNetState`](/packet/index.html#players) | `0x312b6d7f` |
| `200000 / 210000` | [`PlayerNetState`](/packet/index.html#player-net-state) | `0x2d9946d6` |

`200000 / 210000`の明示的な状態フレームは619ビットで、`PlayerNetState`の本文586ビットを含みます。プレイヤーactorの通信設定はこの型を`Unreliable`として登録し、生成した同じ本文を符号化します。`Group ID`はステーションringの論理位置から作られ、装備配列のindexや画面上のプレイヤー番号を直接示すものではありません。[Packet](/packet/index.html#player-net-state)にフィールド位置を示します。

`PlayerNetState`の本文bit 51–83と84–116には、方向21ビットと大きさ12ビットからなる二つのベクトルがあります。本文bit 117–137と138–158には、受信側で回転基底の再構成に使う二つの圧縮方向ベクトルがあります。こちらは各21ビットで、上下角10ビットと水平角11ビットに分かれます。

本文後半には、移動などのサブ状態5種類、`InkAction`の動作状態15種類、追加の動作状態3種類を選ぶ領域があります。選択された型ごとに本文の長さが変わりますが、未使用部分をゼロで埋め、次の領域の開始位置を固定します。`Jump`の本文108ビットには、二つの真偽値、24・24・25ビットの数値、方向と大きさを送る33ビットのベクトルがあります。[Packet](/packet/index.html#player-net-state)に選択値と型の対応、各分岐のHex Viewを示します。

`PlayerNetState`の本文bit 318はサブ状態の選択値です。`0`なら`PlayerNetState_Squid`、`1`なら`PlayerNetState_Human`の復号器を選びます。また、3Dベクトルの水平成分から作った角度を符号1ビットと大きさ12ビットで送り、受信側で水平ベクトルへ戻します。別のfloat値は-1～1の範囲から12ビットに量子化します。この方向は受信側で補間してプレイヤーの状態へ戻します。身体の向きと射撃方向との対応は`Unknown`です。サブ状態はイカ形式の3ビットと7ビットのゼロ埋め、またはヒト形式の10ビットを使い、後続位置を固定します。

`PlayerNetState`の本文bit 280–282と283–285は、足元の塗りに関わる`PlayerStepPaint`の状態値と選択indexです。後者は通信値から`1`を引きます。生存状態のフラグは未確定です。

`CoopSeqPlayerNetState`の正常な本文は189ビットです。配列の件数が4未満でも未使用枠を埋めます。先頭に個人の`IkuraNum`と保持中の金イクラ数、二つの配列に各参加者のWAVE内と累計の金イクラ納品数を持ちます。

## `BroadcastEventProtocol` {#protocol-8}

Coopプレイ中の認証済み`Protocol` 8で確認した59種類です。型IDとELFの登録名が一致するものを載せています。本文のフィールドまで確認した型は[Packet](/packet/index.html)で説明します。

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

[`ColPaintEvent`](/packet/index.html#col-paint-event)と[`ObjPaintEvent`](/packet/index.html#obj-paint-event)は、位置、二つのサイズ値と方向、塗り定義、対象参照を持ちます。受信側は対象を検証して塗り処理へ渡します。具体的な形や面積は塗り定義と投影先にも依存します。[`CoopEnemyStateEvent`](/packet/index.html#enemy-state-event)は状態コードと切替が有効になるフレームを送ります。状態`1`は`State::Die`で、ヘビの死亡状態から送る経路があります。

[`AttackEvent`](/packet/index.html#attack-event)内の`DamageReason`は、通常のID範囲でメイン・サブ・スペシャルのブキ情報を選ぶ区分とIDを持ちます。[`CoopSeqPlayerGoldenIkuraAssistEvent`](/packet/index.html#golden-ikura-assist-event)はアシスト対象の参加者を4ビットマスクで送ります。

`PlayerNetEvent::BulletSpShockSonar`はホップソナーに対応します。`PlayerNetEvent::ChariotStart`と`BulletSpChariotCannon`はカニタンク、`BulletSpTripleTornadoMother`と`BulletSpTripleTornadoGuide`、`TripleTornadoBind`はトリプルトルネードに対応します。`PlayerNetEvent::PerformSpecial`と併せて使用したスペシャルの種類を調べられます。これらは装備済み`SpecialId`や残使用回数を直接示す欄ではありません。

`PlayerNetEvent::BulletCharger`、`PlayerNetEvent::BulletSlosher`、`PlayerNetEvent::BulletManeuver`は、それぞれチャージャー、スロッシャー、マニューバー系の射撃通知です。型IDからブキの系統を調べられますが、同系統内の具体的な`WeaponId`は確定できません。

### `PlayerNetEvent::CoopRoundSetup` {#coop-round-setup}

`PlayerNetEvent::CoopRoundSetup`の型付き本文は2ビットです。この本文にブキIDは入りません。以下は型付き本文だけの構造例です。

<PacketHexExample kind="coopRoundSetup" />

型付きイベントの形式と長さは一致しますが、ELFの登録名へ結び付けられていない型IDもあります。型名と本文の意味はいずれも`Unknown`です。

|         型ID | 型名      |
| -----------: | --------- |
| `0xa9cd6c5a` | `Unknown` |
| `0x80c2ef2b` | `Unknown` |
| `0x9380c77b` | `Unknown` |

## `BroadcastReliableProtocol` {#protocol-11}

このProtocolには`PrivateSetting`と`VersusSetting`の設定同期があります。`PrivateSetting`には次の型が定義されています。

| ELF登録ID | 型名 |
| --: | --- |
| `0xede242dc` | [`CommonPrivateSettingNetState`](/protocol/index.html#private-setting) |
| `0x39ee8bf7` | [`CoopPrivateSettingNetState`](/protocol/index.html#private-setting) |
| `0x00c6916a` | `VersusMasterPreSeletTeamNetState` |
| `0x4ec5cfa6` | `VersusPrivateSettingNetState` |

`PrivateSetting`のハンドラー番号は`13`です。`Reliable`の要素は`is_valid`、`VersusMasterPreSeletTeamNetState`、`CommonPrivateSettingNetState`、`VersusPrivateSettingNetState`、`CoopPrivateSettingNetState`、`blocking_dsi`の順に並びます。

`VersusPrivateSettingNetState`には最大10件の配列があり、型付き本文の先頭を起点とするLSB0のbit 43–46が4ビットの要素数、bit 47から各要素の3ビット値が続きます。各値は通信値から`1`を引いて復元します。未使用枠は0で埋め、正常な本文長は77ビットです。前方の`VersusMasterPreSeletTeamNetState`は、同じ件数・要素・未使用枠の形式で34ビットです。

`VersusSetting`のハンドラー番号は`1`です。`Reliable`の要素が定義順に10件あり、5番目が`StationIdArrayNetState`です。本文では型IDを毎回送る代わりに、各要素の有無を1ビットで送り、存在する要素の本文を続けます。

|    ELF登録ID | 型名                     | ハンドラー内の位置 |
| -----------: | ------------------------ | -----------------: |
| `0xc056fc0f` | `StationIdArrayNetState` |              5番目 |

`StationIdArrayNetState`は最大10件のステーション識別情報を持ちます。要素数は4ビット、各要素は64ビット値・16ビット値・1ビットのフラグです。要素は配列の論理順で読み書きし、未使用枠は0で埋めます。この配列からローカルのステーション識別情報と一致する要素の論理位置を取得し、ネットワーク管理オブジェクトへ保存する処理があります。論理位置と個人の装備配列の添字は、常に同じ値になるわけではありません。

サーモンランのシーン構築では、ステーション識別値が非ゼロでフラグが有効な枠に、参加枠の値`0`を選びます。対応するユーザー設定の取得と配列への追加が成功すると、その枠をシーンの参加者配列へ移します。`VersusPrivateSettingNetState`の配列を使う分岐とは別です。

通常のサーモンランでは、この有効なステーションの論理順と`Session 5`のステーション識別値の順序を照合し、全員のユーザー設定がそろえば、名前と内部プレイヤー番号を条件付きで対応付けられます。シーンに採用した設定から名前をコピーし、参加対象だけを順に数えた番号がactorの識別と個人集計・装備のindexへつながります。設定取得や追加に失敗すると枠が省かれるため、全員の取得・追加・採用が成功することが条件です。

照合には64ビット値と16ビット値の組を順序も含めて使い、64ビット値の精度を保ちます。IPアドレスや表示名の一致だけでは対応を決めません。部屋の識別値・順序・有効フラグが変わったら以前の対応を破棄し、新しい部屋で得た設定を照合します。入室時にこれらがそろえば、`OnlineCoopSetting`やWAVE開始を待たずに名前を対応付けられます。

次の構造例は、順に`VersusMasterPreSeletTeamNetState`・`VersusPrivateSettingNetState`・`StationIdArrayNetState`の本文です。`StationIdArrayNetState`は814ビットの配列に20・1・64・32ビットの欄が続き、正常な本文長は931ビットです。後続欄の意味は`Unknown`です。

<PacketHexExample kind="versusPreSelect" />

<PacketHexExample kind="versusPrivate" />

<PacketHexExample kind="stationIdArray" />

ステーションごとの`StationInfo`は、ステーションの論理indexに`2`を加えたハンドラー番号を使います。その通信設定では、`VersusUserSettingNetState`を`Reliable`の7番目、`CoopUserInfoNetState`を8番目の要素に定義しています。[全要素の順序](/packet/index.html#station-info)を示しています。

`VersusUserSettingNetState`の`GameStatus.CoopSmell`は、参加者ごとに合算するEX WAVE抽選の入力です。[3ビット欄の位置と抽選式](/packet/versus-user-setting.html#ex-wave)を説明しています。

| ELF登録ID | 型名 | `Reliable`内の位置 |
| --: | --- | --: |
| `0x9a54b478` | [`VersusUserSettingNetState`](/packet/versus-user-setting.html) | 7番目 |
| `0xf8164b9a` | `CoopUserInfoNetState` | 8番目 |
| `0x10951074` | [`RomInfoNetState`](/packet/index.html#rom-info) | 11番目 |

`VersusUserSettingNetState`では、`ModelType`の値`0`～`3`がイカ・タコとF/Mモデルの区分、`Hair`と`Eyebrow`が髪型と眉の選択、`CoopSkin`が作業着の選択に関わります。ネームプレートには二つ名・背景・3枠のバッジがあります。[各フィールドと列挙値](/packet/versus-user-setting.html)を示しています。

`CoopUserInfoNetState`の本文は整数値だけの17ビットです。送信時に`10`を加え、受信時に`10`を引きます。値の意味と、`WeaponId`や`SpecialId`との対応は`Unknown`です。

## Protocol ID未確認の型 {#registered-only}

以下のイベント型はELFへの登録を確認しました。

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

`OnlineVersusSetting`には最大10件の`Protocoled_SplTeam`配列があります。要素数は4ビットで、各要素は値に`1`を加えた3ビット値です。未使用枠は0で埋め、受信時には各要素の通信値から`1`を引きます。この型の登録と符号化処理は確認していますが、通信上の通知形式との結合は未確認です。

以下は型付き本文、または明示した配列部分だけの構造例です。外側の`Protocol`番号やパケット形式を仮定していません。

`OnlineVersusSetting`の次の表示は、本文bit 555–588の配列部分だけです。型全体は753～783ビットで、この34ビットが全体の本文長ではありません。表示内のbit 0が本文bit 555に当たります。

<PacketHexExample kind="onlineVersusRoles" />

### `CoopEnemyFallDeathEvent`

`CoopEnemyFallDeathEvent` (`0x61e20cf7`)の型付き本文は0ビットです。敵の高さが基準値から一定量下回ったときに通知し、受信側は対象actorの現在の世代を取得できる場合に照合し、取得できない場合の処理経路もあります。通常の残り値による死亡判定とは別の経路です。

`CoopEnemySakePillarDieAirEvent` (`0x43e14cdb`)は1ビットの真偽値を持ち、ハシラ側の受信処理はこの値を保存して死亡状態へ移します。真偽値のゲーム内での意味は`Unknown`です。`CoopEnemySakelienGeyserDeathEvent` (`0xf25c3ca7`)の本文は0ビットで、この敵固有の死亡フラグを同期する経路があります。

<PacketHexExample kind="fallDeath" />

<PacketHexExample kind="pillarDieAir" />

<PacketHexExample kind="geyserDeath" />

### `DestroyEvent`

`DestroyEvent` (`0xecc856e7`)の型付き本文は4ビットで、真偽値1ビットと値3ビットから成ります。actorに属するイベントとして生成・受信し、世代を確認する経路があります。3ビット欄の意味と、サーモンランの通常の撃破との対応は`Unknown`です。

<PacketHexExample kind="destroy" />

### `CoopSeqStatsEvent`

`CoopSeqStatsEvent` (`0x6474f87a`)の正常な型付き本文は751ビットです。先頭3ビットが外側配列の件数で、最大4件を収めます。各要素は12ビット値、内側配列の件数5ビット、最大17件の10ビット値から成り、187ビットです。両配列とも未使用枠をゼロで埋めるため、件数が少なくても本文長は変わりません。

型付き本文のbit `3 + 187 × i`から要素`i`の12ビット値、bit `15 + 187 × i`から内側の件数、bit `20 + 187 × i + 10 × j`から内側要素`j`を読みます。各値のゲーム内での意味と、個人別討伐数への対応は`Unknown`です。通常のゲーム中にこの通知を送る条件と外側の`Protocol`番号も未確定です。

<PacketHexExample kind="coopSeqStats" />

### `CoopWeaponId`

`CoopWeaponId`は`WeaponId`に`3`を加えた16ビット値を送り、受信時に`3`を引きます。この型を要素とする配列は、要素数を3ビットで送り、存在する各要素を続ける経路があります。配列の容量は4件です。この型を運ぶ通信上のGroup IDと、各プレイヤーの装備欄との対応は`Unknown`です。

[`OnlineCoopSetting`](/packet/index.html#online-coop-setting)のブキID配列は別の符号化経路です。IDへの加算値は同じですが、通信上の位置はそのページで説明します。

<PacketHexExample kind="coopWeaponId" />

## 参考資料 {#references}

- ELF
- LAN Play通信
