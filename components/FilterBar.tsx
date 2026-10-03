
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Filter, Check, ChevronsDown, ChevronsUp } from 'lucide-react';
import { BLOCK_TYPES } from '../constants';
import { BlockType } from '../types';

interface FilterBarProps {
  selectedType: BlockType | 'All';
  onTypeChange: (type: BlockType | 'All') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showMismatchOnly: boolean;
  onToggleMismatch: () => void;
  showDerived: boolean;
  onToggleDerived: () => void;
  areAllExpanded: boolean;
  onToggleExpandAll: () => void;
}

const getTypeColor = (type: BlockType) => {
  switch (type) {
    case 'Universal': return 'bg-blue-500';
    case 'Domain': return 'bg-indigo-500';
    case 'Intervention': return 'bg-rose-500';
    case 'Recipient': return 'bg-emerald-500';
    case 'Site': return 'bg-purple-500';
    case 'Appendix': return 'bg-teal-500';
    case 'Consent': return 'bg-cyan-500';
    case 'Signature': return 'bg-slate-500';
    default: return 'bg-gray-400';
  }
};

export const FilterBar: React.FC<FilterBarProps> = ({ 
  selectedType, 
  onTypeChange, 
  searchQuery, 
  onSearchChange,
  showMismatchOnly,
  onToggleMismatch,
  showDerived,
  onToggleDerived,
  areAllExpanded,
  onToggleExpandAll
}) => {
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pt-6 border-t border-gray-200/60">
      {/* Left Filters */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        
        {/* Role/Type Filter */}
        <div className="relative shrink-0 z-30" ref={typeDropdownRef}>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Filter Types</label>
            <button 
              onClick={() => setIsTypeOpen(!isTypeOpen)}
              className="px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-sm flex items-center justify-between gap-3 min-w-[170px] hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
            >
              <span className="truncate text-gray-700 font-medium">
                {selectedType === 'All' ? 'All Types' : selectedType}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isTypeOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {isTypeOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-100 rounded-lg shadow-xl py-1 ring-1 ring-black ring-opacity-5 max-h-80 overflow-y-auto">
              <button
                onClick={() => {
                  onTypeChange('All');
                  setIsTypeOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <span className={selectedType === 'All' ? 'font-medium text-gray-900' : 'text-gray-600'}>All Types</span>
                {selectedType === 'All' && <Check className="w-4 h-4 text-indigo-600" />}
              </button>
              
              <div className="h-px bg-gray-100 my-1"></div>
              
              {BLOCK_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => {
                    onTypeChange(type);
                    setIsTypeOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${getTypeColor(type)}`}></span>
                    <span className={selectedType === type ? 'font-medium text-gray-900' : 'text-gray-600'}>{type}</span>
                  </div>
                  {selectedType === type && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Variations/Derived Toggle */}
        <div className="flex flex-col gap-1.5 shrink-0">
           <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Variations</label>
           <button 
            onClick={onToggleDerived}
            className={`px-3.5 py-2 rounded-lg border text-sm font-medium flex items-center gap-2.5 transition-all group shadow-sm ${
              showDerived 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-900' 
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className={`
              relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
              ${showDerived ? 'bg-indigo-500' : 'bg-gray-200 group-hover:bg-gray-300'}
            `}>
              <span
                aria-hidden="true"
                className={`
                  pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                  ${showDerived ? 'translate-x-4' : 'translate-x-0'}
                `}
              />
            </div>
            <span>Show Derived</span>
          </button>
        </div>
        
        {/* Status Filter Toggle */}
        <div className="flex flex-col gap-1.5 shrink-0">
           <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Status</label>
           <button 
            onClick={onToggleMismatch}
            className={`px-3.5 py-2 rounded-lg border text-sm font-medium flex items-center gap-2.5 transition-all group shadow-sm ${
              showMismatchOnly 
                ? 'bg-amber-50 border-amber-200 text-amber-900' 
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className={`
              relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
              ${showMismatchOnly ? 'bg-amber-500' : 'bg-gray-200 group-hover:bg-gray-300'}
            `}>
              <span
                aria-hidden="true"
                className={`
                  pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                  ${showMismatchOnly ? 'translate-x-4' : 'translate-x-0'}
                `}
              />
            </div>
            <span>Updates Pending</span>
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-10 bg-gray-200 mx-2 shrink-0 hidden sm:block"></div>

        {/* Expand/Collapse All */}
        <div className="flex flex-col gap-1.5 shrink-0">
           <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">View</label>
           <button 
            onClick={onToggleExpandAll}
            className="px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
            title={areAllExpanded ? "Collapse All Blocks" : "Expand All Blocks"}
          >
             {areAllExpanded ? <ChevronsUp className="w-4 h-4" /> : <ChevronsDown className="w-4 h-4" />}
             {areAllExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </div>

      {/* Right Search */}
      <div className="flex flex-col gap-1.5 w-full sm:w-[320px]">
        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Search</label>
        <div className="relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by content name..." 
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all placeholder:text-gray-400 shadow-sm"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>
    </div>
  );
};