---
title: Splatoon 3のWaveSeed
description: Splatoon 3のオオモノシャケ出現用WaveSeedの計算
---

# Splatoon 3の`WaveSeed`

SP3では、オオモノシャケの出現に使うPRNGを、WAVE開始時点の共有乱数状態から計算した`WaveSeed`で初期化します。最初の共有乱数状態には、シーンの`RandomSeed0`～`RandomSeed3`で構成される128ビットの[`GameSeed`](/prng/game-seed/sp3.html)が入ります。

## 計算方法

次のRustコードは、WAVE開始時点の共有乱数状態から`WaveSeed`を計算します。

```rust
fn wave_seeds(shared_state: [u32; 4]) -> [u32; 2] {
    let [s0, _, _, s3] = shared_state;
    let t = s0 ^ (s0 << 11);
    let v = s3 ^ (s3 >> 19) ^ t ^ (t >> 8);
    [
        v.wrapping_add(0xe6da_1c4b),
        v.wrapping_add(0x8d56_161f),
    ]
}
```

返値は順にオオモノシャケの出現予定時刻用、種類・湧き方向用です。`s1`と`s2`はこのWAVEの計算式には直接入りませんが、次のWAVEの共有乱数状態に影響します。`WaveSeed`は32ビットで、初期化後のPRNG状態は128ビットです。種類・湧き方向に使う状態は、展開後に1回進めてから使います。

## WAVEごとの変化

通常のWAVE 1終了時には、共有乱数状態を5回進めた結果を`CoopSeqRoundFinishEvent`で共有します。その状態からWAVE 2の`WaveSeed`を計算します。WAVE 2を通常終了して3へ進むときは、WAVE 2終了時の共有乱数状態を6回進めます。

```rust
fn get_u32(state: &mut [u32; 4]) -> u32 {
    let [s0, s1, s2, s3] = *state;
    let t = s0 ^ (s0 << 11);
    let value = s3 ^ (s3 >> 19) ^ t ^ (t >> 8);
    *state = [s1, s2, s3, value];
    value
}

fn next_wave_state(mut state_at_finish: [u32; 4], wave_number: u32) -> [u32; 4] {
    for _ in 0..wave_number + 4 {
        get_u32(&mut state_at_finish);
    }
    state_at_finish
}

fn regular_wave_seeds(mut game_seed: [u32; 4]) -> [[u32; 2]; 3] {
    if game_seed == [0; 4] {
        game_seed[0] = 1;
    }
    let wave_2_state = next_wave_state(game_seed, 1);
    let wave_3_state = next_wave_state(wave_2_state, 2);
    [
        wave_seeds(game_seed),
        wave_seeds(wave_2_state),
        wave_seeds(wave_3_state),
    ]
}
```

通常経路では、WAVE中のオオモノシャケの抽選は別のPRNGを進めるため、上のように`GameSeed`からWAVE 2・3の状態を計算できます。`CoopSeqRoundFinishEvent`の状態を使う場合は、計算後の状態をそのまま使います。

イベントと潮位は`GameSeed`から計算します。計算方法は[SP3の`GameSeed`](/prng/game-seed/sp3.html#イベントと潮位の計算)にあります。

## 参考資料

- ELF
