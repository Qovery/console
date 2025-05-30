import { HACKATHON_API_BASE_URL } from "../../devops-copilot-panel/submit-message"

export const addThread = async (
    userSub: string,
    token: string,
    organizationId: string,
    message: string
): Promise<Response> => {
    const response = await fetch(
        `${HACKATHON_API_BASE_URL}/owner/${userSub}/organization/${organizationId}/thread`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: message.substring(0, 50),
            }),
        }
    )

    if (!response.ok) {
        throw new Error(`Failed to create thread: ${response.status}`)
    }

    return response
}