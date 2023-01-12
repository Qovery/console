import ResizeObserver from '__tests__/utils/resize-observer'
import { act, render, screen, waitFor } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { databaseFactoryMock } from '@qovery/shared/factories'
import PageSettingsResources, { PageSettingsResourcesProps } from './page-settings-resources'

const database = databaseFactoryMock(1)[0]

const props: PageSettingsResourcesProps = {
  onSubmit: () => jest.fn(),
  loading: false,
  database: database,
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

  it('should render successfully', async () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageSettingsResources {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form', async () => {
    const { getByDisplayValue } = render(
      wrapWithReactHookForm(<PageSettingsResources {...props} />, {
        defaultValues: { cpu: [0.25], storage: 512, memory: 1024 },
      })
    )

    const inputs = screen.getAllByRole('slider') as HTMLSpanElement[]

    await act(() => {
      getByDisplayValue(512)
      getByDisplayValue(1024)
      expect(inputs[0].getAttribute('aria-valuenow')).toBe('0.25')
    })
  })

  it('should submit the form', async () => {
    const spy = jest.fn((e) => e.preventDefault())
    props.onSubmit = spy
    props.loading = false

    render(
      wrapWithReactHookForm(<PageSettingsResources {...props} />, {
        defaultValues: { cpu: [0.25], storage: 512, memory: 512 },
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
