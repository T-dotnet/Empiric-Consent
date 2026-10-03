
import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  PenLine, 
  Trash2, 
  Plus, 
  GitBranch, 
  History, 
  Lock, 
  Info, 
  GitFork, 
  CornerDownRight, 
  AlertTriangle, 
  GripVertical, 
  Copy, 
  Ban, 
  CheckCircle2,
  Link2,
  MessageSquare
} from 'lucide-react';
import { Block, LogicRule, BlockType } from '../types';

interface BlockListProps {
  blocks: Block[];
  allBlocks: Block[];
  isReadOnly: boolean;
  onToggleExpand: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onEditContent: (block: Block) => void;
  onShowHistory: (block: Block) => void;
  onAddLogic: (blockId: string) => void;
  onDeleteLogic: (blockId: string, ruleId: string) => void;
  onRevertBlock: (blockId: string, version: string) => void;
  onToggleDisable: (blockId: string) => void;
  onReorderBlocks: (draggedId: string, targetId: string) => void;
  onUpdateNote: (blockId: string, note: string) => void;
  onAddBlock: (afterId?: string) => void;
  canReorder: boolean;
}

interface LogicRowProps {
  rule: LogicRule;
  onDelete: () => void;
}

const getTypeColor = (type: BlockType) => {
  switch (type) {
    case 'Universal': return 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200';
    case 'Domain': return 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200';
    case 'Intervention': return 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200';
    case 'Recipient': return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200';
    case 'Site': return 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200';
    case 'Appendix': return 'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200';
    case 'Consent': return 'bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-200';
    case 'Signature': return 'bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200';
    default: return 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-200';
  }
};

const LogicRow: React.FC<LogicRowProps> = ({ rule, onDelete }) => {
  const isExclude = rule.action === 'Exclude block';
  const isAllValues = rule.values.includes('ALL');
  const isSystem = rule.isSystem;
  
  return (
    <div className={`flex items-center justify-between py-2 px-3 rounded-lg border mb-2 transition-all ${
      isSystem 
        ? 'bg-amber-50/50 border-amber-200/60' 
        : 'bg-white border-gray-200/80 shadow-sm'
    }`}>
      <div className="flex items-center gap-2 overflow-hidden flex-wrap">
        {isSystem && (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/50 px-1.5 py-0.5 rounded border border-amber-200">
             <Lock className="w-2.5 h-2.5" /> System Rule
          </span>
        )}
        
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-wide">IF</span>
          
          <span className="font-semibold text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
            {rule.parameter}
          </span>
          
          <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wide px-1">{rule.operator}</span>
          
          <div className="flex flex-wrap gap-1">
            {isAllValues ? (
               <span className="font-bold text-[10px] bg-gray-800 text-white px-1.5 py-0.5 rounded shadow-sm">ALL VALUES</span>
            ) : (
              rule.values.map((v, i) => (
                <span key={i} className="font-medium text-indigo-700 bg-indigo-50 ring-1 ring-inset ring-indigo-100 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                  {v}
                </span>
              ))
            )}
          </div>
          
          <span className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-wide px-1">THEN</span>
          
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
            isExclude 
              ? 'bg-red-50 text-red-700 border-red-100' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
          }`}>
             {isExclude ? <Ban className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
             {isExclude ? 'Exclude' : 'Include'}
          </span>
        </div>
      </div>

      {!isSystem && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors ml-2"
          title="Remove rule"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
      
      {isSystem && rule.systemReason && (
        <div className="ml-2 group relative">
           <Info className="w-3.5 h-3.5 text-amber-400 cursor-help" />
           <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {rule.systemReason}
           </div>
        </div>
      )}
    </div>
  );
};

export const BlockList: React.FC<BlockListProps> = ({ 
  blocks, 
  allBlocks,
  onToggleExpand, 
  onDeleteBlock, 
  onDuplicateBlock, 
  onEditContent, 
  onShowHistory,
  onAddLogic,
  onDeleteLogic,
  onToggleDisable,
  onReorderBlocks,
  onUpdateNote,
  onAddBlock,
  canReorder
}) => {
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedBlockId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedBlockId !== id) {
       setDragOverBlockId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== targetId) {
      onReorderBlocks(draggedId, targetId);
    }
    setDraggedBlockId(null);
    setDragOverBlockId(null);
  };

  const handleDragEnd = () => {
    setDraggedBlockId(null);
    setDragOverBlockId(null);
  };

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300 text-center shadow-sm">
         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 ring-1 ring-gray-100">
            <AlertTriangle className="w-8 h-8 text-gray-300" />
         </div>
         <h3 className="text-lg font-medium text-gray-900">No blocks found</h3>
         <p className="text-sm text-gray-500 max-w-sm mt-1 mb-4">
           Try adjusting your search or filters, or add a new block to get started.
         </p>
         <button 
           onClick={() => onAddBlock()} 
           className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white shadow-sm rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
         >
           <Plus className="w-4 h-4" /> Add First Block
         </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {blocks.map((block) => {
        const isDerived = block.isCloned;
        const parentBlock = isDerived ? allBlocks.find(b => b.id === block.clonedFrom) : null;
        const isOutdated = isDerived && parentBlock && parentBlock.version !== block.derivedFromVersion;
        
        const visibleRules = block.rules ? block.rules.filter(r => !r.isSystem) : [];
        const hasLogic = visibleRules.length > 0;
        const userRulesCount = visibleRules.length;
        
        const associatedDomains = block.associatedDomainIds 
          ? block.associatedDomainIds.map(id => allBlocks.find(b => b.id === id)).filter(Boolean) as Block[]
          : [];
        
        const isExpanded = block.isExpanded || false;
        const isLongContent = block.content && block.content.length > 120;
        
        return (
          <div 
            key={block.id}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, block.id)}
            onDragOver={(e) => handleDragOver(e, block.id)}
            onDrop={(e) => handleDrop(e, block.id)}
            onDragEnd={handleDragEnd}
            className={`
               grid grid-cols-1 lg:grid-cols-3 gap-8 group transition-all duration-200 relative
               ${draggedBlockId === block.id ? 'opacity-40' : ''}
            `}
          >
            <div className={`
                relative bg-white rounded-lg border lg:col-span-2 flex flex-col group/card transition-all duration-200
                ${block.isDisabled ? 'opacity-60 bg-gray-50 border-gray-200 shadow-none' : 'hover:border-indigo-300 hover:shadow-md border-gray-200 shadow-sm'}
                ${dragOverBlockId === block.id ? 'border-t-4 border-t-indigo-500' : ''}
                ${isOutdated ? 'ring-1 ring-amber-300 border-amber-300 bg-amber-50/10' : ''}
                ${isDerived ? 'ml-0 sm:ml-10' : ''}
            `}
            onClick={(e) => {
               if (window.getSelection()?.toString()) return;
               onEditContent(block);
            }}
            >
                {isDerived && (
                   <div className="absolute -left-7 top-6 text-gray-300 hidden sm:block">
                      <CornerDownRight className="w-5 h-5" />
                   </div>
                )}

                <div className="p-5 flex gap-5 items-start">
                  
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 text-gray-400 cursor-move hover:text-gray-600 transition-colors -ml-1"
                  >
                     <GripVertical className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                     
                     <div className="flex items-center justify-between gap-3 mb-3">
                        <h3 className={`font-semibold text-base tracking-tight ${block.isDisabled ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {block.contentName}
                        </h3>
                        
                        <div className="flex items-center gap-2">
                           {/* Main Action Toolbar - Hover Only */}
                           <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-indigo-100 shadow-sm opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
                              <button 
                                onClick={(e) => { e.stopPropagation(); onEditContent(block); }}
                                className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                                title="Edit Content"
                              >
                                <PenLine className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDuplicateBlock(block.id); }}
                                className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                                title="Duplicate / Create Variation"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <div className="w-px h-4 bg-gray-200 mx-1"></div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onToggleDisable(block.id); }}
                                className={`p-1.5 rounded-md transition-colors ${block.isDisabled ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                title={block.isDisabled ? "Enable Block" : "Disable Block"}
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete Block"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                           </div>

                           <div className="flex items-center gap-1">
                               <button 
                                  onClick={(e) => { e.stopPropagation(); onShowHistory(block); }}
                                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                  title="View History"
                               >
                                 <History className="w-4 h-4" />
                               </button>
                               <button 
                                  onClick={(e) => { e.stopPropagation(); onToggleExpand(block.id); }}
                                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                  title={isExpanded ? "Collapse" : "Expand"}
                               >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                               </button>
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-wrap items-center gap-2 mb-4">
                        {!isDerived && (
                          <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getTypeColor(block.type)}`}>
                              {block.type}
                              <span className="opacity-60 border-l border-current pl-1.5 ml-0.5 font-mono normal-case">v{block.version}</span>
                          </span>
                        )}

                        {isDerived && (
                              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] ring-1 ring-inset ring-amber-200 bg-amber-50 text-amber-900" title={`Derived from ${parentBlock?.contentName || 'Unknown'} v${block.derivedFromVersion}`}>
                                 <GitFork className="w-3 h-3 text-amber-600 shrink-0" />
                                 <span className="font-bold uppercase tracking-wider text-amber-700 text-[9px]">Derived</span>
                                 <span className="text-amber-300">|</span>
                                 <span className="truncate max-w-[140px] font-medium">
                                    {parentBlock ? parentBlock.contentName : 'Unknown'}
                                 </span>
                                 {block.derivedFromVersion && (
                                    <span className="ml-0.5 bg-white px-1.5 py-px rounded border border-amber-200 text-[9px] font-mono font-bold text-amber-700">v{block.derivedFromVersion}</span>
                                 )}
                              </span>
                        )}

                        {isOutdated && (
                           <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] ring-1 ring-inset ring-rose-200 bg-rose-50 text-rose-700" title="The source block has a newer version available">
                              <AlertTriangle className="w-3 h-3" />
                              <span className="font-bold uppercase tracking-wider">Source Updated</span>
                              <span className="text-rose-300">|</span>
                              <span className="font-medium">v{parentBlock?.version}</span>
                           </span>
                        )}
                     </div>

                     <div 
                        className={`
                          text-sm text-gray-600 transition-colors leading-relaxed
                          ${isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}
                          ${!block.content && 'italic text-gray-400'}
                        `}
                     >
                        {block.content || 'No content defined...'}
                     </div>
                     
                     {isLongContent ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleExpand(block.id); }}
                          className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline mt-2 mb-3 flex items-center gap-0.5"
                        >
                          {isExpanded ? (
                             <>Show less <ChevronUp className="w-3 h-3" /></>
                          ) : (
                             <>Show full text <ChevronDown className="w-3 h-3" /></>
                          )}
                        </button>
                     ) : (
                        <div className="mb-3"></div>
                     )}

                     <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                           <button 
                             onClick={(e) => { e.stopPropagation(); onToggleExpand(block.id); }}
                             className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-all ${
                               hasLogic 
                                 ? 'bg-white border-indigo-200 text-indigo-700 shadow-sm hover:border-indigo-300 ring-1 ring-transparent hover:ring-indigo-100' 
                                 : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'
                             }`}
                             title="Toggle details and full content"
                           >
                              {hasLogic ? (
                                 <div className="flex items-center gap-2">
                                     <span className="flex items-center gap-1.5">
                                       <GitBranch className="w-3.5 h-3.5" />
                                       {userRulesCount} Logic Rule{userRulesCount !== 1 ? 's' : ''}
                                     </span>
                                 </div>
                              ) : (
                                 <>
                                   <CornerDownRight className="w-3.5 h-3.5" />
                                   Mandatory (No Logic)
                                 </>
                              )}
                              {isExpanded ? <ChevronUp className="w-3 h-3 ml-1 opacity-50" /> : <ChevronDown className="w-3 h-3 ml-1 opacity-50" />}
                           </button>

                           {associatedDomains.length > 0 && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium border border-gray-200 bg-gray-50 text-gray-600" title={`Inherits system rules from ${associatedDomains.map(d => d.contentName).join(', ')}`}>
                                  <Link2 className="w-3 h-3 text-gray-400" />
                                  <span className="opacity-75">Linked to:</span>
                                  <span className="font-semibold text-gray-700 truncate max-w-[150px]">
                                    {associatedDomains.length === 1 
                                      ? associatedDomains[0].contentName 
                                      : `${associatedDomains.length} Domains`}
                                  </span>
                              </div>
                           )}
                           
                           {/* Add Rule Button - Hover Only */}
                           <div className="opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
                               <button 
                                 onClick={(e) => { e.stopPropagation(); onAddLogic(block.id); }}
                                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-all shadow-sm"
                               >
                                  <Plus className="w-3.5 h-3.5" /> Add Rule
                               </button>
                           </div>
                        </div>
                     </div>

                     {isExpanded && (
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          className="mt-4 pt-1 animate-in slide-in-from-top-2 duration-200 cursor-auto"
                        >
                           <div className="bg-gray-50/80 rounded-lg p-4 border border-gray-100/80">
                              {hasLogic ? (
                                 <div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 pl-1">Condition Logic</div>
                                    {visibleRules.map(rule => (
                                       <LogicRow 
                                         key={rule.id} 
                                         rule={rule} 
                                         onDelete={() => onDeleteLogic(block.id, rule.id)}
                                       />
                                    ))}
                                 </div>
                              ) : (
                                 <div className="text-center py-6">
                                    <p className="text-xs text-gray-400 italic">This block is included by default for all recipients.</p>
                                    <button 
                                      onClick={() => onAddLogic(block.id)}
                                      className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
                                    >
                                      Add a condition
                                    </button>
                                 </div>
                              )}
                           </div>
                        </div>
                     )}
                  </div>
                </div>

                {/* Bottom Overlay Actions - Hover Only */}
                <div className="absolute left-0 right-0 -bottom-5 flex justify-center gap-2 z-20 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddBlock(block.id); }}
                        className="pointer-events-auto flex items-center gap-1.5 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all ring-2 ring-white transform translate-y-1/2"
                        title="Add a new block after this one"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Block
                    </button>
                    
                    {!isDerived && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDuplicateBlock(block.id); }}
                            className="pointer-events-auto flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg hover:bg-amber-100 hover:scale-105 transition-all ring-2 ring-white transform translate-y-1/2"
                            title="Create a derived variation of this block"
                        >
                            <GitFork className="w-3.5 h-3.5" /> Derive
                        </button>
                    )}
                </div>
            </div>

            <div className="hidden lg:block lg:col-span-1 pt-0">
               <div className="sticky top-28">
                  <div className="flex items-center justify-between mb-2">
                     <label 
                       htmlFor={`note-${block.id}`}
                       className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"
                     >
                       <MessageSquare className="w-3 h-3 text-indigo-400" />
                       Internal Note
                     </label>
                     <span className="text-[9px] text-gray-300 font-mono">v{block.version}</span>
                  </div>
                  
                  <div className="relative group/note">
                    <textarea
                      id={`note-${block.id}`}
                      value={block.notes || ''}
                      onChange={(e) => onUpdateNote(block.id, e.target.value)}
                      placeholder="Add a note..."
                      className={`w-full text-xs p-3 rounded-lg border transition-all resize-none outline-none shadow-sm
                        ${block.notes 
                          ? 'bg-amber-50 border-amber-200 text-gray-800 focus:ring-2 focus:ring-amber-200 focus:border-amber-300' 
                          : 'bg-white border-gray-200 text-gray-600 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300'
                        }
                      `}
                      rows={block.notes ? 4 : 2}
                    />
                    {block.notes && (
                       <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-400 rounded-full" title="Has note"></div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        );
      })}
      
      <div className="flex justify-center py-8 border-t border-dashed border-gray-200 mt-12">
         <button 
           onClick={() => onAddBlock()} 
           className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white shadow-lg rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all scale-100 hover:scale-105 active:scale-95"
         >
           <Plus className="w-4 h-4" /> Add New Block to End
         </button>
      </div>
    </div>
  );
};
