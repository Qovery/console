import ResizeObserver from '__tests__/utils/resize-observer'
import { act, render, screen, waitFor } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { ApplicationResourcesData } from '@qovery/shared/interfaces'
import { IconAwesomeEnum } from '@qovery/shared/ui'
import PageSettingsResources, { PageSettingsResourcesProps } from './page-settings-resources'

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
  window.ResizeObserver = ResizeObserver
  let defaultValues: ApplicationResourcesData

  beforeEach(() => {
    defaultValues = {
      instances: [1, 18],
      cpu: [3],
      memory: 1024,
    }
  })

  it('should render successfully', async () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageSettingsResources {...props} />, { defaultValues }))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form', async () => {
    const { getByDisplayValue } = render(
      wrapWithReactHookForm(<PageSettingsResources {...props} />, {
        defaultValues,
      })
    )

    const inputs = screen.getAllByRole('slider') as HTMLSpanElement[]

    await act(() => {
      getByDisplayValue(1024)
      expect(inputs[0].getAttribute('aria-valuenow')).toBe('3')
      expect(inputs[1].getAttribute('aria-valuenow')).toBe('1')
      expect(inputs[2].getAttribute('aria-valuenow')).toBe('18')
    })
  })

  it('should render warning box and icon for cpu', () => {
    props.displayWarningCpu = true

    const { getByTestId, getAllByRole } = render(
      wrapWithReactHookForm(<PageSettingsResources {...props} />, {
        defaultValues: { cpu: [10], instances: [1, 1], memory: 323 },
      })
    )

    const img = getAllByRole('img')[0]

    getByTestId('warning-box')
    expect(img.classList.contains(IconAwesomeEnum.TRIANGLE_EXCLAMATION)).toBe(true)
  })

  it('should submit the form', async () => {
    const spy = jest.fn((e) => e.preventDefault())
    props.onSubmit = spy
    props.loading = false

    render(
      wrapWithReactHookForm(<PageSettingsResources {...props} />, {
        defaultValues,
      })
    )

    const button = screen.getByTestId('submit-button')

    await waitFor(() => {
      button.click()
      expect(button).not.toBeDisabled()
      expect(spy).toHaveBeenCalled()
    })
  })
})
