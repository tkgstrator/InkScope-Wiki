---
title: 内部ID
description: サーモンランの内部IDと難易度
---

# 内部ID

WAVEの計算に使う内部IDの一覧です。[ブキ](/ids/weapon-id.html)、[スペシャル](/ids/special-id.html)、[敵種](/ids/salmon-id.html)のIDは別ページにまとめています。

## `StageId` {#stages}

`StageId`はステージの識別番号で、`CoopSceneInfo.Id`と同じ値です。待機中の部屋設定には`Cop_*`名が入ります。

| 種類    | `StageId` | `Cop_*`名          | 日本語表示名                 |
| ------- | --------: | ------------------ | ---------------------------- |
| 通常    |       `1` | `Cop_Shakeup`      | シェケナダム                 |
| 通常    |       `2` | `Cop_Shakespiral`  | アラマキ砦                   |
| 通常    |       `4` | `Cop_Shakelift`    | トキシラズいぶし工房         |
| 通常    |       `6` | `Cop_Shakeship`    | 難破船ドン・ブラコ           |
| 通常    |       `7` | `Cop_Shakedent`    | ムニ・エール海洋発電所       |
| 通常    |       `8` | `Cop_Shakehighway` | すじこジャンクション跡       |
| 通常    |       `9` | `Cop_Shakerail`    | どんぴこ闘技場               |
| Big Run |     `100` | `Cop_Carousel`     | スメーシーワールド           |
| Big Run |     `102` | `Cop_Upland`       | 海女美術大学                 |
| Big Run |     `103` | `Cop_Temple`       | マテガイ放水路               |
| Big Run |     `104` | `Cop_Factory`      | ナンプラー遺跡               |
| Big Run |     `105` | `Cop_Section`      | タラポートショッピングパーク |
| Big Run |     `106` | `Cop_District00`   | ゴンズイ地区                 |
| Big Run |     `107` | `Cop_Manbou00`     | グランドバンカラアリーナ     |

`Cop_Tutorial`は`CoopSceneInfo`の14行に含まれないため、`StageId`はありません。

## `EventId`/`WaterLevel` {#events-and-tides}

`EventId`とゲーム内の共通設定キー、および`WaterLevel`（潮位）の対応です。

| `EventId` | 設定キー        |
| --------: | --------------- |
|       `0` | `EventNone`     |
|       `1` | `EventRush`     |
|       `2` | `EventGeyser`   |
|       `3` | `EventDozer`    |
|       `4` | `EventHakobiya` |
|       `5` | `EventFog`      |
|       `6` | `EventMissile`  |
|       `7` | `EventRelay`    |
|       `8` | `EventTamaire`  |

| `WaterLevel` | 意味         |
| -----------: | ------------ |
|          `0` | 干潮（Low）  |
|          `1` | 通常（Mid）  |
|          `2` | 満潮（High） |

イベントと潮位は、抽選後に参加人数などの条件で書き換わる場合があります。詳細は[WAVE 情報](/wave/index.html)を参照してください。

## `JobType` {#job-types}

`JobType`はバイトの種類を示すIDです。実行ファイルには0～7の分岐があり、5～7の名称は未特定です。

|  ID | 呼称          | 確認した処理                               |
| --: | ------------- | ------------------------------------------ |
| `0` | `Regular`     | 通常のバイト。参加者の評価値を難易度に使う |
| `1` | `Private`     | プライベートバイト用の設定経路             |
| `2` | `TeamContest` | 条件により通常のイベント決定処理を省く     |
| `3` | `Contest`     | 確認したWAVE設定分岐はID `2`と同じ         |
| `4` | `BigRun`      | 条件によりBig Run用の設定を使う            |
| `5` | 未特定        | 固有の分岐は未確認                         |
| `6` | 未特定        | 敵の予定表の並べ替えなどに関係する         |
| `7` | 未特定        | コンテスト用のWAVE設定を直接読む           |

ID 2～4の処理にはゲーム中のモード状態も関わります。

## `Difficulty` {#difficulty}

`Difficulty`はWAVE開始前にホストから届く難易度設定です。WAVEの計算では、`JobType`に応じて0～1665に収めた実効難易度を使います。

| `JobType` | 実効難易度の求め方                                       |
| --------: | -------------------------------------------------------- |
|       `0` | 対象となる参加者の難易度値の平均。対象がいなければ`0`    |
|       `1` | `MatchMode`が`11`ならシーンの`Difficulty`。それ以外は`0` |

## 参考資料 {#references}

- `CoopSceneInfo`
- ステージ表示データ
- ELF
- ステージ設定
