import { render } from '__tests__/utils/setup-jest'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { ApplicationContainerCreateContext } from '../page-application-create-feature'
import PageApplicationInstallFeature from './page-application-install-feature'

describe('InstallApplicationFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ApplicationContainerCreateContext.Provider
        value={{
          currentStep: 1,
          setCurrentStep: jest.fn(),
          generalData: { name: 'test', applicationSource: ServiceTypeEnum.APPLICATION },
          setGeneralData: jest.fn(),
          resourcesData: {
            memory: 512,
            cpu: [0.5],
            instances: [1, 12],
          },
          setResourcesData: jest.fn(),
          setPortData: jest.fn(),
          portData: {
            ports: [
              {
                application_port: 80,
                external_port: 443,
                is_public: true,
              },
            ],
          },
        }}
      >
        <PageApplicationInstallFeature />
      </ApplicationContainerCreateContext.Provider>
    )

    expect(baseElement).toBeTruthy()
  })
})
