import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CustomNumberInputProps {
    value: number;
    onChange: (newValue: number) => void;
    onSave: (valueToSave: number) => void;
}

const CustomNumberInput: React.FC<CustomNumberInputProps> = ({ value, onChange, onSave }) => {
    const [inputValue, setInputValue] = useState(value.toString());

    useEffect(() => {
        setInputValue(value.toString());
    }, [value]);

    const handleSave = (newValue: number) => {
        const finalValue = Math.max(0, newValue);
        onChange(finalValue);
        onSave(finalValue);
    };
    
    const handleIncrement = () => {
        handleSave(value + 1);
    };

    const handleDecrement = () => {
        handleSave(Math.max(0, value - 1));
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };
    
    const handleBlur = () => {
        const numValue = parseInt(inputValue, 10);
        if (!isNaN(numValue)) {
            handleSave(numValue);
        } else {
            setInputValue(value.toString()); // Revert if invalid
        }
    };

    return (
        <div className="flex items-center bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg w-44 shadow-inner border border-slate-300 dark:border-slate-600" style={{height: '44px'}}>
            <input
                type="text" // Use text to avoid native spinners and allow better formatting
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onKeyPress={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                className="w-full h-full bg-transparent text-center font-bold text-lg tracking-wider py-2 px-3 focus:outline-none"
            />
            <div className="flex flex-col h-full border-l border-slate-300 dark:border-slate-600">
                <button 
                    onClick={handleIncrement} 
                    className="flex-1 px-3 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-600/50 transition-colors rounded-tr-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    aria-label="Increase value"
                >
                    <ChevronUp className="w-5 h-5" />
                </button>
                <button 
                    onClick={handleDecrement} 
                    className="flex-1 px-3 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-600/50 transition-colors rounded-br-lg border-t border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    aria-label="Decrease value"
                >
                    <ChevronDown className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default CustomNumberInput;