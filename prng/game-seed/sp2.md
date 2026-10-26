---
title: Splatoon 2のGameSeed
description: Splatoon 2のGameSeedとWAVEの決まり方
---

# Splatoon 2の`GameSeed`

Splatoon 2（SP2）の`GameSeed`は1つの32ビット整数です。取り得る入力値は`2^32`＝4,294,967,296通りです。

バイト全体の起点となり、各WAVEにおけるイベントと潮位を決定するために使います。この値が分かれば、基本的にサーモンランの全てのランダムな要素は先読みすることができます。

## 取得方法

マッチメイキング成立時に、ホストマシンから全クライアントに送信されます。

メモリの中身を読み込むか、パケットを解析することで`GameSeed`の値を取得できます。

## イベントと潮位の計算

`GameSeed`からイベントと潮位を計算します。`init_state`と`get_u32`は[`WaveSeed`の計算方法](/prng/wave-seed/sp2.html#計算方法)にあります。

```rust
fn wave_events_and_tides(game_seed: u32) -> ([u8; 3], [u8; 3]) {
    const EVENT_WEIGHTS: [u32; 7] = [18, 1, 1, 1, 1, 1, 1];
    const TIDE_WEIGHTS: [u32; 3] = [1, 3, 1];

    let mut state = init_state(game_seed);
    let mut events = [0u8; 3];
    let mut tides = [0u8; 3];

    for wave in 0..3 {
        let mut total = 0u32;
        for (event, &weight) in EVENT_WEIGHTS.iter().enumerate() {
            if wave > 0 && events[wave - 1] != 0 && events[wave - 1] == event as u8 {
                continue;
            }
            total += weight;
            let value = (u64::from(get_u32(&mut state)) * u64::from(total)) >> 32;
            if value < u64::from(weight) {
                events[wave] = event as u8;
            }
        }

        total = 0;
        for (tide, &weight) in TIDE_WEIGHTS.iter().enumerate() {
            if tide == 0 && (1..=3).contains(&events[wave]) {
                continue;
            }
            total += weight;
            let value = (u64::from(get_u32(&mut state)) * u64::from(total)) >> 32;
            if value < u64::from(weight) {
                tides[wave] = if events[wave] == 6 { 0 } else { tide as u8 };
            }
        }
    }

    (events, tides)
}
```

## 参考資料

- [サーモンラン大全](https://overfishing.netlify.app/wave/index.html)
- [StarlightSeedHack](https://github.com/tkgstrator/StarlightSeedHack)
