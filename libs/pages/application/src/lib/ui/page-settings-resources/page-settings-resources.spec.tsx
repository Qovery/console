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
    watch: (name: string) => {
      if (name === 'autoscaling_mode') return 'HPA'
      if (name === 'hpa_metric_type') return 'CPU'
      return undefined
    },
    setValue: jest.fn(),
    formState: {
      isValid: true,
    },
  }),
}))

// Helper function to normalize react-select dynamic IDs in snapshots
function normalizeReactSelectIds(container: HTMLElement) {
  // Replace dynamic react-select IDs with stable ones
  const elements = container.querySelectorAll('[id^="react-select-"]')
  elements.forEach((el: Element) => {
    const id = el.getAttribute('id')
    if (id && id.match(/^react-select-\d+-/)) {
      el.setAttribute('id', id.replace(/react-select-\d+-/, 'react-select-X-'))
    }
  })

  // Replace dynamic aria-labelledby
  const ariaElements = container.querySelectorAll('[aria-labelledby^="react-select-"]')
  ariaElements.forEach((el: Element) => {
    const ariaLabelledby = el.getAttribute('aria-labelledby')
    if (ariaLabelledby && ariaLabelledby.match(/^react-select-\d+-/)) {
      el.setAttribute('aria-labelledby', ariaLabelledby.replace(/react-select-\d+-/, 'react-select-X-'))
    }
  })
}

describe('PageSettingsResources', () => {
  let defaultValues: ApplicationResourcesData

  beforeEach(() => {
    defaultValues = {
      min_running_instances: 1,
      max_running_instances: 18,
      cpu: 3,
      memory: 1024,
      gpu: 0,
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
    expect(submitButton).toBeInTheDocument()

    // Normalize react-select IDs before snapshot
    normalizeReactSelectIds(container)

    // Verify warning box is displayed
    expect(container).toMatchSnapshot()
    expect(screen.getByTestId('banner-box')).toBeInTheDocument()
    expect(screen.getByText(/not enough resources/i)).toBeInTheDocument()
    expect(screen.getByText(/increase the capacity of your cluster nodes/i)).toBeInTheDocument()
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
