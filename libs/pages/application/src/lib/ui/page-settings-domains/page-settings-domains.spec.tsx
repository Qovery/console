import PageSettingsDomains, { PageSettingsDomainsProps } from './page-settings-domains'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { StorageTypeEnum } from 'qovery-typescript-axios'
import {
  act,
  findAllByRole,
  findAllByTestId,
  findByDisplayValue,
  findByTestId,
  findByText,
  fireEvent,
  queryByText,
  render,
  waitFor,
} from '@testing-library/react'

const props: PageSettingsDomainsProps = {
  keys: ['123', '456'],
  onAddStorage: jest.fn(),
  onRemove: jest.fn(),
}

describe('PageSettingsDangerZone', () => {
  let initialFormValues: { [key: string]: string | number } = {}

  beforeEach(() => {
    initialFormValues = {
      size_123: 78,
      path_123: 'path_123',
      type_123: StorageTypeEnum.FAST_SSD,
      size_456: 200,
      path_456: 'path_456',
      type_456: StorageTypeEnum.FAST_SSD,
    }
    props.keys = ['123', '456']
  })

  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<PageSettingsDomains {...props} />, { defaultValues: initialFormValues })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should have two rows of fields', async () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<PageSettingsDomains {...props} />, { defaultValues: initialFormValues })
    )

    await waitFor(async () => {
      const formRows = await findAllByTestId(baseElement, 'form-row')
      expect(formRows).toHaveLength(2)
    })
  })

  it('a row should have 2 inputs 1 select and 1 delete button', async () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<PageSettingsDomains {...props} />, { defaultValues: initialFormValues })
    )

    await waitFor(async () => {
      const formRows = await findAllByTestId(baseElement, 'form-row')
      expect(formRows[0].querySelectorAll('input')).toHaveLength(2)
      expect(formRows[0].querySelectorAll('.input.input--select')).toHaveLength(1)
      expect(formRows[0].querySelectorAll('[data-testid="remove"]')).toHaveLength(1)
    })
  })

  it('row should initialize with good values', async () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<PageSettingsDomains {...props} />, { defaultValues: initialFormValues })
    )

    await waitFor(async () => {
      const formRows = await findAllByTestId(baseElement, 'form-row')
      await findByDisplayValue(formRows[0], '78')
      await findByDisplayValue(formRows[0], 'path_123')
      // todo uncomment when select component is fixed
      // await findByDisplayValue(formRows[0], 'FAST_SSD')
    })
  })

  it('size in GB should have a maximum and a minimum', async () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<PageSettingsDomains {...props} />, { defaultValues: initialFormValues })
    )

    const formRows = await findAllByTestId(baseElement, 'form-row')
    const inputs = await findAllByRole(formRows[0], 'textbox')
    await act(async () => {
      fireEvent.input(inputs[0], { target: { value: '4' } })
    })
    await findByText(formRows[0], 'The hard disk space must be between 32 and 512 GB.')

    await act(async () => {
      fireEvent.input(inputs[0], { target: { value: '32' } })
    })
    const error = await queryByText(formRows[0], 'The hard disk space must be between 32 and 512 GB.')
    expect(error).toBeNull()

    await act(async () => {
      fireEvent.input(inputs[0], { target: { value: '799' } })
    })
    await findByText(formRows[0], 'The hard disk space must be between 32 and 512 GB.')
  })

  it('should have an help section', async () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<PageSettingsDomains {...props} />, { defaultValues: initialFormValues })
    )

    await findByTestId(baseElement, 'help-section')
  })

  it('should have an add button and a click handler', async () => {
    const spy = jest.fn()
    props.onAddStorage = spy
    const { baseElement } = render(
      wrapWithReactHookForm(<PageSettingsDomains {...props} />, { defaultValues: initialFormValues })
    )

    const button = await findByText(baseElement, 'Add Storage')

    await act(() => {
      fireEvent.click(button)
    })

    expect(spy).toHaveBeenCalled()
  })

  it('should call remove handler on click on remove', async () => {
    const spy = jest.fn()
    props.onRemove = spy
    const { baseElement } = render(
      wrapWithReactHookForm(<PageSettingsDomains {...props} />, { defaultValues: initialFormValues })
    )

    const removeButton = await findAllByTestId(baseElement, 'remove')

    await act(() => {
      fireEvent.click(removeButton[0])
    })

    expect(spy).toHaveBeenCalled()
  })

  it('should have a placeholder if no storage yet', async () => {
    initialFormValues = {}
    props.keys = []
    const { baseElement } = render(
      wrapWithReactHookForm(<PageSettingsDomains {...props} />, { defaultValues: initialFormValues })
    )

    await findByText(baseElement, 'No storage are set')
  })
})
