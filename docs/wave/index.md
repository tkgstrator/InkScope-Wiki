---
title: WAVE 情報
description: Splatoon 3のWAVEで計算できる内容と、まだ確定できない内容
---

# WAVE 情報

`GameSeed`から各WAVEの候補を計算できます。実際のイベント、潮位、ブキ、スペシャルを先読みするには、ステージや難易度のほか、ゲームが使ったシーンの値と実行時設定も照合します。

## ブキとスペシャル {#weapons-specials}

プライベートバイトではスペシャルを内部プレイヤー番号へ割り当て、その後に支給ブキの表を作る処理があります。[ブキのID](/ids/weapon-id.html)と[スペシャルのID](/ids/special-id.html)は別表にまとめています。

次は`JobType` 1の計算です。スペシャル候補とブキプールはゲーム内で使われる順に渡します。ブキ候補の配列は指定された開始位置から有効件数分を読み、末尾に達したら先頭へ戻ります。その順の値を`main_ids`、`current_main`、`source_main`に渡します。コードの`effective_internal_value`は[InternalValue](/internal-value.html)を使い、シーン側に別値があればそちらを使います。候補の先頭4件から`SpecialId`を取得します。`get_u32`は上のイベント計算と同じ関数です。

高分岐では、第1候補を入力順で追加してシャッフルし、先頭から最大2件を取り出します。残りの末尾へ第2候補を追加してもう一度シャッフルし、再び先頭から最大2件を取り出した後、選んだ候補をシャッフルします。候補を逆順にしたり末尾から取り出したりすると、乱数の消費数が同じでも割当結果が変わります。

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

ブキには`draw_specials`が返した乱数状態を引き継ぎます。`remap_specials`は実行時に再配置が有効な場合だけ使います。通信上の設定値だけでは実効候補・ブキプールを確定できません。内部プレイヤー番号と参加者は、後述する通常のサーモンランの参加順と対応付けられます。

### 参加人数と割り当て

スペシャルは内部index 0～3の4件を選び、ブキは5行×4枠の表を作ります。参加人数はスペシャル再配置の成立条件に使われます。再配置フラグが有効な場合、主ブキringの対応件数が有効参加者数以上なら再配置できます。同じ主ブキIDが複数あれば、同じ`SpecialId`が複数枠へ写る場合もあります。`UnlockedSeason`はブキ候補のSeason上限に使われます。[`OnlineCoopSetting`](/packet/index.html#online-coop-setting)にはその値が含まれますが、先読みにはシーンで実際に採用された値が必要です。

`JobType=1`の装備getterは、当該WAVEのブキとスペシャルを同じ内部indexで参照します。スペシャルの再配置は配列の内容を変更し、getterが使うindexは変更しません。

通常のサーモンランでは、有効なステーションの論理順にユーザー設定をシーンへ取り込み、そのうち参加対象の順に内部プレイヤー番号を付けます。[ステーションの識別値とユーザー設定](/protocol/type.html#protocol-11)を同じ部屋の情報として照合し、全員の設定取得とシーンへの追加・採用が成功することが、この対応の条件です。ステーションの論理indexをそのまま内部プレイヤー番号には使いません。

再配置前のスペシャルを個人へ割り当てるには、再配置が無効で、後から装備が上書きされないことも必要です。再配置自体は乱数を消費しませんが、各indexの`SpecialId`は変わります。ブキの乱数状態が同じであることだけでは、スペシャルの割り当てまで一致するとは限りません。

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

### 最初のオオモノの種類

`JobType=1`で`EventId`が`0`・`5`・`6`の場合、WAVEの最初の通常出現候補は、次の条件がそろえば`SalmonId`を計算できます。参加人数は生成したイベントをWAVEへ適用する処理にも使います。

- シーンが採用した`GameSeed`、ステージ、`Difficulty`、有効参加人数を使い、`MatchMode=11`と通常のステージ初期化経路を通ります。
- イベント・潮位への実行時の強制変更や後段の上書きがなく、通常のオオモノ出現予定を使います。
- 最初のスケジューラ呼び出しが経過tick `0`で予定を処理し、それ以前の出現や共有乱数の消費がありません。
- 現存数と予約数がともに`0`で、周期的なキンシャケ選択の条件と、初期状態の種類候補判定が分かっています。

霧では周期の入力が別途必要です。その値や種類ごとの判定条件を確定できなければ、最初の種類も`Unknown`です。ここで求める値は出現候補の種類で、出現地点や実際の生成成功までは示しません。

2件目以降も続けて求めるには、処理済みの予定と共有乱数の状態に加え、実際のスケジューラ時刻、出現・予約・撃破による現存数の変化、周期判定、出現地点の選択処理を引き継ぎます。最初の種類だけを求めた状態から、後続の実際の湧きを同じ条件で確定することはできません。

## 参考資料 {#references}

- ELF
- ステージデータ
- LAN Play通信
