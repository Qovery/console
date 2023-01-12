import { render } from '__tests__/utils/setup-jest'
import { useForm } from 'react-hook-form'
import { clusterFactoryMock } from '@qovery/shared/factories'
import PageCreateEditDeploymentRule, { PageCreateEditDeploymentRuleProps } from './page-create-edit-deployment-rule'

describe('PageCreateEditDeploymentRule', () => {
  let props: PageCreateEditDeploymentRuleProps
  let Wrapper: React.FC

  beforeEach(() => {
    props = {
      title: 'Create rule',
      btnLabel: 'Create',
      onSubmit: jest.fn(),
      control: null as any,
      clusters: clusterFactoryMock(2),
    }

    Wrapper = () => {
      const { control } = useForm<{
        id: string
        name: string
        timezone: string
        start_time: string
        stop_time: string
        mode: string
        auto_deploy: boolean
        auto_delete: boolean
        auto_stop: boolean
        description: string
        cluster_id: string
      }>()

      props.control = control

      return <PageCreateEditDeploymentRule {...props} />
    }

    render(<Wrapper />)
  })

  it('should render successfully', () => {
    const { baseElement } = render(<PageCreateEditDeploymentRule {...props} />)

    expect(baseElement).toBeTruthy()
  })
})
