---
title: Type
description: Splatoon 3のCoop通信で確認した型と実行ファイルの登録型
---

# Type

Splatoon 3のELFとLAN Play通信で確認した型です。`Coop`で始まるイベント型は54種類登録され、16種類を`Protocol` 8で確認しています。

## `UnreliableProtocol` {#protocol-5}

| Group ID | 型名 | ELF登録ID |
| --: | --- | --: |
| `1104` | [`CoopSequenceNetState`](/packet/index.html#wave-state) | `0x135a505a` |
| `1107 / 1108` | [`CoopSeqPlayerNetState`](/packet/index.html#players) | `0x312b6d7f` |

## `BroadcastEventProtocol` {#protocol-8}

Coopプレイ中の`Protocol` 8で確認した39種類です。

| 型ID | 型名 |
| --: | --- |
| `0xf429516a` | `AttackEvent` |
| `0xaef8a8b7` | `AttackEventMulti8` |
| `0x6c199c2e` | `BulletNetEvent::SpawnWallDrop` |
| `0x8d0e3437` | `CoopEnemySakeCarrierSpawnSakeCopterEvent` |
| `0x838fb319` | `CoopEnemySakeDolphinTargetPosEvent` |
| `0x83af1b69` | `CoopEnemySakeFlyBagmanEndPickupEvent` |
| `0x4ab76ee0` | `CoopEnemySakeFlyBagmanTargetPosEvent` |
| `0x7db12439` | `CoopEnemySakeSaucerFallEvent` |
| `0x15f34197` | `CoopEnemySakeSaucerTargetPosEvent` |
| `0x0caefc01` | [`CoopEnemySpawnNetEvent`](/packet/index.html#enemy-spawn-event) |
| `0x4c1ecd54` | `CoopEnemyStateEvent` |
| `0x3d8d2c59` | [`CoopItemGoldenIkuraDirectBankEvent`](/packet/index.html#golden-ikura-direct-bank-event) |
| `0xf010cc79` | [`CoopItemGoldenIkuraShotEvent`](/packet/index.html#golden-ikura-shot-event) |
| `0x8aa4d7d5` | `CoopItemRequestGetByPlayerEvent` |
| `0xedbcbb02` | [`CoopItemResponseGetByEnemyEvent`](/packet/index.html#enemy-get-event) |
| `0x5b64bbf1` | [`CoopItemResponseGetByPlayerEvent`](/packet/index.html#player-get-event) |
| `0x1a894818` | `CoopItemShootSleepEvent` |
| `0x6e7d7386` | [`CoopItemSpawnEvent`](/packet/index.html#item-spawn-event) |
| `0xc7cd3faf` | `CoopSeqRoundFinishEvent` |
| `0xb28e7c61` | `GeneratorBind` |
| `0xa73057e1` | `GeneratorDestroyRequest` |
| `0x39b6e487` | `GeneratorWaveSync` |
| `0x85b99621` | `HitEffectNetEvent` |
| `0x9a1e036d` | [`OnlineCoopSetting`](/packet/index.html#online-coop-setting) |
| `0xba206257` | `PlayerNetEvent::Attack` |
| `0xd63f3522` | `PlayerNetEvent::BulletClam` |
| `0xbc4e7627` | `PlayerNetEvent::BulletShooter` |
| `0x89c53d2e` | `PlayerNetEvent::BulletSpShockSonar` |
| `0x079c2378` | `PlayerNetEvent::BulletSpinner` |
| `0xcf9be194` | `PlayerNetEvent::CoopRescued` |
| `0x4c4d2b61` | `PlayerNetEvent::CoopRoundSetup` |
| `0xf4d6f09e` | `PlayerNetEvent::DirectBankClam` |
| `0x13c90357` | `PlayerNetEvent::DokanWarp_End` |
| `0x9f9b5f27` | `PlayerNetEvent::DokanWarp_Start` |
| `0x25bee8f2` | `PlayerNetEvent::PerformSpecial` |
| `0x74400e72` | `PlayerNetEvent::Revival` |
| `0x89e91844` | `PlayerNetEvent::TroubleDie` |
| `0x4939c1ac` | `ColPaintEvent` |
| `0xe3f0eb9a` | `ObjPaintEvent` |

## `BroadcastReliableProtocol` {#protocol-11}

`PrivateSetting`で確認した型です。

| ELF登録ID | 型名 |
| --: | --- |
| `0xede242dc` | [`CommonPrivateSettingNetState`](/protocol/index.html#private-setting) |
| `0x39ee8bf7` | [`CoopPrivateSettingNetState`](/protocol/index.html#private-setting) |

## Protocol ID未確認の型 {#registered-only}

以下のイベント型はELFへの登録を確認しました。

|       登録ID | 型名                                          |
| -----------: | --------------------------------------------- |
| `0x5b07ba26` | `CoopBuildEvent`                              |
| `0xb33af5aa` | `CoopEnemyBossHelperAdjustHpEvent`            |
| `0x61e20cf7` | `CoopEnemyFallDeathEvent`                     |
| `0xff385e79` | `CoopEnemyRushEventNetEvent`                  |
| `0xec888261` | `CoopEnemySakeArtilleryRegisterGunPointEvent` |
| `0x34a81cfe` | `CoopEnemySakeBigBalloonChargeEvent`          |
| `0x1efbaa50` | `CoopEnemySakeDolphinCapturedPointEvent`      |
| `0x30797709` | `CoopEnemySakeJawEatTargetPosEvent`           |
| `0x3c93471f` | `CoopEnemySakeJawHideEvent`                   |
| `0x43e14cdb` | `CoopEnemySakePillarDieAirEvent`              |
| `0x5594af01` | `CoopEnemySakeShipSpawnIkuraBoxEvent`         |
| `0xa5858a4b` | `CoopEnemySakeTamaireAttackEvent`             |
| `0x1451e928` | `CoopEnemySakeTamaireMoveEvent`               |
| `0x460bec7f` | `CoopEnemySakediverEatBombEvent`              |
| `0x8c7b6a53` | `CoopEnemySakediverReserveAttackEvent`        |
| `0x68411214` | `CoopEnemySakelienBomberShotEvent`            |
| `0xb9968b49` | `CoopEnemySakelienCupTwinsFrontDirEvent`      |
| `0xd54d7019` | `CoopEnemySakelienGeyserCureLifeEvent`        |
| `0xf25c3ca7` | `CoopEnemySakelienGeyserDeathEvent`           |
| `0xc0391eb1` | `CoopEnemySakelienGiantJumpAttackEvent`       |
| `0x5db54d9f` | `CoopEnemySakelienShieldDownEvent`            |
| `0xf41baa27` | `CoopEnemySakelienShieldHitPlayerEvent`       |
| `0x5674a28d` | `CoopEnemySakerocketJumpEvent`                |
| `0x83f114b0` | `CoopHelicopterStopEvent`                     |
| `0xe1321cb3` | `CoopItemCorrectFailureEvent`                 |
| `0x9b322a25` | `CoopItemGoldenIkuraArtilleryEvent`           |
| `0xbf11d186` | `CoopItemGoldenIkuraArtilleryFixedEvent`      |
| `0x0dfcb47c` | `CoopItemRequestGetByEnemyEvent`              |
| `0x608a5274` | `CoopItemStateEvent`                          |
| `0x42f7e69c` | `CoopSakeArtilleryGunShootGoldenIkuraEvent`   |
| `0x180138c9` | `CoopSakeShipGoldenIkuraBoxBreakEvent`        |
| `0xa370430c` | `CoopSakerocketBulletHitEnemyEvent`           |
| `0x82289f93` | `CoopSakerocketBulletReturnEvent`             |
| `0xba5fdc00` | `CoopSeqDbgForceGameOverEvent`                |
| `0x85c563d8` | `CoopSeqPlayerGoldenIkuraAssistEvent`         |
| `0x1e6fb025` | `CoopSeqPlayerGoldenIkuraDirectBankEvent`     |
| `0x6474f87a` | `CoopSeqStatsEvent`                           |
| `0x68ad0836` | `CoopSpawnGeyserOpenEvent`                    |
| `0xe1c48824` | `OnlineDbgCoopRecordProfile`                  |
| `0x9bd55525` | `OnlineDbgCoopRecordReport`                   |
| `0x5c9e7c22` | `OnlineDbgCoopRecordRequest`                  |

### NetState

|      ELFのID | 型名                   |
| -----------: | ---------------------- |
| `0xf8164b9a` | `CoopUserInfoNetState` |

`CoopUserInfoNetState`の通信上のGroup IDは未確認です。

## 参考資料 {#references}

- ELF
- LAN Play通信
