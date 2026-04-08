import { type ReactNode } from 'react'
import * as servicesDomain from '@qovery/domains/services/feature'
import { helmFactoryMock } from '@qovery/shared/factories'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { HelmValuesOverrideArgumentsSettings } from './helm-values-override-arguments-settings'

const useServiceSpy = jest.spyOn(servicesDomain, 'useService') as jest.Mock
const useEditServiceSpy = jest.spyOn(servicesDomain, 'useEditService') as jest.Mock

const mockEditService = jest.fn()
const mockValuesOverrideArgumentsSetting = jest.fn()

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
  ValuesOverrideArgumentsSetting: ({
    children,
    methods,
    onSubmit,
  }: {
    children?: ReactNode
    methods: {
      getValues: (field?: string) => unknown
      setValue: (field: string, value: unknown) => void
    }
    onSubmit: () => void
  }) => {
    mockValuesOverrideArgumentsSetting({ children, methods, onSubmit })

    return (
      <div>
        <div data-testid="arguments-value">{JSON.stringify(methods.getValues('arguments'))}</div>
        <button type="button" onClick={() => onSubmit()}>
          Submit mocked arguments
        </button>
        <button
          type="button"
          onClick={() =>
            methods.setValue('arguments', [
              {
                key: 'replicaCount',
                type: '--set',
                value: '2',
              },
              {
                key: 'image.tag',
                type: '--set-string',
                value: '1.2.3',
              },
              {
                key: 'extraConfig',
                type: '--set-json',
                value: '{"enabled":true}',
                json: '{"enabled":true}',
              },
            ])
          }
        >
          Set mixed arguments
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

describe('HelmValuesOverrideArgumentsSettings', () => {
  beforeEach(() => {
    mockEditService.mockReset()
    mockValuesOverrideArgumentsSetting.mockClear()
    useEditServiceSpy.mockReturnValue({
      mutate: mockEditService,
      isLoading: false,
    })
  })

  it('prefills argument overrides from the Helm service', () => {
    const service = makeHelmService()
    service.values_override = {
      set: [['replicaCount', '1']],
      set_string: [['image.tag', 'latest']],
      set_json: [['extraConfig', '{"enabled":true}']],
    }

    useServiceSpy.mockReturnValue({
      data: service,
    })

    renderWithProviders(<HelmValuesOverrideArgumentsSettings />)

    expect(screen.getByTestId('arguments-value')).toHaveTextContent('"key":"replicaCount"')
    expect(screen.getByTestId('arguments-value')).toHaveTextContent('"type":"--set-string"')
    expect(screen.getByTestId('arguments-value')).toHaveTextContent('"json":"{\\"enabled\\":true}"')
  })

  it('submits mixed argument overrides while preserving file overrides', async () => {
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

    const { userEvent } = renderWithProviders(<HelmValuesOverrideArgumentsSettings />)

    await userEvent.click(screen.getByRole('button', { name: 'Set mixed arguments' }))
    await userEvent.click(screen.getByRole('button', { name: 'Submit mocked arguments' }))

    expect(mockEditService).toHaveBeenCalledWith({
      serviceId: 'service-1',
      payload: buildEditServicePayload({
        service,
        request: {
          values_override: {
            set: [['replicaCount', '2']],
            set_string: [['image.tag', '1.2.3']],
            set_json: [['extraConfig', '{"enabled":true}']],
            file: service.values_override.file,
          },
        },
      }),
    })
  })
})
