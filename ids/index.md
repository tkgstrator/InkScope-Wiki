---
title: 内部ID
description: サーモンランの内部IDと難易度
---

# 内部ID

WAVEの計算に使うIDをまとめます。シナリオの`StageId`はステージ資料`CoopSceneInfo.Id`と同じ値です。[ブキ](/ids/weapon-id.html)、[スペシャル](/ids/special-id.html)、[敵種](/ids/salmon-id.html)のIDは別表にまとめています。

## `StageId` {#stages}

`StageId`は選択シナリオのステージ番号です。次の表は`CoopSceneInfo.Id`とステージ名の対応を示します。

表のIDと種類は`CoopSceneInfo`にある14行に基づきます。日本語名はゲームの表示データと照合しています。

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

`Cop_Tutorial`のステージデータもありますが、この14行にはないため表のIDを付けていません。`Cop_District00`と`Cop_Manbou00`の日本語名は表示データで末尾の`00`を省いた名前と対応付けています。

待機中の部屋設定には`Cop_*`名が入ります。

## `EventId`/`WaterLevel` {#events-and-tides}

`EventId`と設定キーの対応はWAVE設定の分岐と共通設定を照合して整理しています。右列はゲーム内の共通設定キーです。画面に出る日本語名との対応はまだ確定していません。

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

イベントと潮位は、決定後に人数などの条件で書き換わる場合があります。[WAVE 情報](/wave/index.html)で生成値と適用値の違いを説明します。

## `JobType` {#job-types}

`JobType`はバイトの種類を示すIDです。実行ファイルには0～7を区別する処理がありますが、5～7の名称はまだ分かっていません。

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

2～4の処理は`JobType`だけでは決まりません。ゲーム中のモード状態も必要です。選択したプライベートバイトのシナリオが必ず`JobType` 1になるかも未確認です。

## `Difficulty` {#difficulty}

`Difficulty`はWAVE開始前にホストから届く設定値です。WAVEの決定処理では、`JobType`ごとに求めた実効難易度を使います。

| `JobType` | 実効難易度の求め方                                       |
| --------: | -------------------------------------------------------- |
|       `0` | 対象となる参加者の難易度値の平均。対象がいなければ`0`    |
|       `1` | `MatchMode`が`11`ならシーンの`Difficulty`。それ以外は`0` |

計算した値は0～1665に収めます。

## 参考資料 {#references}

- `CoopSceneInfo`
- ステージ表示データ
- ELF
- ステージ設定
