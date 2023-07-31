import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { defaultLivenessProbe, defaultReadinessProbe } from '@qovery/shared/console-shared'
import PageSettingsHealthchecks from './page-settings-healthchecks'

describe('PageSettingsHealthchecks', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(
        <PageSettingsHealthchecks
          onSubmit={jest.fn()}
          linkResourcesSetting="/"
          isJob={false}
          loading={false}
          ports={[]}
        />,
        {
          defaultValues: {
            liveness_probe: {
              ...defaultLivenessProbe,
            },
            readiness_probe: {
              ...defaultReadinessProbe,
            },
          },
        }
      )
    )
    expect(baseElement).toBeTruthy()
  })
})
