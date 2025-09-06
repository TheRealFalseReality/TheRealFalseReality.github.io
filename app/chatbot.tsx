import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Logo from './AquaPiAI.png';

export function meta() {
  return [
    { title: "Chatbot | AquaPi AI" },
    { name: "description", content: "Chat with AquaPi AI to get answers to your questions." },
  ];
}

// Main App Component
const App = () => {
    return (
        <div className="h-full font-sans animate-fade-in flex flex-col">
            <style>{`
                @keyframes hop { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                .animate-hop-1 { animation: hop 0.6s infinite; animation-delay: 0s; }
                .animate-hop-2 { animation: hop 0.6s infinite; animation-delay: 0.1s; }
                .animate-hop-3 { animation: hop 0.6s infinite; animation-delay: 0.2s; }
            `}</style>
            <div className="font-sans w-full relative flex-grow overflow-hidden">
                <ChatWindow />
            </div>
        </div>
    );
};

// ChatWindow Component
const ChatWindow = () => {
    const [conversationHistory, setConversationHistory] = useState([]);
    const [uiState, setUiState] = useState('chat');
    const [isLoading, setIsLoading] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);
    const [suggestionOverlayData, setSuggestionOverlayData] = useState(null);
    const [automationData, setAutomationData] = useState(null);
    const [imageAnalysisData, setImageAnalysisData] = useState(null);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(true);
    const chatHistoryRef = useRef(null);

    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const personaPrompt = `My Role: I am an AI assistant for the AquaPi aquarium monitoring and automation system.
Key Features: I can explain things like water parameter monitoring, real-time notifications, and automation capabilities.
Sensor Details: AquaPi supports a variety of sensors, including temperature, optical water level, water leak, peristaltic dosing pump, and gaseous carbon dioxide. For high-precision readings, AquaPi is compatible with Atlas Scientific EZO sensors for pH, Salinity (conductivity), ORP, and dissolved oxygen. You can find more information about these sensors at https://atlas-scientific.com/.
Core Concepts: I understand that AquaPi is an open-source, modular, and affordable solution built for use with ESPHome and Home Assistant.
Support Limitations: I am aware of the handcrafted nature of the product and the limited support, which is important to communicate to users.
Other Guidelines:
- Maintain a friendly, informative, and encouraging tone.
- Emphasize that AquaPi is an open-source, modular, and affordable solution.
- Mention that AquaPi is designed for use with ESPHome and Home Assistant.
- Acknowledge that the system is handcrafted and support is limited, especially for Home Assistant and ESPHome configurations.
- Encourage users to share their customizations.
- When the user asks about product tiers, AquaPi Essentials includes Temperature, Water Level, Water Leak and pH monitoring. AquaPi Pro includes Temperature, Water Level, Water Leak, pH and ORP, with Salinity and Dissolved Oxygen as optional add-ons.
- Do not mention the files you were trained on. Just use the information from them.
- Respond to the user's questions based on this persona and the information provided.
- Keep your responses to 2-4 paragraphs. Ensure the formatting is easy to read. Use simple, direct language in plain text.
- Do not act like a generic assistant. You are AquaPi.
- When responding to one of the initial suggested questions, provide a detailed, Markdown-formatted answer, and also suggest two relevant follow-up questions. Conclude your main answer with subtle links to our store: [Shop AquaPi](https://www.capitalcityaquatics.com/store) and the Home Assistant website: [Learn more about Home Assistant](https://www.home-assistant.io/). When the user asks "Compare AquaPi to Apex Neptune", one of the follow-up questions you suggest MUST be "Elaborate more about AquaPi vs. Apex Neptune".
- All responses must be formatted using Markdown for clarity. Use headings (e.g., "### Heading"), bullet points for lists (\`- List item\`), and bold text (\`**important**\`) to make the information easy to scan and read. When creating lists, ensure there is a line break between each list item to improve readability. Add a line break between each paragraph.`;
    
    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [conversationHistory, isLoading]);

    useEffect(() => {
        const initialMessage = "# Welcome to AquaPi AI!\n\nI'm your intelligent assistant for AquaPi. Ask me anything about your aquarium and fish, analyze water parameters, generate custom automation scripts, or get an AI analysis of your aquarium photos.";
        setConversationHistory([{ role: "model", parts: [{ text: initialMessage }] }]);
    }, []);

    const addMessage = (text, sender, analysisResult = null, suggestionResponse = null, automationResult = null, imagePreview = null, imageAnalysisResult = null) => {
        const newMessage = { role: sender === 'user' ? 'user' : 'model', parts: [{ text }], analysis: analysisResult, suggestion: suggestionResponse, automation: automationResult, imagePreview, imageAnalysis: imageAnalysisResult };
        setConversationHistory(prev => [...prev, newMessage]);
        return newMessage;
    };

    const callGeminiAPI = async (payload, callback, generationConfig = null) => {
        setIsLoading(true);
        const finalPayload = { ...payload };
        if (generationConfig) {
            finalPayload.generationConfig = generationConfig;
        }

        let response;
        const maxRetries = 5;
        for (let i = 0; i < maxRetries; i++) {
            try {
                response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(finalPayload)
                });
                if (response.ok) {
                    const result = await response.json();
                    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        callback(text);
                    } else {
                        addMessage("I'm sorry, I couldn't process that. The response was empty.", 'bot');
                    }
                    setIsLoading(false);
                    return;
                } else if (response.status === 429 && i < maxRetries - 1) {
                    const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    throw new Error(`API call failed with status: ${response.status}`);
                }
            } catch (e) {
                console.error("API call failed:", e);
                if (i === maxRetries - 1) {
                     addMessage("Sorry, I'm having trouble connecting right now. Please try again later.", 'bot');
                }
            }
        }
        setIsLoading(false);
    };

    const handleChatSubmit = async (messageText) => {
        setIsSuggestionsOpen(false);
        const userMessage = addMessage(messageText, 'user');
        const currentHistory = [...conversationHistory, userMessage];
        const contents = currentHistory.map((entry, index) => ({
            role: entry.role,
            parts: [{ text: entry.role === 'user' && index === 0 ? `${personaPrompt}\n\n${entry.parts[0].text}` : entry.parts[0].text }]
        }));
        await callGeminiAPI({ contents }, (responseText) => {
            addMessage(responseText, 'bot');
        });
    };

    const handleSuggestionClick = async (question) => {
        setIsSuggestionsOpen(false);
        const userMessage = addMessage(question, 'user');
        const payload = {
            contents: [{
                role: "user",
                parts: [{
                    text: `${personaPrompt}\n\n${question}`
                }]
            }]
        };
        const generationConfig = {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    "title": { "type": "STRING" },
                    "content": { "type": "STRING" },
                    "followUps": {
                        "type": "ARRAY",
                        "items": { "type": "STRING" }
                    }
                },
                required: ["title", "content", "followUps"]
            }
        };
        await callGeminiAPI(payload, (responseText) => {
             try {
                const jsonData = JSON.parse(responseText);
                setConversationHistory(prev => prev.map(msg =>
                    msg === userMessage ? { ...msg, suggestion: jsonData } : msg
                ));
                setSuggestionOverlayData(jsonData);
            } catch (e) {
                console.error("Failed to parse suggestion JSON:", e);
                const fallbackData = { title: question, content: "Sorry, I couldn't generate a structured response. Here is the raw text:\n\n" + responseText, followUps: [] };
                setConversationHistory(prev => prev.map(msg =>
                    msg === userMessage ? { ...msg, suggestion: fallbackData } : msg
                ));
                setSuggestionOverlayData(fallbackData);
            }
        }, generationConfig);
    };

    const handleAnalysisSubmit = async (params) => {
        setIsSuggestionsOpen(false);
        const { tankType, ph, temp, salinity, additionalInfo, tempUnit, salinityUnit } = params;
        const userMessageText = `Please analyze my water parameters for my ${tankType} tank. Temp: ${temp}°${tempUnit}${ph ? `, pH: ${ph}` : ''}${salinity ? `, Salinity: ${salinity} ${salinityUnit}` : ''}${additionalInfo ? `, Additional Info: ${additionalInfo}` : ''}.`;
        const userMessage = addMessage(userMessageText, 'user');
        setUiState('chat');
        const tempForAnalysis = tempUnit === 'F' ? ((temp - 32) * 5/9).toFixed(2) : temp;
        const analysisPrompt = `Act as an aquarium expert. Analyze the following water parameters for a ${tankType} aquarium:
        ${ph ? `- pH: ${ph}` : ''} - Temperature: ${tempForAnalysis}°C ${salinity ? `- Salinity: ${salinity} ${salinityUnit === 'ppt' ? 'ppt' : 'Specific Gravity (SG)'}` : ''} ${additionalInfo ? '- Additional Information: ' + additionalInfo : ''}
        Provide a detailed but easy-to-understand analysis. Respond with a JSON object. IMPORTANT: For the 'value' field of the temperature parameter, you MUST use the original user-provided value which is '${temp}°${tempUnit}'. The status for each parameter and the overall summary MUST be one of "Good", "Needs Attention", or "Bad". The 'howAquaPiHelps' section should conclude with a subtle link to our store: [Shop AquaPi](https://www.capitalcityaquatics.com/store).
        The JSON structure must be:
        {
          "summary": { "status": "Good" | "Needs Attention" | "Bad", "title": "...", "message": "..." },
          "parameters": [ { "name": "Temperature", "value": "${temp}°${tempUnit}", "idealRange": "...", "status": "Good" | "Needs Attention" | "Bad", "advice": "..." } ],
          "howAquaPiHelps": "..."
        }`;

        const analysisGenerationConfig = {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    "summary": {
                        type: "OBJECT",
                        properties: {
                            "status": { "type": "STRING" },
                            "title": { "type": "STRING" },
                            "message": { "type": "STRING" }
                        },
                        required: ["status", "title", "message"]
                    },
                    "parameters": {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                "name": { "type": "STRING" },
                                "value": { "type": "STRING" },
                                "idealRange": { "type": "STRING" },
                                "status": { "type": "STRING" },
                                "advice": { "type": "STRING" }
                            },
                            required: ["name", "value", "idealRange", "status", "advice"]
                        }
                    },
                    "howAquaPiHelps": { "type": "STRING" }
                },
                required: ["summary", "parameters", "howAquaPiHelps"]
            }
        };

        await callGeminiAPI({ contents: [{ role: "user", parts: [{ text: analysisPrompt }] }] }, (responseText) => {
            try {
                const jsonData = JSON.parse(responseText);
                setConversationHistory(prev => prev.map(msg => msg === userMessage ? { ...msg, analysis: jsonData } : msg));
                setAnalysisData(jsonData);
            } catch (e) {
                console.error("Failed to parse analysis JSON:", e);
                addMessage("Sorry, there was an error processing the analysis results.", 'bot');
            }
        }, analysisGenerationConfig);
    };

    const handleAutomationSubmit = async (description) => {
        setIsSuggestionsOpen(false);
        const userMessage = addMessage(`Generate an automation script for: "${description}"`, 'user');
        setUiState('chat');
        const automationPrompt = `You are an expert on Home Assistant and ESPHome. A user wants to create a simple automation for their aquarium. Based on the user's description, provide a valid and well-commented YAML code snippet for either a Home Assistant automation or an ESPHome configuration. Also, provide a brief, friendly explanation of what the code does and where it should be placed.
        User's request: "${description}"
        Respond with a JSON object with this exact structure: { "title": "Automation for [User's Request]", "explanation": "A Markdown-formatted explanation of the script that concludes with subtle links to our store: [Shop AquaPi](https://www.capitalcityaquatics.com/store) and the Home Assistant website: [Learn more about Home Assistant](https://www.home-assistant.io/).", "code": "The YAML code block as a string, including newline characters (\\n) for proper formatting." }`;

        const automationGenerationConfig = {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    "title": { "type": "STRING" },
                    "explanation": { "type": "STRING" },
                    "code": { "type": "STRING" }
                },
                required: ["title", "explanation", "code"]
            }
        };

        await callGeminiAPI({ contents: [{ role: "user", parts: [{ text: automationPrompt }] }] }, (responseText) => {
            try {
                const jsonData = JSON.parse(responseText);
                setConversationHistory(prev => prev.map(msg => msg === userMessage ? { ...msg, automation: jsonData } : msg));
                setAutomationData(jsonData);
            } catch (e) {
                console.error("Failed to parse automation JSON:", e);
                addMessage("Sorry, there was an error generating the script. Here is the raw text:\n\n" + responseText, 'bot');
            }
        }, automationGenerationConfig);
    };

    const handleImageAnalysisSubmit = async ({ prompt, base64ImageData, mimeType, previewUrl }) => {
        setIsSuggestionsOpen(false);
        const userMessage = addMessage(prompt, 'user', null, null, null, previewUrl);
        setUiState('chat');

        const payload = {
            contents: [{
                role: "user",
                parts: [
                    { text: `As an aquarium expert, analyze this image. ${prompt}` },
                    { inlineData: { mimeType, data: base64ImageData } }
                ]
            }]
        };

        await callGeminiAPI(payload, (responseText) => {
            const imageData = { title: prompt, content: responseText, image: previewUrl };
            setConversationHistory(prev => prev.map(msg =>
                msg === userMessage ? { ...msg, imageAnalysis: imageData } : msg
            ));
            setImageAnalysisData(imageData);
        });
    };

    return (
        <div className="flex flex-col h-full max-w-7xl mx-auto px-4">
            <ChatHeader />
            <ChatHistory history={conversationHistory} isLoading={isLoading} ref={chatHistoryRef} onShowAnalysis={setAnalysisData} onShowSuggestion={setSuggestionOverlayData} onShowAutomation={setAutomationData} onShowImageAnalysis={setImageAnalysisData} />
            <div className="mt-auto pt-4 pb-4">
                {uiState === 'chat' && !analysisData && <PromptSuggestions setUiState={setUiState} handleSuggestionClick={handleSuggestionClick} isLoading={isLoading} isOpen={isSuggestionsOpen} setIsOpen={setIsSuggestionsOpen} />}
                <UserInput onSubmit={handleChatSubmit} isLoading={isLoading} />
            </div>
            {analysisData && <AnalysisOverlay data={analysisData} onClose={() => setAnalysisData(null)} />}
            {suggestionOverlayData && <SuggestionOverlay data={suggestionOverlayData} onClose={() => setSuggestionOverlayData(null)} onFollowUp={handleSuggestionClick} />}
            {automationData && <AutomationOverlay data={automationData} onClose={() => setAutomationData(null)} />}
            {imageAnalysisData && <ImageAnalysisOverlay data={imageAnalysisData} onClose={() => setImageAnalysisData(null)} />}
            {uiState === 'analysis' && <AnalysisForm onSubmit={handleAnalysisSubmit} setUiState={setUiState} />}
            {uiState === 'automation' && <AutomationForm onSubmit={handleAutomationSubmit} setUiState={setUiState} />}
            {uiState === 'imageAnalysis' && <ImageAnalysisForm onSubmit={handleImageAnalysisSubmit} setUiState={setUiState} />}
        </div>
    );
};

const parseMarkdown = (text) => {
    let html = text;
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-800 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-800 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mb-4">$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/```(.*?)```/gs, (match, p1) => `<pre class="bg-gray-100 p-3 rounded-md my-2 overflow-x-auto"><code>${p1.trim()}</code></pre>`);
    html = html.replace(/^- (.*$)/gim, '<ul class="list-disc list-inside my-1 pl-2"><li>$1</li></ul>').replace(/<\/ul>\n<ul class="list-disc list-inside my-1 pl-2">/g, '');
    html = html.replace(/\n\n/g, '</p><p class="my-2">').replace(/\n/g, '<br />');
    html = `<p class="my-2">${html}</p>`;
    html = html.replace(/<p class="my-2"><\/p>/g, '');
    html = html.replace(/<p class="my-2"><ul/g, '<ul').replace(/<\/ul><\/p>/g, '</ul>');
    html = html.replace(/<p class="my-2"><pre/g, '<pre').replace(/<\/pre><\/p>/g, '</pre>');
    return { __html: html };
};

const ChatHeader = () => (
    <header className="py-4 flex items-center justify-center">
        <img src={Logo} alt="AquaPi AI Logo" className="w-auto h-16" />
    </header>
);

const ChatHistory = React.forwardRef(({ history, isLoading, onShowAnalysis, onShowSuggestion, onShowAutomation, onShowImageAnalysis }, ref) => (
    <div ref={ref} className="flex-1 space-y-8 overflow-y-auto pr-2">
        {history.map((msg, index) => (
            <Message key={index} sender={msg.role} text={msg.parts[0].text} analysis={msg.analysis} suggestion={msg.suggestion} automation={msg.automation} imagePreview={msg.imagePreview} imageAnalysis={msg.imageAnalysis} onShowAnalysis={onShowAnalysis} onShowSuggestion={onShowSuggestion} onShowAutomation={onShowAutomation} onShowImageAnalysis={onShowImageAnalysis} />
        ))}
        {isLoading && <LoadingIndicator />}
    </div>
));

const Message = ({ sender, text, analysis, suggestion, automation, imagePreview, imageAnalysis, onShowAnalysis, onShowSuggestion, onShowAutomation, onShowImageAnalysis }) => {
    const isUser = sender === 'user';
    const avatarContent = isUser ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M5.52 19c.64-2.2 1.84-4 3.22-5.26C10.1 12.58 12 12 12 12s1.9-.58 3.26-1.74c1.38-1.26 2.58-3.06 3.22-5.26" />
        </svg>
    ) : (
        <img src="https://github.com/TheRealFalseReality/aquapi/blob/main/assets/image/AquaPiLogo150px.png?raw=true" alt="AquaPi AI" className="w-5 h-5" />
    );
    const avatarBg = isUser ? 'bg-blue-500' : 'bg-[var(--accent-primary)]';
    const headerText = isUser ? <span className="font-semibold text-blue-600">You</span> : <span className="font-semibold text-[var(--text-dark)]">AquaPi AI</span>;
    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 ${avatarBg} flex items-center justify-center font-bold`}>{avatarContent}</div>
                <div>{headerText}</div>
            </div>
            <div className="ml-11">
                <div className="p-4 rounded-lg bg-white border border-[var(--border-color)] text-gray-700 leading-relaxed shadow-sm">
                    {imagePreview && <img src={imagePreview} alt="User upload" className="max-w-xs rounded-md mb-2" />}
                    <div dangerouslySetInnerHTML={isUser ? {__html: text.replace(/\n/g, '<br />')} : parseMarkdown(text)} />
                </div>
                {analysis && <button onClick={() => onShowAnalysis(analysis)} className="mt-2 px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors">View Analysis</button>}
                {suggestion && <button onClick={() => onShowSuggestion(suggestion)} className="mt-2 px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition-colors">View Response</button>}
                {automation && <button onClick={() => onShowAutomation(automation)} className="mt-2 px-3 py-1 text-xs font-semibold bg-pink-100 text-pink-800 rounded-md hover:bg-pink-200 transition-colors">View Script</button>}
                {imageAnalysis && <button onClick={() => onShowImageAnalysis(imageAnalysis)} className="mt-2 px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors">View Image Analysis</button>}
            </div>
        </div>
    );
};

const LoadingIndicator = () => (
    <div className="w-full">
        <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex-shrink-0 flex items-center justify-center font-bold">
                 <img src="https://github.com/TheRealFalseReality/aquapi/blob/main/assets/image/AquaPiLogo150px.png?raw=true" alt="AquaPi AI" className="w-5 h-5" />
            </div>
            <div className="font-semibold text-gray-600">AquaPi AI is thinking...</div>
        </div>
        <div className="ml-11 p-4 rounded-lg bg-gray-100 border border-gray-200">
            <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-hop-1"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-hop-2"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-hop-3"></div>
            </div>
        </div>
    </div>
);

const UserInput = ({ onSubmit, isLoading }) => {
    const [inputValue, setInputValue] = useState('');
    const handleSubmit = () => {
        if (inputValue.trim() && !isLoading) {
            onSubmit(inputValue);
            setInputValue('');
        }
    };
    return (
        <div className="relative">
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                disabled={isLoading}
                className="w-full p-4 pr-14 text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all disabled:opacity-50 shadow-sm"
                placeholder={isLoading ? "Please wait..." : "Ask AquaPi anything..."}
            />
            <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-[var(--accent-primary)] to-blue-500 text-white rounded-md shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transform transition-transform duration-150 active:scale-95 hover:scale-110"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
        </div>
    );
};

const PromptSuggestions = ({ setUiState, handleSuggestionClick, isLoading, isOpen, setIsOpen }) => {
    const questions = [
        { title: "What is AquaPi?", action: () => handleSuggestionClick("What is AquaPi?"), style: "bg-white/70 hover:bg-white" },
        { title: "Compare to Apex Neptune", icon: null, action: () => handleSuggestionClick("Compare AquaPi to Apex Neptune"), style: "bg-white/70 hover:bg-white" },
        { title: "What parameters can AquaPi monitor?", icon: null, action: () => handleSuggestionClick("What parameters can AquaPi monitor?"), style: "bg-white/70 hover:bg-white" },
        { title: "Can I use my own sensors?", icon: null, action: () => handleSuggestionClick("Can I use my own sensors?"), style: "bg-white/70 hover:bg-white" },
    ];
    const aiActions = [
        { title: "AI Water Analysis", icon: '✨', action: () => { setUiState('analysis'); setIsOpen(false); }, style: "bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white" },
        { title: "AI Script Generator", icon: '⚡', action: () => { setUiState('automation'); setIsOpen(false); }, style: "bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white" },
        { title: "AI Image Analysis", icon: '📷', action: () => { setUiState('imageAnalysis'); setIsOpen(false); }, style: "bg-gradient-to-r from-green-400 to-teal-400 hover:from-green-500 hover:to-teal-500 text-white" }
    ];

    const renderButton = ({ title, icon, action, style }) => (
        <button key={title} onClick={action} disabled={isLoading} className={`p-3 border border-[var(--border-color)] rounded-lg transition-all duration-200 flex items-center justify-center gap-3 text-gray-700 shadow-sm ${style} disabled:opacity-50 disabled:cursor-not-allowed`}>
            {icon && <span className="text-lg">{icon}</span>}
            <span className="text-sm font-semibold text-center">{title}</span>
        </button>
    );

    return (
        <div className="mb-3">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-sm text-gray-500 hover:text-gray-800 mb-2 p-1">
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path d="M12 10h-2v2"/></svg>
                    <span className="font-semibold">Ask, Analyze, and Automate</span>
                </div>
                <div className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <div className="flex flex-col gap-3 pt-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{questions.map(q => renderButton(q))}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">{aiActions.map(a => renderButton(a))}</div>
                </div>
            </div>
        </div>
    );
};

// ModalFormWrapper Component
const ModalFormWrapper = ({ children, title, onClose }) => (
    <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
        <div
            className="w-full max-w-lg bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-xl shadow-2xl p-6 m-4 text-gray-800"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--text-dark)]">{title}</h4>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            {children}
        </div>
    </div>
);

// AnalysisForm Component
const AnalysisForm = ({ onSubmit, setUiState }) => {
    const [params, setParams] = useState({ tankType: '', ph: '', temp: '', salinity: '', additionalInfo: '', tempUnit: 'F', salinityUnit: 'ppt' });
    const handleChange = (e) => setParams({ ...params, [e.target.name]: e.target.value });
    const handleTempUnitToggle = (e) => setParams({ ...params, tempUnit: e.target.checked ? 'F' : 'C' });
    const handleSalinityUnitToggle = (e) => setParams({ ...params, salinityUnit: e.target.checked ? 'SG' : 'ppt' });
    const handleSubmit = () => {
        if (!params.tankType || !params.temp) { alert("Please fill in Tank Type and Temperature."); return; }
        onSubmit(params);
    };
    return (
        <ModalFormWrapper title="Analyze Water Parameters" onClose={() => setUiState('chat')}>
            <div className="space-y-4">
                <input name="tankType" value={params.tankType} onChange={handleChange} className="w-full p-2 bg-white border border-[var(--border-color)] rounded-lg text-gray-800 placeholder-gray-400" placeholder="e.g., Freshwater Community, Reef Tank" />
                <div className="flex gap-4 items-center">
                    <input name="temp" value={params.temp} onChange={handleChange} className="w-full p-2 bg-white border border-[var(--border-color)] rounded-lg text-gray-800 placeholder-gray-400" placeholder={`Temperature`} />
                    <ToggleSwitch id="temp-unit" checked={params.tempUnit === 'F'} onChange={handleTempUnitToggle} labelOn="°F" labelOff="°C" />
                </div>
                <input name="ph" value={params.ph} onChange={handleChange} className="w-full p-2 bg-white border border-[var(--border-color)] rounded-lg text-gray-800 placeholder-gray-400" placeholder="pH value (optional)" />
                <div className="flex gap-4 items-center">
                    <input name="salinity" value={params.salinity} onChange={handleChange} className="w-full p-2 bg-white border border-[var(--border-color)] rounded-lg text-gray-800 placeholder-gray-400" placeholder={`Salinity (optional)`} />
                    <ToggleSwitch id="salinity-unit" checked={params.salinityUnit === 'SG'} onChange={handleSalinityUnitToggle} labelOn="SG" labelOff="ppt" />
                </div>
                <textarea name="additionalInfo" value={params.additionalInfo} onChange={handleChange} className="w-full p-2 bg-white border border-[var(--border-color)] rounded-lg resize-none text-gray-800 placeholder-gray-400" rows="3" placeholder="Any other details about your tank?"></textarea>
                <button onClick={handleSubmit} className="w-full p-3 font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg hover:opacity-90 shadow">Submit for Analysis</button>
            </div>
        </ModalFormWrapper>
    );
};

// AutomationForm Component
const AutomationForm = ({ onSubmit, setUiState }) => {
    const [description, setDescription] = useState('');
    const handleSubmit = () => {
        if (!description.trim()) { alert("Please describe the automation."); return; }
        onSubmit(description);
    };
    return (
        <ModalFormWrapper title="Automation Script Generator" onClose={() => setUiState('chat')}>
            <div className="space-y-4">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 bg-white border border-[var(--border-color)] rounded-lg resize-none text-gray-800 placeholder-gray-400" rows="5" placeholder="Describe the automation... e.g., 'turn on a pump for 30 seconds every 24 hours'"></textarea>
                <button onClick={handleSubmit} className="w-full p-3 font-semibold bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-lg hover:opacity-90 shadow">Generate Script</button>
            </div>
        </ModalFormWrapper>
    );
};

// ToggleSwitch Component
const ToggleSwitch = ({ id, checked, onChange, labelOn, labelOff }) => (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer bg-gray-200 rounded-full p-1">
        <input type="checkbox" id={id} className="sr-only" checked={checked} onChange={onChange} />
        <span className={`px-2 py-0.5 text-xs font-bold rounded-full transition-colors ${!checked ? 'bg-blue-500 text-white' : 'text-gray-500'}`}>{labelOff}</span>
        <span className={`px-2 py-0.5 text-xs font-bold rounded-full transition-colors ${checked ? 'bg-blue-500 text-white' : 'text-gray-500'}`}>{labelOn}</span>
    </label>
);

// AnalysisOverlay Component
const AnalysisOverlay = ({ data, onClose }) => {
    if (!data) return null;
    const { summary, parameters, howAquaPiHelps } = data;
    const statusStyles = {
        "Good": { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
        "Needs Attention": { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
        "Bad": { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
    };
    const summaryStyle = (summary && statusStyles[summary.status]) || statusStyles["Needs Attention"];
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="relative w-full max-w-4xl bg-white border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="sticky top-4 right-4 float-right text-gray-400 hover:text-gray-800 bg-gray-100 rounded-full p-2 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div className="p-8">
                    {summary && (
                        <div className={`p-6 rounded-lg mb-8 text-center ${summaryStyle.bg} border ${summaryStyle.border}`}>
                            <div className={`text-4xl font-bold ${summaryStyle.color} mb-2`}>{summary.status}</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{summary.title}</h2>
                            <p className="text-gray-600">{summary.message}</p>
                        </div>
                    )}
                    {parameters && (
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            {parameters.map(param => {
                                const paramStyle = (param && statusStyles[param.status]) || statusStyles["Needs Attention"];
                                return (
                                    <div key={param.name} className={`p-4 rounded-lg ${paramStyle.bg} border ${paramStyle.border}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-gray-800">{param.name}</h3>
                                            <span className={`font-bold ${paramStyle.color}`}>{param.value}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2">Ideal: {param.idealRange}</p>
                                        <p className="text-sm text-gray-700">{param.advice}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {howAquaPiHelps && (
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">How AquaPi Can Help</h3>
                            <div className="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={parseMarkdown(howAquaPiHelps)} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// SuggestionOverlay Component
const SuggestionOverlay = ({ data, onClose, onFollowUp }) => {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="relative w-full max-w-4xl bg-white border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="sticky top-4 right-4 float-right text-gray-400 hover:text-gray-800 bg-gray-100 rounded-full p-2 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{data.title}</h2>
                    <div className="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={parseMarkdown(data.content)} />
                    {data.followUps && data.followUps.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Suggested Follow-ups:</h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                {data.followUps.map((followUp, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            onClose();
                                            onFollowUp(followUp);
                                        }}
                                        className="p-3 border border-gray-200 rounded-lg transition-all duration-200 flex-1 text-center bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold"
                                    >
                                        {followUp}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// AutomationOverlay Component
const AutomationOverlay = ({ data, onClose }) => {
    const [copySuccess, setCopySuccess] = useState('');

    const copyToClipboard = () => {
        const textArea = document.createElement("textarea");
        textArea.value = data.code;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            setCopySuccess('Failed to copy');
        }
        document.body.removeChild(textArea);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="relative w-full max-w-4xl bg-white border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="sticky top-4 right-4 float-right text-gray-400 hover:text-gray-800 bg-gray-100 rounded-full p-2 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{data.title}</h2>
                    <div className="relative mb-6">
                        <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto whitespace-pre-wrap text-gray-800">
                            <code>{data.code}</code>
                        </pre>
                        <button onClick={copyToClipboard} className="absolute top-2 right-2 bg-gray-200 text-gray-700 px-3 py-1 text-xs font-semibold rounded-md hover:bg-gray-300 transition-colors">
                            {copySuccess || 'Copy Code'}
                        </button>
                    </div>
                    <div className="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={parseMarkdown(data.explanation)} />
                </div>
            </div>
        </div>
    );
};

// ImageAnalysisForm Component
const ImageAnalysisForm = ({ onSubmit, setUiState }) => {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState({ preview: '', data: null, mimeType: '' });
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage({
                    preview: reader.result,
                    data: reader.result.split(',')[1],
                    mimeType: file.type
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!image.data) {
            alert("Please provide an image.");
            return;
        }
        const finalPrompt = prompt.trim() || "What kind of fish is this?";
        onSubmit({ prompt: finalPrompt, base64ImageData: image.data, mimeType: image.mimeType, previewUrl: image.preview });
    };

    return (
        <ModalFormWrapper title="AI Image Analysis" onClose={() => setUiState('chat')}>
            <div className="space-y-4">
                <div
                    className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer"
                    onClick={() => fileInputRef.current.click()}
                >
                    {image.preview ? (
                        <img src={image.preview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                    ) : (
                        <div className="text-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            <span>Click to upload an image</span>
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/png, image/jpeg"
                    className="hidden"
                />
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-2 bg-white border border-[var(--border-color)] rounded-lg resize-none text-gray-800 placeholder-gray-400"
                    rows="3"
                    placeholder="Ask a question about the image... (optional)"
                />
                <button onClick={handleSubmit} className="w-full p-3 font-semibold bg-gradient-to-r from-green-400 to-teal-400 text-white rounded-lg hover:opacity-90 shadow">Submit for Analysis</button>
            </div>
        </ModalFormWrapper>
    );
};

// ImageAnalysisOverlay Component
const ImageAnalysisOverlay = ({ data, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="relative w-full max-w-4xl bg-white border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="sticky top-4 right-4 float-right text-gray-400 hover:text-gray-800 bg-gray-100 rounded-full p-2 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{data.title}</h2>
                    <img src={data.image} alt="Analyzed image" className="w-full max-w-md mx-auto rounded-lg mb-6" />
                    <div className="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={parseMarkdown(data.content)} />
                </div>
            </div>
        </div>
    );
};

export default App;