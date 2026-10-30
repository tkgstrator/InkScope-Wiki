---
title: PRNG
description: サーモンランの乱数とGameSeedの関係
---

# PRNG

サーモンランでは、擬似乱数生成器（PRNG）にシードを渡して得た乱数から、WAVEのイベントや潮位などを決定します。`GameSeed`はその起点となる値です。実際の結果には、ステージや難易度などの設定、乱数の消費順序、プレイ中の状況も関わります。

`sead::Random`の乱数生成方式は**Xorshift128**です。32ビット整数×4の内部状態を更新し、次の32ビット整数を生成します。

## メルセンヌ・ツイスタとの関係

32ビット整数からXorshift128の内部状態を初期化する処理では、MT19937（メルセンヌ・ツイスタ）と同じ初期化定数`0x6C078965`を使います。共通するのは**初期化定数**だけで、乱数生成自体はXorshift128です。`GameSeed`が32ビット整数×4で与えられる経路では、この初期化処理を通らない場合があります。

## シードの役割

| パラメータ | 役割 |
| --- | --- |
| [`GameSeed`](/prng/game-seed/index.html) | 乱数処理の起点。SP2とSP3で構成が異なる |
| [`WaveSeed`](/prng/wave-seed/index.html) | SP2ではWAVEごと、SP3ではオオモノシャケ出現用PRNGの初期化に使う値 |
| [`SceneSeed`](/prng/scene-seed/index.html) | SP2で`WaveSeed`から作る値。SP3では同じ階層は未確認 |

SP3では、通信上の`GameSeed`がそのままPRNGへ渡るとは限りません。通信と先読みの関係は[WAVE 情報](/wave/index.html)を参照してください。

## 参考資料

- [SEAD `Random`](https://github.com/open-ead/sead/blob/master/include/random/seadRandom.h)
- [StarlightSeedHack](https://github.com/tkgstrator/StarlightSeedHack)
- [MT19937](https://github.com/clibs/mt19937ar/blob/master/mt19937ar.c)
- ELF
