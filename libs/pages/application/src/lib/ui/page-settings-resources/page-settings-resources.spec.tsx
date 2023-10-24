import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { type ApplicationResourcesData } from '@qovery/shared/interfaces'
import { IconAwesomeEnum } from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsResources, { type PageSettingsResourcesProps } from './page-settings-resources'

const application = applicationFactoryMock(1)[0]

const props: PageSettingsResourcesProps = {
  loading: false,
  onSubmit: () => jest.fn(),
  application: application,
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
      instances: [1, 18],
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

    const inputs = screen.getAllByRole('slider') as HTMLSpanElement[]

    const submitButton = await screen.findByRole('button', { name: /save/i })
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(submitButton).toBeInTheDocument()

    screen.getByDisplayValue(1024)
    expect(inputs[0].getAttribute('aria-valuenow')).toBe('1')
    expect(inputs[1].getAttribute('aria-valuenow')).toBe('18')
  })

  it('should render warning box and icon for cpu', async () => {
    props.displayWarningCpu = true

    renderWithProviders(
      wrapWithReactHookForm(<PageSettingsResources {...props} />, {
        defaultValues: { cpu: 10, instances: [1, 1], memory: 323 },
      })
    )

    const submitButton = await screen.findByRole('button', { name: /save/i })
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(submitButton).toBeInTheDocument()

    const img = screen.getAllByRole('img')[0]

    screen.getByTestId('banner-box')
    expect(img.classList.contains(IconAwesomeEnum.TRIANGLE_EXCLAMATION)).toBe(true)
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
    expect(submitButton).not.toBeDisabled()
    expect(spy).toHaveBeenCalled()
  })
})
