import { act } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { defaultLivenessProbe, defaultReadinessProbe } from '@qovery/shared/console-shared'
import { ProbeTypeEnum, ProbeTypeWithNoneEnum } from '@qovery/shared/enums'
import StepHealthchecks, { StepHealthchecksProps } from './step-healthchecks'

const props: StepHealthchecksProps = {
  onBack: jest.fn(),
  onSubmit: jest.fn(),
  defaultTypeReadiness: ProbeTypeEnum.TCP,
  defaultTypeLiveness: ProbeTypeWithNoneEnum.NONE,
  ports: [
    {
      application_port: 3000,
      external_port: 3000,
      is_public: false,
    },
    {
      application_port: 4000,
      external_port: 3000,
      is_public: true,
    },
  ],
}

describe('StepHealthchecks', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<StepHealthchecks {...props} />, {
        defaultValues: {
          ports: [
            {
              application_port: 3000,
              external_port: 3000,
              is_public: false,
            },
            {
              application_port: 4000,
              external_port: 3000,
              is_public: true,
            },
          ],
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form on click', async () => {
    const { getByTestId } = render(
      wrapWithReactHookForm(<StepHealthchecks {...props} />, {
        defaultValues: {
          readiness_probe: {
            ...{
              current_type: ProbeTypeEnum.TCP,
              type: {
                tcp: {
                  port: 80,
                },
              },
            },
            ...defaultReadinessProbe,
          },
          liveness_probe: {
            ...{
              current_type: ProbeTypeWithNoneEnum.NONE,
              type: {
                none: null,
              },
            },
            ...defaultLivenessProbe,
          },
          ports: [
            {
              application_port: 3000,
              external_port: 3000,
              is_public: false,
            },
            {
              application_port: 4000,
              external_port: 3000,
              is_public: true,
            },
          ],
        },
      })
    )

    const button = getByTestId('button-submit')
    // wait one cycle that the button becomes enabled
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await act(() => {})

    await act(() => {
      button.click()
    })

    expect(button).not.toBeDisabled()
    expect(props.onSubmit).toHaveBeenCalled()
  })
})
