import { GoogleGenAI, Modality } from "@google/genai";
import type { MeetingDetails } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Handles errors from the Gemini API and translates them into user-friendly messages.
 * @param error The error object caught.
 * @param context A string describing the context of the operation (e.g., 'phiên âm').
 * @returns An Error object with a user-friendly message.
 */
const handleGeminiError = (error: unknown, context: string): Error => {
    console.error(`Gemini API Error (${context}):`, error);
    let message = `Đã xảy ra lỗi không xác định trong quá trình ${context}.`;

    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('api key not valid') || errorMessage.includes('permission_denied')) {
            message = "Lỗi xác thực: Khóa API của bạn không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại.";
        } else if (errorMessage.includes('400 bad request') || errorMessage.includes('invalid argument') || errorMessage.includes('request payload size')) {
            message = "Lỗi yêu cầu: Dữ liệu gửi đi không hợp lệ. Tệp có thể bị hỏng, quá lớn hoặc có định dạng không được hỗ trợ.";
        } else if (errorMessage.includes('quota')) {
            message = "Lỗi hạn ngạch: Bạn đã vượt quá giới hạn yêu cầu cho phép. Vui lòng thử lại sau.";
        } else if (errorMessage.includes('500') || errorMessage.includes('503') || errorMessage.includes('internal')) {
            message = "Lỗi máy chủ: Dịch vụ AI hiện đang gặp sự cố. Vui lòng thử lại sau ít phút.";
        } else if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
            message = "Lỗi mạng: Không thể kết nối đến dịch vụ AI. Vui lòng kiểm tra kết nối internet của bạn.";
        } else {
             message = `Đã xảy ra lỗi trong quá trình ${context}: ${error.message}`;
        }
    }
    return new Error(message);
};


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
    try {
        const audioPart = await fileToGenerativePart(file);
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    { text: "Vui lòng chuyển đổi file âm thanh sau thành văn bản. Hãy sử dụng tính năng nhận dạng người nói (speaker diarization) để xác định và gán nhãn cho từng người nói (ví dụ: Người nói 1, Người nói 2, v.v.). Kết quả đầu ra chỉ nên là văn bản đã được chuyển đổi kèm theo nhãn của người nói. Không thêm bất kỳ bình luận hay định dạng nào khác ngoài nội dung phiên âm." },
                    audioPart
                ]
            },
        });
        return response.text;
    } catch (error) {
        throw handleGeminiError(error, 'phiên âm');
    }
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
    
    try {
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
    } catch (error) {
        throw handleGeminiError(error, 'tạo biên bản');
    }
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
    
    try {
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
    } catch (error) {
        throw handleGeminiError(error, 'chỉnh sửa biên bản');
    }
};

export const generateSpeech = async (textToSpeak: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: textToSpeak }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!base64Audio) {
            throw new Error("Không nhận được dữ liệu âm thanh từ AI.");
        }

        return base64Audio;

    } catch (error) {
        throw handleGeminiError(error, 'tạo âm thanh');
    }
};
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function generateText(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

