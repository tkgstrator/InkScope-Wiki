---
title: Protocol
description: LAN Playの部屋探索とPiaプロトコル
---

<script setup lang="ts">
import PacketHexExample from '../components/PacketHexExample.vue'
</script>

# Protocol

プライベートバイトでは、クライアントはLAN Playで部屋を見つけ、ホストに参加します。

部屋を作る側を**ホスト**、部屋に入る側を**クライアント**と呼びます。両者は部屋を見つけた後、Piaという通信ライブラリでデータをやり取りします。

ここではSplatoon 3のLAN Playを扱います。通常のインターネット通信とは区別します。クライアントが部屋を探すtype 0パケットを`BrowseRequest`、ホストが返すtype 1の部屋情報を`BrowseReply`と呼びます。

## Protocol ID {#protocol-ids}

Pia 6.32.3の`Protocol` IDです。

|   ID | 名前                                                        |
| ---: | ----------------------------------------------------------- |
|  `0` | 空のPiaチャンク（本文0）                                    |
|  `1` | [`NetProtocol`](#net-protocol)                              |
|  `2` | `TurnProtocol`                                              |
|  `3` | [`RttProtocol`](#rtt-protocol)                              |
|  `4` | `SyncProtocol`                                              |
|  `5` | [`UnreliableProtocol`](/packet/index.html#state-layout)     |
|  `6` | Clone Protocol                                              |
|  `7` | `EventProtocol`                                             |
|  `8` | [`BroadcastEventProtocol`](/packet/index.html#event-layout) |
|  `9` | `ClockProtocol`                                             |
| `10` | `ReliableProtocol`                                          |
| `11` | [`BroadcastReliableProtocol`](#broadcast-reliable-protocol) |
| `12` | `StreamBroadcastReliableProtocol`                           |
| `13` | [`SessionProtocol`](#session-protocol)                      |
| `14` | `NatTraversalResultProtocol`                                |
| `15` | `MonitoringDataProtocol`                                    |
| `16` | WAN NAT Traversal Protocol                                  |
| `17` | Reckoning 1D Protocol                                       |
| `18` | Reckoning 3D Protocol                                       |

本文の構造を確認したIDは`1, 3, 5, 8, 11, 13`です。

一覧の名前はPia側の`Protocol`登録名です。`BrowseRequest`と`BrowseReply`は部屋探索用のUDP 35000通信で、このID表には含めません。本文の構造を確認したIDと、意味を特定したフィールドは次のように分かれます。

| `Protocol` ID | 確認した本文 | 読めた値 | 残る`Unknown` |
| --: | --- | --- | --- |
| `1` | 接続開始、参加者情報、応答などの`Net`種別 | `Sequence`、`Generation`と応答の対応 | 参加成立の最終条件、各種別の未解読欄 |
| `3` | 往復時刻の要求`Type=0`と応答`Type=1` | `OriginTick`を使うRTT計算 | 通信遅延とゲーム内動作の関係 |
| `5` | `1104`、`1107`、`1108`、`200000`、`210000`の状態フレーム | WAVE進行、ノルマ、17ビット三軸、配列AのWAVE納品数・配列Bの累計納品数 | 三軸のシーン上の意味、未解読欄、別形式のフレーム |
| `8` | 型付きイベントと、別形式の190バイト本文 | 型IDと一部のイベント本文のビット配置 | 未同定の型ID、別形式の内容、個人の得点や撃破数 |
| `11` | 設定更新と、それ以外の可変長本文 | `PrivateSetting`の`StageResource`と難易度 | シナリオ有効時の`RandomSeedAry`値、設定以外の本文と結果データとの接続 |
| `13` | `Session 0/2/5/6` | 参加者・ステーション情報と応答値 | 試合終了やクリアを示す独立した条件 |

`0`は本文のないPiaチャンクです。残りのIDは登録名まで確認していますが、本文の構造は`Unknown`です。`Session 6`は試合前にも試合後にもあるため、それだけでクリアを示す値とは扱いません。

## `LanBrowseProcessJob` {#discovery}

以下は`BrowseRequest`と`BrowseReply`のUDP 35000ペイロードです。Hex Viewのビット位置は表示中のバイト列の先頭から数えます。

### `BrowseRequest` {#browse-request}

クライアントは`BrowseRequest`を送って部屋を探します。

<PacketHexExample kind="browseRequest" />

### `BrowseReply` {#browse-reply}

ホストは`BrowseReply`で部屋情報と接続に必要な情報を平文で返します。

<PacketHexExample kind="browseReply" />

その後、接続と参加者情報を交換します。通信上の応答だけから、画面上で参加が完了したとは判断できません。最終的な参加成立条件には未確認の部分があります。

## `NetProtocol` {#net-protocol}

`Net 0x32`で接続を始め、ホストの`Net 0x11`が参加者の一時IDと接続先を伝えます。`Net 0x33`には`Reason`と`Detail`が入ります。`Net 0x12`は`Net 0x11`の`Sequence`を返し、`Net 0x51`は`Net 0x50`の`Generation`を返します。

<PacketHexExample kind="net" />

## `RttProtocol` {#rtt-protocol}

ホストとクライアントは`Type` `0`の要求を送り、`Type` `1`の応答が返す`OriginTick`と受信時のtickとの差からRTT（ミリ秒）を計算します。`ElapsedMicroseconds`は送信側の経過時間です。`DestinationVariableId`は要求で`0`、応答で返答先のIDとなり、`ProtocolStationVariableId`はプロトコルが保持するステーションの一時IDです。

<PacketHexExample kind="rtt" />

## `BroadcastReliableProtocol` {#broadcast-reliable-protocol}

`Flags`の`0x00`では10枠の制御データ、`0x07`では可変長データを確認しています。`Sequence`と`Acknowledgment`は双方向の進行値です。試合中や終了後に届く未分類の本文もあり、すべてを`PrivateSetting`として解釈することはできません。

<PacketHexExample kind="broadcastReliable" />

### `PrivateSetting` {#private-setting}

[Type](/protocol/type.html#protocol-11)に、設定で確認した型を載せています。

待機中にホストが変えた設定は、`PrivateSetting`としてクライアントへ届きます。`CommonPrivateSettingNetState`はステージの識別名、`CoopPrivateSettingNetState`はキケン度に対応する値を運びます。これらは単独でも、一つの更新にまとめても送れます。ステージの`Cop_*`名と資料上のIDの対応は[内部ID](/ids/index.html)にまとめています。設定値`q`と画面のキケン度には`(q - 1) / 5`％という関係が推定されますが、全域での対応は`Unknown`です。

<PacketHexExample kind="privateSetting" />

`PrivateSetting`には選択シナリオの`RandomSeedAry`を運ぶ形式もあります。これは開始前に届く`OnlineCoopSetting`の`GameSeed`とは別の欄です。詳しくは[Splatoon 3の`GameSeed`](/prng/game-seed/sp3.html)で説明します。

## `SessionProtocol` {#session-protocol}

`Session 0`がクライアントのID・接続先・名前を、ホストの`Session 2`がステーション情報、`Session 5`が参加者情報を運びます。`Session 6`は`Sequence`と`Acknowledgment`を返します。

<PacketHexExample kind="session" />

## 参考資料 {#references}

- [Pia Protocols](https://github.com/kinnay/NintendoClients/wiki/Pia-Protocols)
- ELF
- LAN Play通信
