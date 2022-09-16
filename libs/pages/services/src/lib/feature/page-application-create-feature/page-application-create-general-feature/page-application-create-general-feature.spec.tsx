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
          globalData: { name: 'test', applicationSource: ServiceTypeEnum.APPLICATION },
          setGlobalData: jest.fn(),
          resourcesData: undefined,
          setResourcesData: jest.fn(),
        }}
      >
        <PageApplicationCreateGeneralFeature />
      </ApplicationContainerCreateContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })
})
