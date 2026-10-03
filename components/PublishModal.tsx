
import React, { useState, useEffect, useMemo } from 'react';
import { X, CheckCircle2, ArrowRight, Building2, UploadCloud, AlertTriangle, RefreshCw, CheckSquare, Square, Clock } from 'lucide-react';
import { Site, Template } from '../types';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId?: string;
  templateName: string;
  currentVersion: string;
  status: Template['status'];
  sites: Site[];
  onConfirm: (templateId: string) => void;
  onConfirmUpdates: (templateId: string, siteIds: string[]) => void;
}

interface InternalSiteStatus {
  id: string;
  name: string;
  version: string;
  isSelectedForUpdate: boolean;
  updateStatus?: 'None' | 'Under Review';
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'Active':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'Published':
      return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'Needs Update':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'Under Review':
      return 'text-purple-700 bg-purple-50 border-purple-200';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
};


export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, templateId, templateName, currentVersion, status, sites, onConfirm, onConfirmUpdates }) => {
  const [internalSites, setInternalSites] = useState<InternalSiteStatus[]>([]);

  useEffect(() => {
    if (isOpen && sites) {
      setInternalSites(sites.map(s => ({
        id: s.id,
        name: s.name,
        version: s.version,
        updateStatus: s.updateStatus,
        isSelectedForUpdate: false
      })));
    }
  }, [isOpen, sites]);

  const nextMajorVersion = useMemo(() => {
    const parts = currentVersion.split('.');
    const major = parseInt(parts[0], 10);
    return !isNaN(major) ? `${major + 1}.0` : `${currentVersion} (Release)`;
  }, [currentVersion]);

  const toggleSiteUpdate = (id: string) => {
    setInternalSites(prev => prev.map(s => 
      s.id === id ? { ...s, isSelectedForUpdate: !s.isSelectedForUpdate } : s
    ));
  };

  const handleUpdateAll = () => {
    const outdatedSites = internalSites.filter(s => s.version !== currentVersion);
    const allOutdatedAreSelected = outdatedSites.length > 0 && outdatedSites.every(s => s.isSelectedForUpdate);
    
    setInternalSites(prev => prev.map(s => {
      if (s.version !== currentVersion) {
        return { ...s, isSelectedForUpdate: !allOutdatedAreSelected };
      }
      return s;
    }));
  };

  const handleConfirm = () => {
    if (!templateId) return;

    if (status === 'Draft') {
        onConfirm(templateId);
    } else {
        const idsToUpdate = internalSites.filter(s => s.isSelectedForUpdate).map(s => s.id);
        onConfirmUpdates(templateId, idsToUpdate);
    }
  };

  if (!isOpen) return null;

  const sitesToUpdateCount = internalSites.filter(s => s.isSelectedForUpdate).length;
  const outdatedSites = internalSites.filter(s => s.version !== currentVersion);
  const outdatedSitesCount = outdatedSites.length;
  const allOutdatedSelected = outdatedSitesCount > 0 && outdatedSites.every(s => s.isSelectedForUpdate);

  const isPublishFlow = status === 'Draft';

  const title = isPublishFlow ? 'Publish to Sites' : 'Site Details & Updates';
  const description = isPublishFlow
    ? `Deploy version ${currentVersion} of "${templateName}" to participating sites.`
    : `Review status for version ${currentVersion}. You can deploy updates to sites on older versions.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${isPublishFlow ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                {isPublishFlow ? <UploadCloud className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
             </div>
             <div>
               <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
               <p className="text-sm text-gray-500 mt-1 max-w-md">{description}</p>
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
        <div className="p-6 overflow-y-auto bg-gray-50/50">
           {isPublishFlow ? (
             <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
               <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
               <h3 className="text-lg font-medium text-gray-800">Ready to Publish?</h3>
               <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
                 This will finalize draft <strong className="text-gray-700">v{currentVersion}</strong> and create new release <strong className="text-gray-900 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">v{nextMajorVersion}</strong>.
               </p>
               <p className="text-sm text-gray-500 mt-2">
                 The template status will change to 'Rolling Out' and sites can begin updating to the new major version.
               </p>
             </div>
           ) : (
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
               <div className="p-4 flex justify-between items-center border-b border-gray-200 bg-gray-50/50">
                 <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                   <Building2 className="w-4 h-4 text-gray-400" />
                   Site Status ({sites.length} total)
                 </h4>
                 {outdatedSitesCount > 0 && (
                    <button 
                      onClick={handleUpdateAll}
                      className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      {allOutdatedSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                      Select all ({outdatedSitesCount})
                    </button>
                 )}
               </div>
               
               <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {internalSites.map(site => {
                     let siteStatus = 'Active';
                     if (site.version !== currentVersion) {
                         siteStatus = site.updateStatus === 'Under Review' ? 'Under Review' : 'Needs Update';
                     }
                     
                     return (
                       <div key={site.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center text-sm">
                          <div className="col-span-6 flex items-center gap-3">
                             {siteStatus !== 'Active' ? (
                                <button onClick={() => toggleSiteUpdate(site.id)}>
                                   {site.isSelectedForUpdate ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5 text-gray-300" />}
                                </button>
                             ) : (
                                <div className="w-5 h-5 flex items-center justify-center">
                                   <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                </div>
                             )}
                             <span className="font-medium text-gray-800">{site.name}</span>
                          </div>
                          <div className="col-span-3 font-mono text-gray-500">
                             {site.version}
                             {siteStatus !== 'Active' && <ArrowRight className="inline w-3 h-3 mx-1 text-gray-400" />}
                             {siteStatus !== 'Active' && <span className="font-semibold text-gray-800">{currentVersion}</span>}
                          </div>
                          <div className="col-span-3">
                             <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(siteStatus)}`}>
                               {siteStatus}
                             </span>
                          </div>
                       </div>
                     );
                  })}
               </div>
               {outdatedSitesCount === 0 && (
                  <div className="p-8 text-center text-sm text-gray-500 bg-emerald-50/30">
                     <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                     All sites are up to date with version {currentVersion}.
                  </div>
               )}
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/80 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!isPublishFlow && sitesToUpdateCount === 0}
            className="px-6 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPublishFlow ? (
              <>
                <UploadCloud className="w-4 h-4" /> Publish Template
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" /> 
                {sitesToUpdateCount > 0 ? `Process ${sitesToUpdateCount} Site(s)` : 'Process Sites'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
