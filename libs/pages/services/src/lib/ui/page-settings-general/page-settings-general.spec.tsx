import { useForm } from 'react-hook-form'
import { clusterFactoryMock } from '@console/domains/organization'
import { render } from '__tests__/utils/setup-jest'
import PageSettingsGeneral, { PageSettingsGeneralProps } from './page-settings-general'

describe('PageSettingsGeneral', () => {
  let props: PageSettingsGeneralProps
  let Wrapper: React.FC

  beforeEach(() => {
    props = {
      onSubmit: jest.fn(),
      control: null as any,
      clusters: clusterFactoryMock(2),
    }

    Wrapper = () => {
      const { control } = useForm<{
        name: string
        mode: string
        cluster_id: string
      }>()

      props.control = control

      return <PageSettingsGeneral {...props} />
    }

    render(<Wrapper />)
  })

  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsGeneral {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
