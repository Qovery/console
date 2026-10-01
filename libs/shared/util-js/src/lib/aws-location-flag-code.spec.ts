import { getAwsLocationFlagCode } from './aws-location-flag-code'

describe('getAwsLocationFlagCode', () => {
  it.each([
    ['eu-west-1', 'EU'],
    ['eu.anthropic.claude-sonnet', 'EU'],
    ['us-east-1', 'US'],
    ['us.anthropic.claude-sonnet', 'US'],
    ['af-south-1', 'ZA'],
    ['ap-east-1', 'HK'],
    ['ap-south-2', 'IN'],
    ['ap-northeast-1', 'JP'],
    ['ap-southeast-1', 'SG'],
    ['global.anthropic.claude-sonnet', undefined],
  ])('maps %s to %s', (location, expected) => {
    expect(getAwsLocationFlagCode(location)).toBe(expected)
  })
})
