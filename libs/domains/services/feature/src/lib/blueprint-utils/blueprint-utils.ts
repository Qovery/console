const BLUEPRINT_NAME_PARTS: Record<string, string> = {
  aws: 'AWS',
  gcp: 'GCP',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  rabbitmq: 'RabbitMQ',
  rds: 'RDS',
  s3: 'S3',
}

export function formatBlueprintName(name: string): string {
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => {
      const normalizedPart = part.toLowerCase()

      return BLUEPRINT_NAME_PARTS[normalizedPart] ?? `${part.charAt(0).toUpperCase()}${part.slice(1)}`
    })
    .join(' ')
}
