import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { OrganizationAnnotationsGroupScopeEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useCreateAnnotationsGroup from '../hooks/use-create-annotations-group/use-create-annotations-group'
import * as useEditAnnotationsGroup from '../hooks/use-edit-annotations-group/use-edit-annotations-group'
import AnnotationCreateEditModal, {
  type AnnotationCreateEditModalProps,
  convertScopeEnumToObject,
  convertScopeObjectToEnum,
} from './annotation-create-edit-modal'

const useCreateAnnotationsGroupMockSpy = jest.spyOn(useCreateAnnotationsGroup, 'useCreateAnnotationsGroup') as jest.Mock
const useEditAnnotationsGroupMockSpy = jest.spyOn(useEditAnnotationsGroup, 'useEditAnnotationsGroup') as jest.Mock

const props: AnnotationCreateEditModalProps = {
  organizationId: '0000-0000-0000',
  onClose: jest.fn(),
}

describe('AnnotationCreateEditModal', () => {
  beforeEach(() => {
    useCreateAnnotationsGroupMockSpy.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ id: '000' }),
    })
    useEditAnnotationsGroupMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
  })

  it('should match with snatpshot', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<AnnotationCreateEditModal {...props} />))
    expect(baseElement).toMatchSnapshot()
  })

  it('should correctly convert array of enums to object', () => {
    const input = [OrganizationAnnotationsGroupScopeEnum.HPA, OrganizationAnnotationsGroupScopeEnum.CRON_JOBS]
    const expected = { HPA: true, CRON_JOBS: true }
    expect(convertScopeEnumToObject(input)).toMatchObject(expected)
  })

  it('should correctly convert object to array of enums', () => {
    const input = { HPA: true, CRON_JOBS: true }
    const expected = [OrganizationAnnotationsGroupScopeEnum.HPA, OrganizationAnnotationsGroupScopeEnum.CRON_JOBS]
    expect(convertScopeObjectToEnum(input)).toEqual(expected)
  })

  it('should submit the form to create a annotation group', async () => {
    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<AnnotationCreateEditModal {...props} />))

    const inputName = screen.getByLabelText('Group name')
    await userEvent.type(inputName, 'my-name')

    const inputKey = screen.getByTestId('annotations.0.key')
    await userEvent.type(inputKey, 'key')

    const inputValue = screen.getByTestId('annotations.0.value')
    await userEvent.type(inputValue, 'value')

    const checkboxScope = screen.getByText('HPA')
    await userEvent.click(checkboxScope)

    const btn = screen.getByRole('button', { name: 'Create' })
    expect(btn).toBeEnabled()

    await userEvent.click(btn)

    expect(useCreateAnnotationsGroupMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0000-0000-0000',
      annotationsGroupRequest: {
        name: 'my-name',
        annotations: [
          {
            key: 'key',
            value: 'value',
          },
        ],
        scopes: ['HPA'],
      },
    })

    expect(props.onClose).toHaveBeenCalled()
  })

  it('should submit the form to edit a annotations group', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <AnnotationCreateEditModal
          {...props}
          isEdit
          annotationsGroup={{
            id: '1111-1111-1111',
            created_at: '',
            updated_at: '',
            name: 'name',
            annotations: [
              {
                key: 'key',
                value: 'value',
              },
            ],
            scopes: ['HPA', 'CRON_JOBS'],
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

    expect(useEditAnnotationsGroupMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0000-0000-0000',
      annotationsGroupId: '1111-1111-1111',
      annotationsGroupRequest: {
        name: 'my-name',
        annotations: [
          {
            key: 'key',
            value: 'value',
          },
        ],
        scopes: ['HPA', 'CRON_JOBS'],
      },
    })

    expect(props.onClose).toHaveBeenCalled()
  })
})
