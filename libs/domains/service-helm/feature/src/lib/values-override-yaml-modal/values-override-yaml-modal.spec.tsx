import { renderWithProviders } from '@qovery/shared/util-tests'
import ValuesOverrideYamlModal, { type ValuesOverrideYamlModalProps } from './values-override-yaml-modal'

describe('ValuesOverrideYamlModal', () => {
  const props: ValuesOverrideYamlModalProps = {
    organizationId: '0',
    clusterId: '1',
    name: 'my-cluster',
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ValuesOverrideYamlModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<ValuesOverrideYamlModal {...props} />)
    expect(baseElement).toMatchSnapshot()
  })
})
