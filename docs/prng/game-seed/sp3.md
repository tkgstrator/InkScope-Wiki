---
title: Splatoon 3のGameSeed
description: Splatoon 3のGameSeedとシーンへの転送
---

# Splatoon 3の`GameSeed`

Splatoon 3（SP3）の`GameSeed`は32ビット整数×4（計128ビット）です。

WAVEのイベントや潮位など、複数の抽選の起点になります。実際の先読みには、シーンで採用された値、ステージ、難易度、参加人数などの実行時設定も必要です。

## 取得方法

マッチング成立時にホストから全クライアントへ送信されます。メモリの参照、セーブデータの復号、または`BroadcastEventProtocol`の[`OnlineCoopSetting`](/packet/index.html#online-coop-setting)パケットの解析で取得できます。

`Regular`や`BigRun`ではホストが生成し、`Private`ではシナリオの`RandomSeedAry`を使う経路もあります。待機中に送られる`RandomSeedAry`と、WAVE開始前に送られる`GameSeed`は別の値です。

`CoopSeqRoundFinishEvent`（`subtype=1`）は共有乱数状態を運び、受信側はその値を共有状態に反映します。通常のWAVE 1/2/3では、送信側が直前の共有状態をそれぞれ5/6/7回進めて通知します。共有状態が`OnlineCoopSetting.GameSeed`で初期化され、各終了通知がそのまま適用されれば、通知値は累積5/11/18回進めた状態に対応します。なお、ブキ・スペシャル抽選に使われたシーンの実効値は別途照合が必要です。

## イベントと潮位の計算

`GameSeed`から[Regularステージ](/stage/index.html#regular-stages)のイベントと潮位を計算します。Big Runステージでは発生しないイベントと潮位の組み合わせがあるため、条件が異なります。

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
