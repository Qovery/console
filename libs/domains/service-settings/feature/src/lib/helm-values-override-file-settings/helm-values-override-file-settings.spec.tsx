import { type ReactNode } from 'react'
import * as servicesDomain from '@qovery/domains/services/feature'
import { helmFactoryMock } from '@qovery/shared/factories'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { HelmValuesOverrideFileSettings } from './helm-values-override-file-settings'

const useServiceSpy = jest.spyOn(servicesDomain, 'useService') as jest.Mock
const useEditServiceSpy = jest.spyOn(servicesDomain, 'useEditService') as jest.Mock

const mockEditService = jest.fn()
const mockValuesOverrideFilesSetting = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'project-1',
    environmentId: 'env-1',
    serviceId: 'service-1',
  }),
}))

jest.mock('@qovery/domains/service-helm/feature', () => ({
  ...jest.requireActual('@qovery/domains/service-helm/feature'),
  ValuesOverrideFilesSetting: ({
    children,
    methods,
    onSubmit,
    watchFieldType,
  }: {
    children?: ReactNode
    methods: {
      getValues: (field?: string) => unknown
      setValue: (field: string, value: unknown) => void
    }
    onSubmit: () => void
    watchFieldType: string
  }) => {
    mockValuesOverrideFilesSetting({ children, methods, onSubmit, watchFieldType })

    return (
      <div>
        <div data-testid="watch-field-type">{watchFieldType}</div>
        <div data-testid="content-value">{String(methods.getValues('content') ?? '')}</div>
        <div data-testid="repository-value">{String(methods.getValues('repository') ?? '')}</div>
        <div data-testid="paths-value">{String(methods.getValues('paths') ?? '')}</div>
        <div data-testid="provider-value">{String(methods.getValues('provider') ?? '')}</div>
        <div data-testid="is-public-repository-value">{String(methods.getValues('is_public_repository') ?? '')}</div>
        <button type="button" onClick={() => onSubmit()}>
          Submit mocked form
        </button>
        <button type="button" onClick={() => methods.setValue('type', 'NONE')}>
          Select none
        </button>
        <button
          type="button"
          onClick={() => {
            methods.setValue('type', 'YAML')
            methods.setValue('content', 'foo: bar')
          }}
        >
          Select yaml
        </button>
        <button
          type="button"
          onClick={() => {
            methods.setValue('type', 'GIT_REPOSITORY')
            methods.setValue('provider', 'GITHUB')
            methods.setValue('repository', 'https://github.com/Qovery/console.git')
            methods.setValue('branch', 'main')
            methods.setValue('paths', 'values.yaml; extra.yaml')
            methods.setValue('is_public_repository', true)
          }}
        >
          Select public git
        </button>
        {children}
      </div>
    )
  },
}))

const makeHelmService = () => {
  const service = helmFactoryMock(1)[0]
  service.id = 'service-1'
  service.environment.id = 'env-1'

  return service
}

describe('HelmValuesOverrideFileSettings', () => {
  beforeEach(() => {
    mockEditService.mockReset()
    mockValuesOverrideFilesSetting.mockClear()
    useEditServiceSpy.mockReturnValue({
      mutate: mockEditService,
      isLoading: false,
    })
  })

  it('prefills git override values from the Helm service', () => {
    const service = makeHelmService()
    service.values_override = {
      file: {
        git: {
          git_repository: {
            url: 'https://github.com/Qovery/console',
            provider: 'GITHUB',
            owner: 'Qovery',
            name: 'console',
            branch: 'main',
            root_path: '/',
            git_token_id: 'git-token',
          },
          paths: ['values.yaml'],
        },
      },
    }

    useServiceSpy.mockReturnValue({
      data: service,
    })

    renderWithProviders(<HelmValuesOverrideFileSettings />)

    expect(screen.getByTestId('watch-field-type')).toHaveTextContent('GIT_REPOSITORY')
    expect(screen.getByTestId('repository-value')).toHaveTextContent('console')
    expect(screen.getByTestId('paths-value')).toHaveTextContent('values.yaml')
    expect(screen.getByTestId('provider-value')).toHaveTextContent('GITHUB')
  })

  it('prefills public git override values from the Helm service', () => {
    const service = makeHelmService()
    service.values_override = {
      file: {
        git: {
          git_repository: {
            url: 'https://github.com/Qovery/console.git',
            provider: 'GITHUB',
            branch: 'main',
            git_token_id: null,
          },
          paths: ['values.yaml', 'extra.yaml'],
        },
      },
    }

    useServiceSpy.mockReturnValue({
      data: service,
    })

    renderWithProviders(<HelmValuesOverrideFileSettings />)

    expect(screen.getByTestId('watch-field-type')).toHaveTextContent('GIT_REPOSITORY')
    expect(screen.getByTestId('repository-value')).toHaveTextContent('https://github.com/Qovery/console.git')
    expect(screen.getByTestId('paths-value')).toHaveTextContent('values.yaml; extra.yaml')
    expect(screen.getByTestId('provider-value')).toHaveTextContent('GITHUB')
    expect(screen.getByTestId('is-public-repository-value')).toHaveTextContent('true')
  })

  it('submits a NONE override payload', async () => {
    const service = makeHelmService()
    service.values_override = {
      file: {
        raw: {
          values: [
            {
              name: 'override',
              content: 'foo: bar',
            },
          ],
        },
      },
    }

    useServiceSpy.mockReturnValue({
      data: service,
    })

    const { userEvent } = renderWithProviders(<HelmValuesOverrideFileSettings />)

    await userEvent.click(screen.getByRole('button', { name: 'Select none' }))
    await userEvent.click(screen.getByRole('button', { name: 'Submit mocked form' }))

    expect(mockEditService).toHaveBeenCalledWith({
      serviceId: 'service-1',
      payload: buildEditServicePayload({
        service,
        request: {
          values_override: {
            ...service.values_override,
            file: undefined,
          },
        },
      }),
    })
  })

  it('submits a YAML override payload', async () => {
    const service = makeHelmService()
    useServiceSpy.mockReturnValue({
      data: service,
    })

    const { userEvent } = renderWithProviders(<HelmValuesOverrideFileSettings />)

    await userEvent.click(screen.getByRole('button', { name: 'Select yaml' }))
    await userEvent.click(screen.getByRole('button', { name: 'Submit mocked form' }))

    expect(mockEditService).toHaveBeenCalledWith({
      serviceId: 'service-1',
      payload: buildEditServicePayload({
        service,
        request: {
          values_override: {
            ...service.values_override,
            file: {
              raw: {
                values: [
                  {
                    name: 'override',
                    content: 'foo: bar',
                  },
                ],
              },
            },
          },
        },
      }),
    })
  })

  it('forces auto deploy to false for public git repositories', async () => {
    const service = makeHelmService()
    service.auto_deploy = true

    useServiceSpy.mockReturnValue({
      data: service,
    })

    const { userEvent } = renderWithProviders(<HelmValuesOverrideFileSettings />)

    await userEvent.click(screen.getByRole('button', { name: 'Select public git' }))
    await userEvent.click(screen.getByRole('button', { name: 'Submit mocked form' }))

    expect(mockEditService).toHaveBeenCalledWith({
      serviceId: 'service-1',
      payload: buildEditServicePayload({
        service: {
          ...service,
          auto_deploy: false,
        },
        request: {
          values_override: {
            ...service.values_override,
            file: {
              git: {
                git_repository: {
                  provider: 'GITHUB',
                  url: 'https://github.com/Qovery/console.git',
                  branch: 'main',
                  git_token_id: undefined,
                },
                paths: ['values.yaml', 'extra.yaml'],
              },
            },
          },
        },
      }),
    })
  })
})
