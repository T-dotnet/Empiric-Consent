
import React, { useState, useMemo } from 'react';
import { X, Clock, FileText, User, Split, GitCommit, LayoutTemplate } from 'lucide-react';
import { Block, BlockHistoryEntry } from '../types';
import { DiffViewer } from './DiffViewer';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: Block | null;
  currentTemplateVersion?: string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, block, currentTemplateVersion }) => {
  const [showDiff, setShowDiff] = useState(false);

  // Construct full history including the current state if it's missing from the history array
  const sortedHistory = useMemo(() => {
    if (!block) return [];
    
    const history = [...block.history];
    const isCurrentInHistory = history.some(h => h.version === block.version);

    if (!isCurrentInHistory) {
      // Synthesize an entry for the current version
      const currentEntry: BlockHistoryEntry = {
        version: block.version,
        templateVersion: currentTemplateVersion || 'N/A',
        updatedAt: block.lastUpdated,
        editedBy: 'Current User', // Placeholder as Block doesn't store this field directly at top level usually
        changeDescription: 'Current version',
        contentSnapshot: block.content || '',
      };
      history.unshift(currentEntry);
    }

    return history.sort((a, b) => parseFloat(b.version) - parseFloat(a.version));
  }, [block, currentTemplateVersion]);

  if (!isOpen || !block) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] ring-1 ring-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Version History</h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              {block.contentName}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-gray-100 bg-white flex justify-end">
           <button
             onClick={() => setShowDiff(!showDiff)}
             className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all flex items-center gap-2 ${
               showDiff 
                 ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-inner' 
                 : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 shadow-sm'
             }`}
           >
             <Split className="w-3.5 h-3.5" />
             {showDiff ? 'Hide Changes' : 'Highlight Changes'}
           </button>
        </div>

        {/* Timeline Body */}
        <div className="p-6 overflow-y-auto bg-white">
          {sortedHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No edit history available yet.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 my-2">
              {sortedHistory.map((entry, index) => {
                // Compare against the next entry in the list (chronologically previous)
                const previousEntry = index < sortedHistory.length - 1 ? sortedHistory[index + 1] : null;
                const comparisonContent = previousEntry ? previousEntry.contentSnapshot : '';
                const isMajorVersion = entry.version.endsWith('.0');
                const isCurrent = index === 0;
                
                return (
                  <div key={index} className="relative pl-8">
                    {/* Dot */}
                    <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                      isMajorVersion
                        ? 'bg-purple-600 ring-4 ring-purple-50'
                        : isCurrent
                          ? 'bg-amber-500 ring-4 ring-amber-50' 
                          : 'bg-gray-300'
                    }`}></div>
                    
                    {/* Content */}
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`text-sm font-bold ${isCurrent ? 'text-gray-900' : 'text-gray-600'}`}>
                          Version {entry.version}
                        </span>
                        
                        {isCurrent && (
                          <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Current
                          </span>
                        )}

                        {entry.templateVersion && (
                          <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1" title="Template Version">
                            <LayoutTemplate className="w-3 h-3" />
                            Template v{entry.templateVersion}
                          </span>
                        )}

                        {isMajorVersion && !entry.templateVersion && (
                          <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                            <GitCommit className="w-3 h-3" />
                            Update
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {entry.updatedAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {entry.editedBy}
                        </span>
                      </div>
                      
                      {entry.changeDescription && (
                         <div className="text-xs text-gray-400 mt-1 italic">
                           {entry.changeDescription}
                         </div>
                      )}

                      <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {showDiff && previousEntry && (
                           <div className="flex justify-end mb-2">
                              <div className="flex gap-2 text-[9px] text-gray-400">
                                 <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-100 border border-red-200 rounded"></span> Removed</span>
                                 <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-100 border border-emerald-200 rounded"></span> Added</span>
                              </div>
                           </div>
                        )}
                        
                        <div className="text-xs text-gray-600 font-mono bg-white p-2 rounded border border-gray-200 overflow-x-auto max-h-[200px] overflow-y-auto">
                           {showDiff ? (
                             <DiffViewer oldText={comparisonContent} newText={entry.contentSnapshot} />
                           ) : (
                             <p className="whitespace-pre-wrap leading-relaxed">{entry.contentSnapshot}</p>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
             <button onClick={onClose} className="text-sm text-gray-600 hover:text-gray-900 font-medium">Close</button>
        </div>

      </div>
    </div>
  );
};
