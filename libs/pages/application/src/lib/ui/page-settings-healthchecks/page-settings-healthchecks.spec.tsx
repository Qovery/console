import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { defaultLivenessProbe, defaultReadinessProbe } from '@qovery/shared/console-shared'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import PageSettingsHealthchecks from './page-settings-healthchecks'

describe('PageSettingsHealthchecks', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(
        <PageSettingsHealthchecks
          onSubmit={jest.fn()}
          defaultTypeLiveness={ProbeTypeEnum.TCP}
          defaultTypeReadiness={ProbeTypeEnum.HTTP}
          linkResourcesSetting="/"
          isJob={false}
          loading={'loaded'}
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
