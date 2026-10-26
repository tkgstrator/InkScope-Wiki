---
title: Splatoon 3とSceneSeed
description: Splatoon 3のシーンにある乱数値
---

# Splatoon 3と`SceneSeed`

SP3のシーンには`RandomSeed0`～`RandomSeed3`という32ビット整数×4の値があります。`GameSeed`からこれらの値へコピーする経路がありますが、別の乱数から値を作る経路や、後から上書きされる可能性もあります。

シーンの値から用途別のPRNGを作ります。すべて0の場合は、PRNGの初期化時に`(1, 0, 0, 0)`へ補正します。シーンに保存された元の値は変わりません。SP2の`SceneSeed`と同じ生成手順だとは確認できていません。

通信の`GameSeed`とシーンの値の関係は[SP3の`GameSeed`](/prng/game-seed/sp3.html)で説明します。

## 参考資料

- ELF
