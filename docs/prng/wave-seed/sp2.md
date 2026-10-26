---
title: Splatoon 2のWaveSeed
description: Splatoon 2のWaveSeedの作り方と用途
---

# Splatoon 2の`WaveSeed`

`WaveSeed`はWAVEごとのPRNGの初期値となる32ビット整数です。そのPRNGでシャケの湧き方向とオオモノシャケの種類を決めます。

## 計算方法

次のRustコードはSP2の`WaveSeed`を計算します。WAVE 1の`WaveSeed`が`GameSeed`になっているのは恐らく実装ミスです。

```rust
fn init_state(mut value: u32) -> [u32; 4] {
    let mut state = [0; 4];
    for (i, word) in state.iter_mut().enumerate() {
        value = 0x6c07_8965_u32
            .wrapping_mul(value ^ (value >> 30))
            .wrapping_add((i + 1) as u32);
        *word = value;
    }
    state
}

fn get_u32(state: &mut [u32; 4]) -> u32 {
    let [x, y, z, w] = *state;
    let t = x ^ (x << 11);
    let next = t ^ (t >> 8) ^ w ^ (w >> 19);
    *state = [y, z, w, next];
    next
}

fn wave_seeds(game_seed: u32) -> [u32; 3] {
    let mut state = init_state(game_seed);
    let _ = get_u32(&mut state);
    let wave_2 = get_u32(&mut state);
    let wave_3 = get_u32(&mut state);
    [game_seed, wave_2, wave_3]
}
```

乱数生成そのものと、MT19937の初期化定数との関係は[PRNG](/prng/index.html)で説明します。

## 参考資料

- [サーモンラン大全](https://overfishing.netlify.app/wave/index.html)
- [StarlightSeedHack](https://github.com/tkgstrator/StarlightSeedHack/blob/master/source/coop.cpp)
