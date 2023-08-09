import { getByText, render } from '__tests__/utils/setup-jest'
import { containerFactoryMock } from '@qovery/shared/factories'
import { dateFullFormat, timeAgo } from '@qovery/shared/utils'
import AboutUpdate, { AboutUpdateProps } from './about-update'

const mockContainer = containerFactoryMock(1)[0]
const props: AboutUpdateProps = {
  application: mockContainer,
}

describe('AboutUpdate', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AboutUpdate {...props} />)
    expect(baseElement).toBeTruthy()
    getByText(baseElement, dateFullFormat(mockContainer.created_at))
    if (mockContainer.updated_at) getByText(baseElement, timeAgo(new Date(mockContainer.updated_at)))
  })
})
