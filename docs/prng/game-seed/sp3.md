---
title: Splatoon 3のGameSeed
description: Splatoon 3のGameSeedとシーンへの転送
---

# Splatoon 3の`GameSeed`

Splatoon 3（SP3）の`GameSeed`は32ビット整数×4で構成される計128ビットの整数です。

バイト全体の起点となり、各WAVEにおけるイベントと潮位を決定するために使います。この値が分かれば、基本的にサーモンランの全てのランダムな要素は先読みすることができます。

## 取得方法

マッチメイキング成立時に、ホストマシンから全クライアントに送信されます。

`Regular`, `BigRun`の場合にはホストマシンが生成し、`Private`の場合にはセーブデータに保存されている`RandomSeedAry`から復元します。

メモリの中身を読み込むか、セーブデータを復号するか、`BroadcastEventProtocol:OnlineCoopSetting`のパケットを解析することで`GameSeed`の値を取得できます。

## イベントと潮位の計算

GameSeedから[Regularステージ](/stage/index.html#regular-stages)のイベントと潮位を計算します。ビッグラン専用のステージでは発生しないイベントと潮位の組み合わせがあるため、このコードで先読みすることはできません。

```rust
use ocean_calc::{SeedWords, derive};

fn get_u32(state: &mut [u32; 4]) -> u32 {
    let [s0, s1, s2, s3] = *state;
    let t = s0 ^ (s0 << 11);
    let value = s3 ^ (s3 >> 19) ^ t ^ (t >> 8);
    *state = [s1, s2, s3, value];
    value
}

fn get_tide_u32(state: &mut [u32; 4]) -> u32 {
    let last = state[3];
    let value = get_u32(state);
    state[3] = last;
    value
}

fn wave_events_and_tides(game_seed: [u32; 4]) -> ([u8; 3], [u8; 3]) {
    const EVENT_WEIGHTS: [u32; 9] = [24, 1, 1, 1, 1, 1, 1, 1, 1];
    const TIDE_WEIGHTS: [u32; 3] = [1, 3, 1];
    let seed = SeedWords::from_scene(game_seed);
    let mut state = derive(seed, 0xf7d5_febd).as_array();
    let mut events = [0u8; 3];
    let mut tides = [1u8; 3];

    for wave in 0..3 {
        let mut total = 0u32;
        for (event, &weight) in EVENT_WEIGHTS.iter().enumerate() {
            if wave > 0 && events[wave - 1] != 0 && events[wave - 1] == event as u8 {
                continue;
            }
            total += weight;
            let value = (u64::from(total) * u64::from(get_u32(&mut state))) >> 32;
            if value < u64::from(weight) {
                events[wave] = event as u8;
            }
        }

        total = 0;
        for (tide, &weight) in TIDE_WEIGHTS.iter().enumerate() {
            if tide == 0 && matches!(events[wave], 1 | 2 | 3 | 8) {
                continue;
            }
            total += weight;
            let value = (u64::from(total) * u64::from(get_tide_u32(&mut state))) >> 32;
            if value < u64::from(weight) {
                tides[wave] = tide as u8;
            }
        }
    }

    (events, tides)
}
```

## 参考資料

- ELF
- LAN Play通信
