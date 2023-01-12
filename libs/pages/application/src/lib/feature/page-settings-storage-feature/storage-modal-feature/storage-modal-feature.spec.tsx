import { render } from '__tests__/utils/setup-jest'
import { StorageTypeEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import StorageModalFeature, { StorageModalFeatureProps, handleSubmit } from './storage-modal-feature'

const props: StorageModalFeatureProps = {
  onClose: jest.fn(),
  application: applicationFactoryMock(1)[0],
  applicationId: '1',
}

describe('StorageModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StorageModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

describe('handleSubmit', () => {
  let application: ApplicationEntity
  beforeEach(() => {
    application = applicationFactoryMock(1)[0]
  })

  describe('creation mode', () => {
    it('should create the first storage', () => {
      application.storage = []
      const app = handleSubmit({ size: 54, type: StorageTypeEnum.FAST_SSD, mount_point: '/test' }, application)
      expect(app.storage).toHaveLength(1)
    })

    it('should add a new storage', () => {
      const app = handleSubmit({ size: 54, type: StorageTypeEnum.FAST_SSD, mount_point: '/test' }, application)
      expect(app.storage).toHaveLength(2)
    })
  })

  describe('edit mode', () => {
    it('should edit the only storage', () => {
      const app = handleSubmit(
        { size: 54, type: StorageTypeEnum.FAST_SSD, mount_point: '/test' },
        application,
        application.storage ? application.storage[0] : undefined
      )

      if (app.storage?.length) {
        expect(app.storage[0].size).toBe(54)
      }
    })
  })
})
