import { render } from '__tests__/utils/setup-jest'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import MenuTimeFormat, { MenuTimeFormatProps } from './menu-time-format'

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
