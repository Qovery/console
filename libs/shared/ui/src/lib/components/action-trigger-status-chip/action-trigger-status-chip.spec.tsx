import { renderWithProviders } from '@qovery/shared/util-tests'
import { ActionTriggerStatusChip } from './action-trigger-status-chip'

describe('ActionTriggerStatusChip', () => {
  it('shoud match size snapshot', () => {
    const { baseElement } = renderWithProviders(<ActionTriggerStatusChip triggerAction="DEPLOY" status="DELETED" />)
    expect(baseElement).toMatchSnapshot()
  })
})
