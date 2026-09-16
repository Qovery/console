import { canCreateCertificateRenewalAlert, getSelectedAlertMetrics } from './metric-availability'

describe('certificate alert availability', () => {
  it.each([false, undefined])('rejects direct certificate URLs when the flag is %s', (enabled) => {
    const available = canCreateCertificateRenewalAlert(enabled, { serviceType: 'APPLICATION' })
    expect(getSelectedAlertMetrics('certificate_renewal_failed', undefined, available)).toEqual([])
    expect(getSelectedAlertMetrics('cpu', 'certificate_renewal_failed', available)).toEqual([])
    expect(getSelectedAlertMetrics('cpu', 'cpu,certificate_renewal_failed,memory', available)).toEqual([
      'cpu',
      'memory',
    ])
  })

  it.each(['APPLICATION', 'CONTAINER', 'HELM'] as const)(
    'allows %s to prepare an alert before a domain is added',
    (serviceType) => {
      const available = canCreateCertificateRenewalAlert(true, { serviceType })
      expect(getSelectedAlertMetrics('certificate_renewal_failed', undefined, available)).toEqual([
        'certificate_renewal_failed',
      ])
    }
  )

  it.each([true, false])(
    'deduplicates URL templates and preserves first selection order when enabled=%s',
    (enabled) => {
      expect(
        getSelectedAlertMetrics(
          'cpu',
          'memory,cpu, memory ,certificate_renewal_failed,cpu,certificate_renewal_failed,invalid',
          enabled
        )
      ).toEqual(enabled ? ['memory', 'cpu', 'certificate_renewal_failed'] : ['memory', 'cpu'])
    }
  )

  it('rejects certificate URLs for databases even when the flag is enabled', () => {
    const available = canCreateCertificateRenewalAlert(true, { serviceType: 'DATABASE' })
    expect(getSelectedAlertMetrics('certificate_renewal_failed', 'certificate_renewal_failed', available)).toEqual([])
  })
})
