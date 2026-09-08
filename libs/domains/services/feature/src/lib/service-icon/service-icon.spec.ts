import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceAvatar, type ServiceAvatarProps } from '../service-avatar/service-avatar'
import { ServiceIcons } from './service-icon'

jest.mock('@qovery/shared/ui', () => {
  const actual = jest.requireActual('@qovery/shared/ui')
  const React = jest.requireActual('react')

  return {
    ...actual,
    Avatar: ({ fallback }: { fallback: unknown }) => fallback,
    Icon: ({ name }: { name: string }) => React.createElement('span', { 'data-testid': 'fallback-icon' }, name),
  }
})

const expectedServiceIcons = [
  ['app://qovery-console/lifecycle-job', 'LifecycleJob'],
  ['app://qovery-console/cron-job', 'CronJob'],
  ['app://qovery-console/container', 'Container'],
  ['app://qovery-console/database', 'Database'],
  ['app://qovery-console/helm', 'Helm'],
  ['app://qovery-console/application', 'Application'],
  ['app://qovery-console/argocd', 'ArgoCD'],
  ['app://qovery-console/apache', 'Apache'],
  ['app://qovery-console/apacheairflow', 'Apache Airflow'],
  ['app://qovery-console/apachekafka', 'Apache Kafka'],
  ['app://qovery-console/angular', 'Angular'],
  ['app://qovery-console/aws', 'AWS'],
  ['app://qovery-console/azure', 'Azure'],
  ['app://qovery-console/bash', 'Bash'],
  ['app://qovery-console/cloudflare', 'Cloudflare'],
  ['app://qovery-console/couchbase', 'Couchbase'],
  ['app://qovery-console/docker', 'Docker'],
  ['app://qovery-console/elasticsearch', 'Elasticsearch'],
  ['app://qovery-console/fastapi', 'FastAPI'],
  ['app://qovery-console/flask', 'Flask'],
  ['app://qovery-console/gcp', 'GCP'],
  ['app://qovery-console/golang', 'Golang'],
  ['app://qovery-console/grafana', 'Grafana'],
  ['app://qovery-console/java', 'Java'],
  ['app://qovery-console/kotlin', 'Kotlin'],
  ['app://qovery-console/kubernetes', 'Kubernetes'],
  ['app://qovery-console/mongodb', 'MongoDB'],
  ['app://qovery-console/mysql', 'MySQL'],
  ['app://qovery-console/nestjs', 'NestJS'],
  ['app://qovery-console/nextjs', 'NextJS'],
  ['app://qovery-console/nginx', 'Nginx'],
  ['app://qovery-console/node', 'Node'],
  ['app://qovery-console/nuxtjs', 'NuxtJS'],
  ['app://qovery-console/postgresql', 'PostgreSQL'],
  ['app://qovery-console/prometheus', 'Prometheus'],
  ['app://qovery-console/pulumi', 'Pulumi'],
  ['app://qovery-console/python', 'Python'],
  ['app://qovery-console/rabbitmq', 'RabbitMQ'],
  ['app://qovery-console/rails', 'Rails'],
  ['app://qovery-console/react', 'React'],
  ['app://qovery-console/redis', 'Redis'],
  ['app://qovery-console/ruby', 'Ruby'],
  ['app://qovery-console/rust', 'Rust'],
  ['app://qovery-console/spring', 'Spring'],
  ['app://qovery-console/svelte', 'Svelte'],
  ['app://qovery-console/terraform', 'Terraform'],
  ['app://qovery-console/vue', 'Vue'],
  ['app://qovery-console/airbyte', 'Airbyte'],
  ['app://qovery-console/amazon-msk', 'Amazon MSK'],
  ['app://qovery-console/aiven', 'Aiven'],
  ['app://qovery-console/bedrock', 'AWS Bedrock'],
  ['app://qovery-console/bigquery', 'BigQuery'],
  ['app://qovery-console/clickhouse', 'Clickhouse'],
  ['app://qovery-console/cloudformation', 'CloudFormation'],
  ['app://qovery-console/confluent', 'Confluent'],
  ['app://qovery-console/crossplane', 'Crossplane'],
  ['app://qovery-console/datadog', 'Datadog'],
  ['app://qovery-console/ec2', 'EC2'],
  ['app://qovery-console/kafka', 'Kafka'],
  ['app://qovery-console/kubecost', 'Kubecost'],
  ['app://qovery-console/neon', 'Neon'],
  ['app://qovery-console/newrelic', 'New Relic'],
  ['app://qovery-console/planetscale', 'PlanetScale'],
  ['app://qovery-console/qovery', 'Qovery'],
  ['app://qovery-console/redpanda', 'Redpanda'],
  ['app://qovery-console/scaleway', 'Scaleway'],
  ['app://qovery-console/snowflake', 'Snowflake'],
  ['app://qovery-console/temporal', 'Temporal'],
  ['app://qovery-console/timescaledb', 'Timescale'],
  ['app://qovery-console/windmill', 'Windmill'],
  ['app://qovery-console/lambda', 'Lambda'],
  ['app://qovery-console/s3', 'S3'],
] as const

describe('service catalog icons', () => {
  it('covers every registered icon', () => {
    expect(Object.keys(ServiceIcons)).toEqual(expectedServiceIcons.map(([iconUri]) => iconUri))
  })

  it.each(expectedServiceIcons)('resolves %s with the %s alt title', (iconUri, title) => {
    const serviceIcon = ServiceIcons[iconUri as keyof typeof ServiceIcons]

    expect(serviceIcon.icon).toBeTruthy()
    expect(serviceIcon.title).toBe(title)
  })

  it('uses the service-type fallback for an unknown icon URI', () => {
    const service = {
      icon_uri: 'app://qovery-console/unknown',
      serviceType: 'APPLICATION',
    } as ServiceAvatarProps['service']

    const React = jest.requireActual('react')
    renderWithProviders(React.createElement(ServiceAvatar, { service }))

    expect(screen.getByTestId('fallback-icon')).toHaveTextContent('APPLICATION')
  })
})
