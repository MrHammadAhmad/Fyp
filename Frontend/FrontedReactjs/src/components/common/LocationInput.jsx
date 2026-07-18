import React, { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '../../utils/helpers';
import Input from '../ui/Input';

const LAHORE_AREAS = [
  "Gulberg", "DHA", "Johar Town", "Model Town", 
  "Bahria Town", "Wapda Town", "Cavalry Ground", "Cantt"
];

export default function LocationInput({ 
  value, 
  onChange, 
  label = "Area in Lahore", 
  placeholder = "e.g. Gulberg, DHA, Johar Town",
  className,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAreas = LAHORE_AREAS.filter(area => 
    area.toLowerCase().includes((value || '').toLowerCase())
  );

  return (
    <div className={cn("relative w-full", className)} ref={wrapperRef}>
      <Input
        label={label}
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => {
          onChange(e);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        leftIcon={<MapPin size={18} />}
        required={required}
      />
      
      {isOpen && filteredAreas.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl shadow-lg max-h-60 overflow-auto py-2">
          {filteredAreas.map((area, index) => (
            <div
              key={index}
              className="px-4 py-2.5 text-sm cursor-pointer hover:bg-brand-50 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300 transition-colors"
              onClick={() => {
                // Mock an event object for onChange
                onChange({ target: { value: area } });
                setIsOpen(false);
              }}
            >
              {area}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
