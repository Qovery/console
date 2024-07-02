import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { ServiceBadge } from './service-badge'

describe('ServiceBadge', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<ServiceBadge size="md" icon="LIFECYCLE_JOB" type="TERRAFORM" />)
    )
    expect(baseElement).toMatchSnapshot()
  })
})
