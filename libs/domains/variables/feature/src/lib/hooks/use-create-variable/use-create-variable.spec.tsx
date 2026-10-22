import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type VariableRequest } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { act, renderHook } from '@qovery/shared/util-tests'
import { useCreateVariable } from './use-create-variable'

const mockCreateVariable = jest.fn()
const mockToastError = jest.fn()

jest.mock('@qovery/domains/variables/data-access', () => {
  const actual = jest.requireActual('@qovery/domains/variables/data-access')
  return {
    ...actual,
    mutations: {
      ...actual.mutations,
      createVariable: (...args: unknown[]) => mockCreateVariable(...args),
    },
  }
})

jest.mock('@qovery/shared/ui', () => ({
  toastError: (...args: unknown[]) => mockToastError(...args),
}))

jest.mock('@tanstack/react-router', () => ({
  useRouter: () => ({
    buildLocation: ({ params }: { params: Record<string, string> }) => ({
      href: `/${Object.values(params).join('/')}`,
    }),
  }),
}))

const variableRequest: VariableRequest = {
  key: 'LOG_LEVEL',
  value: 'debug',
  is_secret: false,
  variable_scope: 'APPLICATION',
  variable_parent_id: 'service-id',
}

const existingVariable = {
  id: 'parent-id',
  key: 'LOG_LEVEL',
  scope: 'ENVIRONMENT',
  organization_id: 'org-id',
  project_id: 'project-id',
  environment_id: 'environment-id',
  service_id: null,
  created_at: '2024-06-10T12:53:23.97647Z',
  value: 'info',
  variable_type: 'VALUE',
  is_secret: false,
}

function conflictError(existing: object | undefined) {
  // No `code`: the conflict is detected from the HTTP status
  return {
    name: 'Conflict',
    message: 'Variable LOG_LEVEL already exists at environment scope',
    response: { status: 409, data: existing ? { existing_variable: existing } : {} },
  }
}

async function createWithError(error: object, onCreateOverride?: jest.Mock) {
  mockCreateVariable.mockRejectedValueOnce(error)
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const { result } = renderHook(() => useCreateVariable({ onCreateOverride }), { wrapper })
  await act(async () => {
    await result.current.mutateAsync({ variableRequest }).catch(() => undefined)
  })
  queryClient.clear()
}

describe('useCreateVariable', () => {
  beforeEach(() => {
    mockCreateVariable.mockReset()
    mockToastError.mockReset()
  })

  it('offers to create an override when the conflicting variable is overridable', async () => {
    const onCreateOverride = jest.fn()
    const error = conflictError(existingVariable)

    await createWithError(error, onCreateOverride)

    expect(mockToastError).toHaveBeenCalledWith(
      error,
      'Conflict',
      error.message,
      expect.any(Function),
      'Create an override'
    )

    mockToastError.mock.calls[0][3]()
    expect(onCreateOverride).toHaveBeenCalledWith({
      parentVariable: expect.objectContaining({ id: 'parent-id', key: 'LOG_LEVEL', scope: 'ENVIRONMENT' }),
      variableRequest,
    })
  })

  it('links to the conflicting variable when it is at the same scope', async () => {
    const onCreateOverride = jest.fn()
    const error = conflictError({ ...existingVariable, scope: 'APPLICATION', service_id: 'service-id' })

    await createWithError(error, onCreateOverride)

    expect(mockToastError).toHaveBeenCalledWith(
      error,
      'Conflict',
      error.message,
      expect.any(Function),
      'Go to the conflicting variable'
    )
  })

  it('links to the conflicting variable when the conflict is on the mount path of another key', async () => {
    const onCreateOverride = jest.fn()
    const error = conflictError({
      ...existingVariable,
      key: 'OTHER_FILE',
      variable_type: 'FILE',
      mount_path: '/app/config',
    })

    await createWithError(error, onCreateOverride)

    expect(mockToastError.mock.calls[0][4]).toBe('Go to the conflicting variable')
  })

  it('links to the conflicting variable when it is an override of unknown kind', async () => {
    const error = conflictError({ ...existingVariable, variable_type: 'OVERRIDE' })

    await createWithError(error, jest.fn())

    expect(mockToastError.mock.calls[0][4]).toBe('Go to the conflicting variable')
  })

  it('links to the conflicting variable when its secret kind differs', async () => {
    const error = conflictError({ ...existingVariable, is_secret: true })

    await createWithError(error, jest.fn())

    expect(mockToastError.mock.calls[0][4]).toBe('Go to the conflicting variable')
  })

  it('links to the conflicting variable when the API does not send its type', async () => {
    const legacyExistingVariable: Record<string, unknown> = { ...existingVariable }
    delete legacyExistingVariable['variable_type']
    delete legacyExistingVariable['is_secret']
    const error = conflictError(legacyExistingVariable)

    await createWithError(error, jest.fn())

    expect(mockToastError.mock.calls[0][4]).toBe('Go to the conflicting variable')
  })

  it('links to the conflicting variable when no override handler is given', async () => {
    const error = conflictError(existingVariable)

    await createWithError(error)

    expect(mockToastError.mock.calls[0][4]).toBe('Go to the conflicting variable')
  })

  it('shows the conflict message when the body has no existing variable', async () => {
    const error = conflictError(undefined)

    await createWithError(error)

    expect(mockToastError).toHaveBeenCalledWith(error, 'Conflict', error.message)
  })

  it('shows a generic error toast for other errors', async () => {
    const error = { code: '400', name: 'Bad Request', message: 'Invalid key', response: { status: 400, data: {} } }

    await createWithError(error)

    expect(mockToastError).toHaveBeenCalledWith(error)
  })
})
