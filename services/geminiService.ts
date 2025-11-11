import { GoogleGenAI } from "@google/genai";
import type { MeetingDetails } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert File -> base64
const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                resolve('');
            }
        };
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

export const transcribeAudio = async (file: File, model: string): Promise<string> => {
    const audioPart = await fileToGenerativePart(file);
    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [
                { text: "Please transcribe the following audio file. Provide only the transcribed text, without any additional comments or formatting." },
                audioPart
            ]
        },
    });
    return response.text;
};

export const generateMeetingMinutes = async (transcription: string, details: MeetingDetails, model: string): Promise<string> => {
    const prompt = `
        Based on the following meeting transcription and details, please generate a professional meeting minutes document in HTML format.

        **Meeting Details:**
        - **Topic/Purpose:** ${details.topic || 'Not specified'}
        - **Time and Place:** ${details.timeAndPlace || 'Not specified'}
        - **Chairperson:** ${details.chair || 'Not specified'}
        - **Attendees:** ${details.attendees || 'Not specified'}

        **Meeting Transcription:**
        ---
        ${transcription}
        ---

        **Instructions for HTML Output:**
        1.  The entire output must be a single block of HTML, without any surrounding markdown backticks (\`\`\`).
        2.  Use Tailwind CSS classes for styling to create a clean, professional, and readable document. Use a light theme (e.g., white background, dark text).
        3.  The structure should include:
            - A main title (\`<h1>\`) for the meeting topic.
            - A section for meeting details (time, place, attendees, chair).
            - Key sections like "Agenda", "Discussion Summary", "Decisions Made", and "Action Items".
            - Use \`<h2>\` for section titles.
            - Use \`<ul>\` and \`<li>\` for lists. For action items, clearly state the task and who is assigned to it.
        4.  Analyze the transcription to extract the relevant information for each section. If the agenda is not explicitly stated, infer it from the discussion topics.
        5.  The language of the output should be Vietnamese.

        **Example of desired HTML structure snippet:**
        \`\`\`html
        <div class="font-sans p-8 bg-white text-gray-800">
            <h1 class="text-3xl font-bold mb-2 text-gray-900">Biên bản họp: [Chủ đề cuộc họp]</h1>
            <hr class="mb-6">
            ... (details section) ...
            <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-800 border-b pb-2">Tóm tắt thảo luận</h2>
            ...
            <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-800 border-b pb-2">Các công việc cần thực hiện</h2>
            <ul class="list-disc list-inside space-y-2">
                <li><strong>[Mô tả công việc]:</strong> Phụ trách: [Tên người/Nhóm]. Hạn cuối: [Ngày, nếu có].</li>
            </ul>
        </div>
        \`\`\`

        Now, generate the complete HTML in Vietnamese based on the provided transcription and details.
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt
    });

    // Clean up the response to ensure it's just HTML
    let htmlContent = response.text.trim();
    if (htmlContent.startsWith('```html')) {
        htmlContent = htmlContent.substring(7);
    }
    if (htmlContent.endsWith('```')) {
        htmlContent = htmlContent.substring(0, htmlContent.length - 3);
    }
    
    return htmlContent.trim();
};

export const regenerateMeetingMinutes = async (
    transcription: string,
    details: MeetingDetails,
    previousMinutesHtml: string,
    editRequest: string,
    model: string
): Promise<string> => {
    const prompt = `
        You are an AI assistant tasked with editing a set of meeting minutes. The minutes are in Vietnamese.
        You will be given the original meeting transcription, the meeting details, the previous HTML version of the minutes, and a user's request for edits.
        Your task is to apply the edits and return a new, complete HTML document that incorporates the changes.

        **User's Edit Request (in Vietnamese):**
        "${editRequest}"

        **Original Meeting Transcription (for context):**
        ---
        ${transcription}
        ---

        **Original Meeting Details (for context):**
        - **Topic/Purpose:** ${details.topic || 'Not specified'}
        - **Time and Place:** ${details.timeAndPlace || 'Not specified'}
        - **Chairperson:** ${details.chair || 'Not specified'}
        - **Attendees:** ${details.attendees || 'Not specified'}
        
        **Previous HTML Version of Minutes:**
        ---
        ${previousMinutesHtml}
        ---

        **Instructions:**
        1.  Carefully analyze the user's edit request.
        2.  Modify the "Previous HTML Version of Minutes" to reflect the requested changes. You may need to add, remove, or alter text and structure.
        3.  If the edit request is vague, use the original transcription to find the correct information.
        4.  The output must be the complete, new HTML document in Vietnamese.
        5.  Maintain the same styling (Tailwind CSS) and structure as the original HTML.
        6.  The entire output must be a single block of HTML, without any surrounding markdown backticks (\`\`\`).
    `;
    
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt
    });

    // Clean up the response to ensure it's just HTML
    let htmlContent = response.text.trim();
    if (htmlContent.startsWith('```html')) {
        htmlContent = htmlContent.substring(7);
    }
    if (htmlContent.endsWith('```')) {
        htmlContent = htmlContent.substring(0, htmlContent.length - 3);
    }
    
    return htmlContent.trim();
};
