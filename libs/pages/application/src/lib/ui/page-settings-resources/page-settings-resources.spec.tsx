import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { type ApplicationResourcesData } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsResources, { type PageSettingsResourcesProps } from './page-settings-resources'

const application = applicationFactoryMock(1)[0]

const props: PageSettingsResourcesProps = {
  loading: false,
  onSubmit: () => jest.fn(),
  service: application,
  displayWarningCpu: true,
}

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useFormContext: () => ({
    watch: () => jest.fn(),
    formState: {
      isValid: true,
    },
  }),
}))

describe('PageSettingsResources', () => {
  let defaultValues: ApplicationResourcesData

  beforeEach(() => {
    defaultValues = {
      min_running_instances: 1,
      max_running_instances: 18,
      cpu: 3,
      memory: 1024,
    }
  })

  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<PageSettingsResources {...props} />, { defaultValues })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render the form', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<PageSettingsResources {...props} />, {
        defaultValues,
      })
    )

    const submitButton = await screen.findByRole('button', { name: /save/i })
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(submitButton).toBeInTheDocument()

    screen.getByDisplayValue(1024)
    expect(screen.getByLabelText('Instances min')).toHaveValue(1)
    expect(screen.getByLabelText('Instances max')).toHaveValue(18)
  })

  it('should render warning box and icon for cpu', async () => {
    props.displayWarningCpu = true

    const { container } = renderWithProviders(
      wrapWithReactHookForm(<PageSettingsResources {...props} />, {
        defaultValues: { cpu: 10, min_running_instances: 1, max_running_instances: 1, memory: 323 },
      })
    )

    const submitButton = await screen.findByRole('button', { name: /save/i })
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(submitButton).toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })

  it('should submit the form', async () => {
    const spy = jest.fn((e) => e.preventDefault())
    props.onSubmit = spy
    props.loading = false

    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<PageSettingsResources {...props} />, {
        defaultValues,
      })
    )

    const submitButton = await screen.findByRole('button', { name: /save/i })
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(submitButton).toBeInTheDocument()

    await userEvent.click(submitButton)
    expect(submitButton).toBeEnabled()
    expect(spy).toHaveBeenCalled()
  })
})
