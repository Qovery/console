import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import ResizeObserver from '__tests__/utils/resize-observer'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { applicationFactoryMock } from '@console/domains/application'
import { MemorySizeEnum } from '@console/shared/enums'
import { IconAwesomeEnum } from '@console/shared/ui'
import PageSettingsResources, { PageSettingsResourcesProps } from './page-settings-resources'

const application = applicationFactoryMock(1)[0]

const props: PageSettingsResourcesProps = {
  loading: false,
  onSubmit: () => jest.fn(),
  handleChangeMemoryUnit: jest.fn(),
  memorySize: MemorySizeEnum.MB,
  application: application,
  displayWarningCpu: true,
}

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useFormContext: () => ({
    watch: () => jest.fn(),
    formState: () => jest.fn(),
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
        defaultValues: { cpu: [0.5], instances: [0, 1], memory: 323 },
      })
    )

    const inputs = screen.getAllByRole('slider') as HTMLSpanElement[]

    await act(() => {
      getByDisplayValue(323)
      expect(inputs[0].getAttribute('aria-valuenow')).toBe('0.5')
      expect(inputs[1].getAttribute('aria-valuenow')).toBe('0')
      expect(inputs[2].getAttribute('aria-valuenow')).toBe('1')
    })
  })

  it('should render warning box and icon for cpu', () => {
    props.displayWarningCpu = true

    const { getByTestId, getAllByRole } = render(
      wrapWithReactHookForm(<PageSettingsResources {...props} />, {
        defaultValues: { cpu: [10], instances: [0, 1], memory: 323 },
      })
    )

    const img = getAllByRole('img')[0]

    getByTestId('warning-box')
    expect(img.classList.contains(IconAwesomeEnum.TRIANGLE_EXCLAMATION)).toBe(true)
  })

  it('should render current consumption for memory with GB', () => {
    const { getByTestId } = render(wrapWithReactHookForm(<PageSettingsResources {...props} />))
    expect(getByTestId('current-consumption').textContent).toBe('Current consumption: 1 GB')
  })

  it('should render current consumption for memory with MB', () => {
    const newApp = props.application
    if (newApp) newApp.memory = 100
    props.application = newApp

    const { getByTestId } = render(wrapWithReactHookForm(<PageSettingsResources {...props} />))
    expect(getByTestId('current-consumption').textContent).toBe('Current consumption: 100 MB')
  })

  // it('should submit the form', async () => {
  //   const spy = jest.fn()
  //   props.onSubmit = spy

  //   const { getByTestId } = render(
  //     wrapWithReactHookForm(<PageSettingsResources {...props} />, {
  //       defaultValues: { cpu: [0.5], instances: [1, 1], memory: 512 },
  //     })
  //   )

  //   const button = getByTestId('submit-button')

  //   console.log(button)

  //   await waitFor(() => {
  //     button.click()
  //     // expect(button).not.toBeDisabled()
  //     expect(spy).toHaveBeenCalled()
  //   })
  // })
})
