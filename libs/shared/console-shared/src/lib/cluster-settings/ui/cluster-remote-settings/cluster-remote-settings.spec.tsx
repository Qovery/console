import { getByDisplayValue, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type ClusterRemoteData } from '@qovery/shared/interfaces'
import ClusterRemoteSettings, { type ClusterRemoteSettingsProps } from './cluster-remote-settings'

describe('ClusterRemoteSettings', () => {
  let defaultValues: ClusterRemoteData
  let props: ClusterRemoteSettingsProps
  beforeEach(() => {
    defaultValues = {
      ssh_key: 'ssh key',
    }

    props = {
      fromDetail: false,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<ClusterRemoteData>(<ClusterRemoteSettings />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should init well the inputs with the form default values', async () => {
    const { baseElement } = render(
      wrapWithReactHookForm<ClusterRemoteData>(<ClusterRemoteSettings {...props} />, {
        defaultValues,
      })
    )

    getByDisplayValue(baseElement, 'ssh key')
  })
})
