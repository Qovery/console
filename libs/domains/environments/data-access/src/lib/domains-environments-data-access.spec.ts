import { AxiosHeaders } from 'axios'
import { EnvironmentExportApi } from 'qovery-typescript-axios'
import { mutations } from './domains-environments-data-access'

describe('mutations.exportTerraform', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it.each([true, false])('should exclude secrets even if a caller supplies exportSecrets=%s', async (exportSecrets) => {
    const archive = new File(['terraform'], 'terraform.zip', { type: 'application/zip' })
    const exportConfiguration = jest
      .spyOn(EnvironmentExportApi.prototype, 'exportEnvironmentConfigurationIntoTerraform')
      .mockResolvedValue({
        data: archive,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      })
    const request = { environmentId: '111', exportSecrets }

    const result = await mutations.exportTerraform(request)

    expect(exportConfiguration).toHaveBeenCalledWith('111', { responseType: 'blob' })
    expect(result).toBe(archive)
  })
})
