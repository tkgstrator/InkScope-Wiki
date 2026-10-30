---
title: WAVE 情報
description: Splatoon 3のWAVEで計算できる内容と、まだ確定できない内容
---

# WAVE 情報

`GameSeed`から各WAVEの候補を計算できます。実際のイベント、潮位、ブキ、スペシャルを先読みするには、ステージや難易度のほか、シーンで採用された値と実行時設定が必要です。

## ブキとスペシャル {#weapons-specials}

プライベートバイト（`JobType=1`）では、スペシャルを内部プレイヤー番号（0～3）へ割り当てた後、支給ブキの表（5行×4枠）を作成します。[ブキのID](/ids/weapon-id.html)と[スペシャルのID](/ids/special-id.html)は別表を参照してください。

以下は`JobType=1`の抽選コードです。スペシャル候補とブキプールはゲーム内の順序で渡します。ブキ候補配列は指定の開始位置から有効件数分をリング状に読み、`main_ids`、`current_main`、`source_main`へ渡します。`effective_internal_value`には[InternalValue](/internal-value.html)（シーン側に別値があればその値）を使い、候補の先頭4件から`SpecialId`を取得します。`get_u32`は[イベント計算](/prng/game-seed/sp3.html#イベントと潮位の計算)と同じ関数です。

高分岐では、第1候補を入力順に追加してシャッフルし、先頭から最大2件を取り出します。続いて残りの末尾へ第2候補を追加して再度シャッフルし、先頭から最大2件を取り出したうえで、選ばれた計4件をシャッフルします。

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
        let mut work: Vec<_> = prior.iter().copied().take(9).collect();
        shuffle(&mut state, &mut work);
        let mut chosen = Vec::new();
        let count = work.len().min(2);
        chosen.extend(work.drain(..count));
        for &id in v6 {
            if work.len() == 9 { break; }
            work.push(id);
        }
        shuffle(&mut state, &mut work);
        let count = work.len().min(2);
        chosen.extend(work.drain(..count));
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

ブキ抽選には`draw_specials`終了後の乱数状態を引き継ぎます。`remap_specials`は実行時にスペシャル再配置が有効な場合のみ適用されます。なお、通信上の設定値だけでは実効候補やブキプールは確定しません。

### 参加人数と割り当て

スペシャルは内部index 0～3の4枠、ブキは5行×4枠の表を作成し、各WAVEの装備は同じ内部indexで参照します。

再配置フラグが有効で、主ブキ配列の一致数が有効参加者数以上なら、スペシャル配列を再配置します（同じ主ブキIDが複数ある場合は同じ`SpecialId`が複数枠に割り当てられます）。再配置自体は乱数を消費しませんが、各indexの`SpecialId`が変わります。

また、ブキ候補のSeason上限にはシーンで採用された`UnlockedSeason`（[`OnlineCoopSetting`](/packet/index.html#online-coop-setting)で送信）を使います。

通常のサーモンランでは、有効なステーションの論理順にユーザー設定を取り込み、参加対象順に内部プレイヤー番号を割り当てます。[ステーション識別値とユーザー設定](/protocol/type.html#protocol-11)が全員分そろってシーンへ採用されると、参加者と内部プレイヤー番号を対応付けられます。

## オオモノシャケと湧き方向 {#boss-spawns}

通常・霧・ドスコイ大量発生（`JobType` 0/1、`EventId` `0, 5, 6`）では、オオモノシャケの名目上の出現時刻と件数を計算できます。敵種IDは[`SalmonId`](/ids/salmon-id.html)を参照してください。敵種は、出現後すぐに撃破して同時出現上限に達しない条件で計算します。

以下は出現予定時刻を求めるコードです。`seed`はシーンの128ビット`GameSeed`、`special_branch`は実行時に選ばれた分岐です。

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

同時刻の項目はゲームのヒープソート順に処理します。

通常のオオモノシャケでは、湧き方向・敵種・汎用出現地点の候補番号を、イベントや潮位とは別の乱数状態で順に計算します。

次のコードの`states`には種類ごとの上限と実行時条件（`callback_allows`）を反映します。`stage_keys`は`CoopSpawnPointEnemy{d}`の`Layer`（Low=0、Mid=1、High=2）から`3 × d + Layer`で求めます。`internal_value`には[InternalValue](/internal-value.html)を渡します（この閾値は小さいため、バージョン1.0.0以外では条件を満たします）。

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

`advance_direction`はスケジューラの呼び出しごとに1回判定します。通常のオオモノ候補は`SalmonId` 4～14で、上限に達した候補は乱数だけ進めます。霧で周期的に出現するキンシャケ（`SalmonId` 15）はこの抽選を通りません。

### 最初のオオモノの種類

`JobType=1`かつ`EventId`が`0`・`5`・`6`のとき、以下の条件を満たせばWAVE最初のオオモノの`SalmonId`を計算できます。

- シーンが採用した`GameSeed`、ステージ、`Difficulty`、有効参加人数を使い、`MatchMode=11`と通常のステージ初期化を通る
- イベント・潮位の強制変更や上書きがなく、通常のオオモノ出現予定を使う
- 最初のスケジューラ呼び出しが経過tick `0`で実行され、それ以前に出現や乱数消費がない
- 現存数と予約数がともに`0`で、周期的なキンシャケ出現の条件と初期の候補判定が判明している

霧ではキンシャケの出現周期の入力が別途必要です。2体目以降も続けて計算するには、スケジューラの実行時刻、出現・予約・撃破による現存数の変化、出現地点の選択処理を引き継ぐ必要があります。

## 参考資料 {#references}

- ELF
- ステージデータ
- LAN Play通信
