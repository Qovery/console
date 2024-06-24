import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { defaultLivenessProbe, defaultReadinessProbe } from '@qovery/shared/console-shared'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import StepHealthchecks, { type StepHealthchecksProps } from './step-healthchecks'

const props: StepHealthchecksProps = {
  onBack: jest.fn(),
  onSubmit: jest.fn(),
  defaultTypeReadiness: ProbeTypeEnum.TCP,
  defaultTypeLiveness: ProbeTypeEnum.NONE,
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
    const { baseElement } = renderWithProviders(
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
    const { userEvent } = renderWithProviders(
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
              current_type: ProbeTypeEnum.NONE,
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

    const button = await screen.findByTestId('button-submit')
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(button).toBeInTheDocument()
    expect(button).toBeEnabled()
    await userEvent.click(button)

    expect(props.onSubmit).toHaveBeenCalled()
  })
})
