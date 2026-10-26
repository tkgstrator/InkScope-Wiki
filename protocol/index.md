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

正常参加とゲーム中の保存データで本文を確認したIDは`1, 3, 5, 8, 11, 13`です。

## `LanBrowseProcessJob` {#discovery}

以下の要求と応答は同じ探索で保存したUDP 35000ペイロードです。Hex Viewのビット位置は表示中のバイト列の先頭から数えます。

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

`Flags`の`0x00`では10枠の制御データ、`0x07`では可変長データを確認しています。`Sequence`と`Acknowledgment`は双方向の進行値です。

<PacketHexExample kind="broadcastReliable" />

### `PrivateSetting` {#private-setting}

[Type](/protocol/type.html#protocol-11)に、設定で確認した型を載せています。

待機中にホストが変えた設定は、`PrivateSetting`としてクライアントへ届きます。`CommonPrivateSettingNetState`はステージの識別名、`CoopPrivateSettingNetState`はキケン度に対応する値を運びます。保存した通信では、それぞれ単独の更新と、両方を含む更新を確認しています。ステージの`Cop_*`名と資料上のIDの対応は[内部ID](/ids/index.html)にまとめています。確認した形式では設定値`q`と画面のキケン度の関係を`(q - 1) / 5`％と推定しています。照合した範囲は主に5～200％です。それを超える値への適用は未確認です。

<PacketHexExample kind="privateSetting" />

`PrivateSetting`には選択シナリオの`RandomSeedAry`を運ぶ形式もあります。`CoopPrivateSettingNetState`を含む保存更新では、シナリオが無効で、配列の件数は0でした。開始前に届く`OnlineCoopSetting`の`GameSeed`とは区別します。詳しくは[Splatoon 3の`GameSeed`](/prng/game-seed/sp3.html)で説明します。

## `SessionProtocol` {#session-protocol}

`Session 0`がクライアントのID・接続先・名前を、ホストの`Session 2`がステーション情報、`Session 5`が参加者情報を運びます。`Session 6`は`Sequence`と`Acknowledgment`を返します。

<PacketHexExample kind="session" />

## 参考資料 {#references}

- [Pia Protocols](https://github.com/kinnay/NintendoClients/wiki/Pia-Protocols)
- ELF
- LAN Play通信
