---
title: SalmonId（EnemyId）
description: サーモンランで使う敵種IDの対応
---

# `SalmonId`

通信中の5ビットの整数は、ゲーム内の`CoopEnemyInfo.Type`で使う0～31のIDに対応します。このページでは`SalmonId`と表記します。日本語表示名と、敵設定データにある分類も併記します。日本語表示名が「未確認」の行は、対応する表示文言を確かめていません。

|   ID | `CoopEnemyInfo.Type` | 日本語表示名   | 分類           |
| ---: | -------------------- | -------------- | -------------- |
|  `0` | `SakelienStandard`   | シャケ         | ザコシャケ     |
|  `1` | `SakelienLarge`      | ドスコイ       | ザコシャケ     |
|  `2` | `SakelienSmall`      | コジャケ       | ザコシャケ     |
|  `3` | `SakeFlyBagman`      | タマヒロイ     | その他         |
|  `4` | `SakelienBomber`     | バクダン       | オオモノシャケ |
|  `5` | `SakelienCupTwins`   | カタパッド     | オオモノシャケ |
|  `6` | `SakelienShield`     | テッパン       | オオモノシャケ |
|  `7` | `SakelienSnake`      | ヘビ           | オオモノシャケ |
|  `8` | `SakelienTower`      | タワー         | オオモノシャケ |
|  `9` | `Sakediver`          | モグラ         | オオモノシャケ |
| `10` | `Sakerocket`         | コウモリ       | オオモノシャケ |
| `11` | `SakePillar`         | ハシラ         | オオモノシャケ |
| `12` | `SakeDolphin`        | ダイバー       | オオモノシャケ |
| `13` | `SakeArtillery`      | テッキュウ     | オオモノシャケ |
| `14` | `SakeSaucer`         | ナベブタ       | オオモノシャケ |
| `15` | `SakelienGolden`     | キンシャケ     | イベント用     |
| `16` | `SakelienGeyser`     | 未確認         | イベント用     |
| `17` | `Sakedozer`          | グリル         | イベント用     |
| `18` | `SakeCarrier`        | 未確認         | イベント用     |
| `19` | `SakeCopter`         | シャケコプター | その他         |
| `20` | `SakeBigMouth`       | ドロシャケ     | イベント用     |
| `21` | `SakeBigMouthGold`   | ドロシャケ     | イベント用     |
| `22` | `SakeShip`           | 未確認         | イベント用     |
| `23` | `SakelienGiant`      | ヨコヅナ       | オカシラシャケ |
| `24` | `SakeRope`           | タツ           | オカシラシャケ |
| `25` | `SakeJaw`            | ジョー         | オカシラシャケ |
| `26` | `SakeBigBalloon`     | 未確認         | 設定行なし     |
| `27` | `SakeGhost`          | 未確認         | 設定行なし     |
| `28` | `SakeBalloon`        | 未確認         | 設定行なし     |
| `29` | `SakeWheel`          | 未確認         | 設定行なし     |
| `30` | `Triple`             | オカシラ連合   | 設定行なし     |
| `31` | `Random`             | 未確認         | 設定行なし     |

「設定行なし」は、敵種の列挙には存在しますが、確認した敵設定データに同名の行がないことを示します。この表のIDは敵設定データの行番号ではありません。

## 参考資料

- ELF
- 表示データ
- 敵設定データ
- LAN Play通信
