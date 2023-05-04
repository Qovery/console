import { render } from '__tests__/utils/setup-jest'
import { eventsFactoryMock } from '@qovery/shared/factories'
import RowEventFeature from './row-event-feature'

const mockEvent = eventsFactoryMock(1)[0]

describe('RowEventFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RowEventFeature event={mockEvent} />)
    expect(baseElement).toBeTruthy()
  })
})
