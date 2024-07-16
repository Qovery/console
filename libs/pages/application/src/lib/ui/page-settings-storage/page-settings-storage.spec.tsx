import {
  act,
  findAllByTestId,
  findByDisplayValue,
  findByText,
  fireEvent,
  render,
  waitFor,
} from '__tests__/utils/setup-jest'
import { StorageTypeEnum } from 'qovery-typescript-axios'
import { PageSettingsStorage, type PageSettingsStorageProps } from './page-settings-storage'

const props: PageSettingsStorageProps = {
  deploymentState: 'READY',
  storages: [
    { type: StorageTypeEnum.FAST_SSD, size: 20, mount_point: '/dir2', id: 'fac3863d-06b3-4540-97cc-95be6f365833' },
    { type: StorageTypeEnum.FAST_SSD, size: 5, mount_point: '/dir', id: '3282c32b-410e-4107-a908-54cbf885d5c6' },
  ],
  onAddStorage: jest.fn(),
  onRemove: jest.fn(),
  onEdit: jest.fn(),
}

describe('PageSettingsStorage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsStorage {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have two rows of fields', async () => {
    const { baseElement } = render(<PageSettingsStorage {...props} />)

    await waitFor(async () => {
      const formRows = await findAllByTestId(baseElement, 'form-row')
      expect(formRows).toHaveLength(2)
    })
  })

  it('a row should have 3 inputs 1 delete button and 1 edit', async () => {
    const { baseElement } = render(<PageSettingsStorage {...props} />)

    await waitFor(async () => {
      const formRows = await findAllByTestId(baseElement, 'form-row')
      expect(formRows[0].querySelectorAll('input')).toHaveLength(3)
      expect(formRows[0].querySelectorAll('[data-testid="remove"]')).toHaveLength(1)
      expect(formRows[0].querySelectorAll('[data-testid="edit"]')).toHaveLength(1)
    })
  })

  it('row should initialize with good values', async () => {
    const { baseElement } = render(<PageSettingsStorage {...props} />)

    await waitFor(async () => {
      const formRows = await findAllByTestId(baseElement, 'form-row')
      await findByDisplayValue(formRows[0], '20')
      await findByDisplayValue(formRows[0], '/dir2')
      // todo uncomment when select component is fixed
      // await findByDisplayValue(formRows[0], 'FAST_SSD')
    })
  })

  it('should have an add button and a click handler', async () => {
    const spy = jest.fn()
    props.onAddStorage = spy
    const { baseElement } = render(<PageSettingsStorage {...props} />)

    const button = await findByText(baseElement, 'Add Storage')

    await act(() => {
      fireEvent.click(button)
    })

    expect(spy).toHaveBeenCalled()
  })

  it('should have an edit button and a click handler', async () => {
    const spy = jest.fn()
    props.onEdit = spy
    const { baseElement } = render(<PageSettingsStorage {...props} />)

    const button = await findAllByTestId(baseElement, 'edit')

    await act(() => {
      fireEvent.click(button[0])
    })

    expect(spy).toHaveBeenCalled()
  })

  it('should call remove handler on click on remove', async () => {
    const spy = jest.fn()
    props.onRemove = spy
    const { baseElement } = render(<PageSettingsStorage {...props} />)

    const removeButton = await findAllByTestId(baseElement, 'remove')

    await act(() => {
      fireEvent.click(removeButton[0])
    })

    expect(spy).toHaveBeenCalled()
  })

  it('should have a placeholder if no storage yet', async () => {
    props.storages = []
    const { baseElement } = render(<PageSettingsStorage {...props} />)

    await findByText(baseElement, 'No storage are set')
  })
})
