---
title: Splatoon 3とSceneSeed
description: Splatoon 3のシーンにある乱数値
---

# Splatoon 3と`SceneSeed`

SP3のシーンには、`RandomSeed0`～`RandomSeed3`（32ビット整数×4）があります。`GameSeed`からコピーする経路のほか、別の乱数から生成する経路や後から上書きされる経路もあります。

シーンの値から用途別のPRNGを初期化します。4つの値がすべて`0`の場合は、PRNGの初期化時に`(1, 0, 0, 0)`へ補正します（シーンに保存された元の値は変わりません）。SP2の`SceneSeed`と同じ生成手順かは未確認です。

通信上の`GameSeed`とシーンの値の関係は[SP3の`GameSeed`](/prng/game-seed/sp3.html)を参照してください。

## 参考資料

- ELF
