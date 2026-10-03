import React from 'react';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { Block } from '../types';

interface NotesPanelProps {
  blocks: Block[];
  onUpdateNote: (blockId: string, note: string) => void;
  readOnly: boolean;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ blocks, onUpdateNote, readOnly }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col max-h-[calc(100vh-140px)] sticky top-24">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          Review Notes
        </h3>
        <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
          {blocks.length} sections
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {blocks.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-sm">No blocks visible.</p>
          </div>
        ) : (
          blocks.map((block) => (
            <div key={block.id} className="group">
              <div className="flex items-center justify-between mb-2">
                <label 
                  htmlFor={`note-${block.id}`}
                  className={`text-xs font-semibold truncate max-w-[200px] ${block.isDisabled ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                  title={block.contentName}
                >
                  {block.contentName}
                </label>
                <span className="text-[10px] text-gray-400 font-mono">v{block.version}</span>
              </div>
              
              <div className="relative">
                <textarea
                  id={`note-${block.id}`}
                  value={block.notes || ''}
                  onChange={(e) => onUpdateNote(block.id, e.target.value)}
                  readOnly={readOnly}
                  placeholder={readOnly ? "No notes added." : "Add internal note..."}
                  className={`w-full text-xs p-3 rounded-lg border transition-all resize-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none
                    ${block.notes 
                      ? 'bg-amber-50 border-amber-200 text-gray-800' 
                      : 'bg-gray-50 border-gray-200 text-gray-600 focus:bg-white placeholder:text-gray-400'
                    }
                    ${readOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
                  `}
                  rows={block.notes ? 3 : 2}
                />
                {block.notes && (
                   <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-400 rounded-full" title="Has note"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-3 border-t border-gray-100 bg-gray-50/30 text-[10px] text-gray-400 text-center">
        Notes are internal and not visible to participants.
      </div>
    </div>
  );
};