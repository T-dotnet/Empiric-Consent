
import React from 'react';
import { X, Info } from 'lucide-react';
import { Template } from '../types';

interface TemplateSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (templateId: string, newName: string) => void;
  template: Template | null;
}

export const TemplateSettingsModal: React.FC<TemplateSettingsModalProps> = ({ isOpen, onClose, template }) => {
  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col ring-1 ring-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
               <Info className="w-5 h-5" />
             </div>
             <div>
               <h2 className="text-xl font-semibold text-gray-900">Template Details</h2>
               <p className="text-sm text-gray-500 mt-1">View template metadata and properties.</p>
             </div>
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
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Template Name</p>
            <p className="text-lg font-semibold text-gray-900">{template.name}</p>
          </div>

          <div className="h-px bg-gray-100"></div>

          {/* Other Info (Read-only) */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
             <div className="text-sm">
                <p className="text-gray-500 font-medium uppercase tracking-wider text-[10px]">Status</p>
                <p className="text-gray-800 font-semibold mt-1">{template.status}</p>
             </div>
             <div className="text-sm">
                <p className="text-gray-500 font-medium uppercase tracking-wider text-[10px]">Skeleton</p>
                <p className="text-gray-800 font-semibold mt-1">{template.skeleton || 'N/A'}</p>
             </div>
             <div className="text-sm">
                <p className="text-gray-500 font-medium uppercase tracking-wider text-[10px]">Last Updated</p>
                <p className="text-gray-800 font-semibold mt-1">{template.lastUpdated}</p>
             </div>
             <div className="text-sm">
                <p className="text-gray-500 font-medium uppercase tracking-wider text-[10px]">Updated By</p>
                <p className="text-gray-800 font-semibold mt-1">{template.updatedBy || 'N/A'}</p>
             </div>
             <div className="text-sm col-span-2">
                <p className="text-gray-500 font-medium uppercase tracking-wider text-[10px]">Template ID</p>
                <p className="text-gray-800 font-mono text-xs mt-1 bg-gray-50 px-2 py-1 rounded border border-gray-100 inline-block">{template.id.toUpperCase()}</p>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
