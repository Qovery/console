import { render } from '__tests__/utils/setup-jest'
import { useForm } from 'react-hook-form'
import { clusterFactoryMock } from '@qovery/shared/factories'
import PageCreateEditDeploymentRule, {
  type PageCreateEditDeploymentRuleProps,
} from './page-create-edit-deployment-rule'

describe('PageCreateEditDeploymentRule', () => {
  let props: Partial<PageCreateEditDeploymentRuleProps>

  beforeEach(() => {
    props = {
      title: 'Create rule',
      btnLabel: 'Create',
      onSubmit: jest.fn(),
      clusters: clusterFactoryMock(2),
    }

    const Wrapper = () => {
      const { control } = useForm<{
        id: string
        name: string
        timezone: string
        start_time: string
        stop_time: string
        mode: string
        auto_stop: boolean
        description: string
        cluster_id: string
      }>()

      props.control = control

      return <PageCreateEditDeploymentRule {...(props as PageCreateEditDeploymentRuleProps)} />
    }

    render(<Wrapper />)
  })

  it('should render successfully', () => {
    const { baseElement } = render(<PageCreateEditDeploymentRule {...(props as PageCreateEditDeploymentRuleProps)} />)

    expect(baseElement).toBeTruthy()
  })
})
