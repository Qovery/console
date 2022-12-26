import { render } from '__tests__/utils/setup-jest'
import { applicationFactoryMock } from '@qovery/domains/application'
import { ContainerApplicationEntity } from '@qovery/shared/interfaces'
import ContainerCard, { ContainerCardProps } from './container-card'

const mockApplication = applicationFactoryMock(1)[0]
const props: ContainerCardProps = {
  application: mockApplication as ContainerApplicationEntity,
}

describe('ContainerCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ContainerCard {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
