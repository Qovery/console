import { HACKATHON_API_BASE_URL } from "../../devops-copilot-panel/submit-message";

export async function fetchThread(userSub: string, organizationId: string, threadId: string, token: string) {
    const response = await fetch(
        `${HACKATHON_API_BASE_URL}/owner/${userSub}/organization/${organizationId}/thread/${threadId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )

    if (!response.ok) {
        throw new Error('Failed to fetch thread')
    }

    return response
}