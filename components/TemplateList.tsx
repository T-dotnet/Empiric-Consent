
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  ChevronLeft,
  ChevronRight,
  Building2,
  Clock,
  User,
  Eye,
  PenLine,
  RefreshCw
} from 'lucide-react';
import { Template, Site, Skeleton } from '../types';

interface TemplateListProps {
  templates: Template[];
  skeletons: Skeleton[];
  sitesByTemplate: Record<string, Site[]>;
  onSelectTemplate: (template: Template) => void;
  onSelectVersion: (template: Template, version: string) => void;
  onCreateTemplate: () => void;
  onCreateSkeleton: () => void;
  onEditSkeleton: (skeleton: Skeleton) => void;
  onArchiveSkeleton: (skeletonId: string) => void;
  onTestLogic: (template: Template) => void;
  onArchive: (templateId: string) => void;
  onUpdateSite: (templateId: string, siteId: string) => void;
  onOpenSiteDetails: (template?: Template, filter?: string | string[]) => void;
  onCreateDraft?: (template: Template) => void;
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'Active':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200 font-bold';
    case 'Published':
      return 'text-blue-700 bg-blue-50 border-blue-200 font-bold';
    case 'Rolling Out':
      return 'text-purple-700 bg-purple-50 border-purple-200 font-bold';
    case 'Draft':
      return 'text-amber-700 bg-amber-50 border-amber-200 font-bold';
    case 'Archived':
      return 'text-gray-700 bg-gray-50 border-gray-200';
    case 'Snapshot':
      return 'text-slate-600 bg-slate-100 border-slate-200';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
};

interface VersionRowProps {
  version: string;
  status: string;
  lastUpdated: string;
  updatedBy: string;
  isCurrent: boolean;
  onView: () => void;
  onEdit?: () => void;
  sitesNeedingUpdateCount?: number;
  sitesCount?: number;
  onManagePending?: () => void;
}

const VersionRow: React.FC<VersionRowProps> = ({ 
  version, 
  status, 
  lastUpdated, 
  updatedBy, 
  isCurrent, 
  onView,
  onEdit,
  sitesNeedingUpdateCount,
  sitesCount,
  onManagePending
}) => {
  const isDraft = status === 'Draft';

  return (
    <tr className={`group transition-colors hover:bg-gray-50/50 ${isCurrent ? 'bg-indigo-50/10' : ''}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <button 
          onClick={(e) => { e.stopPropagation(); isDraft && onEdit ? onEdit() : onView(); }}
          className="flex items-center gap-2 group/ver outline-none text-left"
        >
           <span className={`font-mono text-sm transition-all ${
             isCurrent 
               ? 'font-bold text-indigo-700' 
               : 'font-semibold text-gray-900 group-hover/ver:text-indigo-600 group-hover/ver:underline'
           }`}>
             v{version}
           </span>
        </button>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col items-start gap-1.5">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider border ${getStatusStyles(status)}`}>
            {status}
            </span>
            {status === 'Rolling Out' && (sitesNeedingUpdateCount || 0) > 0 && (
            <button
                onClick={(e) => { e.stopPropagation(); onManagePending?.(); }}
                className="text-[10px] font-semibold text-amber-600 pl-0.5 flex items-center gap-1.5 hover:text-amber-800 hover:underline cursor-pointer transition-all"
            >
                <RefreshCw className="w-3 h-3 text-amber-500" />
                {sitesNeedingUpdateCount} site{(sitesNeedingUpdateCount || 0) !== 1 ? 's' : ''} pending
            </button>
            )}
            {status === 'Published' && (sitesCount || 0) > 0 && (
            <div className="text-[10px] font-semibold text-blue-600 pl-0.5 flex items-center gap-1.5 cursor-default">
                <Building2 className="w-3 h-3 text-blue-500" />
                {sitesCount} site{(sitesCount || 0) !== 1 ? 's' : ''} active
            </div>
            )}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
             <Clock className="w-3.5 h-3.5 text-gray-400" />
             {lastUpdated}
          </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
             <User className="w-3.5 h-3.5 text-gray-400" />
             {updatedBy}
          </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
        <div className="flex items-center justify-end gap-2">
            {isDraft && onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-medium transition-colors shadow-sm hover:bg-indigo-100"
              >
                <PenLine className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onView(); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
        </div>
      </td>
    </tr>
  );
};

export const TemplateList: React.FC<TemplateListProps> = ({ templates, sitesByTemplate, onSelectVersion, onCreateTemplate, onOpenSiteDetails, onTestLogic, onCreateDraft }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const activeTemplate = templates.length > 0 ? templates[0] : null;

  const versions = useMemo(() => {
      if (!activeTemplate) return [];
      
      const allVersionsRaw = [
          {
              version: activeTemplate.version,
              status: activeTemplate.status,
              lastUpdated: activeTemplate.lastUpdated,
              updatedBy: activeTemplate.updatedBy || 'Unknown',
              isCurrent: true
          }
      ];
      
      if (activeTemplate.history && activeTemplate.history.length > 0) {
          activeTemplate.history.forEach(h => {
              allVersionsRaw.push({
                  version: h.version,
                  status: 'Archived', // default, will be calculated below
                  lastUpdated: h.lastUpdated,
                  updatedBy: h.updatedBy,
                  isCurrent: false
              });
          });
      }

      // Sort descending
      allVersionsRaw.sort((a, b) => parseFloat(b.version) - parseFloat(a.version));

      // Determine Live/Active Version (highest X.0)
      const liveVersionItem = allVersionsRaw.find(v => v.version.endsWith('.0'));
      const liveVersion = liveVersionItem ? liveVersionItem.version : null;
      
      const sites = sitesByTemplate[activeTemplate.id] || [];

      return allVersionsRaw.map(v => {
          let status = v.status;
          let sitesNeedingUpdateCount = 0;
          let sitesCount = 0;
          
          const sitesOnVersion = sites.filter(s => s.version === v.version);
          sitesCount = sitesOnVersion.length;
          
          if (v.version === liveVersion) {
              // This is the latest major version. It should be Active or Rolling Out.
              const allOnTarget = sites.length > 0 && sites.every(s => s.version === v.version);
              
              if (v.isCurrent) {
                  // If it's the current active template, use its status (likely Active/Rolling Out)
                  if (v.status === 'Rolling Out') {
                      if (allOnTarget) status = 'Active';
                  } else if (v.status === 'Published') {
                      status = 'Active';
                  }
              } else {
                  // It's in history. Infer status based on site uptake.
                  status = (sites.length === 0 || allOnTarget) ? 'Active' : 'Rolling Out';
              }

              if (status === 'Rolling Out') {
                  sitesNeedingUpdateCount = sites.filter(s => s.version !== v.version).length;
              }
          } else if (v.version.endsWith('.0') && v.version !== liveVersion) {
              // This is a previous major version.
              // Mark as 'Published' only if sites are still using it, otherwise 'Archived'
              const isUsedBySites = sitesCount > 0;
              status = isUsedBySites ? 'Published' : 'Archived';
          } else if (!v.isCurrent) {
              // Intermediate drafts that are not current are Archived
              status = 'Archived';
          }
          
          return { ...v, status, sitesNeedingUpdateCount, sitesCount };
      });
  }, [activeTemplate, sitesByTemplate]);

  const totalPages = Math.ceil(versions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVersions = versions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEditVersion = (versionItem: any) => {
      onSelectVersion(activeTemplate!, versionItem.version);
  };

  const handleViewVersion = (versionItem: any) => {
      const snapshotTemplate: Template = {
          ...activeTemplate!,
          version: versionItem.version,
          status: versionItem.status as Template['status'],
          lastUpdated: versionItem.lastUpdated,
          updatedBy: versionItem.updatedBy,
          blocks: activeTemplate!.history?.find(h => h.version === versionItem.version)?.blocksSnapshot || activeTemplate!.blocks
      };
      onTestLogic(snapshotTemplate);
  };
  
  if (!activeTemplate) return null;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 tracking-tight">{activeTemplate.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onOpenSiteDetails(activeTemplate)}
            className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm"
          >
            <Building2 className="w-4 h-4 text-gray-500" /> Manage Sites
          </button>
          
          <button 
            onClick={() => onCreateDraft?.(activeTemplate)}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" /> Create Draft
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Version</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Updated By</th>
                <th scope="col" className="relative px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentVersions.map((v) => (
                <VersionRow 
                  key={v.version}
                  version={v.version}
                  status={v.status}
                  lastUpdated={v.lastUpdated}
                  updatedBy={v.updatedBy}
                  isCurrent={v.isCurrent}
                  sitesNeedingUpdateCount={v.sitesNeedingUpdateCount}
                  sitesCount={v.sitesCount}
                  onView={() => handleViewVersion(v)}
                  onEdit={v.status === 'Draft' ? () => handleEditVersion(v) : undefined}
                  onManagePending={() => onOpenSiteDetails(activeTemplate, ['Needs Update', 'Under Review'])}
                />
              ))}
            </tbody>
          </table>
        </div>
        
        {versions.length > itemsPerPage && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, versions.length)}</span> of <span className="font-semibold">{versions.length}</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-gray-700">Page {currentPage} of {totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
