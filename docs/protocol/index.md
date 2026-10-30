---
title: Protocol
description: LAN Playの部屋探索とPiaプロトコル
---

<script setup lang="ts">
import PacketHexExample from '../components/PacketHexExample.vue'
</script>

# Protocol

ここではSplatoon 3のLAN Play通信を扱います（通常のインターネット通信とは別です）。部屋を立てるSwitchを**ホスト**、参加するSwitchを**クライアント**と呼びます。

プライベートバイトでは、クライアントがUDP 35000で部屋を探す`BrowseRequest`（type 0）を送り、ホストが部屋情報の`BrowseReply`（type 1）を返します。部屋を見つけた後は、通信ライブラリのPiaを使ってデータをやり取りします。

## Protocol ID {#protocol-ids}

Pia 6.32.3に登録されている`Protocol` IDの一覧です（UDP 35000の`BrowseRequest`・`BrowseReply`は含みません）。

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

本文の構造を確認した`Protocol` ID（`1, 3, 5, 8, 11, 13`）の概要です。その他のIDは登録名のみ確認しており、本文構造は`Unknown`です。

| `Protocol` ID | 確認した本文 | 特定した値 | 未特定の要素（`Unknown`） |
| --: | --- | --- | --- |
| `1` | 接続開始・参加者情報・応答などの`Net`種別 | `Sequence`、`Generation`と応答の対応 | 参加成立の最終条件、各種別の未解読欄 |
| `3` | 往復時刻の要求（`Type=0`）と応答（`Type=1`） | `OriginTick`によるRTT計算 | 通信遅延とゲーム内動作の関係 |
| `5` | `1104`、`1107`、`1108`、`200000`、`210000`の状態フレーム | WAVE進行、ノルマ、位置、WAVE内・累計の金イクラ納品数 | 未解読欄、別形式のフレーム |
| `8` | 型付きイベントと別形式の190バイト本文 | 型IDと主要イベント本文のビット配置 | 未同定の型ID、別形式の内容 |
| `11` | 設定更新と可変長本文 | `PrivateSetting`の`StageResource`と難易度、ユーザー設定 | シナリオ有効時の`RandomSeedAry`、結果データとの接続 |
| `13` | `Session 0/2/5/6` | 参加者・ステーション情報と応答値 | 試合終了やクリアを示す独立条件 |

`Session 6`は試合前後どちらにも現れるため、クリア判定には使えません。

## `LanBrowseProcessJob` {#discovery}

UDP 35000で送受信する`BrowseRequest`と`BrowseReply`のペイロードです。Hex Viewのビット位置は表示バイト列の先頭を起点とします。

### `BrowseRequest` {#browse-request}

クライアントが部屋を探すために送信するパケットです。

<PacketHexExample kind="browseRequest" />

### `BrowseReply` {#browse-reply}

ホストが部屋情報と接続情報を平文で返すパケットです。

<PacketHexExample kind="browseReply" />

その後、接続と参加者情報を交換します。なお、画面上で参加が完了したかどうかは通信上の応答だけでは確定しません。

## `NetProtocol` {#net-protocol}

`Net 0x32`で接続を開始し、ホストの`Net 0x11`が参加者の一時IDと接続先を通知します。`Net 0x33`には`Reason`と`Detail`が入ります。`Net 0x12`は`Net 0x11`の`Sequence`を、`Net 0x51`は`Net 0x50`の`Generation`をそれぞれ応答します。

<PacketHexExample kind="net" />

## `RttProtocol` {#rtt-protocol}

`Type=0`の要求を送り、`Type=1`の応答に含まれる`OriginTick`と受信時tickの差からRTT（ミリ秒）を計算します。`ElapsedMicroseconds`は送信側の経過時間です。`DestinationVariableId`は要求時が`0`、応答時が返答先IDとなり、`ProtocolStationVariableId`はプロトコルが保持するステーションの一時IDです。

<PacketHexExample kind="rtt" />

## `BroadcastReliableProtocol` {#broadcast-reliable-protocol}

`Flags`が`0x00`のときは10枠の制御データ、`0x07`のときは可変長データを運びます。`Sequence`と`Acknowledgment`は双方向の進行値です。試合中や終了後に届く未分類の本文もあります。

<PacketHexExample kind="broadcastReliable" />

### `PrivateSetting` {#private-setting}

待機中にホストが変更した部屋設定は`PrivateSetting`としてクライアントへ届きます（登録型の一覧は[Type](/protocol/type.html#protocol-11)を参照）。`CommonPrivateSettingNetState`はステージの`Cop_*`名（[内部ID](/ids/index.html)参照）、`CoopPrivateSettingNetState`はキケン度に対応する値を運び、単独またはまとめて送信されます。設定値`q`と画面表示のキケン度には`(q - 1) / 5`％の関係が推定されますが、全域での対応は`Unknown`です。

<PacketHexExample kind="privateSetting" />

`PrivateSetting`には選択シナリオの`RandomSeedAry`を運ぶ形式もあります。WAVE開始前に届く`OnlineCoopSetting`の`GameSeed`とは別の欄です（詳細は[Splatoon 3の`GameSeed`](/prng/game-seed/sp3.html)を参照）。

## `SessionProtocol` {#session-protocol}

クライアントの`Session 0`がID・接続先・名前を送り、ホストの`Session 2`がステーション情報、`Session 5`が参加者情報を通知します。`Session 6`は`Sequence`と`Acknowledgment`を返します。

<PacketHexExample kind="session" />

## 参考資料 {#references}

- [Pia Protocols](https://github.com/kinnay/NintendoClients/wiki/Pia-Protocols)
- ELF
- LAN Play通信
