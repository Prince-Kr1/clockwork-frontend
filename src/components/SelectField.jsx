import { ChevronDown } from 'lucide-react';
import { Listbox } from "@headlessui/react";

const SelectField = ({ 
  value, 
  onChange, 
  options, 
  className = "",
  placeholder = "Select",
  disabled = false 
}) => {
  return (
    <div className={`relative ${className}`}>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          {/* Button */}
          <Listbox.Button
            className={`w-full flex justify-between items-center bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700
                      hover:border-amber-300 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-300 focus:border-amber-300
                      ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
          >
            <span className={options.find((option) => option.value === value) ? '' : 'text-gray-400'}>
              {options.find((option) => option.value === value)?.label || placeholder}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
          </Listbox.Button>

          {/* Options */}
          <Listbox.Options
            className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 focus:outline-none max-h-60 overflow-auto"
          >
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active, selected }) =>
                  `cursor-pointer px-3 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    active ? "bg-amber-50 text-amber-700" : "text-gray-700"
                  } ${selected ? "font-medium bg-amber-100 text-amber-800" : ""}`
                }
              >
                {({ selected }) => (
                  <div className="flex justify-between items-center">
                    <span>{option.label}</span>
                    {selected && (
                      <span className="text-amber-600">✓</span>
                    )}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
};

export default SelectField;