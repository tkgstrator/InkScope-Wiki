---
title: SceneSeed
description: Splatoon 2とSplatoon 3のシーンの乱数値
---

# SceneSeed

SP2の`SceneSeed`とSP3のシーンにある乱数値について、確認できている内容を分けて説明します。

| 作品 | 確認できたこと |
| --- | --- |
| [SP2](/prng/scene-seed/sp2.html) | `WaveSeed`から`SceneSeed`を作ります。ゲーム中の乱数消費により、`GameSeed`を固定しても結果が変わると考えられています。 |
| [SP3](/prng/scene-seed/sp3.html) | シーンには`RandomSeed0`～`RandomSeed3`があります。SP2の`SceneSeed`と同じ生成手順かは未確認です。 |

## 参考資料

- ELF
