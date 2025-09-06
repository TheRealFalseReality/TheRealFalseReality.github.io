import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import fishData from '../compat/fishcompat.json';

export function meta() {
  return [
    { title: "AI Compatibility Calculator | AquaPi AI" },
    { name: "description", content: "Get an AI-powered compatibility report for your aquarium fish." },
  ];
}

const UpArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
    </svg>
);

interface AlphabetScrollerProps {
  letters: string[];
  onLetterClick: (letter: string) => void;
  onScrollToTop: () => void;
}

const AlphabetScroller = ({ letters, onLetterClick, onScrollToTop }: AlphabetScrollerProps) => {
    return (
        <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-40 flex flex-col items-center bg-white/50 dark:bg-black/20 p-2 rounded-l-lg backdrop-blur-sm h-auto max-h-[80vh] justify-around">
            <button
                onClick={onScrollToTop}
                className="text-[var(--text-dark)] text-xs font-bold p-1 w-6 h-6 flex items-center justify-center bg-black/10 hover:bg-[var(--accent-primary)] hover:text-white rounded-full transition-colors duration-200 mb-1"
                title="Scroll to Top"
            >
                <UpArrowIcon />
            </button>
            {letters.map(letter => (
                <button
                    key={letter}
                    onClick={() => onLetterClick(letter)}
                    className="text-[var(--text-dark)] text-xs font-bold p-1 w-6 h-6 flex items-center justify-center bg-black/10 hover:bg-[var(--accent-primary)] hover:text-white rounded-full transition-colors duration-200"
                >
                    {letter}
                </button>
            ))}
        </div>
    );
};


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
  const letterRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const abortControllerRef = useRef<AbortController | null>(null);


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

  const getWeightedScore = (score: number) => {
    const randomFactor = Math.random() * 0.1 - 0.05; // -0.05 to 0.05
    return Math.max(0, Math.min(1, score + randomFactor));
  };

  const getPairwiseProbability = (fishA: any, fishB: any) => {
    if (fishA.compatible.includes(fishB.name) && fishB.compatible.includes(fishA.name)) {
      return getWeightedScore(1.0);
    }
    if (fishA.notCompatible.includes(fishB.name) || fishB.notCompatible.includes(fishA.name)) {
      return getWeightedScore(0.0);
    }
    if (fishA.notRecommended.includes(fishB.name) || fishB.notRecommended.includes(fishA.name)) {
        return getWeightedScore(0.25);
    }
    if (fishA.withCaution.includes(fishB.name) || fishB.withCaution.includes(fishA.name)) {
      return getWeightedScore(0.75);
    }
    return getWeightedScore(0.5);
  };

  const calculateScores = (fishList: any[]) => {
    if (fishList.length === 0) {
      return {
        groupHarmony: 1.0,
        mathBreakdown: { pairs: [], harmonyEquation: "100%" }
      };
    }

    let minProb = 1.0;
    const pairs: any[] = [];
    const harmonyTerms: string[] = [];

    if (fishList.length === 1) {
      const fish = fishList[0];
      const prob = getPairwiseProbability(fish, fish);
      pairs.push({ fishA: fish.name, fishB: fish.name, prob });
      minProb = prob;
      harmonyTerms.push(`${(prob * 100).toFixed(1)}%`);
    } else {
      for (let i = 0; i < fishList.length; i++) {
        for (let j = i + 1; j < fishList.length; j++) {
          const prob = getPairwiseProbability(fishList[i], fishList[j]);
          pairs.push({ fishA: fishList[i].name, fishB: fishList[j].name, prob });
          if (prob < minProb) minProb = prob;
          harmonyTerms.push(`${(prob * 100).toFixed(1)}%`);
        }
      }
    }

    const groupHarmony = minProb;
    const harmonyEquation = `min(${harmonyTerms.join(', ') || '100%'}) = ${(groupHarmony * 100).toFixed(1)}%`;

    return {
      groupHarmony,
      mathBreakdown: { pairs, harmonyEquation }
    };
  };

  const getHarmonyColor = (score: number) => {
    if (score >= 0.75) return 'text-green-500';
    if (score >= 0.5) return 'text-yellow-500';
    if (score >= 0.25) return 'text-orange-500';
    return 'text-red-500';
  };

  // --- END: Compatibility Calculation Logic ---

  const getCompatibilityReport = async () => {
    if (selectedFish.length === 0) return;

    setLoadingReport(true);
    setReport(null);
    setError(null);

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const currentSelectedFish = [...selectedFish];
    const { groupHarmony, mathBreakdown } = calculateScores(currentSelectedFish);

    try {
      const prompt = `
        You are an aquarium expert. A user has selected a group of fish. Your task is to generate a tailored care guide and compatibility summary.
        Selected Fish: ${currentSelectedFish.map(f => f.name).join(', ')}
        Fish Type: ${selectedCategory}
        Group Harmony Score: ${(groupHarmony * 100).toFixed(0)}%
        Please provide a JSON object with the following:
        1. "harmonyLabel": "Based on the Group Harmony Score of ${(groupHarmony * 100).toFixed(0)}%, provide a one-word label (e.g., Excellent, Good, Fair, Poor).",
        2. "harmonySummary": "Based on the Group Harmony Score of ${(groupHarmony * 100).toFixed(0)}%, write a brief summary of the overall compatibility of this group.",
        3. "detailedSummary": A detailed summary of the potential interactions in this specific group of fish.
        4. "tankSize": A recommended minimum tank size.
        5. "decorations": Recommended decorations and setup.
        6. "careGuide": A general care guide for this group.
        7. "compatibleFish": A list of other fish that are compatible with ALL selected fish.
        `;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            "type": "OBJECT",
            "properties": {
              "harmonyLabel": { "type": "STRING" },
              "harmonySummary": { "type": "STRING" },
              "detailedSummary": { "type": "STRING" },
              "tankSize": { "type": "STRING" },
              "decorations": { "type": "STRING" },
              "careGuide": { "type": "STRING" },
              "compatibleFish": { "type": "ARRAY", "items": { "type": "OBJECT", "properties": { "name": { "type": "STRING" } }, "required": ["name"] } }
            },
            "required": ["harmonyLabel", "harmonySummary", "detailedSummary", "tankSize", "decorations", "careGuide", "compatibleFish"]
          }
        }
      };
      
      const apiKey = process.env.GEMINI_API_KEY; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      let response;
      let result;
      const MAX_RETRIES = 5;
      let attempt = 0;
      let delay = 1000;

      while (attempt < MAX_RETRIES) {
        try {
          response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal });
          if (response.status === 429) {
            await new Promise(res => setTimeout(res, delay));
            delay *= 2;
            attempt++;
            continue;
          }
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          result = await response.json();
          break;
        } catch (e: any) {
           if (e.name === 'AbortError') return;
           if (attempt >= MAX_RETRIES - 1) {
             setError(`Failed to fetch: ${e.message}. Please try again.`);
             setLoadingReport(false);
             return;
           }
           attempt++;
        }
      }

      if (response && response.ok) {
        if (result.candidates?.[0]?.content?.parts?.[0]) {
          const parsedJson = JSON.parse(result.candidates[0].content.parts[0].text);
          const finalReport = { ...parsedJson, groupHarmonyScore: groupHarmony, math: mathBreakdown };
          setReport(finalReport);
          setShowReport(true);
        } else {
          setError("Unexpected API response format.");
        }
      } else {
        setError("API call failed after several retries.");
      }

    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setError(`An error occurred: ${e.message}`);
        console.error(e);
      }
    } finally {
      setLoadingReport(false);
    }
  };

  const handleCancelReport = () => {
    abortControllerRef.current?.abort();
    setLoadingReport(false);
  };

  const handleFishClick = (fish: any) => {
    setSelectedFish(prev => prev.some(f => f.name === fish.name) ? prev.filter(f => f.name !== fish.name) : [...prev, fish]);
    setReport(null);
    setShowReport(false);
  };

  const handleClearSelection = () => {
    setSelectedFish([]);
    setReport(null);
    setShowReport(false);
  };
  
  const handleLetterClick = (letter: string) => {
      letterRefs.current[letter]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleScrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const availableLetters = useMemo(() => {
      if (!localFishData) return [];
      const currentList = localFishData[selectedCategory] || [];
      const letters = new Set(currentList.map((fish: any) => fish.name.charAt(0).toUpperCase()));
      return Array.from(letters).sort();
  }, [selectedCategory, localFishData]);

  if (loadingData) return <div className="min-h-screen text-[var(--text-dark)] flex items-center justify-center p-4">Loading...</div>;
  if (error && !localFishData) return <div className="min-h-screen text-red-800 flex items-center justify-center p-4">Error: {error}</div>;
  
  let lastLetter = '';

  return (
    <div className="min-h-screen text-[var(--text-dark)] font-sans antialiased animate-fade-in">
        <div className="p-4 sm:p-8 pb-12">
            <AlphabetScroller letters={availableLetters} onLetterClick={handleLetterClick} onScrollToTop={handleScrollToTop} />
            <header className="text-center mb-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--text-dark)] drop-shadow-sm">AI Compatibility Calculator</h1>
                <p className="mt-2 text-lg sm:text-xl text-[var(--text-light)]">Select fish to get a compatibility report.</p>
            </header>

            <div className="flex justify-center space-x-4 mb-6">
                <button onClick={() => { setSelectedCategory("freshwater"); handleClearSelection(); }} disabled={loadingReport} className={`px-6 py-3 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 ${selectedCategory === "freshwater" ? "bg-[var(--accent-primary)] text-white shadow-lg" : "bg-[var(--card-bg)] text-[var(--text-light)] hover:bg-gray-100 dark:hover:bg-gray-700"} ${loadingReport ? 'cursor-not-allowed opacity-50' : ''}`}>Freshwater 🐟</button>
                <button onClick={() => { setSelectedCategory("marine"); handleClearSelection(); }} disabled={loadingReport} className={`px-6 py-3 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 ${selectedCategory === "marine" ? "bg-[var(--accent-primary)] text-white shadow-lg" : "bg-[var(--card-bg)] text-[var(--text-light)] hover:bg-gray-100 dark:hover:bg-gray-700"} ${loadingReport ? 'cursor-not-allowed opacity-50' : ''}`}>Saltwater 🐡</button>
            </div>

            <main className="max-w-full mx-auto bg-white/50 dark:bg-black/10 backdrop-blur-sm rounded-3xl p-4 sm:p-8 shadow-2xl overflow-hidden border border-[var(--border-color)]">
                {report && !showReport && (
                <div className="fixed top-4 right-4 z-50">
                    <button onClick={() => setShowReport(true)} disabled={loadingReport} className={`flex items-center justify-center px-6 py-3 bg-white/60 backdrop-blur-sm hover:bg-white text-[var(--text-dark)] font-bold text-lg rounded-full shadow-lg transition-colors duration-300 transform hover:scale-105 border border-gray-300 ${loadingReport ? 'cursor-not-allowed opacity-50' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" /></svg>
                    Show Last Report
                    </button>
                </div>
                )}

                <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-dark)]">
                    Choose your {selectedCategory} fish:
                </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
                {localFishData[selectedCategory].map((fish: any, index: number) => {
                    const firstLetter = fish.name.charAt(0).toUpperCase();
                    const isNewLetter = firstLetter !== lastLetter;
                    if (isNewLetter) lastLetter = firstLetter;
                    return(
                    <div
                        key={fish.name}
                        ref={isNewLetter ? (el) => { letterRefs.current[firstLetter] = el; } : null}
                        onClick={() => !loadingReport && handleFishClick(fish)}
                        className={`flex flex-col rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl animate-scale-in border bg-[var(--card-bg)] ${
                            selectedFish.some(f => f.name === fish.name)
                            ? "ring-4 ring-[var(--accent-primary)] border-transparent"
                            : "border-[var(--border-color)] hover:bg-gray-50 dark:hover:bg-gray-600"
                        } ${loadingReport ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <img src={fish.imageURL} alt={fish.name} className="w-full h-40 sm:h-24 md:h-32 object-cover rounded-t-xl" onError={(e: any) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x200/4B5563/F9FAFB?text=No+Image"; }}/>
                        <div className="p-2 flex-grow flex flex-col justify-center">
                            <p className="text-base sm:text-lg font-semibold text-center text-[var(--text-dark)]">{fish.name}</p>
                            <p className="text-xs sm:text-sm text-[var(--text-light)] italic text-center">{fish.commonNames.join(', ')}</p>
                        </div>
                    </div>
                )})}
                </div>
            </main>
        </div>

        {selectedFish.length > 0 && (
            <div className="fixed inset-x-0 bottom-0 z-50 p-4">
                <div className="max-w-full mx-auto flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4">
                    <div className="flex items-center justify-center gap-4 w-full sm:w-auto order-2 sm:order-1">
                        <button onClick={getCompatibilityReport} disabled={loadingReport} className="w-full sm:w-auto px-6 py-3 bg-[var(--accent-primary)] text-white font-bold text-lg rounded-full shadow-lg hover:bg-[#15a1b8] transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            {loadingReport ? "Generating..." : `Get Report`}
                        </button>
                        <button onClick={handleClearSelection} disabled={loadingReport} className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-gray-700 transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Clear
                        </button>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-full shadow-lg order-1 sm:order-2 flex-wrap justify-center">
                        {selectedFish.map((fish, index) => <img key={index} src={fish.imageURL} alt={fish.name} title={fish.name} className="w-12 h-12 rounded-full object-cover border-2 border-[var(--accent-primary)] transition-all duration-300 ease-in-out transform hover:scale-110" onError={(e: any) => { e.target.onerror = null; e.target.src = "https://placehold.co/64x64/4B5563/F9FAFB?text=No+Image"; }}/>)}
                    </div>
                </div>
            </div>
        )}
        
        {loadingReport && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="text-center p-8">
                    <div className="animate-spin inline-block w-12 h-12 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full"></div>
                    <p className="mt-4 text-lg text-white">Generating report, please wait...</p>
                </div>
                <button onClick={handleCancelReport} className="mt-4 px-6 py-3 bg-gray-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-gray-700 transition-colors duration-300">Cancel</button>
            </div>
        )}

        {showReport && (
            <div onClick={() => setShowReport(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-8 md:py-12 animate-fade-in">
            <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-full max-h-[90vh] bg-[var(--card-bg)] text-[var(--text-dark)] rounded-3xl shadow-2xl flex flex-col animate-fade-in-down">
                <div className="relative flex-shrink-0 px-6 pt-4 pb-2 text-center z-10 border-b border-[var(--border-color)]">
                    <h3 className="text-2xl md:text-3xl font-extrabold text-[var(--text-dark)]">Compatibility Report</h3>
                    <div className="mt-1 text-base md:text-lg text-[var(--text-light)]">
                        {selectedFish.map((f, i) => <span key={i} className="font-semibold">{f.name}{i < selectedFish.length - 1 && ', '}</span>)}
                    </div>
                    <button onClick={() => setShowReport(false)} className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-800 transition-colors duration-200 p-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                <div className="overflow-y-auto p-6 sm:p-8">
                {error && <div className="text-center p-4 mb-4 bg-red-100 text-red-800 rounded-lg shadow-inner"><p className="font-bold">Error:</p><p>{error}</p></div>}
                {report && (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
                        <div className="bg-gray-50 dark:bg-gray-700 border border-[var(--border-color)] p-6 rounded-2xl text-center">
                        <h4 className="text-2xl font-bold text-[var(--text-dark)] mb-2">Group Harmony</h4>
                        <div className={`text-3xl font-bold mb-2 ${getHarmonyColor(report.groupHarmonyScore)}`}>{report.harmonyLabel}</div>
                        <p className={`text-5xl md:text-6xl font-bold mb-4 ${getHarmonyColor(report.groupHarmonyScore)}`}>{Math.round(report.groupHarmonyScore * 100)}%</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {report.groupHarmonyScore < 0.5 ? "This score represents the 'weakest link' or the single most problematic pairing in the group. A low score indicates a significant risk of conflict." : "This score represents the compatibility of the most challenging pair in the group. A high score indicates that all selected fish are likely to coexist peacefully."}<br/><br/>
                            <strong>Summary:</strong> {report.harmonySummary}
                        </p>
                        </div>
                    </div>
                    <div className="space-y-6 text-[var(--text-light)]">
                        <div className="border-t-2 border-[var(--border-color)] pt-6"><h4 className="text-2xl font-bold text-[var(--text-dark)] mb-2">Detailed Summary</h4><p className="text-lg leading-relaxed">{report.detailedSummary}</p></div>
                        {report.tankSize && <div className="border-t-2 border-[var(--border-color)] pt-6"><h4 className="text-2xl font-bold text-[var(--text-dark)] mb-2">Recommended Tank Size</h4><p className="text-lg leading-relaxed">{report.tankSize}</p></div>}
                        {report.decorations && <div className="border-t-2 border-[var(--border-color)] pt-6"><h4 className="text-2xl font-bold text-[var(--text-dark)] mb-2">Decorations and Setup</h4><p className="text-lg leading-relaxed">{report.decorations}</p></div>}
                        {report.careGuide && <div className="border-t-2 border-[var(--border-color)] pt-6"><h4 className="text-2xl font-bold text-[var(--text-dark)] mb-2">Care Guide</h4><p className="text-lg leading-relaxed">{report.careGuide}</p></div>}
                        {report.compatibleFish?.length > 0 && (
                        <div className="border-t-2 border-[var(--border-color)] pt-6">
                            <h4 className="text-2xl font-bold text-[var(--text-dark)] mb-4">Compatible Tank Mates</h4>
                            <div className="flex flex-wrap justify-center gap-4 mb-4">{selectedFish.map((fish) => <div key={fish.name} className="flex flex-col items-center"><img src={fish.imageURL} alt={fish.name} className="w-20 h-20 rounded-full border-2 border-[var(--border-color)] object-cover mb-2" onError={(e: any) => { e.target.onerror = null; e.target.src = "https://placehold.co/64x64/4B5563/F9FAFB?text=No+Image"; }}/><span className="font-semibold text-center text-sm text-[var(--text-dark)]">{fish.name}</span></div>)}</div>
                            <ul className="list-disc list-inside columns-2 sm:columns-3 lg:columns-4">{report.compatibleFish.map((fish, index) => <li key={index} className="mb-2">{fish.name}</li>)}</ul>
                        </div>
                        )}
                        {report.math?.pairs.length > 0 && (
                        <div className="border-t-2 border-[var(--border-color)] pt-6">
                            <h4 className="text-2xl font-bold text-[var(--text-dark)] mb-4">Calculation Breakdown</h4>
                            <div className="bg-gray-50 dark:bg-gray-700 border border-[var(--border-color)] p-4 sm:p-6 rounded-2xl space-y-4">
                            <div><h5 className="font-semibold text-lg text-blue-600">Pairwise Compatibility:</h5><ul className="list-disc list-inside">{report.math.pairs.map((p, i) => <li key={i}>{p.fishA} & {p.fishB}: <span className="font-mono">{(p.prob * 100).toFixed(1)}%</span></li>)}</ul></div>
                            <div><h5 className="font-semibold text-lg text-blue-600">Group Harmony Score:</h5><p className="font-mono text-sm break-words">{report.math.harmonyEquation}</p></div>
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
        <footer className="text-center p-8 text-[var(--text-light)] text-sm">
            <p className="max-w-3xl mx-auto">
                This AI-powered tool helps you check the compatibility of freshwater and marine aquarium inhabitants. Select the fish you're interested in, and click "Get Report" to receive a detailed analysis, including recommended tank size, decorations, care guides, and potential conflict risks.
            </p>
        </footer>
    </div>
  );
}