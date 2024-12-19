import { DatabaseModeEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { databaseFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsResourcesFeature, { handleSubmit } from './page-settings-resources-feature'

const mockDatabase = databaseFactoryMock(1)[0]

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ databaseId: '0', environmentId: '1' }),
}))

const mockEditService = jest.fn()

jest.mock('@qovery/domains/cloud-providers/feature', () => ({
  useCloudProviderDatabaseInstanceTypes: () => ({
    data: [
      {
        name: 't2.micro',
      },
      {
        name: 'db.t3.medium',
      },
    ],
  }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  useService: () => ({
    data: mockDatabase,
  }),
  useEditService: () => ({
    mutate: mockEditService,
    isLoading: false,
  }),
  useDeploymentStatus: () => ({
    data: {
      execution_id: '1',
    },
  }),
}))

describe('PageSettingsResourcesFeature', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<PageSettingsResourcesFeature />)

    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(await screen.findByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(baseElement).toBeTruthy()
  })

  it('should submit resources with converters with MB', () => {
    const cpu = 3400
    const memory = 512
    const storage = 1024
    const db = handleSubmit({ cpu: cpu, memory: memory, storage: storage }, mockDatabase)

    expect(db.cpu).toBe(cpu)
    expect(db.memory).toBe(memory)
    expect(db.storage).toBe(storage)
  })

  it('should dispatch edit database for CONTAINER if form is submitted', async () => {
    const { userEvent } = renderWithProviders(<PageSettingsResourcesFeature />)

    // https://react-hook-form.com/advanced-usage#TransformandParse
    const submitButton = await screen.findByRole('button', { name: /save/i })

    await userEvent.clear(screen.getByLabelText(/vcpu/i))
    await userEvent.type(screen.getByLabelText(/vcpu/i), '512')
    await userEvent.clear(screen.getByTestId('input-memory-memory'))
    await userEvent.type(screen.getByTestId('input-memory-memory'), '512')
    await userEvent.clear(screen.getByTestId('input-memory-storage'))
    await userEvent.type(screen.getByTestId('input-memory-storage'), '512')

    expect(submitButton).toBeEnabled()

    await userEvent.click(submitButton)

    expect(mockEditService).toHaveBeenCalledWith({
      serviceId: mockDatabase.id,
      payload: handleSubmit(
        {
          cpu: '512',
          memory: 512,
          storage: 512,
          instance_type: 't2.micro',
          mode: DatabaseModeEnum.CONTAINER,
        },
        mockDatabase
      ),
    })
  })

  it('should dispatch edit database for MANAGED db if form is submitted', async () => {
    mockDatabase.mode = DatabaseModeEnum.MANAGED
    const { userEvent } = renderWithProviders(<PageSettingsResourcesFeature />)

    // https://react-hook-form.com/advanced-usage#TransformandParse
    const submitButton = await screen.findByRole('button', { name: /save/i })

    const realSelect = screen.getByLabelText('Instance type')
    await selectEvent.select(realSelect, 'db.t3.medium', {
      container: document.body,
    })

    await userEvent.clear(screen.getByTestId('input-memory-storage'))
    await userEvent.type(screen.getByTestId('input-memory-storage'), '510')

    expect(submitButton).toBeEnabled()

    await userEvent.click(submitButton)

    expect(mockEditService).toHaveBeenCalledWith({
      serviceId: mockDatabase.id,
      payload: handleSubmit(
        {
          cpu: 1,
          memory: 1024,
          storage: 510,
          instance_type: 'db.t3.medium',
          mode: DatabaseModeEnum.MANAGED,
        },
        mockDatabase
      ),
    })
  })
})
