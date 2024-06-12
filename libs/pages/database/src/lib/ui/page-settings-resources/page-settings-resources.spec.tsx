import { act, render, screen, waitFor } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { databaseFactoryMock } from '@qovery/shared/factories'
import PageSettingsResources, { type PageSettingsResourcesProps } from './page-settings-resources'

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
  it('should render successfully', async () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageSettingsResources {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form', async () => {
    const { getByDisplayValue } = render(
      wrapWithReactHookForm(<PageSettingsResources {...props} />, {
        defaultValues: { cpu: 250, storage: 512, memory: 1024 },
      })
    )

    await act(() => {
      getByDisplayValue(250)
      getByDisplayValue(512)
      getByDisplayValue(1024)
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
      expect(button).toBeEnabled()
      expect(spy).toHaveBeenCalled()
    })
  })
})
