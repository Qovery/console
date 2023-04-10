import { render } from '__tests__/utils/setup-jest'
import MenuTimeFormat, { MenuTimeFormatProps } from './menu-time-format'

describe('MenuTimeFormat', () => {
  const props: MenuTimeFormatProps = {
    setUpdateTimeContext: jest.fn(),
    updateTimeContextValue: { utc: false },
  }

  it('should render successfully', () => {
    const { getByText, baseElement } = render(<MenuTimeFormat {...props} />)
    expect(baseElement).toBeTruthy()
    expect(getByText('Local browser time')).toBeInTheDocument()
    expect(getByText('UTC')).toBeInTheDocument()
  })

  it('should updates time context to local browser time', () => {
    const { getByText } = render(<MenuTimeFormat {...props} />)
    const localBrowserTimeButton = getByText('Local browser time')
    localBrowserTimeButton.click()
    expect(props.setUpdateTimeContext).toHaveBeenCalledWith({ utc: false })
  })

  it('should updates time context to UTC', () => {
    const { getByText } = render(<MenuTimeFormat {...props} />)
    const utcButton = getByText('UTC')
    utcButton.click()
    expect(props.setUpdateTimeContext).toHaveBeenCalledWith({ utc: true })
  })
})
