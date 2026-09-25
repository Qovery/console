import { getAwsLocationFlagCode } from './aws-location-flag-code'

describe('getAwsLocationFlagCode', () => {
  it.each([
    ['eu-west-1', 'EU'],
    ['eu.anthropic.claude-sonnet', 'EU'],
    ['us-east-1', 'US'],
    ['us.anthropic.claude-sonnet', 'US'],
    ['ap-southeast-1', undefined],
    ['global.anthropic.claude-sonnet', undefined],
  ])('maps %s to %s', (location, expected) => {
    expect(getAwsLocationFlagCode(location)).toBe(expected)
  })
})
