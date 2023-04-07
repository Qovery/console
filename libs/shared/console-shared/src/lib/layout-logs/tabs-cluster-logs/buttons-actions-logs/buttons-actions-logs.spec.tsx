import { render } from '__tests__/utils/setup-jest'
import ButtonActionsLogs, { ButtonActionsLogsProps } from './buttons-actions-logs'

describe('ButtonActionsLogs', () => {
  const props: ButtonActionsLogsProps = {}

  it('should render successfully', () => {
    const { baseElement } = render(<ButtonActionsLogs {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
