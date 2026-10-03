
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, ChevronDown, Search, Plus, Trash2, ArrowRight, Check, CheckSquare, Split, RefreshCw, Sparkles, Eye, EyeOff, Bold, Italic, Columns, LayoutList, Braces, LayoutTemplate, Info } from 'lucide-react';
import { Block, BlockType, LogicRule, LogicParameter, LogicOperator, LogicAction } from '../types';
import { BLOCK_TYPES, LOGIC_PARAMETERS, PARAMETER_OPTIONS, AVAILABLE_VARIABLES } from '../constants';
import { DiffViewer } from './DiffViewer';

interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockId: string, name: string, type: BlockType, content: string, rules: LogicRule[], associatedDomainIds?: string[]) => void;
  initialBlock: Block | null;
  existingBlocks: Block[];
  parentBlock?: Block;
  initialTab?: 'content' | 'logic';
}

const CONTENT_TEMPLATES = [
  {
    group: 'Headers & Structure',
    templates: [
      { label: 'Protocol Header', content: '## Protocol Title: {{Protocol Title}}\n**Protocol Number:** {{Protocol Number}}\n**Sponsor:** {{Sponsor Name}}\n**Principal Investigator:** {{Principal Investigator}}' },
      { label: 'Site Header', content: '## {{Site Name}}\n**Address:** {{Site Address}}\n**Contact:** {{Clinical Contact Phone}}' },
      { label: 'Section Break', content: '---\n### New Section Title\n' }
    ]
  },
  {
    group: 'Introduction & Purpose',
    templates: [
      { label: 'Standard Introduction', content: 'You are invited to take part in this research project because you have {{Condition Name}}. This Participant Information Sheet/Consent Form tells you about the research project. It explains the tests and treatments involved.' },
      { label: 'Purpose Statement', content: 'The purpose of this research is to investigate [Specific Aim] in order to [Expected Benefit].' },
      { label: 'Voluntary Participation', content: 'Participation in this research is voluntary. If you do not wish to take part, you do not have to. You may withdraw at any time without affecting your medical care.' }
    ]
  },
  {
    group: 'Procedures & Interventions',
    templates: [
      { label: 'Blood Draw', content: 'We will collect a blood sample of approximately [Amount] mL (about [Number] teaspoons) from a vein in your arm.' },
      { label: 'Questionnaire/Survey', content: 'You will be asked to complete a questionnaire about [Topic]. This should take approximately [Time] minutes.' },
      { label: 'Medical Record Review', content: 'Researchers will access your medical records to collect information regarding your diagnosis, treatment history, and laboratory results.' }
    ]
  },
  {
    group: 'Risks & Safety',
    templates: [
      { label: 'General Discomfort', content: 'You may experience some discomfort or bruising at the site of the blood draw. This is usually minor and temporary.' },
      { label: 'Privacy Risk', content: 'While we take every precaution to protect your data, there is always a small risk of loss of privacy. We use de-identified codes to minimize this risk.' },
      { label: 'Unforeseen Risks', content: 'There may be risks associated with this study that are currently unknown.' }
    ]
  },
  {
    group: 'Data & Privacy',
    templates: [
      { label: 'Data Storage', content: 'Your data will be stored securely at [Location] for a period of [Years] years.' },
      { label: 'De-identification', content: 'All data collected will be de-identified. This means your name and personal details will be removed and replaced with a code.' },
      { label: 'Data Sharing', content: 'De-identified data from this study may be shared with other researchers for future related studies.' }
    ]
  },
  {
    group: 'Consent Declarations',
    templates: [
      { label: 'Participant Declaration', content: 'I have read the Participant Information Sheet or someone has read it to me in a language that I understand.\nI understand the purposes, procedures and risks of the research described in the project.\nI freely agree to participate in this research project as described and understand that I am free to withdraw at any time during the project without affecting my future health care.\nI understand that I will be given a signed copy of this document to keep.' },
      { label: 'Guardian Declaration', content: 'I have read the Participant Information Sheet or someone has read it to me in a language that I understand.\nI understand the purposes, procedures and risks of the research described in the project.\nI freely agree to the child in my care participating in this research project as described and understand that I am free to withdraw them at any time during the project without affecting their future health care.' }
    ]
  },
  {
    group: 'Signatures',
    templates: [
      { label: 'Participant Signature', content: `**Name of Participant (printed):** _________________________________\n\n**Signature:** _________________________________\n\n**Date:** __________________` },
      { label: 'Witness Signature', content: `**Name of Witness (printed):** _________________________________\n\n**Signature:** _________________________________\n\n**Date:** __________________` },
      { label: 'Investigator Signature', content: `**Name of Investigator (printed):** _________________________________\n\n**Signature:** _________________________________\n\n**Date:** __________________` },
      { label: 'Guardian / Representative', content: `**Name of Guardian (printed):** _________________________________\n\n**Relationship to Participant:** _________________________________\n\n**Signature:** _________________________________\n\n**Date:** __________________` },
      { label: 'Medical Treatment Decision Maker', content: `**Name of Medical Treatment Decision Maker (printed):** _________________________________\n\n**Relationship to Participant:** _________________________________\n\n**Signature:** _________________________________\n\n**Date:** __________________` }
    ]
  }
];

export const BlockModal: React.FC<BlockModalProps> = ({ isOpen, onClose, onSave, initialBlock, existingBlocks, parentBlock, initialTab = 'content' }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'logic'>('content');
  const [name, setName] = useState('');
  const [type, setType] = useState<BlockType>('Universal');
  const [content, setContent] = useState('');
  const [rules, setRules] = useState<LogicRule[]>([]);
  const [associatedDomainIds, setAssociatedDomainIds] = useState<string[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [templateCategory, setTemplateCategory] = useState('');

  // Variable Menu State
  const [isVariableMenuOpen, setIsVariableMenuOpen] = useState(false);
  const variableButtonRef = useRef<HTMLButtonElement>(null);
  const variableMenuRef = useRef<HTMLDivElement>(null);

  // Comparison State
  const [comparisonMode, setComparisonMode] = useState<'draft_vs_source' | 'source_diff' | null>(null);
  const [showDiff, setShowDiff] = useState(true);
  const [diffViewMode, setDiffViewMode] = useState<'inline' | 'split'>('inline');

  // Logic Builder State
  const [newRuleParam, setNewRuleParam] = useState<LogicParameter>('Domain');
  const [newRuleOp, setNewRuleOp] = useState<LogicOperator>('EQUAL TO');
  const [newRuleValues, setNewRuleValues] = useState<string[]>([]);
  const [newRuleAction, setNewRuleAction] = useState<LogicAction>('Include block');

  // Reset or populate form when modal opens or block changes
  useEffect(() => {
    if (isOpen && initialBlock) {
      const isNew = initialBlock.contentName === 'Add content';
      setName(isNew ? '' : initialBlock.contentName);
      setType(initialBlock.type);
      setContent(initialBlock.content || '');
      setRules(initialBlock.rules || []);
      setAssociatedDomainIds(initialBlock.associatedDomainIds || []);
      setTemplateCategory('');
      setActiveTab(initialTab);
      
      // Reset Comparison State
      setComparisonMode(null);
      setShowDiff(true);
      setDiffViewMode('inline');

      // Reset Logic Builder
      setNewRuleParam('Domain');
      setNewRuleOp('EQUAL TO');
      setNewRuleValues([]);
      setNewRuleAction('Include block');
      
      setIsVariableMenuOpen(false);
    }
  }, [isOpen, initialBlock, initialTab]);

  // Click outside listener for variable menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        variableMenuRef.current && 
        !variableMenuRef.current.contains(event.target as Node) &&
        variableButtonRef.current && 
        !variableButtonRef.current.contains(event.target as Node)
      ) {
        setIsVariableMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute the old content from the parent's history based on the derivedFromVersion
  const parentSnapshot = useMemo(() => {
    if (!parentBlock || !initialBlock?.derivedFromVersion) return '';
    if (parentBlock.version === initialBlock.derivedFromVersion) return parentBlock.content || '';
    
    // Look in history
    const historyEntry = parentBlock.history.find(h => h.version === initialBlock.derivedFromVersion);
    return historyEntry ? historyEntry.contentSnapshot : (parentBlock.content || ''); // Fallback to current if not found
  }, [parentBlock, initialBlock]);

  const filteredContentTemplates = useMemo(() => {
    if (!templateCategory) return CONTENT_TEMPLATES;
    return CONTENT_TEMPLATES.filter(g => g.group === templateCategory);
  }, [templateCategory]);

  if (!isOpen || !initialBlock) return null;

  const handleSave = () => {
    onSave(initialBlock.id, name || 'Untitled Block', type, content, rules, associatedDomainIds);
    onClose();
  };

  const handleTypeChange = (newType: BlockType) => {
    setType(newType);
    if (newType === 'Domain') {
        setAssociatedDomainIds([]);
        // Automatically add "Domain Logic" if no rules exist
        if (rules.length === 0) {
            const defaultRule: LogicRule = {
                id: `rule_${Date.now()}`,
                parameter: 'Domain',
                operator: 'ANY',
                values: name ? [name] : [],
                action: 'Include block'
            };
            setRules([defaultRule]);
        }
    }
  };

  const handleNameChange = (newName: string) => {
      setName(newName);
      // Auto-sync rule value with block name for Domain blocks using the default single rule
      if (type === 'Domain' && rules.length === 1 && rules[0].parameter === 'Domain') {
          // Only update if it looks like our default rule structure
          if (rules[0].operator === 'ANY' && rules[0].action === 'Include block') {
             setRules([{ ...rules[0], values: newName ? [newName] : [] }]);
          }
      }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLabel = e.target.value;
    let selectedContent = '';
    
    for (const group of CONTENT_TEMPLATES) {
        const found = group.templates.find(t => t.label === selectedLabel);
        if (found) {
            selectedContent = found.content;
            break;
        }
    }

    if (selectedContent) {
        setContent(prev => prev ? `${prev}\n\n${selectedContent}` : selectedContent);
        e.target.value = ""; // Reset select
    }
  };

  const handleFormat = (formatType: 'bold' | 'italic' | 'p' | 'h1' | 'h2' | 'h3') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = content;
    let newCursorPos = end;

    if (['h1', 'h2', 'h3', 'p'].includes(formatType)) {
      const linesBefore = content.substring(0, start).split('\n');
      const startOfLine = start - linesBefore[linesBefore.length - 1].length;
      const endOfLine = content.indexOf('\n', start) === -1 ? content.length : content.indexOf('\n', start);
      
      const lineText = content.substring(startOfLine, endOfLine);
      const cleanLine = lineText.replace(/^#+\s+/, '');
      
      let prefix = '';
      if (formatType === 'h1') prefix = '# ';
      else if (formatType === 'h2') prefix = '## ';
      else if (formatType === 'h3') prefix = '### ';
      
      const newLineText = prefix + cleanLine;
      newText = content.substring(0, startOfLine) + newLineText + content.substring(endOfLine);
      newCursorPos = startOfLine + newLineText.length;
    } else {
      switch (formatType) {
        case 'bold':
          newText = content.substring(0, start) + `**${selectedText}**` + content.substring(end);
          newCursorPos = end + 4;
          break;
        case 'italic':
          newText = content.substring(0, start) + `*${selectedText}*` + content.substring(end);
          newCursorPos = end + 2;
          break;
      }
    }

    setContent(newText);
    
    // Restore focus and update cursor (setTimeout needed to let React render first)
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleInsertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textToInsert = `{{${variable}}}`;
    const newText = content.substring(0, start) + textToInsert + content.substring(end);
    
    setContent(newText);
    
    // Restore focus and update cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
    setIsVariableMenuOpen(false);
  };

  const handleInsertConsentDomains = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Use a dynamic placeholder tag instead of static text
    // This allows the previewer to render the list based on current logic state
    const textToInsert = `{{DYNAMIC_DOMAIN_LIST}}`;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = content.substring(0, start) + textToInsert + content.substring(end);
    
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  const handleAddRule = () => {
     if (newRuleValues.length === 0) return;
     
     const newRule: LogicRule = {
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        parameter: newRuleParam,
        operator: newRuleOp,
        values: newRuleValues,
        action: newRuleAction
     };
     setRules([...rules, newRule]);
     setNewRuleValues([]);
  };

  const handleDeleteRule = (ruleId: string) => {
     setRules(rules.filter(r => r.id !== ruleId));
  };

  const handleValueToggle = (value: string) => {
    let newValues = newRuleValues.includes('ALL') ? [] : [...newRuleValues];
    if (newValues.includes(value)) {
      newValues = newValues.filter(v => v !== value);
    } else {
      newValues.push(value);
    }
    setNewRuleValues(newValues);
  };

  const handleSelectAllValues = () => {
    if (newRuleValues.includes('ALL')) {
      setNewRuleValues([]);
    } else {
      setNewRuleValues(['ALL']);
    }
  };

  const availableOptions = PARAMETER_OPTIONS[newRuleParam] || [];
  const isAllSelected = newRuleValues.includes('ALL');
  const isEditing = initialBlock.contentName !== 'Add content';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{isEditing ? 'Edit Content Block' : 'Create New Content Block'}</h2>
            <p className="text-sm text-gray-500 mt-1">Configure the content and properties for this section.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-200 bg-white flex gap-6">
           <button 
             onClick={() => setActiveTab('content')}
             className={`py-3 text-sm font-medium border-b-2 transition-colors ${
               activeTab === 'content' 
                 ? 'border-indigo-600 text-indigo-600' 
                 : 'border-transparent text-gray-500 hover:text-gray-700'
             }`}
           >
             Content
           </button>
           <button 
             onClick={() => setActiveTab('logic')}
             className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
               activeTab === 'logic' 
                 ? 'border-indigo-600 text-indigo-600' 
                 : 'border-transparent text-gray-500 hover:text-gray-700'
             }`}
           >
             Logic Rules
             {rules.length > 0 && (
               <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{rules.length}</span>
             )}
           </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-8 overflow-y-auto space-y-6 bg-white min-h-[400px]">
          
          {activeTab === 'content' ? (
            <>
              {/* Form Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Block Name */}
                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Block Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Introduction"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all placeholder:text-gray-400 text-sm"
                  />
                  {initialBlock.isCloned && initialBlock.subLabel && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full inline-block"></span>
                      {initialBlock.subLabel}
                    </p>
                  )}
                </div>

                {/* Block Type */}
                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Block Type</label>
                  <div className="relative">
                    <select 
                      value={type}
                      onChange={(e) => handleTypeChange(e.target.value as BlockType)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all cursor-pointer text-sm"
                    >
                      {BLOCK_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Block Type Helper - Full Width */}
                <div className="col-span-2">
                  {initialBlock.isCloned ? (
                    <div className="flex gap-2.5 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                      <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-indigo-700 leading-relaxed">
                        This is a derived variation. It will override the original source block only when the specific rules defined below are met.
                      </p>
                    </div>
                  ) : ['Universal', 'Appendix', 'Signature', 'Consent'].includes(type) ? (
                    <div className="flex gap-2.5 p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600 leading-relaxed">
                        This block will always be shown even if there are no rules. Rules are applied if added, and it will be replaced by derived blocks only if specific rules apply.
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-100">
                      <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 leading-relaxed">
                        This block won't be displayed unless the rules defined in it are met.
                        {type === 'Domain' && rules.length === 1 && rules[0].parameter === 'Domain' && (
                            <span className="block mt-1 font-bold">Auto-logic: IF Domain ANY {name || '[Name]'} THEN Include.</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Content Template Selector (Visible for all NON-derived blocks) */}
                {!initialBlock.isCloned && (
                  <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <LayoutTemplate className="w-3 h-3" /> Insert Content Template
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Category Filter */}
                        <div className="relative">
                            <select
                                value={templateCategory}
                                onChange={(e) => setTemplateCategory(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 appearance-none transition-shadow"
                            >
                                <option value="">All Categories</option>
                                {CONTENT_TEMPLATES.map(g => (
                                    <option key={g.group} value={g.group}>{g.group}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                                <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        {/* Template Selector */}
                        <div className="relative">
                            <select 
                                onChange={handleTemplateChange}
                                className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 appearance-none transition-shadow"
                                defaultValue=""
                            >
                                <option value="" disabled>Select template...</option>
                                {filteredContentTemplates.map((group) => (
                                    <optgroup key={group.group} label={group.group}>
                                    {group.templates.map((t) => (
                                        <option key={t.label} value={t.label}>{t.label}</option>
                                    ))}
                                    </optgroup>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                                <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* Content Area */}
                <div className="col-span-2 space-y-1.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">Block Content</label>
                  </div>

                  {/* Comparison Tools */}
                  {(initialBlock.isCloned && parentBlock) && (
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                       
                       <button 
                         onClick={() => setComparisonMode(comparisonMode === 'draft_vs_source' ? null : 'draft_vs_source')}
                         className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                           comparisonMode === 'draft_vs_source' 
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-200' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                         }`}
                         title="Compare current draft with the original source content"
                       >
                         <Split className="w-3.5 h-3.5" />
                         {comparisonMode === 'draft_vs_source' ? 'Hide Comparison' : 'Compare with Source'}
                       </button>

                       {!content && (
                         <button
                           onClick={() => setContent(parentBlock.content || '')}
                           className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
                         >
                            <Search className="w-3.5 h-3.5" /> Use existing content
                         </button>
                       )}
                    </div>
                  )}
                  
                  {comparisonMode && parentBlock && (
                    <div className={`border rounded-lg overflow-hidden mb-2 ${
                      comparisonMode === 'source_diff' ? 'border-amber-200' : 'border-indigo-200'
                    }`}>
                       <div className={`px-3 py-2 border-b flex items-center justify-between ${
                         comparisonMode === 'source_diff' ? 'bg-amber-50 border-amber-100' : 'bg-indigo-50 border-indigo-100'
                       }`}>
                          <span className={`text-xs font-semibold flex items-center gap-2 ${
                             comparisonMode === 'source_diff' ? 'text-amber-800' : 'text-indigo-800'
                          }`}>
                             {comparisonMode === 'source_diff' ? (
                                <>
                                  <span className="bg-white px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">v{initialBlock.derivedFromVersion}</span>
                                  <ArrowRight className="w-3 h-3 text-amber-400" />
                                  <span className="bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">v{parentBlock.version}</span>
                                </>
                             ) : (
                                <>
                                  <span className="bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-200 text-[10px]">SOURCE v{parentBlock.version}</span>
                                  <ArrowRight className="w-3 h-3 text-indigo-400" />
                                  <span className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 text-[10px]">YOUR DRAFT</span>
                                </>
                             )}
                          </span>
                          
                          <div className="flex items-center gap-2">
                             {(comparisonMode === 'draft_vs_source' || comparisonMode === 'source_diff') && showDiff && (
                                <div className="flex bg-white/50 p-0.5 rounded border border-black/5">
                                   <button 
                                     onClick={() => setDiffViewMode('inline')}
                                     className={`p-1 rounded text-[10px] transition-colors ${diffViewMode === 'inline' ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                                     title="Inline View"
                                   >
                                     <LayoutList className="w-3 h-3" />
                                   </button>
                                   <button 
                                     onClick={() => setDiffViewMode('split')}
                                     className={`p-1 rounded text-[10px] transition-colors ${diffViewMode === 'split' ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                                     title="Side-by-Side View"
                                   >
                                     <Columns className="w-3 h-3" />
                                   </button>
                                </div>
                             )}

                             {comparisonMode === 'draft_vs_source' && (
                                <button
                                  onClick={() => setShowDiff(!showDiff)}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium border transition-colors ${
                                    showDiff 
                                      ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                                      : 'bg-white text-gray-500 border-gray-200 hover:text-gray-700'
                                  }`}
                                  title={showDiff ? "Show source text only" : "Highlight differences against draft"}
                                >
                                  {showDiff ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  {showDiff ? 'Hide Diff' : 'Show Diff'}
                                </button>
                             )}
                          </div>
                       </div>
                       <div className="p-3 bg-white text-xs text-gray-600 max-h-40 overflow-y-auto">
                          {comparisonMode === 'source_diff' ? (
                             <DiffViewer 
                               oldText={parentSnapshot} 
                               newText={parentBlock.content || ''} 
                               viewMode={diffViewMode}
                             />
                          ) : (
                             showDiff ? (
                                <DiffViewer 
                                  oldText={parentBlock.content || ''} 
                                  newText={content} 
                                  viewMode={diffViewMode}
                                />
                             ) : (
                                <div className="whitespace-pre-wrap font-mono leading-relaxed text-gray-600">
                                   {parentBlock.content}
                                </div>
                             )
                          )}
                       </div>
                    </div>
                  )}

                  {/* Rich Text Editor Container */}
                  <div className="w-full rounded-lg border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-amber-200 focus-within:border-amber-300 transition-all overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 px-2 py-2 border-b border-gray-100 bg-gray-50/50">
                       <button onClick={() => handleFormat('p')} className="px-2 py-1.5 text-[10px] font-black text-gray-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Paragraph">P</button>
                       <button onClick={() => handleFormat('h1')} className="px-2 py-1.5 text-[10px] font-black text-gray-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Heading 1">H1</button>
                       <button onClick={() => handleFormat('h2')} className="px-2 py-1.5 text-[10px] font-black text-gray-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Heading 2">H2</button>
                       <button onClick={() => handleFormat('h3')} className="px-2 py-1.5 text-[10px] font-black text-gray-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Heading 3">H3</button>
                       
                       <div className="w-px h-4 bg-gray-300 mx-1"></div>

                       <button onClick={() => handleFormat('bold')} className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Bold">
                         <Bold className="w-3.5 h-3.5" />
                       </button>
                       <button onClick={() => handleFormat('italic')} className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Italic">
                         <Italic className="w-3.5 h-3.5" />
                       </button>

                       <div className="w-px h-4 bg-gray-300 mx-1"></div>
                       
                       {/* Variable Inserter */}
                       <div className="relative">
                          <button 
                            ref={variableButtonRef}
                            onClick={() => setIsVariableMenuOpen(!isVariableMenuOpen)}
                            className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-700 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded transition-all"
                          >
                            <Braces className="w-3.5 h-3.5" /> Variables <ChevronDown className="w-3 h-3" />
                          </button>
                          {isVariableMenuOpen && (
                            <div ref={variableMenuRef} className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                               <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                                 Insert Variable
                               </div>
                               {AVAILABLE_VARIABLES.map(v => (
                                 <button
                                   key={v}
                                   onClick={() => handleInsertVariable(v)}
                                   className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 hover:text-indigo-700 transition-colors block truncate"
                                 >
                                   {v}
                                 </button>
                               ))}
                            </div>
                          )}
                       </div>

                       {/* Consent Domain Inserter (Conditional) */}
                       {type === 'Consent' && (
                           <>
                             <div className="w-px h-4 bg-gray-300 mx-1"></div>
                             <button 
                               onClick={handleInsertConsentDomains}
                               className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50 rounded transition-all"
                               title="Insert dynamic checkboxes for all included Domain blocks"
                             >
                               <CheckSquare className="w-3.5 h-3.5" /> Insert Dynamic Domain List
                             </button>
                           </>
                       )}
                    </div>

                    <textarea 
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={12}
                      className="w-full p-4 text-sm text-gray-800 leading-relaxed focus:outline-none resize-none font-mono bg-white"
                      placeholder="Enter block content..."
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-right">Markdown supported</p>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
               
               {/* New Rule Builder */}
               <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" /> Define Logic Condition
                  </h3>
                  
                  <div className="grid grid-cols-12 gap-3 mb-4">
                     <div className="col-span-3">
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">Parameter</label>
                        <select 
                          value={newRuleParam}
                          onChange={(e) => {
                             setNewRuleParam(e.target.value as LogicParameter);
                             setNewRuleValues([]);
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                          {LOGIC_PARAMETERS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                     </div>
                     <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">Operator</label>
                        <select 
                          value={newRuleOp}
                          onChange={(e) => setNewRuleOp(e.target.value as LogicOperator)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                          <option value="EQUAL TO">Equal to</option>
                          <option value="NOT EQUAL TO">Not equal to</option>
                          <option value="CONTAINS">Contains</option>
                          <option value="ANY">Any of</option>
                        </select>
                     </div>
                     <div className="col-span-7">
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">Values</label>
                        <div className="relative">
                           <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-gray-200 bg-white min-h-[42px] max-h-[80px] overflow-y-auto">
                              {newRuleValues.includes('ALL') ? (
                                 <span className="bg-gray-800 text-white px-2 py-0.5 rounded text-xs flex items-center gap-1">
                                   ALL VALUES <button onClick={() => setNewRuleValues([])}><X className="w-3 h-3" /></button>
                                 </span>
                              ) : (
                                newRuleValues.map(v => (
                                  <span key={v} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs flex items-center gap-1 border border-indigo-100">
                                    {v} <button onClick={() => handleValueToggle(v)}><X className="w-3 h-3" /></button>
                                  </span>
                                ))
                              )}
                              {newRuleValues.length === 0 && <span className="text-gray-400 text-sm italic pl-1">Select values below...</span>}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Value Selector Chips */}
                  <div className="mb-4">
                     <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                        <button 
                          onClick={handleSelectAllValues}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${isAllSelected ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                        >
                          All Values
                        </button>
                        {availableOptions.map(opt => (
                           <button 
                             key={opt} 
                             onClick={() => handleValueToggle(opt)}
                             className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${newRuleValues.includes(opt) ? 'bg-indigo-100 text-indigo-800 border-indigo-200 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                           >
                             {opt}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-indigo-50">
                     <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 font-medium">Then:</span>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                           <button 
                             onClick={() => setNewRuleAction('Include block')}
                             className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${newRuleAction === 'Include block' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                           >
                             Include
                           </button>
                           <button 
                             onClick={() => setNewRuleAction('Exclude block')}
                             className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${newRuleAction === 'Exclude block' ? 'bg-white text-orange-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                           >
                             Exclude
                           </button>
                        </div>
                     </div>
                     <button 
                       onClick={handleAddRule}
                       disabled={newRuleValues.length === 0}
                       className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                     >
                       Add Rule
                     </button>
                  </div>
               </div>

               {/* Active Rules List */}
               <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Active Rules</h4>
                  {rules.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400 text-sm">
                       No rules defined. This block will use default visibility.
                    </div>
                  ) : (
                    <div className="space-y-2">
                       {rules.map((rule) => (
                          <div key={rule.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-colors">
                             <div className="flex items-center gap-3 text-sm">
                                <span className="font-bold text-gray-500 text-xs bg-gray-100 px-1.5 py-0.5 rounded">IF</span>
                                <span className="font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{rule.parameter}</span>
                                <span className="text-gray-400 font-mono text-xs">{rule.operator}</span>
                                <span className="text-gray-800 font-medium max-w-[200px] truncate" title={rule.values.join(', ')}>
                                   {rule.values.includes('ALL') ? 'ALL' : rule.values.join(', ')}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-gray-300 mx-1" />
                                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${rule.action === 'Include block' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                   {rule.action === 'Include block' ? 'Include' : 'Exclude'}
                                </span>
                             </div>
                             <button onClick={() => handleDeleteRule(rule.id)} className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors">
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       ))}
                    </div>
                  )}
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
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-6 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isEditing ? <RefreshCw className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isEditing ? 'Save Changes' : 'Create Block'}
          </button>
        </div>

      </div>
    </div>
  );
};
