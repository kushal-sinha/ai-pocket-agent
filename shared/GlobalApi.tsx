import axios from 'axios';

type ChatMessage = {
    role: string;
    content: string;
};

export const AIChatModel = async (messages: ChatMessage[]) => {
    const response = await axios.post(
        'https://kravixstudio.com/api/v1/chat',
        {
            message: messages,
            aiModel: 'gpt-4.1-mini',
            outputType: 'text',
        },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + process.env.EXPO_PUBLIC_KRAVIX_STUDIO_API_KEY,
            },
        }
    );
    return response.data;
};
