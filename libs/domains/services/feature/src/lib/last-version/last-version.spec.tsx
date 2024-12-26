import { containerFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders } from '@qovery/shared/util-tests'
import LastVersion from './last-version'

const mockContainer = containerFactoryMock(1)[0]

describe('LastVersion', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(
      <LastVersion organizationId="1" projectId="2" service={mockContainer} version="1.0" />
    )
    expect(baseElement).toMatchSnapshot()
  })
})
