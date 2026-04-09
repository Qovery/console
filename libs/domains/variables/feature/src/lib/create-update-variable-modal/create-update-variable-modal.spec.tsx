import { type VariableResponse } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { CreateUpdateVariableModal } from './create-update-variable-modal'

jest.mock('@qovery/shared/ui', () => {
  const actual = jest.requireActual('@qovery/shared/ui')

  return {
    ...actual,
    useModal: () => ({
      enableAlertClickOutside: jest.fn(),
    }),
  }
})

jest.mock('../dropdown-variable/dropdown-variable', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => children,
}))

jest.mock('./variable-value-editor-modal/variable-value-editor-modal', () => ({
  VariableValueEditorModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="mock-value-editor-modal" /> : null,
  getValueEditorLanguage: jest.fn(() => 'plaintext'),
  isVariableValueEditorModalScope: jest.fn((scope: string | undefined) =>
    ['APPLICATION', 'CONTAINER', 'JOB', 'HELM', 'TERRAFORM'].includes(scope ?? '')
  ),
}))

jest.mock('../hooks/use-create-variable/use-create-variable', () => ({
  useCreateVariable: () => ({
    mutateAsync: jest.fn(),
  }),
}))

jest.mock('../hooks/use-create-variable-alias/use-create-variable-alias', () => ({
  useCreateVariableAlias: () => ({
    mutateAsync: jest.fn(),
  }),
}))

jest.mock('../hooks/use-create-variable-override/use-create-variable-override', () => ({
  useCreateVariableOverride: () => ({
    mutateAsync: jest.fn(),
  }),
}))

jest.mock('../hooks/use-edit-variable/use-edit-variable', () => ({
  useEditVariable: () => ({
    mutateAsync: jest.fn(),
  }),
}))

const closeModal = jest.fn()

const baseProps = {
  closeModal,
  scope: 'APPLICATION' as const,
  projectId: 'project-id',
  environmentId: 'environment-id',
  serviceId: 'service-id',
}

const baseVariable = {
  id: 'variable-id',
  created_at: '2024-04-10T09:56:19.908145Z',
  updated_at: '2024-04-10T09:56:19.908145Z',
  key: 'MY_VARIABLE',
  value: 'initial value',
  mount_path: null,
  scope: 'APPLICATION',
  overridden_variable: null,
  aliased_variable: null,
  variable_type: 'VALUE',
  variable_kind: 'Public',
  service_id: 'service-id',
  service_name: 'service-name',
  service_type: 'APPLICATION',
  owned_by: 'QOVERY',
  is_secret: false,
} as VariableResponse

describe('CreateUpdateVariableModal', () => {
  beforeEach(() => {
    closeModal.mockReset()
  })

  it('should render the open editor button when the value field is available', () => {
    renderWithProviders(<CreateUpdateVariableModal {...baseProps} mode="CREATE" type="VALUE" />)

    expect(screen.getByRole('button', { name: /open editor/i })).toBeInTheDocument()
  })

  it('should not render the open editor button for aliases', () => {
    renderWithProviders(<CreateUpdateVariableModal {...baseProps} mode="CREATE" type="ALIAS" variable={baseVariable} />)

    expect(screen.queryByRole('button', { name: /open editor/i })).not.toBeInTheDocument()
  })

  it('should open the fullscreen editor modal when clicking the button', async () => {
    const { userEvent } = renderWithProviders(
      <CreateUpdateVariableModal {...baseProps} mode="UPDATE" type="VALUE" variable={baseVariable} />
    )

    await userEvent.click(screen.getByRole('button', { name: /open editor/i }))

    expect(screen.getByTestId('mock-value-editor-modal')).toBeInTheDocument()
  })
})
