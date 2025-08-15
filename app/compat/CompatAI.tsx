import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import fishData from '../compat/fishcompat.json';

export function meta() {
  return [
    { title: "AI Compatibility Calculator | AquaPi AI" },
    { name: "description", content: "Get an AI-powered compatibility report for your aquarium fish." },
  ];
}

// Main App component
export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("freshwater");
  const [selectedFish, setSelectedFish] = useState<any[]>([]);
  const [report, setReport] = useState<any | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [localFishData, setLocalFishData] = useState<any>(null);

  // Load fish data from the local JSON file on component mount
  useEffect(() => {
    try {
      setLocalFishData(fishData);
    } catch (e: any) {
      setError(`Failed to fetch fish data: ${e.message}`);
      console.error("Failed to fetch fish data:", e);
    } finally {
      setLoadingData(false);
    }
  }, []);

  // --- START: Compatibility Calculation Logic ---

  /**
   * Determines the compatibility probability between two fish.
   * @param {object} fishA - The first fish object.
   * @param {object} fishB - The second fish object.
   * @returns {number} 1.0 for compatible, 0.5 for caution, 0 for not compatible.
   */
  const getPairwiseProbability = (fishA: any, fishB: any) => {
    if (fishA.compatible.includes(fishB.name) && fishB.compatible.includes(fishA.name)) {
      return 1.0;
    }
    if (fishA.notCompatible.includes(fishB.name) || fishB.notCompatible.includes(fishA.name)) {
      return 0.0;
    }
    if (fishA.withCaution.includes(fishB.name) || fishB.withCaution.includes(fishA.name)) {
      return 0.5;
    }
    // Default case if no specific rule is found
    return 0.5;
  };

  /**
   * Calculates the Conflict Risk and Group Harmony scores for a list of fish.
   * @param {Array<object>} fishList - The list of selected fish.
   * @returns {object} An object containing the scores and the math breakdown.
   */
  const calculateScores = (fishList: any[]) => {
    if (fishList.length < 2) {
      return {
        conflictRisk: 1.0,
        groupHarmony: 1.0,
        mathBreakdown: { pairs: [], harmonyEquation: "100%", conflictEquation: "100%" }
      };
    }

    let conflictRisk = 1.0;
    let groupHarmony = 1.0;
    const pairs: any[] = [];
    const harmonyTerms: string[] = [];

    for (let i = 0; i < fishList.length; i++) {
      for (let j = i + 1; j < fishList.length; j++) {
        const prob = getPairwiseProbability(fishList[i], fishList[j]);
        pairs.push({
          fishA: fishList[i].name,
          fishB: fishList[j].name,
          prob: prob
        });
        if (prob < conflictRisk) {
          conflictRisk = prob;
        }
        groupHarmony *= prob;
        harmonyTerms.push(`${(prob * 100)}%`);
      }
    }

    const harmonyEquation = harmonyTerms.join(' × ') + ` = ${(groupHarmony * 100).toFixed(1)}%`;
    const conflictEquation = `min(${harmonyTerms.join(', ')}) = ${(conflictRisk * 100).toFixed(1)}%`;

    return {
      conflictRisk,
      groupHarmony,
      mathBreakdown: { pairs, harmonyEquation, conflictEquation }
    };
  };

  // --- END: Compatibility Calculation Logic ---

  const getCompatibilityReport = async () => {
    if (selectedFish.length === 0) return;

    setLoadingReport(true);
    setReport(null);
    setError(null);

    const currentSelectedFish = [...selectedFish];

    // Calculate scores and math breakdown locally
    const { conflictRisk, groupHarmony, mathBreakdown } = calculateScores(currentSelectedFish);

    try {
      // Construct the prompt for the AI
      const prompt = `
        You are an aquarium expert. A user has selected a group of fish. Your task is to generate a tailored care guide and compatibility summary. Do not mention the scores in your summary, just provide the requested information.

        Selected Fish: ${currentSelectedFish.map(f => f.name).join(', ')}
        Fish Type: ${selectedCategory}
        Group Harmony Score: ${(groupHarmony * 100).toFixed(1)}%
        Conflict Risk Score: ${(conflictRisk * 100).toFixed(1)}%

        Please provide a JSON object with the following:
        1.  "groupHarmonyScoreExplanation": A brief, user-friendly explanation of the Group Harmony Score. Explain that it's calculated by multiplying the compatibility of all possible pairs, so a low score indicates multiple potential issues.
        2.  "conflictRiskScoreExplanation": A brief, user-friendly explanation of the Conflict Risk Score. Explain that this score represents the "weakest link" or the single most problematic pairing in the group.
        3.  "detailedSummary": A detailed summary of the potential interactions in this specific group of fish.
        4.  "tankSize": A recommended minimum tank size.
        5.  "decorations": Recommended decorations and setup.
        6.  "careGuide": A general care guide for this group.
        7.  "compatibleFish": A list of other fish that are compatible with ALL selected fish.
        `;

      // Define the structured JSON response schema
      const payload = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            "type": "OBJECT",
            "properties": {
              "groupHarmonyScoreExplanation": { "type": "STRING" },
              "conflictRiskScoreExplanation": { "type": "STRING" },
              "detailedSummary": { "type": "STRING" },
              "tankSize": { "type": "STRING" },
              "decorations": { "type": "STRING" },
              "careGuide": { "type": "STRING" },
              "compatibleFish": {
                "type": "ARRAY",
                "items": {
                  "type": "OBJECT",
                  "properties": { "name": { "type": "STRING" } },
                  "required": ["name"]
                }
              }
            },
            "required": ["groupHarmonyScoreExplanation", "conflictRiskScoreExplanation", "detailedSummary", "tankSize", "decorations", "careGuide", "compatibleFish"]
          }
        }
      };
      
      const apiKey = process.env.GEMINI_API_KEY; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      let response;
      let result;
      const MAX_RETRIES = 5;
      let attempt = 0;
      let delay = 1000; // 1 second

      while (attempt < MAX_RETRIES) {
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (response.status === 429) {
            console.warn(`Attempt ${attempt + 1}: API rate limit exceeded. Retrying in ${delay / 1000}s.`);
            await new Promise(res => setTimeout(res, delay));
            delay *= 2; // Exponential backoff
            attempt++;
            continue;
          }

          if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
          }

          result = await response.json();
          break; // Success, exit the loop
        } catch (e: any) {
           if (attempt >= MAX_RETRIES - 1) {
             setError(`Failed to fetch: ${e.message}. Please try again.`);
             setLoadingReport(false);
             return;
           }
           attempt++;
        }
      }

      if (response && response.ok) {
        if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
          const jsonString = result.candidates[0].content.parts[0].text;
          const parsedJson = JSON.parse(jsonString);

          // Combine local calculations with AI response
          const finalReport = {
            ...parsedJson,
            groupHarmonyScore: groupHarmony,
            conflictRiskScore: conflictRisk,
            math: mathBreakdown
          };

          setReport(finalReport);
          setShowReport(true);
        } else {
          setError("Unexpected API response format.");
        }
      } else {
        setError("API call failed after several retries.");
      }

    } catch (e: any) {
      setError(`An error occurred: ${e.message}`);
      console.error(e);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleFishClick = (fish: any) => {
    const isSelected = selectedFish.some(f => f.name === fish.name);
    if (isSelected) {
      setSelectedFish(selectedFish.filter(f => f.name !== fish.name));
    } else {
      setSelectedFish([...selectedFish, fish]);
    }
    setReport(null);
    setShowReport(false);
  };

  const handleClearSelection = () => {
    setSelectedFish([]);
    setReport(null);
    setShowReport(false);
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#0f1623] text-[#D8f3ff] flex items-center justify-center p-4 font-sans antialiased">
        <div className="text-center">
          <div className="animate-spin inline-block w-16 h-16 border-4 border-[#81B2E8] border-t-transparent rounded-full"></div>
          <p className="mt-4 text-xl text-[#D8f3ff]">Loading fish data...</p>
        </div>
      </div>
    );
  }

  if (error && !localFishData) {
    return (
      <div className="min-h-screen bg-[#0f1623] text-[#D8f3ff] flex items-center justify-center p-4 font-sans antialiased">
        <div className="text-center p-8 bg-[#75344E] text-[#D8f3ff] rounded-lg shadow-inner max-w-md">
          <p className="font-bold text-xl">Error:</p>
          <p className="mt-2">{error}</p>
          <p className="mt-4">Please check your internet connection and try reloading the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1623] text-[#D8f3ff] font-sans antialiased">
        <div className="sticky top-0 z-50 bg-[#0f1623]/80 backdrop-blur-sm shadow-md">
            <nav className="container mx-auto px-6 lg:px-10 py-3 text-sm text-gray-400">
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
                <span className="mx-2">&gt;</span>
                <span className="text-white">AI Compatibility Calculator</span>
            </nav>
        </div>
        <div className="p-4 sm:p-8 pb-24">
            <header className="text-center mb-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#D8f3ff] drop-shadow-md">AI Compatibility Calculator</h1>
                <p className="mt-2 text-lg sm:text-xl text-[#D8f3ff]">Select fish to get a compatibility report.</p>
            </header>

            <div className="flex justify-center space-x-4 mb-6">
                <button
                onClick={() => { setSelectedCategory("freshwater"); handleClearSelection(); }}
                disabled={loadingReport}
                className={`px-6 py-3 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === "freshwater"
                    ? "bg-[#81B2E8] text-[#0f1623] shadow-lg"
                    : "bg-[#2c3e50] text-[#a7c0d1] hover:bg-[#497eb0] hover:text-white"
                } ${loadingReport ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                Freshwater 🐟
                </button>
                <button
                onClick={() => { setSelectedCategory("marine"); handleClearSelection(); }}
                disabled={loadingReport}
                className={`px-6 py-3 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === "marine"
                    ? "bg-[#81B2E8] text-[#0f1623] shadow-lg"
                    : "bg-[#2c3e50] text-[#a7c0d1] hover:bg-[#497eb0] hover:text-white"
                } ${loadingReport ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                Saltwater 🐡
                </button>
            </div>

            <main className="max-w-7xl mx-auto bg-[#497eb0] rounded-3xl p-4 sm:p-8 shadow-2xl">
                {report && !showReport && (
                <div className="fixed top-4 right-4 z-50">
                    <button
                    onClick={() => setShowReport(true)}
                    disabled={loadingReport}
                    className={`flex items-center justify-center px-6 py-3 bg-[#75344E]/60 backdrop-blur-sm hover:bg-[#75344E] text-[#D8f3ff] font-bold text-lg rounded-full shadow-lg transition-colors duration-300 transform hover:scale-105 ${loadingReport ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Show Last Report
                    </button>
                </div>
                )}

                <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-[#E19F20]">
                    Choose your {selectedCategory} fish:
                </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
                {localFishData[selectedCategory].map((fish: any) => (
                    <div
                    key={fish.name}
                    onClick={() => !loadingReport && handleFishClick(fish)}
                    className={`flex flex-col rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                        selectedFish.some(f => f.name === fish.name)
                        ? "bg-[#75344E] ring-4 ring-[#E19F20]"
                        : "bg-[#0f1623] hover:bg-[#497eb0]"
                    } ${loadingReport ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    >
                    <img
                        src={fish.imageURL}
                        alt={fish.name}
                        className="w-full h-20 sm:h-24 md:h-32 object-cover rounded-t-xl"
                        onError={(e: any) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/400x200/4B5563/F9FAFB?text=No+Image";
                        }}
                    />
                    <div className="p-2 flex-grow flex flex-col justify-center">
                        <p className="text-base sm:text-lg font-semibold text-center text-[#D8f3ff]">{fish.name}</p>
                        <p className="text-xs sm:text-sm text-[#D8f3ff] italic text-center">{fish.latinName}</p>
                    </div>
                    </div>
                ))}
                </div>
            </main>
        </div>

        {/* Floating Action Bar */}
        {selectedFish.length > 0 && (
            <div className="fixed inset-x-0 bottom-0 z-50 p-4">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4">
                    {/* Action Buttons */}
                    <div className="flex items-center justify-center gap-4 w-full sm:w-auto order-2 sm:order-1">
                        <button
                            onClick={getCompatibilityReport}
                            disabled={loadingReport}
                            className="w-full sm:w-auto px-6 py-3 bg-[#E19F20]/60 backdrop-blur-sm text-[#0f1623] font-bold text-lg rounded-full shadow-lg hover:bg-[#E19F20] transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {loadingReport ? "Generating..." : `Get Report`}
                        </button>
                        <button
                            onClick={handleClearSelection}
                            disabled={loadingReport}
                            className="w-full sm:w-auto px-6 py-3 bg-[#75344E]/60 backdrop-blur-sm text-[#D8f3ff] font-bold text-lg rounded-full shadow-lg hover:bg-[#75344E] transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Clear
                        </button>
                    </div>

                    {/* Selected Fish Tray */}
                    <div className="flex items-center gap-2 p-2 bg-black/40 backdrop-blur-md rounded-full shadow-lg order-1 sm:order-2 flex-wrap justify-center">
                        {selectedFish.map((fish, index) => (
                            <img
                                key={index}
                                src={fish.imageURL}
                                alt={fish.name}
                                title={fish.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-[#81B2E8] transition-all duration-300 ease-in-out transform hover:scale-110"
                                onError={(e: any) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://placehold.co/64x64/4B5563/F9FAFB?text=No+Image";
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        )}

        {showReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1623] bg-opacity-75 p-4 animate-fade-in">
            <div className="relative w-full max-w-7xl max-h-[95vh] bg-[#497eb0] rounded-3xl shadow-2xl flex flex-col">
                <div className="relative flex-shrink-0 px-6 py-4 text-center z-10 border-b border-[#D8f3ff]">
                <h3 className="text-3xl md:text-4xl font-extrabold text-[#E19F20]">
                    Compatibility Report
                </h3>
                <p className="mt-2 text-lg md:text-xl text-[#D8f3ff] italic">
                    {selectedFish.map(f => f.name).join(', ')}
                </p>
                <button
                    onClick={() => setShowReport(false)}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 text-[#D8f3ff] hover:text-[#E19F20] transition-colors duration-200 p-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                </div>

                <div className="overflow-y-auto p-6 sm:p-8">
                {error && (
                    <div className="text-center p-4 mb-4 bg-[#75344E] text-[#D8f3ff] rounded-lg shadow-inner">
                    <p className="font-bold">Error:</p>
                    <p>{error}</p>
                    </div>
                )}

                {loadingReport && (
                    <div className="text-center p-8">
                    <div className="animate-spin inline-block w-12 h-12 border-4 border-[#E19F20] border-t-transparent rounded-full"></div>
                    <p className="mt-4 text-lg text-[#E19F20]">Fetching report, please wait...</p>
                    </div>
                )}

                {report && (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-[#0f1623] p-6 rounded-2xl text-center">
                        <h4 className="text-2xl font-bold text-[#E19F20] mb-2">Group Harmony</h4>
                        <p className="text-5xl md:text-6xl font-bold text-[#81B2E8] mb-4">{(report.groupHarmonyScore * 100).toFixed(1)}%</p>
                        <p className="text-sm text-[#D8f3ff] mt-2">{report.groupHarmonyScoreExplanation}</p>
                        </div>
                        <div className="bg-[#0f1623] p-6 rounded-2xl text-center">
                        <h4 className="text-2xl font-bold text-[#E19F20] mb-2">Conflict Risk</h4>
                        <p className="text-5xl md:text-6xl font-bold text-[#75344E] mb-4">{(report.conflictRiskScore * 100).toFixed(1)}%</p>
                        <p className="text-sm text-[#D8f3ff] mt-2">{report.conflictRiskScoreExplanation}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="border-t-2 border-[#D8f3ff] pt-6">
                        <h4 className="text-2xl font-bold text-[#E19F20] mb-2">Detailed Summary</h4>
                        <p className="text-lg leading-relaxed text-[#D8f3ff]">{report.detailedSummary}</p>
                        </div>

                        {report.tankSize && (
                        <div className="border-t-2 border-[#D8f3ff] pt-6">
                            <h4 className="text-2xl font-bold text-[#E19F20] mb-2">Recommended Tank Size</h4>
                            <p className="text-lg leading-relaxed text-[#D8f3ff]">{report.tankSize}</p>
                        </div>
                        )}

                        {report.decorations && (
                        <div className="border-t-2 border-[#D8f3ff] pt-6">
                            <h4 className="text-2xl font-bold text-[#E19F20] mb-2">Decorations and Setup</h4>
                            <p className="text-lg leading-relaxed text-[#D8f3ff]">{report.decorations}</p>
                        </div>
                        )}

                        {report.careGuide && (
                        <div className="border-t-2 border-[#D8f3ff] pt-6">
                            <h4 className="text-2xl font-bold text-[#E19F20] mb-2">Care Guide</h4>
                            <p className="text-lg leading-relaxed text-[#D8f3ff]">{report.careGuide}</p>
                        </div>
                        )}

                        {report.compatibleFish && report.compatibleFish.length > 0 && (
                        <div className="border-t-2 border-[#D8f3ff] pt-6">
                            <h4 className="text-2xl font-bold text-[#E19F20] mb-4">Compatible Tank Mates</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {report.compatibleFish.map((fish: any, index: number) => {
                                const compatibleFishData = localFishData[selectedCategory].find((f: any) => f.name === fish.name);
                                return (
                                    <div key={index} className="flex flex-col items-center p-3 bg-[#0f1623] rounded-lg shadow-md transition-transform duration-200 hover:scale-105">
                                    <img
                                        src={compatibleFishData ? compatibleFishData.imageURL : "https://placehold.co/64x64/4B5563/F9FAFB?text=No+Image"}
                                        alt={fish.name}
                                        className="w-16 h-16 rounded-full border-2 border-[#D8f3ff] object-cover"
                                        onError={(e: any) => { e.target.onerror = null; e.target.src = "https://placehold.co/64x64/4B5563/F9FAFB?text=No+Image"; }}
                                    />
                                    <span className="mt-2 text-sm font-medium text-center text-[#D8f3ff]">{fish.name}</span>
                                    </div>
                                );
                            })}
                            </div>
                        </div>
                        )}

                        {report.math && report.math.pairs.length > 0 && (
                        <div className="border-t-2 border-[#D8f3ff] pt-6">
                            <h4 className="text-2xl font-bold text-[#E19F20] mb-4">Calculation Breakdown</h4>
                            <div className="bg-[#0f1623] p-4 sm:p-6 rounded-2xl space-y-4">
                            <div>
                                <h5 className="font-semibold text-lg text-[#81B2E8]">Pairwise Compatibility:</h5>
                                <ul className="list-disc list-inside text-[#D8f3ff]">
                                {report.math.pairs.map((p: any, i: number) => (
                                    <li key={i}>{p.fishA} & {p.fishB}: <span className="font-mono">{(p.prob * 100)}%</span></li>
                                ))}
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-semibold text-lg text-[#81B2E8]">Group Harmony Score:</h5>
                                <p className="text-[#D8f3ff] font-mono text-sm break-words">{report.math.harmonyEquation}</p>
                            </div>
                            <div>
                                <h5 className="font-semibold text-lg text-[#81B2E8]">Conflict Risk Score:</h5>
                                <p className="text-[#D8f3ff] font-mono text-sm break-words">{report.math.conflictEquation}</p>
                            </div>
                            </div>
                        </div>
                        )}
                    </div>
                    </>
                )}
                </div>
            </div>
            </div>
        )}
        <footer className="text-center p-8 text-gray-500 text-sm">
            <p className="max-w-3xl mx-auto">
                This AI-powered tool helps you check the compatibility of freshwater and marine aquarium inhabitants. Select the fish you're interested in, and click "Get Report" to receive a detailed analysis, including recommended tank size, decorations, care guides, and potential conflict risks.
            </p>
        </footer>
    </div>
  );
}
