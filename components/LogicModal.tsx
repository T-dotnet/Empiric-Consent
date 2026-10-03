
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Check, CheckSquare, Square } from 'lucide-react';
import { LogicOperator, LogicAction, LogicParameter, LogicRule } from '../types';
import { LOGIC_PARAMETERS, PARAMETER_OPTIONS } from '../constants';

interface LogicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: Omit<LogicRule, 'id'>) => void;
}

export const LogicModal: React.FC<LogicModalProps> = ({ isOpen, onClose, onSave }) => {
  const [parameter, setParameter] = useState<LogicParameter>('Domain');
  const [operator, setOperator] = useState<LogicOperator>('EQUAL TO');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [action, setAction] = useState<LogicAction>('Include block');

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setParameter('Domain');
      setOperator('EQUAL TO');
      setSelectedValues([]);
      setAction('Include block');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleValueToggle = (value: string) => {
    // If we are toggling a specific value, remove 'ALL' if it exists
    let newValues = selectedValues.includes('ALL') ? [] : [...selectedValues];
    
    if (newValues.includes(value)) {
      newValues = newValues.filter(v => v !== value);
    } else {
      newValues.push(value);
    }
    
    setSelectedValues(newValues);
  };

  const handleSelectAllValues = () => {
    if (selectedValues.includes('ALL')) {
      setSelectedValues([]);
    } else {
      setSelectedValues(['ALL']);
    }
  };

  const handleSave = () => {
    onSave({
      parameter,
      operator,
      values: selectedValues,
      action
    });
    onClose();
  };

  const availableOptions = PARAMETER_OPTIONS[parameter] || [];
  const isAllSelected = selectedValues.includes('ALL');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Logic Rule</h2>
            <p className="text-sm text-gray-500 mt-1">Define conditions for this block.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 bg-white">
          
          {/* IF Statement Construction */}
          <div className="space-y-4">
            
            {/* 1. Parameter */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">IF Parameter Is</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {LOGIC_PARAMETERS.map(param => (
                  <button
                    key={param}
                    onClick={() => { setParameter(param); setSelectedValues([]); }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all border ${
                      parameter === param 
                        ? 'bg-gray-900 text-white border-gray-900' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {param}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Operator */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Operator</label>
                  <select 
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as LogicOperator)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                  >
                    <option value="EQUAL TO">Equal to</option>
                    <option value="NOT EQUAL TO">Not equal to</option>
                    <option value="CONTAINS">Contains</option>
                    <option value="ANY">Any of</option>
                  </select>
               </div>
            </div>

            {/* 3. Values */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Values</label>
                <button 
                  onClick={handleSelectAllValues}
                  className="flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-800 transition-colors"
                >
                  {isAllSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  Select All
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 max-h-40 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {/* Visual 'ALL' badge if selected */}
                  {isAllSelected ? (
                     <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">
                       <Check className="w-3 h-3" />
                       ALL VALUES
                     </span>
                  ) : (
                    availableOptions.map(option => {
                      const isSelected = selectedValues.includes(option);
                      return (
                        <button
                          key={option}
                          onClick={() => handleValueToggle(option)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                            isSelected 
                              ? 'bg-amber-100 text-amber-800 border-amber-200 shadow-sm' 
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          {option}
                        </button>
                      );
                    })
                  )}
                </div>
                {availableOptions.length === 0 && (
                  <p className="text-xs text-gray-400 italic text-center py-2">No options available for this parameter.</p>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1.5 text-right">
                {isAllSelected ? 'All values selected' : `${selectedValues.length} selected`}
              </p>
            </div>

            <div className="flex items-center justify-center py-2">
               <ArrowRight className="w-5 h-5 text-gray-300" />
            </div>

            {/* 4. Action */}
            <div>
               <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Then Action</label>
               <div className="grid grid-cols-2 gap-3">
                 {(['Include block', 'Exclude block'] as const).map(act => (
                    <button
                      key={act}
                      onClick={() => setAction(act)}
                      className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all text-center ${
                        action === act
                          ? act === 'Include block' 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 ring-1 ring-emerald-200' 
                            : 'bg-orange-50 border-orange-200 text-orange-700 ring-1 ring-orange-200'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {act}
                    </button>
                 ))}
               </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={selectedValues.length === 0}
            className="px-5 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            Add Rule
          </button>
        </div>

      </div>
    </div>
  );
};
