import { act, render } from '__tests__/utils/setup-jest'
import MenuTimeFormat, { type MenuTimeFormatProps } from './menu-time-format'

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

  it('should updates time context to local browser time', async () => {
    const { getByText } = render(<MenuTimeFormat {...props} />)
    const localBrowserTimeButton = getByText('Local browser time')
    await act(() => {
      localBrowserTimeButton.click()
      expect(props.setUpdateTimeContext).toHaveBeenCalledWith({ utc: false })
    })
  })

  it('should updates time context to UTC', async () => {
    const { getByText } = render(<MenuTimeFormat {...props} />)
    const utcButton = getByText('UTC')
    await act(() => {
      utcButton.click()
      expect(props.setUpdateTimeContext).toHaveBeenCalledWith({ utc: true })
    })
  })
})
