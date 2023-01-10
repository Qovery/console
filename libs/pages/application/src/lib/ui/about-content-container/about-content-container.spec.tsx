import { render } from '__tests__/utils/setup-jest'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { ContainerApplicationEntity } from '@qovery/shared/interfaces'
import AboutContentContainer, { AboutContentContainerProps } from './about-content-container'

const mockApplication = applicationFactoryMock(1)[0]
const props: AboutContentContainerProps = {
  application: mockApplication as ContainerApplicationEntity,
}

describe('AboutContentContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AboutContentContainer {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
