---
title: WAVE 情報
description: Splatoon 3のWAVEで計算できる内容と、まだ確定できない内容
---

# WAVE 情報

各WAVEのほとんどすべての情報は、マッチメイキング時に初期化される`GameSeed`で先読みすることができます。

## ブキとスペシャル {#weapons-specials}

プライベートバイトではスペシャルを内部プレイヤー番号へ割り当て、その後に支給ブキの表を作る処理があります。[ブキのID](/ids/weapon-id.html)と[スペシャルのID](/ids/special-id.html)は別表にまとめています。

次は`JobType` 1の計算です。スペシャル候補とブキプールはゲーム内で使われる順に渡します。ブキ候補の配列は指定された開始位置から有効件数分を読み、末尾に達したら先頭へ戻ります。その順の値を`main_ids`、`current_main`、`source_main`に渡します。コードの`effective_internal_value`は[InternalValue](/internal-value.html)を使い、シーン側に別値があればそちらを使います。候補の先頭4件から`SpecialId`を取得します。`get_u32`は上のイベント計算と同じ関数です。

```rust
use ocean_calc::{SeedWords, derive};

fn shuffle<T>(state: &mut [u32; 4], items: &mut [T]) {
    for remaining in (2..=items.len()).rev() {
        let value = get_u32(state);
        let index = ((remaining as u64 * u64::from(value)) >> 32) as usize;
        items.swap(remaining - 1, index);
    }
}

fn draw_specials(
    seed: SeedWords,
    effective_internal_value: u32,
    low: &[u16],
    prior: &[u16],
    v6: &[u16],
    special_id_for: impl Fn(u16) -> u16,
) -> ([u16; 4], [u32; 4]) {
    let mut state = derive(seed, 0x3529_79a0).as_array();
    let candidates = if effective_internal_value >> 17 <= 2 {
        let mut work: Vec<_> = low.iter().copied().take(8).collect();
        shuffle(&mut state, &mut work);
        work
    } else {
        let mut work: Vec<_> = prior.iter().copied().take(9).rev().collect();
        shuffle(&mut state, &mut work);
        let mut chosen = Vec::new();
        for _ in 0..2 {
            if let Some(id) = work.pop() { chosen.push(id); }
        }
        for &id in v6 {
            if work.len() == 9 { break; }
            work.insert(0, id);
        }
        shuffle(&mut state, &mut work);
        for _ in 0..2 {
            if let Some(id) = work.pop() { chosen.push(id); }
        }
        shuffle(&mut state, &mut chosen);
        chosen
    };
    let specials = std::array::from_fn(|i| special_id_for(candidates[i]));
    (specials, state)
}

fn remap_specials(
    initial: [u16; 4],
    current_main: &[i32],
    source_main: &[i32],
    active_count: usize,
) -> [u16; 4] {
    let sources: Vec<_> = current_main.iter()
        .map(|id| source_main.iter().position(|source| source == id))
        .collect();
    let mut final_ids = initial;
    if sources.iter().filter(|source| source.is_some()).count() >= active_count {
        for (destination, source) in sources.into_iter().enumerate() {
            if let Some(source) = source {
                final_ids[destination] = initial[source];
            }
        }
    }
    final_ids
}

fn draw_private_weapons(
    state: &mut [u32; 4],
    main_ids: &[Option<i32>; 4],
    base_ids: &[u16],
    alternate_ids: &[i32],
    mode_allows_direct: bool,
) -> [[u32; 4]; 5] {
    let mut rows = [[0; 4]; 5];
    for wave in 0..5 {
        for player in 0..4 {
            rows[wave][player] = match main_ids[player] {
                Some(id) if id >= 0 &&
                    (mode_allows_direct || alternate_ids.contains(&id)) => id as u32 & 0xffff,
                Some(id) if id >= 0 => u32::from(base_ids[0]),
                _ => {
                    let value = get_u32(state);
                    let index = ((base_ids.len() as u64 * u64::from(value)) >> 32) as usize;
                    0x0001_0000 | u32::from(base_ids[index])
                }
            };
        }
    }
    rows
}
```

ブキには`draw_specials`が返した乱数状態を引き継ぎます。`remap_specials`は実行時に再配置が有効な場合だけ使います。実効候補・ブキプールは保存パケットだけでは確定せず、内部プレイヤー番号と実際の参加者の対応も未確認です。

## オオモノシャケと湧き方向 {#boss-spawns}

通常・霧・ドスコイ大量発生ではオオモノシャケの名目上の出現時刻と件数を計算できます。敵種のIDは[SalmonId](/ids/salmon-id.html)にまとめています。種類は、同じ時刻の連続処理を含めて現存数・予約数が上限に達しない理想的なWAVEを仮定して計算します。

次は`JobType` 0/1で`EventId`が`0, 5, 6`の通常の予定項目を作る処理です。コードの`seed`はシーンの128ビット`GameSeed`です。予定時刻にはイベント・潮位とは別の乱数状態を使います。`special_branch`は実行時に選ばれた分岐です。

```rust
use ocean_calc::{SeedWords, derive};

fn nominal_ticks(
    seed: SeedWords,
    wave_change_num: u32,
    rare_appear_num: u32,
    special_branch: bool,
) -> Vec<u32> {
    let mut state = derive(seed, 0xe6da_1c4b).as_array();
    let interval = 4320 / (wave_change_num - 1);
    let m = wave_change_num - 1;
    let mut ticks: Vec<_> = (0..wave_change_num).map(|i| i * interval).collect();
    for j in 0..rare_appear_num.saturating_sub(wave_change_num) {
        let k = if special_branch { j % m } else { m - 1 - (j % m) };
        let tick = if special_branch && k == 0 {
            0
        } else {
            let value = get_u32(&mut state);
            k * interval + ((u64::from(value) * u64::from(interval)) >> 32) as u32
        };
        ticks.push(tick);
    }
    ticks.sort_unstable();
    ticks
}
```

`nominal_ticks`は時刻の一覧です。種類を順に計算する際は、同時刻の項目もゲームのヒープソート順に処理します。

通常のオオモノシャケでは、方向・種類と汎用地点の候補番号をイベント・潮位とは別の乱数状態で順に計算します。

次のコードの`states`には種類ごとの上限と実行時条件を反映します。

`stage_keys`は`CoopSpawnPointEnemy{d}`の`Layer`（Low=0、Mid=1、High=2）から`3 × d + Layer`で作ります。コードの`internal_value`には[InternalValue](/internal-value.html)を渡します。といっても、この値は極めて小さいので初期バージョン（1.0.0）以外では無視されます。

`callback_allows`はオオモノシャケごとの実行時条件の結果です。

```rust
#[derive(Clone, Copy)]
enum BossCandidate { Skip, AtLimit, Eligible }

fn ideal_boss_candidates(internal_value: u32, callback_allows: [bool; 11]) -> [BossCandidate; 32] {
    std::array::from_fn(|id| {
        if !(4..=14).contains(&id) || (id == 14 && (internal_value >> 8) < 257) {
            BossCandidate::Skip
        } else if callback_allows[id - 4] {
            BossCandidate::Eligible
        } else {
            BossCandidate::Skip
        }
    })
}

fn choose_rare_boss(state: &mut [u32; 4], states: &[BossCandidate; 32]) -> u8 {
    let mut selected = 0x20;
    let mut eligible_count = 0u32;
    for (id, candidate) in states.iter().enumerate() {
        match candidate {
            BossCandidate::Skip => {}
            BossCandidate::AtLimit => { get_u32(state); }
            BossCandidate::Eligible => {
                eligible_count += 1;
                let value = get_u32(state);
                if ((u64::from(value) * u64::from(eligible_count)) >> 32) == 0 {
                    selected = id as u8;
                }
            }
        }
    }
    selected
}

fn choose_direction(
    state: &mut [u32; 4],
    stage_keys: &[u8],
    previous: Option<u8>,
) -> Option<u8> {
    let mask = stage_keys.iter().fold(0u32, |bits, key| bits | (1 << key));
    let mut candidates = vec![0u8, 1, 2];
    for direction in 0..3u8 {
        if mask & (1 << direction) == 0 {
            if let Some(index) = candidates.iter().position(|id| *id == direction) {
                candidates.swap_remove(index);
            }
        }
    }
    if let Some(previous) = previous {
        if let Some(index) = candidates.iter().position(|id| *id == previous) {
            candidates.swap_remove(index);
        }
    }
    if candidates.is_empty() { return previous; }
    let value = get_u32(state);
    let index = ((u64::from(value) * candidates.len() as u64) >> 32) as usize;
    Some(candidates[index])
}

fn initial_directions(
    seed: SeedWords,
    stage_keys: &[u8],
) -> (Option<u8>, Option<u8>, [u32; 4]) {
    let mut state = derive(seed, 0x8d56_161f).as_array();
    get_u32(&mut state);
    let wave_start = choose_direction(&mut state, stage_keys, None);
    let after_queue = choose_direction(&mut state, stage_keys, wave_start);
    (wave_start, after_queue, state)
}

fn advance_direction(
    state: &mut [u32; 4],
    stage_keys: &[u8],
    previous: Option<u8>,
    old_tick: i32,
    new_tick: i32,
    interval: i32,
) -> Option<u8> {
    if interval != 0 && old_tick.wrapping_div(interval) < new_tick.wrapping_div(interval) {
        choose_direction(state, stage_keys, previous)
    } else {
        previous
    }
}

fn choose_generic_spot_index(state: &mut [u32; 4], count: u32) -> Option<u32> {
    if count == 0 { return None; }
    let value = get_u32(state);
    Some(((u64::from(value) * u64::from(count)) >> 32) as u32)
}
```

`advance_direction`はスケジューラの呼び出しごとに一度だけ判定します。

通常の種類候補は`SalmonId` 4～14です。上限に達した候補は乱数だけ進め、周期的に指定される`SalmonId` 15はこの種類選択を通りません。

## 参考資料 {#references}

- ELF
- ステージデータ
- LAN Play通信
