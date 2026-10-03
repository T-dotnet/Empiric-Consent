import React, { useState } from 'react';
import { Sparkles, X, Copy, ArrowRight, Wand2 } from 'lucide-react';

export type AICloneOption = 'standard' | 'simplify' | 'past_tense' | 'future_tense' | 'formal' | 'friendly';

interface AICloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (option: AICloneOption) => void;
  blockName: string;
}

export const AICloneModal: React.FC<AICloneModalProps> = ({ isOpen, onClose, onConfirm, blockName }) => {
  const [selectedOption, setSelectedOption] = useState<AICloneOption>('standard');

  if (!isOpen) return null;

  const options: { id: AICloneOption; label: string; description: string; icon: React.ReactNode }[] = [
    { 
      id: 'standard', 
      label: 'Standard Clone', 
      description: 'Exact copy of the original content.',
      icon: <Copy className="w-4 h-4 text-gray-500" />
    },
    { 
      id: 'simplify', 
      label: 'Rewrite: Simplify', 
      description: 'Lower reading level and remove jargon.',
      icon: <Wand2 className="w-4 h-4 text-gray-500" />
    },
    { 
      id: 'past_tense', 
      label: 'Rewrite: Past Tense', 
      description: 'Convert content to past tense.',
      icon: <Wand2 className="w-4 h-4 text-gray-500" />
    },
    { 
      id: 'future_tense', 
      label: 'Rewrite: Future Tense', 
      description: 'Convert content to future tense.',
      icon: <Wand2 className="w-4 h-4 text-gray-500" />
    },
    { 
      id: 'formal', 
      label: 'Rewrite: Make Formal', 
      description: 'Ensure professional and legal tone.',
      icon: <Wand2 className="w-4 h-4 text-gray-500" />
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col ring-1 ring-gray-200">
        
        <div className="p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              AI Clone & Transform
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Create a variation of <span className="font-medium text-gray-700">"{blockName}"</span>
          </p>
        </div>

        <div className="p-4 bg-gray-50/50 space-y-3">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedOption(opt.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                selectedOption === opt.id
                  ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`mt-0.5 p-1.5 rounded-lg ${selectedOption === opt.id ? 'bg-white' : 'bg-gray-100'}`}>
                {opt.icon}
              </div>
              <div>
                <div className={`text-sm font-semibold ${selectedOption === opt.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                  {opt.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {opt.description}
                </div>
              </div>
              {selectedOption === opt.id && (
                <div className="ml-auto mt-2">
                  <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(selectedOption)}
            className="px-6 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            {selectedOption === 'standard' ? 'Duplicate' : 'Generate with AI'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};