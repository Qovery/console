export function getWideCredentialsTrustPolicy(organizationId: string) {
  return JSON.stringify(
    {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            AWS: ['arn:aws:iam::283389881690:user/qovery-deployer', 'arn:aws:iam::283389881690:role/qovery-deployer'],
          },
          Action: 'sts:AssumeRole',
          Condition: {
            StringLike: {
              'sts:ExternalId': `${organizationId}:*`,
            },
          },
        },
      ],
    },
    null,
    4
  )
}
