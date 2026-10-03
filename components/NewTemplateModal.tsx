




import React, { useState } from 'react';
import { X, Blocks, ChevronRight, Check } from 'lucide-react';
import { Skeleton } from '../types';

interface NewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, skeletonId: string) => void;
  skeletons: Skeleton[];
}

export const NewTemplateModal: React.FC<NewTemplateModalProps> = ({ isOpen, onClose, onCreate, skeletons }) => {
  const [templateName, setTemplateName] = useState('');
  
  // Filter only active skeletons
  const activeSkeletons = skeletons.filter(s => s.status !== 'Archived');
  
  const [selectedSkeletonId, setSelectedSkeletonId] = useState(activeSkeletons.length > 0 ? activeSkeletons[0].id : '');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (templateName.trim()) {
      onCreate(templateName, selectedSkeletonId);
      setTemplateName(''); // Reset
      if (activeSkeletons.length > 0) setSelectedSkeletonId(activeSkeletons[0].id); // Reset
    }
  };

  const selectedSkeleton = skeletons.find(s => s.id === selectedSkeletonId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col ring-1 ring-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">New Template</h2>
            <p className="text-sm text-gray-500 mt-1">Create a new consent form from a skeleton.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6 bg-white">
          
          {/* 1. Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Template Name</label>
            <input 
              type="text" 
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. Phase III Cardiovascular Study"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all placeholder:text-gray-400"
              autoFocus
            />
          </div>

          {/* 2. Skeleton Selection */}
          <div className="space-y-3">
             <label className="block text-sm font-medium text-gray-700">Select Skeleton</label>
             <div className="space-y-3 max-h-[300px] overflow-y-auto">
               {activeSkeletons.length === 0 ? (
                 <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-100 rounded-xl">
                   No active skeletons available.
                 </div>
               ) : (
                 activeSkeletons.map(skeleton => (
                   <button
                     key={skeleton.id}
                     onClick={() => setSelectedSkeletonId(skeleton.id)}
                     className={`relative w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                       selectedSkeletonId === skeleton.id 
                         ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' 
                         : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                     }`}
                   >
                      {selectedSkeletonId === skeleton.id && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg w-fit shrink-0">
                         <Blocks className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold text-sm ${selectedSkeletonId === skeleton.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                          {skeleton.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {skeleton.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{skeleton.blocks.length} blocks</span>
                        </div>
                      </div>
                   </button>
                 ))
               )}
             </div>
          </div>
          
          {/* Preview of selected skeleton logic */}
          {selectedSkeleton && (
             <div className="bg-gray-50 rounded-lg p-4 border border-gray-200/60">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Included Blocks & Logic</h4>
                <div className="flex flex-wrap gap-2">
                   {selectedSkeleton.blocks.map((b, i) => (
                      <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs border border-gray-200 bg-white text-gray-600 shadow-sm" title={b.rules?.length ? `${b.rules.length} logic rules` : 'No rules'}>
                        {b.contentName}
                        {b.rules && b.rules.length > 0 && (
                          <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        )}
                      </span>
                   ))}
                </div>
             </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            disabled={!templateName.trim() || !selectedSkeletonId}
            className="px-6 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2"
          >
            Create Template <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};