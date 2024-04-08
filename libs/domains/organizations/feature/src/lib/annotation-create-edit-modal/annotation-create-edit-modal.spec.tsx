import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { GitProviderEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useCreateGitToken from '../hooks/use-create-git-token/use-create-git-token'
import * as useEditGitToken from '../hooks/use-edit-git-token/use-edit-git-token'
import AnnotationCreateEditModal, { type AnnotationCreateEditModalProps } from './annotation-create-edit-modal'

const useCreateGitTokenMockSpy = jest.spyOn(useCreateGitToken, 'useCreateGitToken') as jest.Mock
const useEditGitTokenMockSpy = jest.spyOn(useEditGitToken, 'useEditGitToken') as jest.Mock

const props: AnnotationCreateEditModalProps = {
  organizationId: '0000-0000-0000',
  onClose: jest.fn(),
}

describe('AnnotationCreateEditModal', () => {
  beforeEach(() => {
    useCreateGitTokenMockSpy.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ id: '000' }),
    })
    useEditGitTokenMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<AnnotationCreateEditModal {...props} />))
    expect(baseElement).toBeTruthy()
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

    const inputType = screen.getByLabelText('Type')
    await selectEvent.select(inputType, ['Gitlab'], {
      container: document.body,
    })

    const inputName = screen.getByLabelText('Token name')
    await userEvent.type(inputName, 'my-token-name')

    const inputValue = screen.getByTestId('annotations.0.value')
    await userEvent.type(inputValue, 'value')

    const checkboxScope = screen.getByText('HPA')
    await userEvent.click(checkboxScope)

    const btn = screen.getByRole('button', { name: 'Create' })
    expect(btn).not.toBeDisabled()

    await userEvent.click(btn)

    expect(useCreateGitTokenMockSpy().mutateAsync).toHaveBeenCalledWith({
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

    expect(props.onClose).toHaveBeenCalledWith({ id: '000' })
  })

  it('should submit the form to edit a git token', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <AnnotationCreateEditModal
          {...props}
          isEdit
          gitToken={{
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

    const inputName = screen.getByLabelText('Token name')
    await userEvent.clear(inputName)
    await userEvent.type(inputName, 'my-token-name')

    const inputTokenValue = screen.getByLabelText('Token value')
    await userEvent.type(inputTokenValue, 'my-token-value')

    const btn = screen.getByRole('button', { name: 'Confirm' })
    expect(btn).not.toBeDisabled()

    await userEvent.click(btn)

    expect(useEditGitTokenMockSpy().mutateAsync).toHaveBeenCalledWith({
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
