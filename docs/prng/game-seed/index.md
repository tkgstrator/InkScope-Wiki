---
title: GameSeed
description: Splatoon 2とSplatoon 3のGameSeedの構成
---

# GameSeed

`GameSeed`は、サーモンランの乱数処理の起点となる値です。同じ名前でも、Splatoon 2（SP2）とSplatoon 3（SP3）では値の構成が異なります。

| 作品                            | `GameSeed`の構成              |
| ------------------------------- | ----------------------------- |
| [SP2](/prng/game-seed/sp2.html) | 32ビット整数                  |
| [SP3](/prng/game-seed/sp3.html) | 32ビット整数×4（計128ビット） |

SP2の`GameSeed`に使える入力値は`2^32`＝4,294,967,296通り（約42.9億通り）です。

## 参考資料

- [サーモンラン大全](https://overfishing.netlify.app/wave/index.html)
- [StarlightSeedHack](https://github.com/tkgstrator/StarlightSeedHack)
- ELF
- LAN Play通信
