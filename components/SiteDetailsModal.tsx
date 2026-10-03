
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Building2, RefreshCw, CheckCircle2, ArrowRight, Square, CheckSquare, ChevronDown, Search, Filter, Clock, Check } from 'lucide-react';
import { Site, Template } from '../types';

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'Active': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'Under Review': return 'text-purple-700 bg-purple-50 border-purple-200';
    case 'Needs Update': return 'text-amber-700 bg-amber-50 border-amber-200';
    default: return 'text-gray-700 bg-gray-50 border-gray-200';
  }
};

interface SiteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template | null;
  allTemplates: Template[];
  sites: Site[];
  onUpdateSites: (templateId: string, siteIds: string[]) => void;
  onSelectTemplate: (template: Template) => void;
  initialStatusFilter?: string | string[];
}

export const SiteDetailsModal: React.FC<SiteDetailsModalProps> = ({ isOpen, onClose, template, allTemplates, sites, onUpdateSites, onSelectTemplate, initialStatusFilter = 'All' }) => {
  const [selectedSiteIds, setSelectedSiteIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Status Filter State (Multi-select)
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const [versionFilter, setVersionFilter] = useState<string>('All');

  // Use the rolling/published version if we are currently looking at a draft
  const activeVersion = useMemo(() => {
    if (!template) return '';
    // If it's a draft, the "target" for updates is the latest stable major version (X.0)
    // If not found, fall back to previousVersion or current (though current is draft)
    if (template.status === 'Draft') {
       const history = template.history || [];
       const majors = history.filter(h => h.version.endsWith('.0')).sort((a, b) => parseFloat(b.version) - parseFloat(a.version));
       if (majors.length > 0) return majors[0].version;
       if (template.previousVersion) return template.previousVersion;
    }
    return template.version;
  }, [template]);

  // Only allow updates if the target version is a major release (X.0)
  const isTargetMajor = activeVersion.endsWith('.0');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Reset selection when template changes or modal opens
      setSelectedSiteIds(new Set());
      setSearchQuery('');
      
      // Initialize filters based on prop, but allow multi-select state
      if (initialStatusFilter && initialStatusFilter !== 'All') {
          if (Array.isArray(initialStatusFilter)) {
              setStatusFilters(new Set(initialStatusFilter));
          } else {
              setStatusFilters(new Set([initialStatusFilter]));
          }
      } else {
          setStatusFilters(new Set());
      }
      
      setVersionFilter('All');
    }
  }, [isOpen, template?.id, initialStatusFilter]);

  const uniqueVersions = useMemo(() => {
    return Array.from(new Set(sites.map(s => s.version))).sort((a, b) => parseFloat(b as string) - parseFloat(a as string));
  }, [sites]);

  const filteredSites = useMemo(() => {
    return sites.map(site => {
        // Determine logical status
        let status: 'Active' | 'Needs Update' | 'Under Review' = 'Active';
        if (site.version !== activeVersion && isTargetMajor) {
            if (site.updateStatus === 'Under Review') {
                status = 'Under Review';
            } else {
                status = 'Needs Update';
            }
        }
        return { ...site, computedStatus: status };
    }).filter(site => {
      // Search
      if (searchQuery && !site.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Status Filter (Multi-select logic: if empty, show all; otherwise must match one of selected)
      if (statusFilters.size > 0 && !statusFilters.has(site.computedStatus)) return false;

      // Version Filter
      if (versionFilter !== 'All' && site.version !== versionFilter) return false;

      return true;
    });
  }, [sites, searchQuery, statusFilters, versionFilter, activeVersion, isTargetMajor]);

  const toggleStatusFilter = (status: string) => {
      const newFilters = new Set(statusFilters);
      if (newFilters.has(status)) {
          newFilters.delete(status);
      } else {
          newFilters.add(status);
      }
      setStatusFilters(newFilters);
  };

  if (!isOpen || !template) return null;

  // Calculating bulk actions based on filtered view
  // Only sites that are NOT active can be updated (either from Needs Update -> Review, or Review -> Active)
  const sitesNeedingActionInView = filteredSites.filter(s => s.computedStatus !== 'Active');
  const canUpdateCount = sitesNeedingActionInView.length;
  
  // Check if all *updateable* sites in current view are selected
  const areAllUpdateableSelected = canUpdateCount > 0 && sitesNeedingActionInView.every(s => selectedSiteIds.has(s.id));

  const handleToggleSelect = (siteId: string) => {
    const newSelected = new Set(selectedSiteIds);
    if (newSelected.has(siteId)) {
      newSelected.delete(siteId);
    } else {
      newSelected.add(siteId);
    }
    setSelectedSiteIds(newSelected);
  };

  const handleSelectAll = () => {
    if (areAllUpdateableSelected) {
      // Deselect all visible updateable sites
      const newSelected = new Set(selectedSiteIds);
      sitesNeedingActionInView.forEach(s => newSelected.delete(s.id));
      setSelectedSiteIds(newSelected);
    } else {
      // Select all visible updateable sites
      const newSelected = new Set(selectedSiteIds);
      sitesNeedingActionInView.forEach(s => newSelected.add(s.id));
      setSelectedSiteIds(newSelected);
    }
  };

  const handleUpdateSelected = () => {
    onUpdateSites(template.id, Array.from(selectedSiteIds));
    setSelectedSiteIds(new Set());
  };

  const handleUpdateSingle = (siteId: string) => {
     onUpdateSites(template.id, [siteId]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Sites</h2>
              <p className="text-sm text-gray-500 mt-1">Review and deploy version updates to participating sites.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Info Sub-header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div className="flex items-center gap-2">
             <span className="text-sm font-medium text-gray-700">Target Release:</span>
             <span className="text-sm font-bold text-gray-900">{template.name}</span>
             <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-mono font-bold">v{activeVersion}</span>
           </div>
        </div>

        {/* Filters Toolbar */}
        <div className="px-6 py-3 border-b border-gray-200 bg-white grid grid-cols-12 gap-4 items-center">
            {/* Search */}
            <div className="col-span-12 sm:col-span-5 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sites..." 
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all placeholder:text-gray-400"
                />
            </div>

            {/* Status Filters (Multi-select) */}
            <div className="col-span-6 sm:col-span-3" ref={statusDropdownRef}>
               <div className="relative">
                  <button
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all cursor-pointer text-gray-600 flex items-center justify-between"
                  >
                    <span className="truncate">
                        {statusFilters.size === 0 ? 'All Statuses' : 
                         statusFilters.size === 1 ? Array.from(statusFilters)[0] : 
                         `${statusFilters.size} selected`}
                    </span>
                    <Filter className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {isStatusDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full min-w-[200px] bg-white border border-gray-100 rounded-lg shadow-xl py-1 z-20">
                        <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Filter by Status</div>
                        {['Needs Update', 'Under Review', 'Active'].map(status => (
                            <div 
                                key={status} 
                                onClick={() => toggleStatusFilter(status)}
                                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer group"
                            >
                                <div className={`w-4 h-4 rounded border mr-2 flex items-center justify-center transition-colors ${statusFilters.has(status) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white group-hover:border-indigo-300'}`}>
                                    {statusFilters.has(status) && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className={`text-sm ${statusFilters.has(status) ? 'text-indigo-900 font-medium' : 'text-gray-700'}`}>{status}</span>
                            </div>
                        ))}
                        {statusFilters.size > 0 && (
                            <div className="border-t border-gray-100 mt-1 pt-1">
                                <button
                                   onClick={() => setStatusFilters(new Set())}
                                   className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:text-indigo-600 hover:bg-gray-50"
                                >
                                   Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                  )}
               </div>
            </div>

            <div className="col-span-6 sm:col-span-4">
               <div className="relative">
                  <select 
                    value={versionFilter}
                    onChange={(e) => setVersionFilter(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 cursor-pointer text-gray-600"
                  >
                    <option value="All">All Versions</option>
                    {uniqueVersions.map(v => (
                      <option key={v as string} value={v as string}>Version {v as string}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
               </div>
            </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="p-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 items-center">
                <div className="col-span-5 flex items-center gap-3">
                   <button 
                      onClick={handleSelectAll} 
                      disabled={canUpdateCount === 0}
                      className="text-gray-400 hover:text-indigo-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={areAllUpdateableSelected ? "Deselect All Needs Update" : "Select All Needs Update"}
                    >
                        {areAllUpdateableSelected && canUpdateCount > 0 ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                    </button>
                   <span>Site Name</span>
                </div>
                <div className="col-span-3">Current Version</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Action</div>
              </div>
              
              {/* Site List */}
              {filteredSites.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredSites.map(site => {
                    const statusLabel = site.computedStatus;
                    const canAction = statusLabel !== 'Active';
                    const isSelected = selectedSiteIds.has(site.id);

                    return (
                      <div key={site.id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center text-sm transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                        <div className="col-span-5 flex items-center gap-3">
                          {canAction ? (
                             <button onClick={() => handleToggleSelect(site.id)} className="text-gray-300 hover:text-indigo-600">
                               {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                             </button>
                          ) : (
                             <div className="w-4 h-4 flex items-center justify-center" title="Active">
                               <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                             </div>
                          )}
                          <div className="flex flex-col">
                             <span className="font-medium text-gray-800 truncate" title={site.name}>{site.name}</span>
                             <span className="text-[10px] text-gray-400 font-mono">ID: {site.id}</span>
                          </div>
                        </div>
                        <div className="col-span-3 font-mono text-gray-600 flex items-center">
                          <span className={`px-2 py-0.5 rounded border ${statusLabel !== 'Active' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-gray-50 border-gray-200'}`}>v{site.version}</span>
                          {statusLabel !== 'Active' && (
                            <>
                              <ArrowRight className="w-3 h-3 mx-2 text-gray-300" />
                              <span className="font-bold text-indigo-700">v{activeVersion}</span>
                            </>
                          )}
                        </div>
                        <div className="col-span-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusStyles(statusLabel)}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <div className="col-span-2 text-right">
                          {statusLabel === 'Needs Update' ? (
                            <button
                              onClick={() => handleUpdateSingle(site.id)}
                              className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ml-auto border border-indigo-100"
                            >
                              <RefreshCw className="w-3 h-3" /> Update
                            </button>
                          ) : statusLabel === 'Under Review' ? (
                            <button
                              onClick={() => handleUpdateSingle(site.id)}
                              className="text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ml-auto border border-purple-100"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Approve
                            </button>
                          ) : (
                            <span className="text-xs font-medium text-emerald-600 flex items-center justify-end gap-1.5">
                              <CheckCircle2 className="w-4 h-4" /> Up-to-date
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-sm text-gray-400 flex flex-col items-center">
                  <Search className="w-8 h-8 text-gray-200 mb-2" />
                  <p>No sites match your filters.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setStatusFilters(new Set()); setVersionFilter('All'); }}
                    className="mt-2 text-indigo-600 hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/80 flex justify-between items-center gap-3">
          <div className="text-sm text-gray-500">
            {selectedSiteIds.size > 0 ? (
               <span className="font-medium text-indigo-600">{selectedSiteIds.size} site(s) selected</span>
            ) : (
               <span>Select sites to perform bulk actions</span>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm">
              Close
            </button>
            <button 
              onClick={handleUpdateSelected} 
              disabled={selectedSiteIds.size === 0}
              className="px-6 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" /> Process Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
