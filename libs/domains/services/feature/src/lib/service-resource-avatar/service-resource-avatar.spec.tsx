import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { ServiceResourceAvatar } from './service-resource-avatar'

describe('ServiceResourceAvatar', () => {
  it('should match snapshot with medium size', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<ServiceResourceAvatar size="md" icon="LIFECYCLE_JOB" type="TERRAFORM" />)
    )
    expect(baseElement).toMatchSnapshot()
  })
  it('should match snapshot with small size', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<ServiceResourceAvatar size="xs" icon="LIFECYCLE_JOB" type="CLOUDFORMATION" />)
    )
    expect(baseElement).toMatchSnapshot()
  })
})
