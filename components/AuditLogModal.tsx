import React, { useMemo } from 'react';
import { X, Clock, User, GitCommit, LayoutTemplate, Layers, Edit3, Trash2, ShieldAlert } from 'lucide-react';
import { Template } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose, template }) => {
  if (!isOpen) return null;

  const allEvents = useMemo(() => {
    const events: {
      id: string;
      type: 'Template' | 'Block';
      name: string;
      version: string;
      date: string;
      user: string;
      description: string;
      icon?: React.ReactNode;
      isCurrent?: boolean;
    }[] = [];
    
    // 1. Template Events (Snapshots & Current State)
    events.push({
      id: `tmpl_curr_${template.version}`,
      type: 'Template',
      name: template.name,
      version: template.version,
      date: template.lastUpdated,
      user: template.updatedBy || 'Unknown',
      description: `Current Status: ${template.status}`,
      isCurrent: true
    });

    if (template.history) {
      template.history.forEach(h => {
         events.push({
           id: `tmpl_hist_${h.version}`,
           type: 'Template',
           name: template.name,
           version: h.version,
           date: h.lastUpdated,
           user: h.updatedBy,
           description: `Snapshot created (Contains ${h.blocksSnapshot.length} blocks)`,
           isCurrent: false
         });
      });
    }

    // 2. Block Events (Granular Actions)
    template.blocks.forEach(block => {
       block.history.forEach((h, idx) => {
          let icon = <Edit3 className="w-3 h-3 text-gray-500" />;
          if (h.changeDescription.toLowerCase().includes('logic')) icon = <ShieldAlert className="w-3 h-3 text-amber-500" />;
          if (h.changeDescription.toLowerCase().includes('delete') || h.changeDescription.toLowerCase().includes('removed')) icon = <Trash2 className="w-3 h-3 text-red-500" />;

          events.push({
             id: `blk_${block.id}_${h.version}_${idx}`,
             type: 'Block',
             name: block.contentName,
             version: h.version,
             date: h.updatedAt,
             user: h.editedBy,
             description: h.changeDescription,
             icon: icon,
             isCurrent: false
          });
       });
       
       // Add an entry for the *current* state of the block if it has recent edits not yet in history
       // (Usually the current state IS the result of the last history entry, but for clarity we list the current version as active)
       if (block.version !== '1.0' && block.version !== '0.1') {
           // Optional: You could add an entry for "Current Block State" here, but the history usually covers the *changes*
       }
    });

    // Sort by Date (descending)
    return events.sort((a, b) => {
       // Simple date parsing assuming DD.MM.YYYY
       const parseDate = (d: string) => {
          const parts = d.split('.');
          if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
          return 0;
       };
       const timeA = parseDate(a.date);
       const timeB = parseDate(b.date);
       
       if (timeA !== timeB) return timeB - timeA;
       // Secondary sort by version for stability
       return parseFloat(b.version) - parseFloat(a.version);
    });
  }, [template]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] ring-1 ring-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Audit Log</h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <LayoutTemplate className="w-3.5 h-3.5" />
              {template.name} ({template.id})
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline Body */}
        <div className="flex-1 overflow-y-auto bg-white p-0">
            <div className="min-w-full inline-block align-middle">
                <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-3 grid grid-cols-12 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
                    <div className="col-span-3">Time / User</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-3">Context</div>
                    <div className="col-span-3">Action / Description</div>
                    <div className="col-span-1 text-right">Ver</div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {allEvents.map((entry) => {
                    const isTemplate = entry.type === 'Template';
                    return (
                      <div key={entry.id} className={`grid grid-cols-12 gap-4 px-6 py-4 text-sm hover:bg-gray-50/50 transition-colors items-start ${entry.isCurrent ? 'bg-indigo-50/30' : ''}`}>
                         
                         {/* Time & User */}
                         <div className="col-span-3">
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                               <Clock className="w-3.5 h-3.5 text-gray-400" />
                               {entry.date}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 ml-0.5">
                               <User className="w-3 h-3 text-gray-400" />
                               {entry.user}
                            </div>
                         </div>

                         {/* Type */}
                         <div className="col-span-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                               isTemplate 
                                 ? 'bg-purple-50 text-purple-700 border-purple-100' 
                                 : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                               {isTemplate ? <LayoutTemplate className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
                               {entry.type}
                            </span>
                         </div>

                         {/* Context Name */}
                         <div className="col-span-3">
                            <div className="font-medium text-gray-800 truncate" title={entry.name}>
                               {entry.name}
                            </div>
                         </div>

                         {/* Description */}
                         <div className="col-span-3 text-gray-600 flex items-start gap-2">
                            {entry.icon && <div className="mt-0.5 shrink-0">{entry.icon}</div>}
                            <span className="leading-snug">{entry.description}</span>
                         </div>

                         {/* Version */}
                         <div className="col-span-1 text-right font-mono text-xs text-gray-500">
                            v{entry.version}
                         </div>
                      </div>
                    );
                  })}
                </div>
                
                {allEvents.length === 0 && (
                   <div className="text-center py-12 text-gray-400">
                      No audit events recorded yet.
                   </div>
                )}
            </div>
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
             <button onClick={onClose} className="text-sm text-gray-600 hover:text-gray-900 font-medium">Close Log</button>
        </div>

      </div>
    </div>
  );
};