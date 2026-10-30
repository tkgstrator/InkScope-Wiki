---
title: ステージ情報
description: Splatoon 3のステージ別の潮位重みとイベント候補
---

# ステージ情報

Splatoon 3のステージ別の潮位重み（`Water`）と除外イベント（`BanEvent`）です。

`Water`は干潮・通常・満潮の重みです。共通設定の重みは全難易度で`1 / 3 / 1`です。「参照元」が「ステージ」の場合はステージ固有の`Water`、「共通」の場合は共通の`Water`を使います。`BanEvent`の指定がない場合は「—」と表記します。

## Regular {#regular-stages}

| `StageId` | ステージ | `Cop_*` | `Water` | 参照元 | `BanEvent` |
| --: | --- | --- | --: | --- | --- |
| `1` | シェケナダム | `Cop_Shakeup` | `1 / 3 / 1` | 共通 | — |
| `2` | アラマキ砦 | `Cop_Shakespiral` | `1 / 3 / 1` | 共通 | — |
| `4` | トキシラズいぶし工房 | `Cop_Shakelift` | `1 / 3 / 1` | 共通 | — |
| `6` | 難破船ドン・ブラコ | `Cop_Shakeship` | `1 / 3 / 1` | 共通 | — |
| `7` | ムニ・エール海洋発電所 | `Cop_Shakedent` | `1 / 3 / 1` | 共通 | — |
| `8` | すじこジャンクション跡 | `Cop_Shakehighway` | `1 / 3 / 1` | 共通 | — |
| `9` | どんぴこ闘技場 | `Cop_Shakerail` | `1 / 3 / 1` | 共通 | — |

## Big Run {#big-run-stages}

| `StageId` | ステージ | `Cop_*` | `Water` | 参照元 | `BanEvent` |
| --: | --- | --- | --: | --- | --- |
| `100` | スメーシーワールド | `Cop_Carousel` | `2 / 2 / 1` | ステージ | — |
| `102` | 海女美術大学 | `Cop_Upland` | `1 / 3 / 1` | ステージ | — |
| `103` | マテガイ放水路 | `Cop_Temple` | `1 / 3 / 1` | 共通 | `EventDozer` |
| `104` | ナンプラー遺跡 | `Cop_Factory` | `1 / 3 / 1` | 共通 | — |
| `105` | タラポートショッピングパーク | `Cop_Section` | `1 / 3 / 1` | 共通 | — |
| `106` | ゴンズイ地区 | `Cop_District00` | `1 / 3 / 1` | 共通 | — |
| `107` | グランドバンカラアリーナ | `Cop_Manbou00` | `1 / 3 / 1` | 共通 | — |

`Cop_Tutorial`にも設定データがあり、`Water`は共通の`1 / 3 / 1`、`BanEvent`の指定はありません。対応する`StageId`は確認できていません。

イベントと潮位の重み・候補条件は[イベントと潮位の条件](/wave/event-tide-conditions.html)にまとめています。

## 参考資料 {#references}

- `Cop_*.pack.zs`
- `CoopSceneInfo`
- ステージ表示データ
