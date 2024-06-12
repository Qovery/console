import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useCreateLabelsGroup from '../hooks/use-create-labels-group/use-create-labels-group'
import * as useEditLabelsGroup from '../hooks/use-edit-labels-group/use-edit-labels-group'
import LabelCreateEditModal, { type LabelCreateEditModalProps } from './label-create-edit-modal'

const useCreateLabelsGroupMockSpy = jest.spyOn(useCreateLabelsGroup, 'useCreateLabelsGroup') as jest.Mock
const useEditLabelsGroupMockSpy = jest.spyOn(useEditLabelsGroup, 'useEditLabelsGroup') as jest.Mock

const props: LabelCreateEditModalProps = {
  organizationId: '0000-0000-0000',
  onClose: jest.fn(),
}

describe('LabelCreateEditModal', () => {
  beforeEach(() => {
    useCreateLabelsGroupMockSpy.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ id: '000' }),
    })
    useEditLabelsGroupMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
  })

  it('should match with snatpshot', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<LabelCreateEditModal {...props} />))
    expect(baseElement).toMatchSnapshot()
  })

  it('should submit the form to create a label group', async () => {
    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<LabelCreateEditModal {...props} />))

    const inputName = screen.getByLabelText('Group name')
    await userEvent.type(inputName, 'my-name')

    const inputKey = screen.getByTestId('labels.0.key')
    await userEvent.type(inputKey, 'key')

    const inputValue = screen.getByTestId('labels.0.value')
    await userEvent.type(inputValue, 'value')

    const btn = screen.getByRole('button', { name: 'Create' })
    expect(btn).toBeEnabled()

    await userEvent.click(btn)

    expect(useCreateLabelsGroupMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0000-0000-0000',
      labelsGroupRequest: {
        name: 'my-name',
        labels: [
          {
            key: 'key',
            value: 'value',
            propagate_to_cloud_provider: false,
          },
        ],
      },
    })

    expect(props.onClose).toHaveBeenCalled()
  })

  it('should submit the form to edit a labels group', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <LabelCreateEditModal
          {...props}
          isEdit
          labelsGroup={{
            id: '1111-1111-1111',
            created_at: '',
            updated_at: '',
            name: 'name',
            labels: [
              {
                key: 'key',
                value: 'value',
                propagate_to_cloud_provider: false,
              },
            ],
          }}
        />
      )
    )

    const inputName = screen.getByLabelText('Group name')
    await userEvent.clear(inputName)
    await userEvent.type(inputName, 'my-name')

    const btn = screen.getByRole('button', { name: 'Confirm' })
    expect(btn).toBeEnabled()

    await userEvent.click(btn)

    expect(useEditLabelsGroupMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0000-0000-0000',
      labelsGroupId: '1111-1111-1111',
      labelsGroupRequest: {
        name: 'my-name',
        labels: [
          {
            key: 'key',
            value: 'value',
            propagate_to_cloud_provider: false,
          },
        ],
      },
    })

    expect(props.onClose).toHaveBeenCalled()
  })
})
