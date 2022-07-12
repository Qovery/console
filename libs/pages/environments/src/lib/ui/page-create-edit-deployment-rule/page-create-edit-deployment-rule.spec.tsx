import { useForm } from 'react-hook-form'
import { clusterFactoryMock } from '@console/domains/organization'
import { render } from '__tests__/utils/setup-jest'
import PageCreateEditDeploymentRule, { PageCreateEditDeploymentRuleProps } from './page-create-edit-deployment-rule'

// setValue('id', deploymentRule?.id)
// setValue('name', deploymentRule?.name)
// setValue('timezone', 'UTC')
// setValue('start_time', startTime)
// setValue('stop_time', stopTime)
// setValue('mode', deploymentRule?.mode)
// setValue('auto_deploy', deploymentRule?.auto_deploy)
// setValue('auto_delete', deploymentRule?.auto_delete)
// setValue('auto_stop', deploymentRule?.auto_stop)
// setValue('weekdays', deploymentRule?.weekdays)
// setValue('wildcard', deploymentRule?.wildcard)
// setValue('description', deploymentRule?.description)
// setValue('cluster_id', deploymentRule?.cluster_id)

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
      const { control } = useForm<any>()

      // const { control } = useForm<{
      //   id: string
      //   name: string
      //   timezone: string
      //   start_time: string
      //   stop_time: string
      //   mode: string
      //   auto_deploy: boolean
      //   auto_delete: boolean
      //   auto_stop: boolean
      //   weekdays:
      //.  description: string
      //.  cluster_id: string
      // }>()

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

// beforeEach(() => {
//   props = {
//     title: 'Create rule',
//     onSubmit: () => console.log('submit'),
//   }
// })

// describe('PageCreateEditDeploymentRule', () => {
//   it('should render successfully', () => {
//     const { baseElement } = render(<PageCreateEditDeploymentRule {...props} />)
//     expect(baseElement).toBeTruthy()
//   })
// })
