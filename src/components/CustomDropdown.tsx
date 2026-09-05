import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  id: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectOption = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="relative w-full cursor-default rounded-md bg-white dark:bg-slate-700 py-2 pl-3 pr-10 text-left text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
      >
        <span className="block truncate">{selectedOption?.label || 'Pilih Opsi'}</span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </span>
      </button>

      {isOpen && (
        <ul
          className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white dark:bg-slate-700 py-1 text-base shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none sm:text-sm animate-fade-in"
          style={{animationDuration: '150ms'}}
          role="listbox"
          aria-labelledby={id}
        >
          {options.map((option) => (
            <li
              key={option.value}
              className="relative cursor-default select-none py-2 pl-3 pr-9 text-slate-900 dark:text-slate-100 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-colors duration-100"
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleSelectOption(option.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSelectOption(option.value)}
              tabIndex={0}
            >
              <div className="flex items-center">
                <span className={`block truncate ${option.value === value ? 'font-semibold' : 'font-normal'}`}>
                  {option.label}
                </span>
                 {option.value === value ? (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 dark:text-blue-400">
                    <Check className="h-5 w-5" aria-hidden="true" />
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;