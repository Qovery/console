import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { MyHistoryProvider, useMyHistory } from './use-my-history'

describe('MyHistoryProvider', () => {
  it('should provide myHistory and push function', async () => {
    const TestComponent = () => {
      const { myHistory, push } = useMyHistory()
      return (
        <div>
          <span>{myHistory.length}</span>
          <button onClick={() => push({ pathname: '/test' })}>Push</button>
        </div>
      )
    }

    const { userEvent, getByRole } = renderWithProviders(
      <MyHistoryProvider>
        <TestComponent />
      </MyHistoryProvider>
    )

    expect(screen.getByText('0')).toBeInTheDocument()
    await userEvent.click(getByRole('button'))

    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
