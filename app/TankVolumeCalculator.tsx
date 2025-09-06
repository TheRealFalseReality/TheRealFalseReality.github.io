import React, { useState } from 'react';

// TankVolumeCalculator component
const TankVolumeCalculator = () => {
    const [shape, setShape] = useState('Rectangle');
    const [units, setUnits] = useState('Inches');
    const [dimensions, setDimensions] = useState({
        length: '',
        width: '',
        height: '',
        diameter: '',
        edge: '',
        fullWidth: '',
    });
    const [results, setResults] = useState({
        gallons: '',
        liters: '',
        pounds: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDimensions({ ...dimensions, [name]: value });
    };

    const calculateVolume = () => {
        const length = parseFloat(dimensions.length) || 0;
        const width = parseFloat(dimensions.width) || 0;
        const height = parseFloat(dimensions.height) || 0;
        const diameter = parseFloat(dimensions.diameter) || 0;
        const edge = parseFloat(dimensions.edge) || 0;
        const fullWidth = parseFloat(dimensions.fullWidth) || 0;

        let volume = 0;
        const radius = diameter / 2.0;

        switch (shape) {
            case 'Cube':
                volume = Math.pow(length, 3);
                break;
            case 'Cylinder':
                volume = Math.PI * Math.pow(radius, 2) * height;
                break;
            case 'Hexagonal':
                volume = (((3 * Math.sqrt(3.0)) / 2) * edge * edge * height);
                break;
            case 'BowFront':
                volume = ((length * width + (Math.PI * (length / 2) * (fullWidth - width)) / 2) * height);
                break;
            case 'Rectangle':
                volume = length * width * height;
                break;
            default:
                volume = 0;
        }

        const conversionGallons = units === 'Inches' ? 0.004329 : 1728 * 0.004329;
        const conversionLiters = units === 'Inches' ? 0.0163871 : 1728 * 0.0163871;
        const conversionPounds = 8.34;

        const gallons = volume * conversionGallons;
        const liters = volume * conversionLiters;
        const pounds = gallons * conversionPounds;

        setResults({
            gallons: gallons.toFixed(2),
            liters: liters.toFixed(2),
            pounds: pounds.toFixed(2),
        });
    };

    const renderInputs = () => {
        switch (shape) {
            case 'Cube':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="length" value={dimensions.length} onChange={handleInputChange} className="w-full p-2 bg-white border border-[var(--border-color)] rounded-lg text-gray-800 placeholder-gray-400" placeholder="Side Length" />
                    </div>
                );
            case 'Cylinder':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="diameter" value={dimensions.diameter} onChange={handleInputChange} className="w-full p-2 bg-white border border-[var(--border-color)] rounded-lg text-gray-800 placeholder-gray-400" placeholder="Diameter" />
                        <input name="height" value={dimensions.height} onChange={handleInputChange} className="w-full p-2 bg-white border border-[var(--border-color)] rounded-lg text-gray-800 placeholder-gray-400" placeholder="Height" />
                    </div>
                );
            case 'Hexagonal':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="edge" value={dimensions.edge} onChange={handleInputChange} className="w-full p-2 bg-white border border-[var(--border-color)] rounded-lg text-gray-800 placeholder-gray-400" placeholder="Edge" />
                        <input name="height" value={dimensions.height} onChange={handleInputChange} className="w-full p-2 bg-white border border-[var(--border-color)] rounded-lg text-gray-800 placeholder-gray-400" placeholder="Height" />
                    </div>
                );
            case 'BowFront':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input name="length" value={dimensions.length} onChange={handleInputChange} className="w-full p-2 bg-white border border-[var(--border-color)] rounded-lg text-gray-800 placeholder-gray-400" placeholder="Length" />
                        <input name="width" value={dimensions.width} onChange={handleInputChange} className="w-full p-2 bg-white border border-[var(--border-color)] rounded-lg text-gray-800 placeholder-gray-400" placeholder="Width" />
                        <input name="fullWidth" value={dimensions.fullWidth} onChange={handleInputChange} className="w-full p-2 bg-white border border-[var(--border-color)] rounded-lg text-gray-800 placeholder-gray-400" placeholder="Full Width" />
                        <input name="height" value={dimensions.height} onChange={handleInputChange} className="w-full p-2 bg-white border border-[var(--border-color)] rounded-lg text-gray-800 placeholder-gray-400" placeholder="Height" />
                    </div>
                );
            case 'Rectangle':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input name="length" value={dimensions.length} onChange={handleInputChange} className="w-full p-2 bg-white border border-[var(--border-color)] rounded-lg text-gray-800 placeholder-gray-400" placeholder="Length" />
                        <input name="width" value={dimensions.width} onChange={handleInputChange} className="w-full p-2 bg-white border border-[var(--border-color)] rounded-lg text-gray-800 placeholder-gray-400" placeholder="Width" />
                        <input name="height" value={dimensions.height} onChange={handleInputChange} className="w-full p-2 bg-white border border-[var(--border-color)] rounded-lg text-gray-800 placeholder-gray-400" placeholder="Height" />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen text-[var(--text-dark)] font-sans antialiased animate-fade-in water-bg">
            <div className="p-4 sm:p-8 pb-12">
                <header className="text-center mb-6">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--text-dark)] drop-shadow-sm">Tank Volume Calculator</h1>
                    <p className="mt-2 text-lg sm:text-xl text-gray-600">Calculate the volume and weight of your aquarium.</p>
                </header>

                <main className="max-w-4xl mx-auto bg-white/50 backdrop-blur-sm rounded-3xl p-4 sm:p-8 shadow-2xl overflow-hidden border border-[var(--border-color)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Shape</label>
                            <select value={shape} onChange={(e) => setShape(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option>Rectangle</option>
                                <option>Cube</option>
                                <option>Cylinder</option>
                                <option>Hexagonal</option>
                                <option>BowFront</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Units</label>
                            <select value={units} onChange={(e) => setUnits(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option>Inches</option>
                                <option>Feet</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        {renderInputs()}
                    </div>

                    <button onClick={calculateVolume} className="w-full p-3 font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg hover:opacity-90 shadow">Calculate</button>

                    {results.gallons && (
                        <div className="mt-6 p-4 bg-gray-50 border border-[var(--border-color)] rounded-2xl text-center">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <h4 className="text-lg font-bold text-[var(--text-dark)]">Volume (Gallons)</h4>
                                    <p className="text-2xl font-bold text-blue-600">{results.gallons}</p>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-[var(--text-dark)]">Volume (Liters)</h4>
                                    <p className="text-2xl font-bold text-green-600">{results.liters}</p>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-[var(--text-dark)]">Water Weight (Pounds)</h4>
                                    <p className="text-2xl font-bold text-purple-600">{results.pounds}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default TankVolumeCalculator;