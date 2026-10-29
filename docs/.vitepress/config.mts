import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { tokenizeWikiSearch } from './search'

export default withMermaid(defineConfig({
  lang: 'ja-JP',
  title: 'サーモンラン解析Wiki',
  description: 'Splatoon 2とSplatoon 3のWAVEとLAN Play通信から分かったこと',
  cleanUrls: false,
  lastUpdated: false,
  appearance: true,
  vite: {
    optimizeDeps: {
      include: ['fastdom', 'fastdom/extensions/fastdom-promised.js'],
    },
  },
  themeConfig: {
    siteTitle: 'サーモンラン解析Wiki',
    nav: [],
    darkModeSwitchLabel: '表示モード',
    lightModeSwitchTitle: 'ライトモードに切り替える',
    darkModeSwitchTitle: 'ダークモードに切り替える',
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '検索',
                buttonAriaLabel: 'サイト内を検索',
              },
              modal: {
                displayDetails: '詳細を表示',
                resetButtonTitle: '検索を消去',
                backButtonTitle: '検索を閉じる',
                noResultsText: '見つかりません',
                footer: {
                  selectText: '選択',
                  selectKeyAriaLabel: 'Enter',
                  navigateText: '移動',
                  navigateUpKeyAriaLabel: '上矢印',
                  navigateDownKeyAriaLabel: '下矢印',
                  closeText: '閉じる',
                  closeKeyAriaLabel: 'Esc',
                },
              },
            },
          },
        },
        miniSearch: {
          options: { tokenize: tokenizeWikiSearch },
          searchOptions: { combineWith: 'AND', fuzzy: false, prefix: true },
        },
      },
    },
    sidebar: [
      {
        text: 'PRNG',
        link: '/prng/index.html',
        items: [
          {
            text: 'GameSeed',
            link: '/prng/game-seed/index.html',
            items: [
              { text: 'Splatoon 2', link: '/prng/game-seed/sp2.html' },
              { text: 'Splatoon 3', link: '/prng/game-seed/sp3.html' },
            ],
          },
          {
            text: 'WaveSeed',
            link: '/prng/wave-seed/index.html',
            items: [
              { text: 'Splatoon 2', link: '/prng/wave-seed/sp2.html' },
              { text: 'Splatoon 3', link: '/prng/wave-seed/sp3.html' },
            ],
          },
          {
            text: 'SceneSeed',
            link: '/prng/scene-seed/index.html',
            items: [
              { text: 'Splatoon 2', link: '/prng/scene-seed/sp2.html' },
              { text: 'Splatoon 3', link: '/prng/scene-seed/sp3.html' },
            ],
          },
        ],
      },
      {
        text: 'WAVE 情報',
        link: '/wave/index.html',
        items: [
          { text: 'イベントと潮位', link: '/wave/index.html#event-tide' },
          { text: 'イベントと潮位の条件', link: '/wave/event-tide-conditions.html' },
          { text: 'ブキとスペシャル', link: '/wave/index.html#weapons-specials' },
          { text: 'オオモノシャケと湧き方向', link: '/wave/index.html#boss-spawns' },
        ],
      },
      { text: 'InternalValue', link: '/internal-value.html' },
      {
        text: 'ステージ情報',
        link: '/stage/index.html',
        items: [
          { text: 'Regular', link: '/stage/index.html#regular-stages' },
          { text: 'Big Run', link: '/stage/index.html#big-run-stages' },
        ],
      },
      {
        text: '内部ID',
        link: '/ids/index.html',
        items: [
          { text: 'StageId', link: '/ids/index.html#stages' },
          { text: 'EventId/WaterLevel', link: '/ids/index.html#events-and-tides' },
          { text: 'JobType', link: '/ids/index.html#job-types' },
          { text: 'Difficulty', link: '/ids/index.html#difficulty' },
          { text: 'WeaponId', link: '/ids/weapon-id.html' },
          { text: 'SpecialId', link: '/ids/special-id.html' },
          { text: 'SalmonId', link: '/ids/salmon-id.html' },
        ],
      },
      {
        text: 'Packet',
        link: '/packet/index.html',
        items: [
          { text: 'パケット構造', link: '/packet/index.html#packet-layout' },
        ],
      },
      {
        text: 'Protocol',
        link: '/protocol/index.html',
        items: [
          { text: 'Protocol ID', link: '/protocol/index.html#protocol-ids' },
          { text: 'Type', link: '/protocol/type.html' },
          {
            text: 'LanBrowseProcessJob',
            link: '/protocol/index.html#discovery',
            items: [
              { text: 'BrowseRequest', link: '/protocol/index.html#browse-request' },
              { text: 'BrowseReply', link: '/protocol/index.html#browse-reply' },
            ],
          },
          { text: 'Key', link: '/protocol/key.html' },
          { text: 'NetProtocol', link: '/protocol/index.html#net-protocol' },
          { text: 'RttProtocol', link: '/protocol/index.html#rtt-protocol' },
          {
            text: 'UnreliableProtocol',
            link: '/packet/index.html#state-layout',
            items: [
              { text: 'CoopSequenceNetState', link: '/packet/index.html#wave-state' },
              { text: 'CoopSeqPlayerNetState', link: '/packet/index.html#players' },
              { text: 'PlayerNetState', link: '/packet/index.html#player-net-state' },
            ],
          },
          {
            text: 'BroadcastEventProtocol',
            link: '/packet/index.html#event-layout',
            items: [
              { text: 'OnlineCoopSetting', link: '/packet/index.html#online-coop-setting' },
              { text: 'CoopEnemySpawnNetEvent', link: '/packet/index.html#enemy-spawn-event' },
              { text: 'CoopEnemyStateEvent', link: '/packet/index.html#enemy-state-event' },
              { text: 'AttackEvent', link: '/packet/index.html#attack-event' },
              { text: 'ColPaintEvent', link: '/packet/index.html#col-paint-event' },
              { text: 'ObjPaintEvent', link: '/packet/index.html#obj-paint-event' },
              { text: 'CoopItemSpawnEvent', link: '/packet/index.html#item-spawn-event' },
              { text: 'CoopItemResponseGetByPlayerEvent', link: '/packet/index.html#player-get-event' },
              { text: 'CoopItemResponseGetByEnemyEvent', link: '/packet/index.html#enemy-get-event' },
              { text: 'CoopItemGoldenIkuraShotEvent', link: '/packet/index.html#golden-ikura-shot-event' },
              { text: 'CoopItemGoldenIkuraDirectBankEvent', link: '/packet/index.html#golden-ikura-direct-bank-event' },
              { text: 'CoopSeqPlayerGoldenIkuraAssistEvent', link: '/packet/index.html#golden-ikura-assist-event' },
              { text: 'PlayerNetEvent::CoopRescued', link: '/packet/index.html#coop-rescued-event' },
              { text: 'PlayerNetEvent::TroubleDie', link: '/packet/index.html#trouble-die-event' },
              { text: 'PlayerNetEvent::Revival', link: '/packet/index.html#revival-event' },
            ],
          },
          {
            text: 'BroadcastReliableProtocol',
            link: '/protocol/index.html#broadcast-reliable-protocol',
            items: [
              { text: 'PrivateSetting', link: '/protocol/index.html#private-setting' },
              { text: 'StationInfo', link: '/packet/index.html#station-info' },
              { text: 'VersusUserSettingNetState', link: '/packet/versus-user-setting.html' },
            ],
          },
          { text: 'SessionProtocol', link: '/protocol/index.html#session-protocol' },
        ],
      },
    ],
    outline: false,
    aside: false,
  },
}))
