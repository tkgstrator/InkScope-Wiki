---
title: Splatoon 2のSceneSeed
description: Splatoon 2のSceneSeedの用途と確認できた範囲
---

# Splatoon 2の`SceneSeed`

`SceneSeed`は[`WaveSeed`](/prng/wave-seed/sp2.html)から作られます。具体的な生成式は未確認です。

## `SceneSeed`の乱数が関わる内容

次の内容は`SceneSeed`から始まる乱数に依存すると思われます。

- 出現するキンシャケのドロップ数
- ザコシャケの種類
- ハコビヤの落下座標
- グリルのターゲット

`GameSeed`を固定しても、これらの結果はプレイごとにずれます。
