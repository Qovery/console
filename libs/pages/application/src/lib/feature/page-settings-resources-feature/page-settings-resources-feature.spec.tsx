import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type Application } from '@qovery/domains/services/data-access'
import { applicationFactoryMock, environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { SettingsResourcesFeature, type SettingsResourcesFeatureProps } from './page-settings-resources-feature'

const mockApplication = applicationFactoryMock(1)[0] as Application
const mockEnvironment = environmentFactoryMock(1)[0]
const mockEditService = jest.fn()

jest.mock('@qovery/domains/services/feature', () => {
  return {
    useEditService: () => ({
      mutate: mockEditService,
      isLoading: false,
    }),
  }
})

jest.mock('@qovery/domains/services/feature', () => {
  return {
    ...jest.requireActual('@qovery/domains/services/feature'),
    useRunningStatus: () => ({
      data: {
        state: 'STARTING',
      },
    }),
  }
})

const props: SettingsResourcesFeatureProps = {
  service: mockApplication,
  environment: mockEnvironment,
}

describe('SettingsResourcesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<SettingsResourcesFeature {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should edit an APPLICATION', async () => {
    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<SettingsResourcesFeature {...props} />))

    const inputCPU = screen.getByLabelText('vCPU (milli)')
    await userEvent.clear(inputCPU)
    await userEvent.type(inputCPU, '1000')

    const inputMemory = screen.getByLabelText('Memory (MiB)')
    await userEvent.clear(inputMemory)
    await userEvent.type(inputMemory, '2048')

    const submitButton = screen.getByRole('button', { name: /save/i })
    await userEvent.click(submitButton)

    waitFor(() => {
      expect(mockEditService.mock.calls[0][0].payload.cpu).toEqual(1000)
      expect(mockEditService.mock.calls[0][0].payload.memory).toEqual(2048)
    })
  })
})
