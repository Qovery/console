import { renderWithProviders } from '@qovery/shared/util-tests'
import GcpExistingVPC, { type GcpExistingVPCProps } from './gcp-existing-vpc'

const feature = {
  vpc_name: 'test',
  vpc_project_id: 'test',
  subnetwork_name: 'test',
  ip_range_pods_name: 'test',
  additional_ip_range_pods_names: ['test'],
  ip_range_services_name: 'test',
}

describe('GcpExistingVPC', () => {
  const props: GcpExistingVPCProps = {
    feature,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<GcpExistingVPC {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshots', () => {
    const { baseElement } = renderWithProviders(<GcpExistingVPC {...props} />)
    expect(baseElement).toMatchSnapshot()
  })
})
