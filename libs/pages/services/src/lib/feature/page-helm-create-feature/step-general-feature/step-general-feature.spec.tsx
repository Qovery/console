import { renderWithProviders } from '@qovery/shared/util-tests'
import { HelmCreateContext } from '../page-helm-create-feature'
import StepGeneralFeature from './step-general-feature'

describe('PageApplicationCreateGeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <HelmCreateContext.Provider
        value={{
          currentStep: 1,
          setCurrentStep: jest.fn(),
          generalForm: {
            name: 'my-helm-app',
            description: 'hello',
            auto_preview: true,
            timeout_sec: 60,
            arguments: ['--wait'],
            source_provider: 'HELM_REPOSITORY',
            repository: 'https://charts.bitnami.com/bitnami',
            chart_name: 'nginx',
            chart_version: '8.9.0',
          },
        }}
      >
        <StepGeneralFeature />
      </HelmCreateContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })
})
