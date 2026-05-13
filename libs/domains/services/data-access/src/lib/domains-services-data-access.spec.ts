import { ArgoCDApi } from 'qovery-typescript-axios'
import { services } from './domains-services-data-access'

describe('services data-access', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('argocdManifest', () => {
    it('should fetch and normalize ArgoCD managed resources', async () => {
      const getArgoCdAppManifest = jest.spyOn(ArgoCDApi.prototype, 'getArgoCdAppManifest').mockResolvedValue({
        data: {
          manifest_revision: 'main@sha256:abc123',
          manifest_metadata: {
            managed_resources: [
              {
                kind: 'Service',
                name: 'http-hello-world-staging',
                liveState: '{"kind":"Service"}',
              },
            ],
          },
        },
      } as never)

      const manifest = await services.argocdManifest('service-id').queryFn({} as never)

      expect(getArgoCdAppManifest).toHaveBeenCalledWith('service-id')
      expect(manifest).toEqual({
        manifest_revision: 'main@sha256:abc123',
        managed_resources: [
          {
            kind: 'Service',
            name: 'http-hello-world-staging',
            liveState: '{"kind":"Service"}',
          },
        ],
      })
    })

    it('should fallback to an empty resources list when the API omits managed resources', async () => {
      jest.spyOn(ArgoCDApi.prototype, 'getArgoCdAppManifest').mockResolvedValue({
        data: {
          manifest_metadata: {},
        },
      } as never)

      const manifest = await services.argocdManifest('service-id').queryFn({} as never)

      expect(manifest.managed_resources).toEqual([])
    })

    it('should normalize optional resource fields', async () => {
      jest.spyOn(ArgoCDApi.prototype, 'getArgoCdAppManifest').mockResolvedValue({
        data: {
          manifest_metadata: {
            managed_resources: [{}],
          },
        },
      } as never)

      const manifest = await services.argocdManifest('service-id').queryFn({} as never)

      expect(manifest.managed_resources).toEqual([
        {
          kind: '',
          name: '',
          liveState: '',
        },
      ])
    })
  })
})
