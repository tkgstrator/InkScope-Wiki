---
title: PRNG
description: サーモンランの乱数とGameSeedの関係
---

# PRNG

サーモンランのWAVEでは、何をもとにイベントや潮位を決めるのでしょうか。ゲームは擬似乱数生成器（PRNG）に種となる値を渡し、そこから順番に得た値をイベントや潮位の決定に使います。`GameSeed`はその起点となる値です。候補と重みはステージや難易度などの設定でも変わり、乱数を使う順番やプレイ中の状況も結果に関わります。

`sead::Random`の乱数生成方式は**Xorshift128**です。32ビット整数×4の内部状態を更新して、次の32ビット整数を作ります。

## メルセンヌ・ツイスタとの関係

32ビット整数からXorshift128の内部状態を初期化する処理には、`0x6C078965`という乗数が現れます。これはMT19937（メルセンヌ・ツイスタ）の初期化にも使われる値です。共通しているのは**初期化に使う定数**です。乱数を生成する処理にはXorshift128を使います。`GameSeed`がすでに32ビット整数×4で与えられる経路では、この初期化処理を通るとは限りません。

## シードの役割

| パラメータ | 役割 |
| --- | --- |
| [`GameSeed`](/prng/game-seed/index.html) | ゲームの乱数処理へ渡す起点。SP2とSP3では値の構成が異なります。 |
| [`WaveSeed`](/prng/wave-seed/index.html) | SP2ではWAVEごと、SP3ではオオモノシャケの出現用PRNGの初期化に使う値です。 |
| [`SceneSeed`](/prng/scene-seed/index.html) | SP2で`WaveSeed`から作る値です。SP3では同じ階層を確認できていません。 |

SP3の通信で`GameSeed`を読めても、その値が実際にPRNGへ渡ったかは別に確かめる必要があります。通信と先読みの関係は[WAVE 情報](/wave/index.html)で説明します。

## 参考資料

- [SEAD `Random`](https://github.com/open-ead/sead/blob/master/include/random/seadRandom.h)
- [StarlightSeedHack](https://github.com/tkgstrator/StarlightSeedHack)
- [MT19937](https://github.com/clibs/mt19937ar/blob/master/mt19937ar.c)
- ELF
