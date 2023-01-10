import { act } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { CustomDomainStatusEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock } from '@qovery/shared/factories'
import CrudModalFeature, { CrudModalFeatureProps } from './crud-modal-feature'

const props: CrudModalFeatureProps = {
  customDomain: {
    id: '1',
    domain: 'example.com',
    status: CustomDomainStatusEnum.VALIDATION_PENDING,
    validation_domain: 'example.com',
    updated_at: '2020-01-01T00:00:00Z',
    created_at: '2020-01-01T00:00:00Z',
  },
  application: applicationFactoryMock(1)[0],
  onClose: jest.fn(),
}

describe('CrudModalFeature', () => {
  it('should render successfully', async () => {
    const { baseElement } = render(<CrudModalFeature {...props} />)
    await act(() => {
      expect(baseElement).toBeTruthy()
    })
  })
})
