import { useAuth0 } from '@auth0/auth0-react'
import { useMutation } from '@tanstack/react-query'

export function useEnableUserConnect() {
  const { getAccessTokenSilently } = useAuth0()

  return useMutation({
    mutationFn: async ({ userEmail, provider }: { userEmail: string; provider?: string }) => {
      const token = await getAccessTokenSilently()

      const response = await fetch(`${process.env.NX_PUBLIC_QOVERY_API}/enableUserSignUp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_email: userEmail,
          provider: provider,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to enable user connect: ${response.statusText}`)
      }

      return response.json()
    },
    meta: {
      notifyOnSuccess: {
        title: 'User enabled successfully',
        description: 'The user can now connect to the platform.',
      },
      notifyOnError: true,
    },
  })
}
