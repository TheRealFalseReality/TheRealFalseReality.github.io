import React, { useState, useEffect } from 'react';

// --- SVG Icons for Shapes ---
const RectangleIcon = () => <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12h40v24H4z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/></svg>;
const CubeIcon = () => <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 14l20-8 20 8-20 8-20-8z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/><path d="M4 14v22l20 8 20-8V14" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/><path d="M24 6v38" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const CylinderIcon = () => <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="24" cy="10" rx="16" ry="6" stroke="currentColor" strokeWidth="3"/><path d="M8 10v28c0 3.314 7.163 6 16 6s16-2.686 16-6V10" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/></svg>;
const HexagonalIcon = () => <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 13l14-8 14 8v18l-14 8-14-8z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/><path d="M24 5v38M10 13l14 8 14-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const BowFrontIcon = () => <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 12h32v24H8z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/><path d="M40 12c-8 10-24 10-32 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const shapeIcons = {
    Rectangle: <RectangleIcon />,
    Cube: <CubeIcon />,
    Cylinder: <CylinderIcon />,
    Hexagonal: <HexagonalIcon />,
    BowFront: <BowFrontIcon />,
};

// TankVolumeCalculator component
const TankVolumeCalculator = () => {
    const [shape, setShape] = useState('Rectangle');
    const [units, setUnits] = useState('Inches');
    const [cylinderType, setCylinderType] = useState('Full');
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

    // Reset cylinder type if shape is changed from Cylinder
    useEffect(() => {
        if (shape !== 'Cylinder') {
            setCylinderType('Full');
        }
    }, [shape]);

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
                const fullCylinderVolume = Math.PI * Math.pow(radius, 2) * height;
                switch (cylinderType) {
                    case 'Half':
                        volume = fullCylinderVolume / 2;
                        break;
                    case 'Corner':
                        volume = fullCylinderVolume / 4;
                        break;
                    default: // Full
                        volume = fullCylinderVolume;
                }
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

        let conversionGallons = 0;
        let conversionLiters = 0;

        switch (units) {
            case 'Inches':
                conversionGallons = 0.004329;
                conversionLiters = 0.0163871;
                break;
            case 'Feet':
                conversionGallons = 7.48052;
                conversionLiters = 28.3168;
                break;
            case 'cm':
                conversionGallons = 0.000264172;
                conversionLiters = 0.001;
                break;
            case 'Meters':
                conversionGallons = 264.172;
                conversionLiters = 1000;
                break;
        }
        
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
        const inputClasses = "w-full p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-dark)] placeholder-[var(--text-light)]";
        switch (shape) {
            case 'Cube':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="length" value={dimensions.length} onChange={handleInputChange} className={inputClasses} placeholder="Side Length" />
                    </div>
                );
            case 'Cylinder':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="diameter" value={dimensions.diameter} onChange={handleInputChange} className={inputClasses} placeholder="Diameter" />
                        <input name="height" value={dimensions.height} onChange={handleInputChange} className={inputClasses} placeholder="Height" />
                    </div>
                );
            case 'Hexagonal':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="edge" value={dimensions.edge} onChange={handleInputChange} className={inputClasses} placeholder="Edge" />
                        <input name="height" value={dimensions.height} onChange={handleInputChange} className={inputClasses} placeholder="Height" />
                    </div>
                );
            case 'BowFront':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input name="length" value={dimensions.length} onChange={handleInputChange} className={inputClasses} placeholder="Length" />
                        <input name="width" value={dimensions.width} onChange={handleInputChange} className={inputClasses} placeholder="Width" />
                        <input name="fullWidth" value={dimensions.fullWidth} onChange={handleInputChange} className={inputClasses} placeholder="Full Width" />
                        <input name="height" value={dimensions.height} onChange={handleInputChange} className={inputClasses} placeholder="Height" />
                    </div>
                );
            case 'Rectangle':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input name="length" value={dimensions.length} onChange={handleInputChange} className={inputClasses} placeholder="Length" />
                        <input name="width" value={dimensions.width} onChange={handleInputChange} className={inputClasses} placeholder="Width" />
                        <input name="height" value={dimensions.height} onChange={handleInputChange} className={inputClasses} placeholder="Height" />
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
                    <p className="mt-2 text-lg sm:text-xl text-[var(--text-light)]">Calculate the volume and weight of your aquarium.</p>
                </header>

                <main className="max-w-4xl mx-auto bg-white/50 backdrop-blur-sm rounded-3xl p-4 sm:p-8 shadow-2xl overflow-hidden border border-[var(--border-color)]">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-center text-[var(--text-dark)] mb-3">Shape</label>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                            {Object.keys(shapeIcons).map((shapeName) => (
                                <button key={shapeName} onClick={() => setShape(shapeName)} className={`p-4 border rounded-lg transition-all duration-200 ${shape === shapeName ? 'bg-[var(--accent-highlight)] border-[var(--accent-primary)]' : 'bg-white/50 border-[var(--border-color)] hover:border-[var(--accent-primary)]'}`}>
                                    <div className="h-12 w-12 mx-auto">{shapeIcons[shapeName as keyof typeof shapeIcons]}</div>
                                    <p className="text-xs font-semibold mt-2">{shapeName}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {shape === 'Cylinder' && (
                        <div className="mb-6 animate-fade-in">
                            <label className="block text-sm font-medium text-center text-[var(--text-dark)] mb-3">Cylinder Type</label>
                            <div className="flex justify-center p-1 bg-gray-200/[.5] dark:bg-black/[.2] rounded-full shadow-inner w-full max-w-sm mx-auto">
                                {['Full', 'Half', 'Corner'].map((type) => (
                                    <button key={type} onClick={() => setCylinderType(type)} className={`w-1/3 px-2 py-1 rounded-full font-semibold text-sm transition-all duration-300 ${cylinderType === type ? 'bg-[var(--accent-primary)] text-white shadow' : 'bg-transparent text-[var(--text-light)] hover:text-[var(--text-dark)]'}`}>{type}</button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-center text-[var(--text-dark)] mb-3">Units</label>
                        <div className="flex justify-center p-1 bg-gray-200/[.5] dark:bg-black/[.2] rounded-full shadow-inner w-full max-w-sm mx-auto">
                            {['Inches', 'Feet', 'Meters', 'cm'].map((unit) => (
                                <button key={unit} onClick={() => setUnits(unit)} className={`w-1/4 px-2 py-1 rounded-full font-semibold text-sm transition-all duration-300 ${units === unit ? 'bg-[var(--accent-primary)] text-white shadow' : 'bg-transparent text-[var(--text-light)] hover:text-[var(--text-dark)]'}`}>{unit}</button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        {renderInputs()}
                    </div>

                    <button onClick={calculateVolume} className="w-full p-3 font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg hover:opacity-90 shadow">Calculate</button>

                    {results.gallons && (
                        <div className="mt-6 p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl text-center">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <h4 className="text-lg font-bold text-[var(--text-dark)]">Volume (Gallons)</h4>
                                    <p className="text-2xl font-bold text-[var(--accent-primary)]">{results.gallons}</p>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-[var(--text-dark)]">Volume (Liters)</h4>
                                    <p className="text-2xl font-bold text-[var(--accent-secondary)]">{results.liters}</p>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-[var(--text-dark)]">Water Weight (Pounds)</h4>
                                    <p className="text-2xl font-bold text-emerald-500">{results.pounds}</p>
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