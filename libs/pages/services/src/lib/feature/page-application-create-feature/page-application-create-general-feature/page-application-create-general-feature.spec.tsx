import { render } from '__tests__/utils/setup-jest'
import { ApplicationContainerCreateContext } from 'libs/pages/services/src/lib/feature/page-application-create-feature/page-application-create-feature'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import PageApplicationCreateGeneralFeature from './page-application-create-general-feature'

describe('PageApplicationCreateGeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ApplicationContainerCreateContext.Provider
        value={{
          currentStep: 1,
          setCurrentStep: jest.fn(),
          generalData: { name: 'test', serviceType: ServiceTypeEnum.APPLICATION },
          setGeneralData: jest.fn(),
          resourcesData: undefined,
          setResourcesData: jest.fn(),
          portData: undefined,
          setPortData: jest.fn(),
        }}
      >
        <PageApplicationCreateGeneralFeature />
      </ApplicationContainerCreateContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })
})
