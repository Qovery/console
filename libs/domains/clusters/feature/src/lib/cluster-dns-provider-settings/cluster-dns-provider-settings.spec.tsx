import {
  CloudflareDnsProviderResponseProviderEnum,
  type ClusterDnsProviderResponse,
  PlanEnum,
  QoveryDnsProviderResponseProviderEnum,
  Route53DnsProviderResponseProviderEnum,
  Route53StaticCredentialsResponseTypeEnum,
} from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import {
  ClusterDnsProviderSettings,
  buildClusterDnsProviderRequest,
  canEditDnsProvider,
  createClusterDnsProviderFormValues,
} from './cluster-dns-provider-settings'

describe('ClusterDnsProviderSettings utils', () => {
  it('should allow editing for Business and Enterprise plans', () => {
    expect(canEditDnsProvider(PlanEnum.BUSINESS)).toBe(true)
    expect(canEditDnsProvider(PlanEnum.BUSINESS_2025)).toBe(true)
    expect(canEditDnsProvider(PlanEnum.ENTERPRISE)).toBe(true)
    expect(canEditDnsProvider(PlanEnum.ENTERPRISE_YEARLY)).toBe(true)
    expect(canEditDnsProvider(PlanEnum.ENTERPRISE_2025)).toBe(true)
    expect(canEditDnsProvider(PlanEnum.TEAM_2025)).toBe(false)
  })

  it('should not prefill Cloudflare secret from the response', () => {
    const formValues = createClusterDnsProviderFormValues({
      dns_provider: {
        provider: CloudflareDnsProviderResponseProviderEnum.CLOUDFLARE,
        domain: 'example.com',
        email: 'user@example.com',
        proxied: true,
      },
    })

    expect(formValues).toMatchObject({
      provider: 'CLOUDFLARE',
      domain: 'example.com',
      cloudflareEmail: 'user@example.com',
      cloudflareApiToken: '',
      cloudflareProxied: true,
    })
  })

  it('should not prefill Route53 secret from the response', () => {
    const formValues = createClusterDnsProviderFormValues({
      dns_provider: {
        provider: Route53DnsProviderResponseProviderEnum.ROUTE53,
        domain: 'example.com',
        credentials: {
          type: Route53StaticCredentialsResponseTypeEnum.STATIC,
          aws_access_key_id: 'AKIA_TEST',
        },
        aws_region: 'eu-west-3',
        hosted_zone_id: 'Z123',
      },
    })

    expect(formValues).toMatchObject({
      provider: 'ROUTE53',
      domain: 'example.com',
      route53AwsAccessKeyId: 'AKIA_TEST',
      route53AwsSecretAccessKey: '',
      route53AwsRegion: 'eu-west-3',
      route53HostedZoneId: 'Z123',
    })
  })

  it('should build the Cloudflare payload', () => {
    expect(
      buildClusterDnsProviderRequest({
        provider: 'CLOUDFLARE',
        domain: 'example.com',
        cloudflareEmail: 'user@example.com',
        cloudflareApiToken: 'secret',
        cloudflareProxied: false,
        route53AwsAccessKeyId: '',
        route53AwsSecretAccessKey: '',
        route53AwsRegion: '',
        route53HostedZoneId: '',
      })
    ).toEqual({
      dns_provider: {
        provider: 'CLOUDFLARE',
        domain: 'example.com',
        email: 'user@example.com',
        api_token: 'secret',
        proxied: false,
      },
    })
  })

  it('should build the Route53 payload', () => {
    expect(
      buildClusterDnsProviderRequest({
        provider: 'ROUTE53',
        domain: 'example.com',
        cloudflareEmail: '',
        cloudflareApiToken: '',
        cloudflareProxied: false,
        route53AwsAccessKeyId: 'AKIA_TEST',
        route53AwsSecretAccessKey: 'secret',
        route53AwsRegion: 'eu-west-3',
        route53HostedZoneId: 'Z123',
      })
    ).toEqual({
      dns_provider: {
        provider: 'ROUTE53',
        domain: 'example.com',
        credentials: {
          type: 'STATIC',
          aws_access_key_id: 'AKIA_TEST',
          aws_secret_access_key: 'secret',
        },
        aws_region: 'eu-west-3',
        hosted_zone_id: 'Z123',
      },
    })
  })

  it('should build the Qovery payload', () => {
    const response: ClusterDnsProviderResponse = {
      dns_provider: {
        provider: QoveryDnsProviderResponseProviderEnum.QOVERY,
        domain: 'example.com',
      },
    }

    expect(buildClusterDnsProviderRequest(createClusterDnsProviderFormValues(response))).toEqual({
      dns_provider: {
        provider: 'QOVERY',
        domain: 'example.com',
      },
    })
  })

  it('should disable the domain field when provider is Qovery', () => {
    renderWithProviders(
      <ClusterDnsProviderSettings
        organizationId="org-1"
        clusterDnsProvider={{
          dns_provider: {
            provider: QoveryDnsProviderResponseProviderEnum.QOVERY,
            domain: 'example.com',
          },
        }}
        onSubmit={jest.fn()}
      />
    )

    expect(screen.getByTestId('input-domain')).toBeDisabled()
  })
})
