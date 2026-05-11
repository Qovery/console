import { buildHelmCreatePayload, buildHelmValuesOverrideFile, splitHelmOverridePaths } from './helm-summary-utils'

describe('helm-summary-utils', () => {
  describe('splitHelmOverridePaths', () => {
    it('splits override paths on commas and semi-colons and trims blank values', () => {
      expect(splitHelmOverridePaths('values/a.yaml; values/b.yaml, ,values/c.yaml;;')).toEqual([
        'values/a.yaml',
        'values/b.yaml',
        'values/c.yaml',
      ])
    })

    it('returns an empty array when paths are missing', () => {
      expect(splitHelmOverridePaths()).toEqual([])
    })
  })

  describe('buildHelmValuesOverrideFile', () => {
    it('returns null for NONE file override type', () => {
      expect(
        buildHelmValuesOverrideFile({
          type: 'NONE',
        })
      ).toBeNull()
    })
  })

  describe('buildHelmCreatePayload', () => {
    it('builds a complete HELM create payload with file overrides and arguments', () => {
      const payload = buildHelmCreatePayload({
        generalData: {
          name: 'helm-app',
          description: 'Helm service',
          icon_uri: 'app://qovery-console/helm',
          source_provider: 'GIT',
          provider: 'GITHUB',
          branch: 'main',
          root_path: '/',
          auto_deploy: true,
          timeout_sec: '600',
          arguments: '--wait --atomic',
          allow_cluster_wide_resources: true,
          git_repository: {
            id: 'repo-1',
            name: 'Qovery/console',
            url: 'https://github.com/Qovery/console',
            default_branch: 'main',
            is_private: false,
          },
        },
        valuesOverrideFileData: {
          type: 'GIT_REPOSITORY',
          provider: 'GITHUB',
          git_token_id: 'token-1',
          branch: 'staging',
          repository: 'https://github.com/Qovery/values',
          paths: 'values/dev.yaml; values/common.yaml,values/extra.yaml',
          auto_deploy: false,
          git_repository: {
            id: 'repo-2',
            name: 'Qovery/values',
            url: 'https://github.com/Qovery/values',
            default_branch: 'main',
            is_private: true,
          },
        },
        valuesOverrideArgumentsData: {
          arguments: [
            { type: '--set', key: 'image.tag', value: 'v1' },
            { type: '--set-string', key: 'env.NODE_ENV', value: 'production' },
            { type: '--set-json', key: 'resources', value: '', json: '{"limits":{"cpu":"500m"}}' },
          ],
        },
      })

      expect(payload).toEqual({
        name: 'helm-app',
        description: 'Helm service',
        icon_uri: 'app://qovery-console/helm',
        source: {
          git_repository: {
            url: 'https://github.com/Qovery/console',
            branch: 'main',
            root_path: '/',
            git_token_id: undefined,
          },
        },
        allow_cluster_wide_resources: true,
        arguments: ['--wait', '--atomic'],
        timeout_sec: 600,
        auto_deploy: true,
        values_override: {
          set: [['image.tag', 'v1']],
          set_string: [['env.NODE_ENV', 'production']],
          set_json: [['resources', '{"limits":{"cpu":"500m"}}']],
          file: {
            git: {
              git_repository: {
                provider: 'GITHUB',
                url: 'https://github.com/Qovery/values',
                branch: 'staging',
                git_token_id: 'token-1',
              },
              paths: ['values/dev.yaml', 'values/common.yaml', 'values/extra.yaml'],
            },
          },
        },
      })
    })

    it('builds raw yaml values overrides and parses invalid timeout values to 0', () => {
      const payload = buildHelmCreatePayload({
        generalData: {
          name: 'helm-app',
          source_provider: 'HELM_REPOSITORY',
          repository: 'helm-repo-1',
          chart_name: 'nginx',
          chart_version: '1.2.3',
          timeout_sec: 'not-a-number',
          arguments: '',
          auto_deploy: false,
          allow_cluster_wide_resources: false,
        },
        valuesOverrideFileData: {
          type: 'YAML',
          content: 'replicaCount: 2',
        },
        valuesOverrideArgumentsData: {
          arguments: [],
        },
      })

      expect(payload.timeout_sec).toBe(0)
      expect(payload.values_override.file).toEqual({
        raw: {
          values: [
            {
              name: 'override',
              content: 'replicaCount: 2',
            },
          ],
        },
      })
      expect(payload.values_override.set).toEqual([])
      expect(payload.values_override.set_string).toEqual([])
      expect(payload.values_override.set_json).toEqual([])
    })
  })
})
