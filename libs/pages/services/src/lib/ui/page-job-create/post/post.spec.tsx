import { render } from '__tests__/utils/setup-jest'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import Post, { PostProps } from './post'

const props: PostProps = {
  variableData: {
    variables: [],
  },
  generalData: {
    name: 'test',
    description: 'test',
    serviceType: ServiceTypeEnum.CONTAINER,
  },
  gotoGlobalInformation: jest.fn(),
  gotoResources: jest.fn(),
  gotoVariables: jest.fn(),
  isLoadingCreate: false,
  isLoadingCreateAndDeploy: false,
  onPrevious: jest.fn(),
  onSubmit: jest.fn(),
  resourcesData: {
    cpu: [3],
    memory: 1024,
  },
  selectedRegistryName: 'test',
}

describe('Post', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Post {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
