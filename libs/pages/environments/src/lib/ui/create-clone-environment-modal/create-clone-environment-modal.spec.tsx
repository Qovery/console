import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { clusterFactoryMock } from '@console/domains/organization'
import CreateCloneEnvironmentModal, { CreateCloneEnvironmentModalProps } from './create-clone-environment-modal'

const mockClusters = clusterFactoryMock(3)
const props: CreateCloneEnvironmentModalProps = {
  environmentToClone: undefined,
  closeModal: jest.fn(),
  clusters: mockClusters,
  loading: false,
  onSubmit: jest.fn(),
}

describe('CreateCloneEnvironmentModal', () => {
  let defaultValues: {
    mode: EnvironmentModeEnum
    cluster_id: string
    name: string
  }

  beforeEach(() => {
    defaultValues = {
      mode: EnvironmentModeEnum.PREVIEW,
      cluster_id: mockClusters[0].id,
      name: '',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<CreateCloneEnvironmentModal {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<CreateCloneEnvironmentModal {...props} />))
    expect(baseElement).toBeTruthy()
  })
})
