import { StorageTypeEnum } from 'qovery-typescript-axios'
import { type Application } from '@qovery/domains/services/data-access'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import StorageModalFeature, { type StorageModalFeatureProps } from './storage-modal-feature'

const mockApplication = applicationFactoryMock(1)[0] as Application

const mockEditService = jest.fn()

jest.mock('@qovery/domains/services/feature', () => ({
  useEditService: () => ({
    mutateAsync: mockEditService,
    isLoading: false,
  }),
  useDeploymentStatus: () => ({
    data: {
      execution_id: '1',
    },
  }),
}))

const props: StorageModalFeatureProps = {
  onClose: jest.fn(),
  service: mockApplication,
}

describe('StorageModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<StorageModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should submit a new storage', async () => {
    const { userEvent } = renderWithProviders(<StorageModalFeature {...props} />)

    const mountPointInput = screen.getByLabelText('Mounting Path')
    await userEvent.type(mountPointInput, '/test')

    const submitButton = screen.getByRole('button', { name: 'Create' })
    await userEvent.click(submitButton)

    const storageRequest = [
      ...(mockApplication.storage || []),
      { mount_point: '/test', size: 4, type: StorageTypeEnum.FAST_SSD },
    ]

    expect(mockEditService.mock.calls[0][0].payload.storage).toEqual(storageRequest)
  })

  it('should submit a edit storage', async () => {
    const storage = mockApplication.storage ? mockApplication.storage[0] : undefined
    const { userEvent } = renderWithProviders(<StorageModalFeature {...props} storage={storage} />)

    const mountPointInput = screen.getByLabelText('Mounting Path')
    await userEvent.type(mountPointInput, '/test')

    const submitButton = screen.getByRole('button', { name: 'Confirm' })
    await userEvent.click(submitButton)

    expect(mockEditService.mock.calls[0][0].payload.storage).toEqual([
      {
        id: storage?.id,
        mount_point: '/test',
        size: storage?.size,
        type: storage?.type,
      },
    ])
  })
})
