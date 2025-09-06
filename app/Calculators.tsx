import React, { useState } from 'react';

// Main Calculators Component
const Calculators = () => {
    const [activeCalculator, setActiveCalculator] = useState('CO2');

    const renderCalculator = () => {
        switch (activeCalculator) {
            case 'CO2':
                return <CarbonDioxideCalculator />;
            case 'Alkalinity':
                return <AlkalinityConverter />;
            case 'Temperature':
                return <TemperatureConverter />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen text-[var(--text-dark)] font-sans antialiased animate-fade-in water-bg">
            <div className="p-4 sm:p-8 pb-12">
                <header className="text-center mb-6">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--text-dark)] drop-shadow-sm">Aquarium Calculators</h1>
                    <p className="mt-2 text-lg sm:text-xl text-[var(--text-light)]">Essential tools for your aquarium.</p>
                </header>

                <main className="max-w-xl mx-auto bg-white/50 backdrop-blur-sm rounded-3xl p-4 sm:p-8 shadow-2xl overflow-hidden border border-[var(--border-color)]">
                    <div className="mb-6 flex justify-center p-1 bg-gray-200/[.5] dark:bg-black/[.2] rounded-full shadow-inner">
                        <button onClick={() => setActiveCalculator('CO2')} className={`w-1/3 px-2 py-1.5 rounded-full font-semibold text-sm transition-all duration-300 ${activeCalculator === 'CO2' ? 'bg-[var(--accent-primary)] text-white shadow' : 'bg-transparent text-[var(--text-light)] hover:text-[var(--text-dark)]'}`}>CO₂</button>
                        <button onClick={() => setActiveCalculator('Alkalinity')} className={`w-1/3 px-2 py-1.5 rounded-full font-semibold text-sm transition-all duration-300 ${activeCalculator === 'Alkalinity' ? 'bg-[var(--accent-primary)] text-white shadow' : 'bg-transparent text-[var(--text-light)] hover:text-[var(--text-dark)]'}`}>Alkalinity</button>
                        <button onClick={() => setActiveCalculator('Temperature')} className={`w-1/3 px-2 py-1.5 rounded-full font-semibold text-sm transition-all duration-300 ${activeCalculator === 'Temperature' ? 'bg-[var(--accent-primary)] text-white shadow' : 'bg-transparent text-[var(--text-light)] hover:text-[var(--text-dark)]'}`}>Temperature</button>
                    </div>
                    
                    {renderCalculator()}
                </main>
            </div>
        </div>
    );
};

// --- Sub-Components for each calculator ---

const CarbonDioxideCalculator = () => {
    const [ph, setPh] = useState('');
    const [dkh, setDkh] = useState('');
    const [result, setResult] = useState('');

    const calculateCO2 = () => {
        const phValue = parseFloat(ph) || 0;
        const dkhValue = parseFloat(dkh) || 0;
        if (phValue > 0 && dkhValue > 0) {
            const phSolution = Math.pow(10.0, 6.37 - phValue);
            const carbonDioxide = (12.839 * dkhValue) * phSolution;
            setResult(carbonDioxide.toFixed(2));
        } else {
            setResult('');
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <input type="number" value={ph} onChange={(e) => setPh(e.target.value)} className="w-full p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-dark)] placeholder-[var(--text-light)]" placeholder="Enter pH" />
            <input type="number" value={dkh} onChange={(e) => setDkh(e.target.value)} className="w-full p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-dark)] placeholder-[var(--text-light)]" placeholder="Enter dKH" />
            <button onClick={calculateCO2} className="w-full p-3 font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-lg hover:opacity-90 shadow">Calculate CO₂ (ppm)</button>
            {result && (
                <div className="mt-4 p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl text-center">
                    <h4 className="text-lg font-bold text-[var(--text-dark)]">Estimated CO₂ Level</h4>
                    <p className="text-2xl font-bold text-[var(--accent-primary)]">{result} ppm</p>
                </div>
            )}
        </div>
    );
};

const AlkalinityConverter = () => {
    const [inputValue, setInputValue] = useState('');
    const [fromUnit, setFromUnit] = useState('dKH');
    const [results, setResults] = useState({ dkh: '', ppm: '', meq: '' });

    const convertAlkalinity = () => {
        const value = parseFloat(inputValue) || 0;
        let dkh = 0, ppm = 0, meq = 0;

        if (value > 0) {
            switch (fromUnit) {
                case 'dKH':
                    dkh = value;
                    ppm = value * 17.857;
                    meq = value * 0.357;
                    break;
                case 'ppm':
                    ppm = value;
                    dkh = value * 0.056;
                    meq = value * 0.02;
                    break;
                case 'meq/L':
                    meq = value;
                    dkh = value * 2.8;
                    ppm = value * 50.0;
                    break;
            }
            setResults({
                dkh: dkh.toFixed(2),
                ppm: ppm.toFixed(2),
                meq: meq.toFixed(2),
            });
        } else {
            setResults({ dkh: '', ppm: '', meq: '' });
        }
    };
    
    return (
         <div className="space-y-4 animate-fade-in">
            <div className="flex justify-center p-1 bg-gray-200/[.5] dark:bg-black/[.2] rounded-full shadow-inner w-full max-w-sm mx-auto">
                {['dKH', 'ppm', 'meq/L'].map((unit) => (
                    <button key={unit} onClick={() => setFromUnit(unit)} className={`w-1/3 px-2 py-1 rounded-full font-semibold text-sm transition-all duration-300 ${fromUnit === unit ? 'bg-[var(--accent-primary)] text-white shadow' : 'bg-transparent text-[var(--text-light)] hover:text-[var(--text-dark)]'}`}>{unit}</button>
                ))}
            </div>
            <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-dark)] placeholder-[var(--text-light)]" placeholder={`Enter value in ${fromUnit}`} />
            <button onClick={convertAlkalinity} className="w-full p-3 font-semibold bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-lg hover:opacity-90 shadow">Convert Alkalinity</button>
            {results.dkh && (
                <div className="mt-4 p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl text-center">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h4 className="text-lg font-bold text-[var(--text-dark)]">dKH</h4>
                            <p className="text-2xl font-bold text-[var(--accent-primary)]">{results.dkh}</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-[var(--text-dark)]">ppm</h4>
                            <p className="text-2xl font-bold text-[var(--accent-secondary)]">{results.ppm}</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-[var(--text-dark)]">meq/L</h4>
                            <p className="text-2xl font-bold text-emerald-500">{results.meq}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TemperatureConverter = () => {
    const [inputValue, setInputValue] = useState('');
    const [fromUnit, setFromUnit] = useState('Fahrenheit');
    const [results, setResults] = useState({ toValue: '', kelvin: '' });

    const convertTemp = () => {
        const temp = parseFloat(inputValue) || 0;
        let convertedTemp = 0, kelvin = 0;

        if (inputValue) {
            if (fromUnit === 'Fahrenheit') {
                convertedTemp = (temp - 32) * (5.0 / 9.0);
                kelvin = convertedTemp + 273.15;
            } else { // Celsius
                convertedTemp = (temp * (9.0 / 5.0) + 32);
                kelvin = temp + 273.15;
            }
            setResults({
                toValue: convertedTemp.toFixed(2),
                kelvin: kelvin.toFixed(2),
            });
        } else {
            setResults({ toValue: '', kelvin: '' });
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
             <div className="flex justify-center p-1 bg-gray-200/[.5] dark:bg-black/[.2] rounded-full shadow-inner w-full max-w-sm mx-auto">
                <button onClick={() => setFromUnit('Fahrenheit')} className={`w-1/2 px-2 py-1 rounded-full font-semibold text-sm transition-all duration-300 ${fromUnit === 'Fahrenheit' ? 'bg-[var(--accent-primary)] text-white shadow' : 'bg-transparent text-[var(--text-light)] hover:text-[var(--text-dark)]'}`}>Fahrenheit</button>
                <button onClick={() => setFromUnit('Celsius')} className={`w-1/2 px-2 py-1 rounded-full font-semibold text-sm transition-all duration-300 ${fromUnit === 'Celsius' ? 'bg-[var(--accent-primary)] text-white shadow' : 'bg-transparent text-[var(--text-light)] hover:text-[var(--text-dark)]'}`}>Celsius</button>
            </div>
            <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-dark)] placeholder-[var(--text-light)]" placeholder={`Enter temperature in °${fromUnit === 'Fahrenheit' ? 'F' : 'C'}`} />
            <button onClick={convertTemp} className="w-full p-3 font-semibold bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-lg hover:opacity-90 shadow">Convert Temperature</button>
            {results.toValue && (
                <div className="mt-4 p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl text-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-lg font-bold text-[var(--text-dark)]">{fromUnit === 'Fahrenheit' ? 'Celsius' : 'Fahrenheit'}</h4>
                            <p className="text-2xl font-bold text-[var(--accent-primary)]">{results.toValue}°</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-[var(--text-dark)]">Kelvin</h4>
                            <p className="text-2xl font-bold text-[var(--accent-secondary)]">{results.kelvin} K</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calculators;