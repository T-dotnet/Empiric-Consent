
import React, { useState, useMemo } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Header } from './components/Header';
import { BlockList } from './components/BlockList';
import { FilterBar } from './components/FilterBar';
import { BlockModal } from './components/BlockModal';
import { HistoryModal } from './components/HistoryModal';
import { TemplateList } from './components/TemplateList';
import { TestLogicModal } from './components/TestLogicModal';
import { NewTemplateModal } from './components/NewTemplateModal';
import { NewSkeletonModal } from './components/NewSkeletonModal';
import { PublishModal } from './components/PublishModal';
import { TemplateSettingsModal } from './components/TemplateSettingsModal';
import { SiteDetailsModal } from './components/SiteDetailsModal';
import { AuditLogModal } from './components/AuditLogModal';
import { AICloneModal, AICloneOption } from './components/AICloneModal';
import { MOCK_TEMPLATES, TEMPLATE_SKELETONS, getMockSitesForTemplate } from './constants';
import { Template, Block, BlockType, LogicRule, Site, Skeleton, BlockHistoryEntry } from './types';

// Helper for semantic version increment (1.9 -> 1.10)
const incrementVersion = (version: string) => {
  const parts = version.split('.');
  if (parts.length < 2) return `${version}.1`;
  const major = parts[0];
  const minor = parseInt(parts[1], 10);
  return `${major}.${minor + 1}`;
};

export function App() {
  const [view, setView] = useState<'list' | 'builder'>('list');
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES || []);
  const [template, setTemplate] = useState<Template>(() => {
    return (templates && templates.length > 0) ? templates[0] : null as any;
  });
  const [viewingVersion, setViewingVersion] = useState<string | null>(null);
  const [skeletons, setSkeletons] = useState<Skeleton[]>(TEMPLATE_SKELETONS || []);
  
  const [expandedBlockIds, setExpandedBlockIds] = useState<Set<string>>(new Set());

  const [sitesByTemplate, setSitesByTemplate] = useState<Record<string, Site[]>>(() => {
    const initialSites: Record<string, Site[]> = {};
    if (MOCK_TEMPLATES) {
      MOCK_TEMPLATES.forEach(t => {
        initialSites[t.id] = getMockSitesForTemplate(t.id, t.version);
      });
    }
    return initialSites;
  });

  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyBlock, setHistoryBlock] = useState<Block | null>(null);

  const [isTestLogicOpen, setIsTestLogicOpen] = useState(false);
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState(false);
  const [isNewSkeletonModalOpen, setIsNewSkeletonModalOpen] = useState(false);
  const [editingSkeleton, setEditingSkeleton] = useState<Skeleton | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSiteDetailsModalOpen, setIsSiteDetailsModalOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [isAICloneModalOpen, setIsAICloneModalOpen] = useState(false);
  const [blockToCloneId, setBlockToCloneId] = useState<string | null>(null);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  const [filterType, setFilterType] = useState<BlockType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMismatchOnly, setShowMismatchOnly] = useState(false);
  const [showDerived, setShowDerived] = useState(true);
  
  const [siteDetailsFilter, setSiteDetailsFilter] = useState<string | string[]>('All');
  const [blockModalInitialTab, setBlockModalInitialTab] = useState<'content' | 'logic'>('content');

  const headerTemplate = useMemo(() => {
    if (!template) return null;
    if (viewingVersion && viewingVersion !== template.version) {
       const historyItem = template.history?.find(h => h.version === viewingVersion);
       if (historyItem) {
          return {
             ...template,
             version: viewingVersion,
             lastUpdated: historyItem.lastUpdated,
             updatedBy: historyItem.updatedBy,
             blocks: historyItem.blocksSnapshot,
             status: 'Snapshot' as any
          };
       }
    }
    return template;
  }, [template, viewingVersion]);

  const filteredBlocks = useMemo(() => {
    if (!headerTemplate) return [];
    
    // Map blocks to include dynamic expansion state from local state
    let blocks = headerTemplate.blocks.map(b => ({
      ...b,
      isExpanded: expandedBlockIds.has(b.id)
    }));

    if (filterType !== 'All') {
      blocks = blocks.filter(b => b.type === filterType);
    }

    if (searchQuery) {
      blocks = blocks.filter(b => 
        b.contentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (b.content && b.content.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (showMismatchOnly) {
       blocks = blocks.filter(b => {
          if (!b.isCloned || !b.clonedFrom) return false;
          const parent = headerTemplate.blocks.find(p => p.id === b.clonedFrom);
          return parent && parent.version !== b.derivedFromVersion;
       });
    }

    if (!showDerived) {
       blocks = blocks.filter(b => !b.isCloned);
    }

    return blocks;
  }, [headerTemplate, filterType, searchQuery, showMismatchOnly, showDerived, expandedBlockIds]);

  const areAllExpanded = useMemo(() => {
    if (filteredBlocks.length === 0) return false;
    return filteredBlocks.every(b => expandedBlockIds.has(b.id));
  }, [filteredBlocks, expandedBlockIds]);

  const handleUpdateSites = (templateId: string, siteIds: string[]) => {
    const tmpl = templates.find(t => t.id === templateId);
    if (!tmpl) return;

    let targetVersion = tmpl.version;
    
    if (tmpl.status === 'Draft') {
       const history = tmpl.history || [];
       const majors = history.filter(h => h.version.endsWith('.0')).sort((a, b) => parseFloat(b.version) - parseFloat(a.version));
       if (majors.length > 0) {
           targetVersion = majors[0].version;
       } else if (tmpl.previousVersion && tmpl.previousVersion.endsWith('.0')) {
           targetVersion = tmpl.previousVersion;
       }
    }

    const currentSites = sitesByTemplate[templateId] || [];
    const updatedSites = currentSites.map(s => {
      if (siteIds.includes(s.id)) {
        if (s.version !== targetVersion) {
            if (s.updateStatus === 'Under Review') {
                return {
                    ...s,
                    version: targetVersion,
                    updateStatus: 'None' as const,
                    lastUpdated: new Date().toLocaleDateString('en-GB').replace(/\//g, '.')
                };
            } 
            else {
                return {
                    ...s,
                    updateStatus: 'Under Review' as const,
                    lastUpdated: new Date().toLocaleDateString('en-GB').replace(/\//g, '.')
                };
            }
        }
      }
      return s;
    });

    setSitesByTemplate(prev => ({
      ...prev,
      [templateId]: updatedSites
    }));

    if (tmpl.status === 'Rolling Out') {
        const allUpdated = updatedSites.every(s => s.version === targetVersion);
        if (allUpdated) {
            const newTemplate = { ...tmpl, status: 'Active' as const };
            setTemplates(prev => prev.map(t => t.id === tmpl.id ? newTemplate : t));
            if (template && template.id === tmpl.id) setTemplate(newTemplate);
        }
    }
  };

  const handleSaveBlock = (blockId: string, name: string, type: BlockType, content: string, rules: LogicRule[], associatedDomainIds?: string[]) => {
    if (!template) return;
    const now = new Date().toLocaleDateString('en-GB').replace(/\//g, '.');

    const updatedTemplate = { ...template };
    const blockIndex = updatedTemplate.blocks.findIndex(b => b.id === blockId);

    if (blockIndex >= 0) {
       // Edit existing block
       const oldBlock = updatedTemplate.blocks[blockIndex];
       
       // 1. Create history entry
       const historyEntry: BlockHistoryEntry = {
          version: oldBlock.version,
          templateVersion: template.version,
          updatedAt: oldBlock.lastUpdated,
          editedBy: 'Liam Alexander',
          changeDescription: 'Module saved',
          contentSnapshot: oldBlock.content || ''
       };

       // 2. Increment version
       const newVersion = incrementVersion(oldBlock.version);

       // 3. Update block
       updatedTemplate.blocks[blockIndex] = {
          ...oldBlock,
          contentName: name,
          type,
          content,
          rules,
          associatedDomainIds,
          version: newVersion,
          previousVersion: oldBlock.version,
          lastUpdated: now,
          hasEditHistory: true,
          history: [historyEntry, ...oldBlock.history]
       };
    } else {
       // Create new block
       updatedTemplate.blocks.push({
          id: blockId,
          type,
          contentName: name,
          content,
          version: '1.0',
          lastUpdated: now,
          hasEditHistory: false,
          history: [],
          isSyncing: false,
          rules,
          associatedDomainIds
       });
    }
    
    updatedTemplate.lastUpdated = now;
    setTemplate(updatedTemplate);
    setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    
    // Show save notification
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 2000);
  };

  const handleDeleteBlock = (id: string) => {
    if (!template) return;
    const updatedTemplate = {
      ...template,
      blocks: template.blocks.filter(b => b.id !== id),
      lastUpdated: new Date().toLocaleDateString('en-GB').replace(/\//g, '.')
    };
    setTemplate(updatedTemplate);
    setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
  };

  const handleDuplicateBlock = (id: string) => {
    if (!template) return;
    const blockToDup = template.blocks.find(b => b.id === id);
    if (!blockToDup) return;

    // Open AI Clone modal instead of direct duplicate
    setBlockToCloneId(id);
    setIsAICloneModalOpen(true);
  };

  const handleAICloneConfirm = (option: AICloneOption) => {
    if (!template || !blockToCloneId) return;
    
    const originalBlock = template.blocks.find(b => b.id === blockToCloneId);
    if (!originalBlock) return;

    let newContent = originalBlock.content || '';
    let suffix = 'Copy';

    if (option === 'simplify') {
        newContent = `[Simplified Version]\n${newContent}`;
        suffix = 'Simple';
    } else if (option === 'past_tense') {
        newContent = `[Past Tense Version]\n${newContent}`;
        suffix = 'Past';
    } else if (option === 'future_tense') {
         newContent = `[Future Tense Version]\n${newContent}`;
         suffix = 'Future';
    } else if (option === 'formal') {
         newContent = `[Formal Version]\n${newContent}`;
         suffix = 'Formal';
    }

    const newBlock: Block = {
      ...originalBlock,
      id: `blk_${Date.now()}`,
      contentName: `${originalBlock.contentName} (${suffix})`,
      content: newContent,
      version: '1.0',
      lastUpdated: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
      hasEditHistory: false,
      history: [],
      isCloned: true,
      clonedFrom: originalBlock.id,
      derivedFromVersion: originalBlock.version,
      subLabel: `Derived from ${originalBlock.contentName} v${originalBlock.version}`
    };

    const updatedTemplate = {
      ...template,
      blocks: [...template.blocks, newBlock]
    };
    
    setTemplate(updatedTemplate);
    setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    setIsAICloneModalOpen(false);
    setBlockToCloneId(null);
  };

  const handleToggleExpand = (id: string) => {
    const newSet = new Set(expandedBlockIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedBlockIds(newSet);
  };

  const handleEditContent = (block: Block) => {
    if (viewingVersion && viewingVersion !== template?.version) return; // Read only in history
    setEditingBlock(block);
    setBlockModalInitialTab('content');
    setIsModalOpen(true);
  };

  const handleShowHistory = (block: Block) => {
    setHistoryBlock(block);
    setIsHistoryOpen(true);
  };

  const handleAddLogic = (blockId: string) => {
    if (viewingVersion && viewingVersion !== template?.version) return;
    const block = template?.blocks.find(b => b.id === blockId);
    if (block) {
       setEditingBlock(block);
       setBlockModalInitialTab('logic');
       setIsModalOpen(true);
    }
  };

  const handleDeleteLogic = (blockId: string, ruleId: string) => {
    if (!template) return;
    if (viewingVersion && viewingVersion !== template.version) return;

    const updatedBlocks = template.blocks.map(b => {
      if (b.id === blockId) {
        return {
          ...b,
          rules: b.rules.filter(r => r.id !== ruleId),
          lastUpdated: new Date().toLocaleDateString('en-GB').replace(/\//g, '.')
        };
      }
      return b;
    });

    const updatedTemplate = { ...template, blocks: updatedBlocks };
    setTemplate(updatedTemplate);
    setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
  };

  const handleToggleDisable = (blockId: string) => {
    if (!template) return;
    if (viewingVersion && viewingVersion !== template.version) return;

    const updatedBlocks = template.blocks.map(b => {
      if (b.id === blockId) {
        return {
          ...b,
          isDisabled: !b.isDisabled,
          lastUpdated: new Date().toLocaleDateString('en-GB').replace(/\//g, '.')
        };
      }
      return b;
    });

    const updatedTemplate = { ...template, blocks: updatedBlocks };
    setTemplate(updatedTemplate);
    setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
  };

  const handleReorderBlocks = (draggedId: string, targetId: string) => {
     if (!template) return;
     const blocks = [...template.blocks];
     const draggedIndex = blocks.findIndex(b => b.id === draggedId);
     const targetIndex = blocks.findIndex(b => b.id === targetId);
     
     if (draggedIndex === -1 || targetIndex === -1) return;
     
     const [draggedItem] = blocks.splice(draggedIndex, 1);
     blocks.splice(targetIndex, 0, draggedItem);
     
     const updatedTemplate = { ...template, blocks };
     setTemplate(updatedTemplate);
     setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
  };

  const handleUpdateNote = (blockId: string, note: string) => {
     if (!template) return;
     const updatedBlocks = template.blocks.map(b => {
        if (b.id === blockId) return { ...b, notes: note };
        return b;
     });
     const updatedTemplate = { ...template, blocks: updatedBlocks };
     setTemplate(updatedTemplate);
     setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
  };

  const handleAddBlock = (afterId?: string) => {
     if (!template) return;
     const newId = `blk_${Date.now()}`;
     const newBlock: Block = {
         id: newId,
         type: 'Universal',
         contentName: 'Add content',
         content: '',
         version: '1.0',
         lastUpdated: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
         hasEditHistory: false,
         history: [],
         isSyncing: false,
         rules: [],
         isDraftCopy: true
     };

     let newBlocks = [...template.blocks];
     if (afterId) {
         const idx = newBlocks.findIndex(b => b.id === afterId);
         if (idx !== -1) {
             newBlocks.splice(idx + 1, 0, newBlock);
         } else {
             newBlocks.push(newBlock);
         }
     } else {
         newBlocks.push(newBlock);
     }
     
     // Update template first to insert the placeholder
     const updatedTemplate = { ...template, blocks: newBlocks };
     setTemplate(updatedTemplate);
     setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));

     // Then open modal for editing immediately
     setEditingBlock(newBlock);
     setIsModalOpen(true);
  };
  
  const handlePublish = () => {
     setIsPublishModalOpen(true);
  };

  const handleConfirmPublish = (templateId: string) => {
     const tmpl = templates.find(t => t.id === templateId);
     if (!tmpl) return;

     // 1. Move current Draft to Rolling Out status
     const now = new Date().toLocaleDateString('en-GB').replace(/\//g, '.');
     const publishedVersion = tmpl.version; // e.g., 1.1 becomes 2.0 effectively, but technically we publish 1.1 as the new baseline
     // Actually, usually we bump major version on publish.
     // Let's assume the draft 1.1 becomes Release 2.0.
     const parts = publishedVersion.split('.');
     const newMajor = parseInt(parts[0]) + 1;
     const releaseVersion = `${newMajor}.0`;

     const releasedTemplate: Template = {
        ...tmpl,
        version: releaseVersion,
        status: 'Rolling Out',
        lastUpdated: now,
        previousVersion: tmpl.version
     };
     
     // 2. Archive the draft state into history
     // (In a real app, we'd snapshot the draft 1.1 as history, then make 2.0 the current)
     
     setTemplates(prev => prev.map(t => t.id === templateId ? releasedTemplate : t));
     if (template?.id === templateId) setTemplate(releasedTemplate);
     setIsPublishModalOpen(false);
  };

  const handleCreateTemplate = (name: string, skeletonId: string) => {
     const skeleton = skeletons.find(s => s.id === skeletonId);
     if (!skeleton) return;
     
     const newTemplate: Template = {
        id: `tmpl_${Date.now()}`,
        name,
        skeleton: skeleton.name,
        version: '0.1',
        previousVersion: '',
        lastUpdated: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
        updatedBy: 'Liam Alexander',
        status: 'Draft',
        blocks: skeleton.blocks.map((b, i) => ({
             ...b,
             id: `blk_${Date.now()}_${i}`,
             version: '0.1',
             lastUpdated: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
             hasEditHistory: false,
             history: [],
             isSyncing: false,
             rules: (b as any).rules || [], // Cast to allow rules on skeleton blocks
             isExpanded: false
        })),
        history: []
     };
     
     setTemplates(prev => [newTemplate, ...prev]);
     setIsNewTemplateModalOpen(false);
     setTemplate(newTemplate);
     setView('builder');
  };

  const handleCreateSkeleton = (name: string, description: string, blocksInput: { type: BlockType; name: string; content: string }[]) => {
      const newSkeleton: Skeleton = {
          id: `sk_${Date.now()}`,
          name,
          description,
          status: 'Active',
          blocks: blocksInput.map(b => ({
              type: b.type,
              contentName: b.name,
              content: b.content,
              version: '1.0',
              lastUpdated: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
              hasEditHistory: false,
              history: [],
              isSyncing: false,
              rules: []
          }))
      };
      
      setSkeletons(prev => [...prev, newSkeleton]);
      setIsNewSkeletonModalOpen(false);
  };
  
  if (view === 'list') {
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col">
              <Navbar />
              <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
                  <TemplateList 
                      templates={templates}
                      skeletons={skeletons}
                      sitesByTemplate={sitesByTemplate}
                      onSelectVersion={(t, v) => {
                          setTemplate(t);
                          setViewingVersion(v);
                          setView('builder');
                      }}
                      onSelectTemplate={(t) => {
                          setTemplate(t);
                          setViewingVersion(null); // Explicitly null to show current
                          setView('builder');
                      }}
                      onCreateTemplate={() => setIsNewTemplateModalOpen(true)}
                      onCreateSkeleton={() => { setEditingSkeleton(null); setIsNewSkeletonModalOpen(true); }}
                      onEditSkeleton={(sk) => { setEditingSkeleton(sk); setIsNewSkeletonModalOpen(true); }}
                      onArchiveSkeleton={(id) => setSkeletons(prev => prev.filter(s => s.id !== id))}
                      onTestLogic={(t) => {
                          setTemplate(t);
                          setIsTestLogicOpen(true);
                      }}
                      onArchive={(id) => setTemplates(prev => prev.filter(t => t.id !== id))}
                      onUpdateSite={(tId, sId) => handleUpdateSites(tId, [sId])}
                      onOpenSiteDetails={(t, filter) => {
                          if(t) setTemplate(t);
                          if(filter) setSiteDetailsFilter(filter);
                          setIsSiteDetailsModalOpen(true);
                      }}
                      onCreateDraft={(t) => {
                          // Create a new draft version from an active template
                          const newVersion = incrementVersion(t.version);
                          const draft: Template = {
                              ...t,
                              version: newVersion,
                              previousVersion: t.version,
                              status: 'Draft',
                              lastUpdated: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
                              history: [{
                                  version: t.version,
                                  lastUpdated: t.lastUpdated,
                                  updatedBy: t.updatedBy || 'System',
                                  blocksSnapshot: JSON.parse(JSON.stringify(t.blocks))
                              }, ...(t.history || [])]
                          };
                          setTemplates(prev => prev.map(tmpl => tmpl.id === t.id ? draft : tmpl));
                          setTemplate(draft);
                          setView('builder');
                      }}
                  />
                  
                  <NewTemplateModal 
                      isOpen={isNewTemplateModalOpen}
                      onClose={() => setIsNewTemplateModalOpen(false)}
                      onCreate={handleCreateTemplate}
                      skeletons={skeletons}
                  />

                  <NewSkeletonModal
                      isOpen={isNewSkeletonModalOpen}
                      onClose={() => setIsNewSkeletonModalOpen(false)}
                      onSave={handleCreateSkeleton}
                      initialSkeleton={editingSkeleton}
                  />
                  
                  {isTestLogicOpen && (
                    <TestLogicModal 
                       isOpen={isTestLogicOpen}
                       onClose={() => setIsTestLogicOpen(false)}
                       template={template}
                       sites={sitesByTemplate[template.id] || []}
                    />
                  )}
                  
                  {isSiteDetailsModalOpen && template && (
                    <SiteDetailsModal 
                       isOpen={isSiteDetailsModalOpen}
                       onClose={() => setIsSiteDetailsModalOpen(false)}
                       template={template}
                       allTemplates={templates}
                       sites={sitesByTemplate[template.id] || []}
                       onUpdateSites={handleUpdateSites}
                       onSelectTemplate={setTemplate}
                       initialStatusFilter={siteDetailsFilter}
                    />
                  )}
              </div>
          </div>
      );
  }

  const isReadOnly = viewingVersion !== null && viewingVersion !== template?.version;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />
      
      {/* Save Notification Toast */}
      {showSaveNotification && (
          <div className="fixed top-20 right-8 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in slide-in-from-right duration-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium">Changes saved successfully</span>
          </div>
      )}

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Header 
          template={headerTemplate || template}
          selectedVersion={viewingVersion || template.version}
          isReadOnly={isReadOnly}
          realStatus={template.status}
          onBack={() => setView('list')}
          onTestLogic={() => setIsTestLogicOpen(true)}
          onPublish={handlePublish}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onUnlock={() => setViewingVersion(null)} // Return to current draft
          onSaveDraft={() => {
              setShowSaveNotification(true);
              setTimeout(() => setShowSaveNotification(false), 2000);
          }}
          onOpenAuditLog={() => setIsAuditLogOpen(true)}
        />
        
        <FilterBar 
          selectedType={filterType} 
          onTypeChange={setFilterType}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showMismatchOnly={showMismatchOnly}
          onToggleMismatch={() => setShowMismatchOnly(!showMismatchOnly)}
          showDerived={showDerived}
          onToggleDerived={() => setShowDerived(!showDerived)}
          areAllExpanded={areAllExpanded}
          onToggleExpandAll={() => {
             if (areAllExpanded) setExpandedBlockIds(new Set());
             else setExpandedBlockIds(new Set(filteredBlocks.map(b => b.id)));
          }}
        />

        <BlockList 
          blocks={filteredBlocks}
          allBlocks={headerTemplate ? headerTemplate.blocks : template.blocks}
          isReadOnly={isReadOnly}
          canReorder={!isReadOnly && filterType === 'All' && !searchQuery}
          onToggleExpand={handleToggleExpand}
          onDeleteBlock={handleDeleteBlock}
          onDuplicateBlock={handleDuplicateBlock}
          onEditContent={handleEditContent}
          onShowHistory={handleShowHistory}
          onAddLogic={handleAddLogic}
          onDeleteLogic={handleDeleteLogic}
          onRevertBlock={() => {}} // Not implemented in MVP
          onToggleDisable={handleToggleDisable}
          onReorderBlocks={handleReorderBlocks}
          onUpdateNote={handleUpdateNote}
          onAddBlock={handleAddBlock}
        />

        {isModalOpen && (
          <BlockModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveBlock}
            initialBlock={editingBlock}
            existingBlocks={template.blocks}
            parentBlock={editingBlock?.isCloned ? template.blocks.find(b => b.id === editingBlock.clonedFrom) : undefined}
            initialTab={blockModalInitialTab}
          />
        )}

        {isHistoryOpen && (
          <HistoryModal 
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            block={historyBlock}
            currentTemplateVersion={template.version}
          />
        )}
        
        {isTestLogicOpen && (
           <TestLogicModal 
              isOpen={isTestLogicOpen}
              onClose={() => setIsTestLogicOpen(false)}
              template={headerTemplate || template}
              sites={sitesByTemplate[template.id] || []}
           />
        )}
        
        {isPublishModalOpen && (
            <PublishModal 
               isOpen={isPublishModalOpen}
               onClose={() => setIsPublishModalOpen(false)}
               templateId={template.id}
               templateName={template.name}
               currentVersion={template.version}
               status={template.status}
               sites={sitesByTemplate[template.id] || []}
               onConfirm={handleConfirmPublish}
               onConfirmUpdates={(tId, sIds) => {
                   handleUpdateSites(tId, sIds);
                   setIsPublishModalOpen(false);
               }}
            />
        )}
        
        {isSettingsModalOpen && (
            <TemplateSettingsModal
               isOpen={isSettingsModalOpen}
               onClose={() => setIsSettingsModalOpen(false)}
               template={template}
            />
        )}
        
        {isAuditLogOpen && (
            <AuditLogModal
               isOpen={isAuditLogOpen}
               onClose={() => setIsAuditLogOpen(false)}
               template={template}
            />
        )}

        {isAICloneModalOpen && (
            <AICloneModal 
               isOpen={isAICloneModalOpen}
               onClose={() => setIsAICloneModalOpen(false)}
               onConfirm={handleAICloneConfirm}
               blockName={template.blocks.find(b => b.id === blockToCloneId)?.contentName || 'Unknown Block'}
            />
        )}

      </main>
    </div>
  );
}
