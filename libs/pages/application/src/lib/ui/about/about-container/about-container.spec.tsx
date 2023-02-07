import { getByText, render } from '@testing-library/react'
import { containerFactoryMock, containerRegistriesMock } from '@qovery/shared/factories'
import AboutContainer, { AboutContainerProps } from './about-container'

const mockContainerRegistry = containerRegistriesMock(1)[0]
const mockContainer = containerFactoryMock(1)[0]
const props: AboutContainerProps = {
  container: mockContainer,
  currentRegistry: mockContainerRegistry,
  loadingStatus: 'loaded',
  organizationId: '1',
}

describe('AboutContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AboutContainer {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render the different informations', () => {
    const { baseElement } = render(<AboutContainer {...props} />)
    getByText(baseElement, mockContainer.image_name)
    getByText(baseElement, mockContainer.tag)
    getByText(baseElement, props.currentRegistry?.name || '')
  })
})
