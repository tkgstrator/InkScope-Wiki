---
title: SceneSeed
description: Splatoon 2とSplatoon 3のシーンの乱数値
---

# SceneSeed

SP2の`SceneSeed`とSP3のシーン内乱数値の違いです。

| 作品 | 概要 |
| --- | --- |
| [SP2](/prng/scene-seed/sp2.html) | `WaveSeed`から`SceneSeed`を生成。プレイ中の乱数消費により、`GameSeed`を固定しても結果が変化する |
| [SP3](/prng/scene-seed/sp3.html) | シーンに`RandomSeed0`～`RandomSeed3`を保持。SP2の`SceneSeed`と同じ生成手順かは未確認 |

## 参考資料

- ELF
