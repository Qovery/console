import { webflow } from './webflow-data-access'

const changelogs = [
  {
    name: 'Qovery changelog',
    summary: 'A release note.',
    url: 'https://www.qovery.com/changelog/release-note',
    firstPublishedAt: '2026-03-19T00:00:00.000Z',
  },
]

describe('webflow data access', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.resetAllMocks()
  })

  it('requests changelogs from the generated static asset', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(changelogs),
    }) as typeof fetch

    const result = await webflow.changelogs.queryFn({
      queryKey: webflow.changelogs.queryKey,
      meta: undefined,
      signal: new AbortController().signal,
      client: {} as never,
    } as never)

    expect(result).toEqual(changelogs)
    expect(global.fetch).toHaveBeenCalledWith(
      '/changelog/latest.json',
      expect.objectContaining({
        headers: {
          Accept: 'application/json',
        },
      })
    )
  })
})
