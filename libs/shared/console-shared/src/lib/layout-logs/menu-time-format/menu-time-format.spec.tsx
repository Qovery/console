import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import MenuTimeFormat, { type MenuTimeFormatProps } from './menu-time-format'

describe('MenuTimeFormat', () => {
  const props: MenuTimeFormatProps = {
    setUpdateTimeContext: jest.fn(),
    updateTimeContextValue: { utc: false },
  }

  it('should render successfully', async () => {
    const { userEvent } = renderWithProviders(<MenuTimeFormat {...props} />)
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Local browser time')).toBeInTheDocument()
    expect(screen.getByText('UTC')).toBeInTheDocument()
  })

  it('should updates time context to local browser time', async () => {
    const { userEvent } = renderWithProviders(<MenuTimeFormat {...props} />)
    await userEvent.click(screen.getByRole('button'))
    const localBrowserTimeButton = screen.getByText('Local browser time')
    await userEvent.click(localBrowserTimeButton)
    expect(props.setUpdateTimeContext).toHaveBeenCalledWith({ utc: false })
  })

  it('should updates time context to UTC', async () => {
    const { userEvent } = renderWithProviders(<MenuTimeFormat {...props} />)
    await userEvent.click(screen.getByRole('button'))
    const utcButton = screen.getByText('UTC')
    await userEvent.click(utcButton)
    expect(props.setUpdateTimeContext).toHaveBeenCalledWith({ utc: true })
  })
})
