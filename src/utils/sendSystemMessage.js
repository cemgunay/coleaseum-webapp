
//send a message from system admin
export default async function sendSystemMessage(conversationId, systemMessage) {
    try {
        const response = await fetch("/api/messages/system", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                systemMessage,
                conversationId,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to send system message");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error sending system message:", error);
    }
}
