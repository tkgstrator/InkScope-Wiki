import { expect, test } from 'bun:test'
import MiniSearch from 'minisearch'
import config from '../docs/.vitepress/config.mts'

test('local search finds Japanese terms inside headings and prose', () => {
  const search = config.themeConfig?.search
  expect(search?.provider).toBe('local')

  if (search?.provider !== 'local') return

  const miniSearch = new MiniSearch({
    fields: ['title', 'text'],
    storeFields: ['title'],
    ...search.options?.miniSearch?.options,
    searchOptions: {
      fuzzy: 0.2,
      prefix: true,
      ...search.options?.miniSearch?.searchOptions,
    },
  })

  miniSearch.addAll([
    {
      id: 'events',
      title: 'イベントと潮位',
      text: '通常のWAVEではイベントを決定します。',
    },
    {
      id: 'seed',
      title: 'ゲームシード',
      text: '計算に使われるゲームシードを確認します。',
    },
  ])

  expect(miniSearch.search('潮位').map((result) => result.id)).toContain('events')
  expect(miniSearch.search('ゲームシード').map((result) => result.id)).toContain('seed')
  expect(miniSearch.search('計算に使われるゲームシード').map((result) => result.id)).toContain('seed')
})
