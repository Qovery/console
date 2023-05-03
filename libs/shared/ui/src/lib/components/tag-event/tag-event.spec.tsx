import { render } from '__tests__/utils/setup-jest'
import { OrganizationEventType } from 'qovery-typescript-axios'
import TagEvent, { TagEventProps } from './tag-event'

describe('TagEvent', () => {
  const props: TagEventProps = {
    eventType: OrganizationEventType.CREATE,
  }

  it('should render successfully', () => {
    const { baseElement } = render(<TagEvent {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
