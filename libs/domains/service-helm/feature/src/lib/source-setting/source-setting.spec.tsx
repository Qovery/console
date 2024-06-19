import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { HelmChartsSetting, SourceSetting } from './source-setting'

jest.mock('../hooks/use-helm-repositories/use-helm-repositories', () => {
  return {
    ...jest.requireActual('../hooks/use-helm-repositories/use-helm-repositories'),
    useHelmRepositories: () => ({
      data: [
        {
          id: '000',
          created_at: '2024-01-10T15:40:58.844307Z',
          updated_at: '2024-01-10T15:40:58.844309Z',
          kind: 'HTTPS',
          name: 'datadog',
          description: '',
          url: 'https://datadog.com',
          skip_tls_verification: false,
        },
      ],
      isLoading: false,
    }),
  }
})

jest.mock('../hooks/use-helm-charts/use-helm-charts', () => {
  return {
    ...jest.requireActual('../hooks/use-helm-charts/use-helm-charts'),
    useHelmCharts: () => ({
      data: [
        {
          chart_name: 'datadog',
          versions: ['3.66.0', '3.65.3'],
        },
      ],
      isLoading: false,
      isFetched: true,
    }),
  }
})

describe('SourceSetting', () => {
  it('should match snapshot', async () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<SourceSetting />, {
        defaultValues: {
          source_provider: 'HELM_REPOSITORY',
          repository: '000',
        },
      })
    )

    expect(baseElement).toMatchSnapshot()
  })

  it('should match snapshot helm chart settings with HTTPS kind', async () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<HelmChartsSetting organizationId="0" helmRepositoryId="000" kind="HTTPS" />, {
        defaultValues: {
          chart_name: 'datadog',
          chart_version: '3.66.0',
        },
      })
    )

    expect(baseElement).toMatchSnapshot()
  })

  it('should match snapshot helm chart settings with OCI kind', async () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<HelmChartsSetting organizationId="0" helmRepositoryId="000" kind="OCI_DOCKER_HUB" />, {
        defaultValues: {
          chart_name: 'datadog',
          chart_version: '3.66.0',
        },
      })
    )

    expect(baseElement).toMatchSnapshot()
  })
})
