
import React from 'react';
import { ArrowUpRight, Clock, Beaker, ChevronLeft, Info, UploadCloud, Building2, Save } from 'lucide-react';
import { Template } from '../types';

interface HeaderProps {
  template: Template;
  selectedVersion: string;
  isReadOnly: boolean;
  realStatus: Template['status'];
  latestPublishedVersion?: string | null;
  onBack: () => void;
  onTestLogic: () => void;
  onPublish: () => void;
  onOpenSettings: () => void;
  onUnlock: () => void;
  onSaveDraft: () => void;
  onOpenAuditLog: () => void;
}

const getStatusStyles = (status: Template['status']) => {
  switch (status) {
    case 'Active':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    case 'Published':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'Rolling Out':
      return 'bg-purple-100 text-purple-800 border border-purple-200';
    case 'Draft':
      return 'bg-amber-100 text-amber-800 border border-amber-200 font-medium';
    case 'Archived':
      return 'bg-gray-100 text-gray-800 border border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const Header = ({ template, selectedVersion, isReadOnly, onBack, onTestLogic, onPublish, onOpenSettings, onSaveDraft, onOpenAuditLog }: HeaderProps) => {
  const isPublishedOrRollingOut = template.status === 'Active' || template.status === 'Published' || template.status === 'Rolling Out';
  const statusToShow = template.status;

  return (
    <div className="mb-8">
      {/* Navigation */}
      <div className="mb-8">
        <button 
          onClick={onBack} 
          className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-indigo-600 transition-all group uppercase tracking-widest"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to list
        </button>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        {/* Title and Metadata */}
        <div>
          {/* Template Identity Labels */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{template.name}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="font-mono text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 uppercase tracking-wider shadow-sm">
              {template.id}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-serif font-bold text-gray-900 tracking-tight">
              Version {selectedVersion}
            </h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${getStatusStyles(statusToShow)}`}>
              {statusToShow.toUpperCase()}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
             <span className="flex items-center gap-1.5">
               <Clock className="w-4 h-4 text-gray-400" />
               Last updated <span className="text-gray-700 font-medium">{template.lastUpdated}</span>
             </span>
             <button 
               onClick={onOpenAuditLog}
               className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
             >
               Audit Logs <ArrowUpRight className="w-3.5 h-3.5" />
             </button>
             <button 
                onClick={onOpenSettings}
                className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1.5 transition-colors"
            >
               <Info className="w-3.5 h-3.5" /> Details
             </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onTestLogic}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm"
          >
            <Beaker className="w-4 h-4 text-gray-500" /> Test Logic
          </button>
          
          {!isReadOnly && (
            <button
                onClick={onSaveDraft}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm"
            >
                <Save className="w-4 h-4 text-gray-500" /> Save Draft
            </button>
          )}
          
          <button 
            onClick={onPublish}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            {isPublishedOrRollingOut ? <Building2 className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
            {isPublishedOrRollingOut ? 'Site List' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
};
