const AWS_REGION_COUNTRY_CODES: Record<string, string> = {
  'af-south-1': 'ZA',
  'ap-east-1': 'HK',
  'ap-northeast-1': 'JP',
  'ap-northeast-2': 'KR',
  'ap-northeast-3': 'JP',
  'ap-south-1': 'IN',
  'ap-south-2': 'IN',
  'ap-southeast-1': 'SG',
  'ap-southeast-2': 'AU',
  'ap-southeast-3': 'ID',
  'ap-southeast-4': 'AU',
  'ca-central-1': 'CA',
  'ca-west-1': 'CA',
  'cn-north-1': 'CN',
  'cn-northwest-1': 'CN',
  'il-central-1': 'IL',
  'me-central-1': 'AE',
  'me-south-1': 'BH',
  'mx-central-1': 'MX',
  'sa-east-1': 'BR',
}

export function getAwsLocationFlagCode(location: string): string | undefined {
  if (/^eu[.-]/.test(location)) return 'EU'
  if (/^us[.-]/.test(location)) return 'US'
  return AWS_REGION_COUNTRY_CODES[location]
}
