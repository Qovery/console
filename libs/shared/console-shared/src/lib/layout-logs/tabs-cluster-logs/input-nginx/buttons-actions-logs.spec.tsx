import { render } from '__tests__/utils/setup-jest'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import MenuTimeFormat, { MenuTimeFormatProps } from './buttons-actions-logs'

describe('MenuTimeFormat', () => {
  const props: MenuTimeFormatProps = {
    setUpdateTimeContext: jest.fn(),
    updateTimeContextValue: { utc: false },
  }

  it('should render successfully', () => {
    const { baseElement } = render(<MenuTimeFormat {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
