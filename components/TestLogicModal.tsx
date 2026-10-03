
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Beaker, CheckCircle2, Ban, ChevronRight, Workflow, LayoutTemplate, FileText, ChevronDown, Printer, Download, Building2, GitCompare, Play, Check, Square, CheckSquare, AlertCircle, Info } from 'lucide-react';
import { Block, Template, Site } from '../types';
import { PARAMETER_OPTIONS } from '../constants';
import { DiffViewer } from './DiffViewer';
import { SimpleMarkdown } from './SimpleMarkdown';

interface TestLogicModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template | null;
  sites: Site[];
}

const getTypeStyles = (type: string) => {
  switch (type) {
    case 'Universal': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Domain': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'Intervention': return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'Recipient': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Site': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Appendix': return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'Consent': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    case 'Signature': return 'bg-slate-100 text-slate-800 border-slate-200';
    case 'Custom': return 'bg-amber-100 text-amber-800 border-amber-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const HospitalLogo: React.FC<{ siteName?: string }> = ({ siteName }) => {
  const name = siteName || '';
  
  // Default / Empiric Logo
  if (!name || name === 'Parent (Default)' || name === 'Default') {
     return (
        <div className="flex flex-col items-center justify-center mb-8 opacity-90">
           <div className="w-10 h-10 bg-indigo-900 rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl mb-1.5 shadow-sm">E</div>
           <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-900 uppercase">Empiric Health</span>
        </div>
     );
  }

  // Royal Melbourne Hospital
  if (name.includes('Royal Melbourne')) {
     return (
        <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-full border-[3px] border-[#005eb8] flex items-center justify-center">
                <div className="w-4 h-4 bg-[#005eb8] rounded-full"></div>
            </div>
            <div className="flex flex-col text-left">
                <span className="text-[#005eb8] font-sans font-bold text-sm leading-none">The Royal</span>
                <span className="text--[#333] font-sans font-light text-xs uppercase tracking-wider leading-none mt-0.5">Melbourne Hospital</span>
            </div>
        </div>
     );
  }
  
  // The Alfred
  if (name.includes('Alfred')) {
     return (
        <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-[#e30613] font-serif font-black text-3xl leading-none">A</span>
            <div className="h-8 w-px bg-gray-300 mx-1"></div>
            <div className="flex flex-col text-left">
                <span className="text-gray-900 font-sans font-bold text-xs uppercase tracking-tight leading-none">The Alfred</span>
                <span className="text-gray-500 font-sans text-[10px] leading-none mt-0.5">Part of Alfred Health</span>
            </div>
        </div>
     );
  }

  // Royal Children's
  if (name.includes('Children')) {
     return (
        <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex gap-1 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            </div>
            <span className="text-[#0093d0] font-sans font-bold text-sm leading-tight">The Royal Children's Hospital</span>
            <span className="text-gray-400 text-[9px] uppercase tracking-[0.2em] leading-tight">Melbourne</span>
        </div>
     );
  }

  // Westmead / Others with generic styles but colored
  if (name.includes('Westmead') || name.includes('Sydney')) {
     return (
         <div className="flex items-center justify-center gap-2 mb-8">
             <div className="w-8 h-8 bg-sky-700 rounded-tl-lg rounded-br-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {name.substring(0, 2).toUpperCase()}
             </div>
             <div className="flex flex-col text-left">
                 <span className="text-sky-800 font-bold text-sm leading-none">{name.split(' ')[0]}</span>
                 <span className="text-sky-900/60 font-medium text-xs leading-none mt-0.5">Hospital</span>
             </div>
         </div>
     )
  }

  // Generic Fallback
  return (
     <div className="flex flex-col items-center justify-center mb-8 opacity-70">
         <Building2 className="w-8 h-8 text-gray-400 mb-1" />
         <span className="text-gray-500 font-bold text-xs uppercase tracking-wide border-t border-gray-200 pt-1">{name}</span>
     </div>
  );
};

// Helper to replace dynamic placeholders with runtime content
const resolveDynamicContent = (content: string, visibleBlocks: { block: Block }[], allBlocks: Block[]) => {
  if (!content || !content.includes('{{DYNAMIC_DOMAIN_LIST}}')) return content;

  // 1. Try to find visible Domain blocks (filtered by logic)
  let domainBlocks = visibleBlocks
    .map(item => item.block)
    .filter(b => b.type === 'Domain');

  // 2. Fallback: If no domains are visible (e.g., rigid "Include" logic with no context selected),
  // show ALL Domain blocks from the template so the user sees what is available.
  if (domainBlocks.length === 0) {
      domainBlocks = allBlocks.filter(b => b.type === 'Domain' && !b.isDisabled);
  }

  if (domainBlocks.length === 0) {
      return content.replace('{{DYNAMIC_DOMAIN_LIST}}', '_No specific domain options available._');
  }

  const listMarkdown = domainBlocks.map(b => 
    `**${b.contentName}**\n\n[ ] Yes  [ ] No`
  ).join('\n\n');

  return content.replace('{{DYNAMIC_DOMAIN_LIST}}', listMarkdown);
};

export const TestLogicModal: React.FC<TestLogicModalProps> = ({ isOpen, onClose, template, sites }) => {
  // Change context to store arrays of strings for multi-select support
  const [context, setContext] = useState<Record<string, string[]>>({});
  const [showMetadata, setShowMetadata] = useState(true);
  const [internalVersion, setInternalVersion] = useState('');
  const [compareVersion, setCompareVersion] = useState<string | null>(null);
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);
  const [isCompareDropdownOpen, setIsCompareDropdownOpen] = useState(false);
  const [isInterventionDropdownOpen, setIsInterventionDropdownOpen] = useState(false);
  
  // Accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    scenarios: false,
    context: true,
  });
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const compareDropdownRef = useRef<HTMLDivElement>(null);
  const interventionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && template) {
        setInternalVersion(template.version);
        setCompareVersion(null);
    }
  }, [isOpen, template]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsVersionDropdownOpen(false);
      }
      if (compareDropdownRef.current && !compareDropdownRef.current.contains(event.target as Node)) {
        setIsCompareDropdownOpen(false);
      }
      if (interventionDropdownRef.current && !interventionDropdownRef.current.contains(event.target as Node)) {
        setIsInterventionDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleContextChange = (param: string, value: string) => {
    // For single-select fields, just set an array with one item
    setContext(prev => ({
      ...prev,
      [param]: value ? [value] : []
    }));
  };

  const handleInterventionToggle = (value: string) => {
    setContext(prev => {
      const current = prev['Intervention'] || [];
      if (current.includes(value)) {
        return { ...prev, 'Intervention': current.filter(v => v !== value) };
      } else {
        return { ...prev, 'Intervention': [...current, value] };
      }
    });
  };

  const clearInterventions = () => {
    setContext(prev => ({ ...prev, 'Intervention': [] }));
  };
  
  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const hasSelections = useMemo(() => {
    return Object.values(context).some((v: string[]) => v.length > 0);
  }, [context]);

  // Get blocks for the currently selected version
  const blocks = useMemo((): Block[] => {
    if (!template) return [];
    if (internalVersion === template.version) return template.blocks;
    const historyEntry = template.history?.find(h => h.version === internalVersion);
    return historyEntry ? historyEntry.blocksSnapshot : template.blocks;
  }, [template, internalVersion]);

  // Compute Quick Scenarios based on the logic present in the current blocks
  const scenarios = useMemo(() => {
    // Standard/Default should explicit reset all context keys to empty arrays
    const computedScenarios = [{ 
      name: 'Standard / Default', 
      context: { 'Situation': [], 'Site': [], 'Recipient': [], 'Intervention': [], 'Jurisdiction': [] } as Record<string, string[]> 
    }];
    
    if (!blocks || blocks.length === 0) return computedScenarios;

    const paramsUsed = new Map<string, Set<string>>();

    // Scan for used parameters and values
    blocks.forEach(b => {
        if (b.isDisabled) return;
        b.rules.forEach(r => {
            if (!paramsUsed.has(r.parameter)) {
                paramsUsed.set(r.parameter, new Set());
            }
            r.values.forEach(v => {
                if (v !== 'ALL') paramsUsed.get(r.parameter)?.add(v);
            });
        });
    });

    // 1. Situation based scenarios
    const situation = paramsUsed.get('Situation');
    if (situation) {
        if (situation.has('consent to continue')) {
            computedScenarios.push({ name: 'Consent to Continue', context: { 'Situation': ['consent to continue'] } });
        }
        if (situation.has('RDM')) {
            computedScenarios.push({ name: 'RDM (Generic)', context: { 'Situation': ['RDM'] } });
            
            // Heuristic for RDM Site variations
            const sites = paramsUsed.get('Site');
            if (sites) {
                if (sites.has('Royal Melbourne Hospital')) {
                    computedScenarios.push({ name: 'RDM (Victoria)', context: { 'Situation': ['RDM'], 'Site': ['Royal Melbourne Hospital'] } });
                }
                if (sites.has('Fiona Stanley Hospital')) {
                    computedScenarios.push({ name: 'RDM (WA)', context: { 'Situation': ['RDM'], 'Site': ['Fiona Stanley Hospital'] } });
                }
                if (sites.has('Westmead Hospital')) {
                    computedScenarios.push({ name: 'RDM (Other)', context: { 'Situation': ['RDM'], 'Site': ['Westmead Hospital'] } });
                }
            }
        }
    }

    // 2. Recipient based scenarios
    const recipients = paramsUsed.get('Recipient');
    if (recipients) {
        recipients.forEach(r => {
            if (r !== 'Participant') { 
                computedScenarios.push({ name: `Recipient: ${r}`, context: { 'Recipient': [r] } });
            }
        });
    }

    // 3. Intervention based scenarios
    const interventions = paramsUsed.get('Intervention');
    if (interventions) {
        // Limit to first 3 individual + 1 combo to avoid clutter
        let count = 0;
        const combo: string[] = [];
        interventions.forEach(i => {
            if (count < 3) {
                computedScenarios.push({ name: `Intervention: ${i}`, context: { 'Intervention': [i] } });
                combo.push(i);
                count++;
            }
        });
        if (combo.length > 1) {
             computedScenarios.push({ name: `Multi: ${combo.slice(0,2).join(' & ')}`, context: { 'Intervention': combo } });
        }
    }

    // 4. Jurisdiction based scenarios
    const jurisdictions = paramsUsed.get('Jurisdiction');
    if (jurisdictions) {
        jurisdictions.forEach(j => {
             computedScenarios.push({ name: `Jurisdiction: ${j}`, context: { 'Jurisdiction': [j] } });
        });
    }

    return computedScenarios;
  }, [blocks]);

  // Get blocks for the comparison version
  const comparisonBlocks = useMemo(() => {
    if (!template || !compareVersion) return null;
    if (compareVersion === template.version) return template.blocks;
    const historyEntry = template.history?.find(h => h.version === compareVersion);
    return historyEntry ? historyEntry.blocksSnapshot : null;
  }, [template, compareVersion]);

  const availableVersions = useMemo(() => {
      if (!template) return [];
      const vers = [{ version: template.version, date: template.lastUpdated }];
      if (template.history) {
          template.history.forEach(h => {
              vers.push({ version: h.version, date: h.lastUpdated });
          });
      }
      return vers.sort((a, b) => parseFloat(b.version) - parseFloat(a.version));
  }, [template]);

  const { activeParameters, parameterValues } = useMemo(() => {
    const usedParams = new Set<string>();
    const usedValues: Record<string, Set<string>> = {};

    blocks.forEach(block => {
      // Skip logic extraction for disabled blocks
      if (block.isDisabled) return;

      block.rules.forEach(rule => {
        if (rule.parameter && PARAMETER_OPTIONS[rule.parameter]) {
          usedParams.add(rule.parameter);
          if (!usedValues[rule.parameter]) {
            usedValues[rule.parameter] = new Set();
          }
          rule.values.forEach(v => usedValues[rule.parameter].add(v));
        }
      });
    });

    // Ensure 'Site' is always available if we have a site list, and merge existing site names
    if (sites && sites.length > 0) {
      usedParams.add('Site');
      if (!usedValues['Site']) usedValues['Site'] = new Set();
      sites.forEach(s => usedValues['Site'].add(s.name));
    }

    return { 
      // Convert Set to Array to preserve insertion order (order of appearance)
      activeParameters: Array.from(usedParams), 
      parameterValues: usedValues 
    };
  }, [blocks, sites]);

  const { visibleBlocks, hiddenBlocks, activeRules } = useMemo(() => {
    const visible: { block: Block; reason: string }[] = [];
    const hidden: Block[] = [];
    const applied: { blockName: string; ruleDescription: string; action: 'Include' | 'Exclude' | 'Notice' }[] = [];

    // Check if Intervention is default (empty array)
    const interventionContext = context['Intervention'] || [];
    const isInterventionDefault = interventionContext.length === 0;
    
    // Check if Situation is default (empty array)
    const situationContext = context['Situation'] || [];
    const isSituationDefault = situationContext.length === 0;

    // Track which parameters had rules successfully triggered
    const triggeredParameters = new Set<string>();

    blocks.forEach(block => {
      // Check for manual disable first
      if (block.isDisabled) {
        hidden.push(block);
        return;
      }

      // If in preview intervention is parent (default) AND situation is default
      // then all domain and appendix blocks are shown (except for derived).
      if (isInterventionDefault && isSituationDefault && (block.type === 'Domain' || block.type === 'Appendix') && !block.isCloned) {
          
          // CRITICAL FIX: Even in default preview mode, we must respect EXCLUSION rules (System Rules).
          // Example: If Site = 'Regional Hub', exclude Antibody Therapy even if Intervention is default.
          const excludeRules = block.rules.filter(r => r.action === 'Exclude block');
          let isExcluded = false;
          let exclusionReason = '';

          for (const rule of excludeRules) {
             // Skip exclusion rules based on Intervention/Domain in this default view
             if (rule.parameter === 'Intervention' || rule.parameter === 'Domain') continue;

             const contextValues = context[rule.parameter] || [];
             // Only evaluate if context is present (e.g. a Site is selected)
             if (contextValues.length === 0 && !rule.values.includes('ALL')) continue;

             let conditionMet = false;
             if (rule.values.includes('ALL')) {
                 conditionMet = true;
             } else {
                 const hasIntersection = rule.values.some(rv => contextValues.includes(rv));
                 if (rule.operator === 'NOT EQUAL TO') {
                     // For NOT EQUAL, if context is present and doesn't match values, condition is met (exclude)
                     // If context is empty, we generally don't exclude based on NOT EQUAL in default view
                     conditionMet = !hasIntersection && contextValues.length > 0;
                 } else {
                     conditionMet = hasIntersection;
                 }
             }

             if (conditionMet) {
                 isExcluded = true;
                 exclusionReason = rule.isSystem ? 'Excluded by System Rule' : `Excluded by ${rule.parameter} rule`;
                 
                 const values = rule.values.includes('ALL') ? 'ALL' : rule.values.join(', ');
                 applied.push({
                     blockName: block.contentName,
                     ruleDescription: `${rule.parameter} ${rule.operator.toLowerCase()} "${values}"`,
                     action: 'Exclude'
                 });
                 triggeredParameters.add(rule.parameter);
                 break;
             }
          }

          if (isExcluded) {
             hidden.push(block);
          } else {
             visible.push({ block, reason: 'Preview: All domains/appendices visible by default' });
          }
          return;
      }

      if (block.rules.length === 0) {
        visible.push({ block, reason: 'Always included' });
        return;
      }

      let shouldShow = true; 
      const includeRules = block.rules.filter(r => r.action === 'Include block');
      const excludeRules = block.rules.filter(r => r.action === 'Exclude block');
      let matchReason = '';

      for (const rule of excludeRules) {
         // If Intervention is default, do not apply Domain/Intervention exclude rules based on Intervention.
         // BUT do apply other rules (like Situation)
         if (isInterventionDefault && (rule.parameter === 'Intervention' || rule.parameter === 'Domain')) continue;

         const contextValues = context[rule.parameter] || [];
         
         let conditionMet = false;
         if (rule.values.includes('ALL')) {
             conditionMet = true;
         } else {
             // Check intersection between context selections and rule values
             const hasIntersection = rule.values.some(rv => contextValues.includes(rv));
             
             if (rule.operator === 'NOT EQUAL TO') {
                 // Logic: If rule says "Exclude if Site != A", and context contains A, condition is false.
                 // If context contains B (and not A), condition is true.
                 // For multi-select, "Not Equal" usually implies "Does not contain".
                 conditionMet = !hasIntersection && contextValues.length > 0;
             } else {
                 // EQUAL TO, CONTAINS, ANY
                 conditionMet = hasIntersection;
             }
         }

         if (conditionMet) {
           shouldShow = false;
           const values = rule.values.includes('ALL') ? 'ALL' : rule.values.join(', ');
           applied.push({
               blockName: block.contentName,
               ruleDescription: `${rule.parameter} ${rule.operator.toLowerCase()} "${values}"`,
               action: 'Exclude'
           });
           triggeredParameters.add(rule.parameter);
           break;
         }
      }

      if (shouldShow && includeRules.length > 0) {
        // Enforce AND logic: ALL include rules must be met
        let allMet = true;
        const matchedConditions: string[] = [];
        const potentialAppliedRules: typeof applied = [];

        for (const rule of includeRules) {
           // If Intervention is default, do not apply Domain/Intervention rules (treat as met)
           // BUT allow other rules (like Situation) to be evaluated normally.
           if (isInterventionDefault && (rule.parameter === 'Intervention' || rule.parameter === 'Domain')) {
               matchedConditions.push(`${rule.parameter} (Default)`);
               continue;
           }

           const contextValues = context[rule.parameter] || [];
           
           let conditionMet = false;
           if (rule.values.includes('ALL')) {
               conditionMet = true;
           } else {
               const hasIntersection = rule.values.some(rv => contextValues.includes(rv));
               
               if (rule.operator === 'NOT EQUAL TO') {
                   conditionMet = !hasIntersection && contextValues.length > 0;
               } else {
                   // EQUAL TO, CONTAINS, ANY
                   conditionMet = hasIntersection;
               }
           }

           if (!conditionMet) {
             allMet = false;
             break;
           }
           matchedConditions.push(`${rule.parameter}`);
           const values = rule.values.includes('ALL') ? 'ALL' : rule.values.join(', ');
           potentialAppliedRules.push({
               blockName: block.contentName,
               ruleDescription: `${rule.parameter} ${rule.operator.toLowerCase()} "${values}"`,
               action: 'Include'
           });
           triggeredParameters.add(rule.parameter);
        }
        
        shouldShow = allMet;
        if (shouldShow) {
             matchReason = `Matched: ${matchedConditions.join(' & ')}`;
             // If all conditions met, add rules to active list
             applied.push(...potentialAppliedRules);
        }

      } else if (shouldShow && excludeRules.length > 0) {
         matchReason = 'Parent (Not excluded)';
      }

      if (shouldShow) {
        visible.push({ block, reason: matchReason || 'Always included' });
      } else {
        hidden.push(block);
      }
    });

    // Check for "No Effect" scenarios (context selected but no rule triggered for that param)
    Object.keys(context).forEach(param => {
       const selections = context[param];
       if (selections && selections.length > 0 && !triggeredParameters.has(param)) {
           // If 'Site' is selected but no site rules exist or were triggered
           if (param === 'Site') {
              applied.push({
                  blockName: 'Simulation Notice',
                  ruleDescription: `Selected Site "${selections[0]}" has no associated exclusion or inclusion rules.`,
                  action: 'Notice'
              });
           }
       }
    });

    // Post-processing: Hide parents if derived version is visible
    const parentIdsToHide = new Set<string>();
    visible.forEach(item => {
        if (item.block.isCloned && item.block.clonedFrom) {
            parentIdsToHide.add(item.block.clonedFrom);
        }
    });

    const finalVisible = visible.filter(item => {
        if (parentIdsToHide.has(item.block.id)) {
            hidden.push(item.block); // Move parent to hidden if derived override exists
            return false;
        }
        return true;
    });

    return { visibleBlocks: finalVisible, hiddenBlocks: hidden, activeRules: applied };
  }, [blocks, context]);

  // Group visible blocks by type for merged view
  const groupedBlocks = useMemo(() => {
    const groups: Record<string, { block: Block; reason: string }[]> = {};
    const types = ['Universal', 'Domain', 'Intervention', 'Recipient', 'Site', 'Signature', 'Custom', 'Consent', 'Appendix'];
    
    types.forEach(t => groups[t] = []);
  
    visibleBlocks.forEach(item => {
      const type = item.block.type || 'Custom';
      if (!groups[type]) groups[type] = []; 
      groups[type].push(item);
    });
  
    return groups;
  }, [visibleBlocks]);

  const ORDERED_TYPES = ['Universal', 'Domain', 'Intervention', 'Site', 'Recipient', 'Appendix', 'Consent', 'Signature', 'Custom'];

  if (!isOpen) return null;
  const templateName = template?.name || 'Untitled Template';

  // Helper for Hospital Logo (expects string, getting first from array)
  const currentSite = context['Site'] && context['Site'].length > 0 ? context['Site'][0] : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col ring-1 ring-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Beaker className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Test Logic & Preview</h2>
              <p className="text-sm text-gray-500">Simulate participant scenarios to verify logic rules.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar: Simulation Context */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto shrink-0 flex flex-col">
            <div className="flex flex-col">

              {/* Quick Scenarios Accordion */}
              <div className="border-b border-gray-200">
                 <button 
                   onClick={() => toggleSection('scenarios')}
                   className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors group"
                 >
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 group-hover:text-indigo-600">
                     <Play className="w-3.5 h-3.5" /> Quick Scenarios
                   </span>
                   <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openSections.scenarios ? 'rotate-180' : ''}`} />
                 </button>
                 
                 {openSections.scenarios && (
                   <div className="px-6 pb-6 pt-2 space-y-2 animate-in slide-in-from-top-1 duration-200">
                      {scenarios.map((preset, idx) => (
                         <button
                           key={idx}
                           onClick={() => setContext(prev => ({ ...prev, ...preset.context }))}
                           className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 text-xs font-medium text-gray-700 transition-colors flex items-center justify-between group"
                         >
                           {preset.name}
                           <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-indigo-400" />
                         </button>
                      ))}
                   </div>
                 )}
              </div>

              {/* Simulation Context Accordion */}
              <div className="border-b border-gray-200">
                <button 
                   onClick={() => toggleSection('context')}
                   className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors group"
                 >
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 group-hover:text-indigo-600">
                     <Workflow className="w-3.5 h-3.5" /> Simulation Context
                   </span>
                   <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openSections.context ? 'rotate-180' : ''}`} />
                </button>
                
                {openSections.context && (
                    <div className="px-6 pb-6 pt-2 space-y-4 animate-in slide-in-from-top-1 duration-200">
                      {activeParameters.length === 0 ? (
                        <p className="text-sm text-gray-500 italic bg-white p-3 rounded border border-gray-200">
                          No logic rules defined in this template yet.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {activeParameters.map(param => {
                              const isIntervention = param === 'Intervention';
                              
                              if (isIntervention) {
                                  const selectedInterventions = context['Intervention'] || [];
                                  return (
                                      <div key={param} className="relative" ref={interventionDropdownRef}>
                                          <label className="block text-xs font-medium text-gray-700 mb-1.5">Domain</label>
                                          <button 
                                              onClick={() => setIsInterventionDropdownOpen(!isInterventionDropdownOpen)}
                                              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-left text-sm flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                          >
                                              <span className={`block truncate ${selectedInterventions.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
                                                  {selectedInterventions.length === 0 
                                                      ? 'Default (All)' 
                                                      : `${selectedInterventions.length} selected`}
                                              </span>
                                              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                          </button>
                                          
                                          {isInterventionDropdownOpen && (
                                              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 max-h-60 overflow-y-auto">
                                                  <div className="px-2 py-1.5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                                      <span className="text-[10px] font-bold text-gray-500 uppercase">Select Domains</span>
                                                      {selectedInterventions.length > 0 && (
                                                          <button onClick={clearInterventions} className="text-[10px] text-red-500 hover:underline">Clear</button>
                                                      )}
                                                  </div>
                                                  {Array.from(parameterValues[param] || new Set<string>()).map((option: string) => {
                                                      const isSelected = selectedInterventions.includes(option);
                                                      return (
                                                          <button
                                                              key={option}
                                                              onClick={() => handleInterventionToggle(option)}
                                                              className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 transition-colors flex items-center gap-2"
                                                          >
                                                              {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> : <Square className="w-3.5 h-3.5 text-gray-300" />}
                                                              <span className={isSelected ? 'font-medium text-indigo-900' : 'text-gray-600'}>{option}</span>
                                                          </button>
                                                      );
                                                  })}
                                              </div>
                                          )}
                                          {selectedInterventions.length > 0 && (
                                              <div className="flex flex-wrap gap-1 mt-2">
                                                  {selectedInterventions.map(v => (
                                                      <span key={v} className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                                                          {v}
                                                          <button onClick={() => handleInterventionToggle(v)} className="hover:text-indigo-900"><X className="w-2.5 h-2.5" /></button>
                                                      </span>
                                                  ))}
                                              </div>
                                          )}
                                      </div>
                                  );
                              }

                              return (
                                <div key={param}>
                                  <label className="block text-xs font-medium text-gray-700 mb-1.5">{param}</label>
                                  <select
                                    value={context[param]?.[0] || ''}
                                    onChange={(e) => handleContextChange(param, e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 shadow-sm"
                                  >
                                    <option value="">Default</option>
                                    {Array.from(parameterValues[param] || new Set<string>()).map((option: string) => (
                                      <option key={option} value={option}>{option}</option>
                                    ))}
                                  </select>
                                </div>
                              );
                          })}
                        </div>
                      )}
                    </div>
                )}
              </div>

              {/* Active Rules List */}
              {activeRules.length > 0 ? (
                <div className="px-6 pb-6 mt-4">
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Applied Rules</h3>
                   <div className="space-y-2">
                     {activeRules.map((item, idx) => (
                       <div key={idx} className={`p-2.5 rounded-md border text-xs shadow-sm ${item.action === 'Exclude' ? 'bg-rose-50 border-rose-100' : item.action === 'Notice' ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-gray-200'}`}>
                         <div className={`font-semibold mb-0.5 truncate ${item.action === 'Exclude' ? 'text-rose-700' : item.action === 'Notice' ? 'text-indigo-700' : 'text-emerald-700'}`}>{item.blockName}</div>
                         <div className="text-gray-500 flex items-start gap-1">
                           {item.action === 'Notice' ? <Info className="w-3 h-3 mt-0.5 shrink-0 text-indigo-400" /> : <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 text-gray-400" />}
                           <span className={item.action === 'Exclude' ? 'text-rose-600' : item.action === 'Notice' ? 'text-indigo-600 italic' : 'text-gray-600'}>{item.ruleDescription}</span>
                         </div>
                         <div className={`text-[10px] font-bold uppercase mt-1.5 ${item.action === 'Exclude' ? 'text-rose-400' : item.action === 'Notice' ? 'text-indigo-400' : 'text-emerald-500'}`}>
                             {item.action === 'Exclude' ? 'Excluded' : item.action === 'Notice' ? 'No Effect' : 'Included'}
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              ) : hasSelections && (
                <div className="px-6 pb-6 mt-4">
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Applied Rules</h3>
                   <div className="p-3 bg-amber-50 border border-amber-100 rounded-md text-xs text-amber-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">No rules triggered</p>
                        <p className="text-amber-700/80 mt-0.5">Your current selections did not impact the visibility of any blocks.</p>
                      </div>
                   </div>
                </div>
              )}

            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-gray-100 overflow-y-auto px-8 pt-8 pb-32 relative">

            {/* Top Bar for Preview Controls */}
            <div className="flex items-center justify-between mb-6">
               {/* Left Controls: Version and View Mode */}
               <div className="flex items-center gap-3">
                   {/* Global Version Dropdown */}
                   <div className="relative" ref={dropdownRef}>
                      <button 
                        onClick={() => setIsVersionDropdownOpen(!isVersionDropdownOpen)}
                        className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-gray-300 transition-colors"
                      >
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Ver</span>
                        <span className="font-semibold text-gray-900 text-sm">{internalVersion}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      {isVersionDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1.5 w-48 bg-white border border-gray-100 rounded-lg shadow-xl z-20 py-1 ring-1 ring-black ring-opacity-5">
                          {availableVersions.map((info) => {
                            const isSelected = internalVersion === info.version;
                            return (
                              <button
                                key={info.version}
                                onClick={() => {
                                  setInternalVersion(info.version);
                                  setIsVersionDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between group"
                              >
                                <div className="flex flex-col gap-0.5">
                                    <span className={`flex items-center gap-2 ${isSelected ? 'font-semibold text-indigo-600' : 'text-gray-900 font-medium'}`}>
                                      Version {info.version}
                                    </span>
                                    {info.date && (
                                      <span className="text-[10px] text-gray-500 font-medium">{info.date}</span>
                                    )}
                                </div>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                   </div>

                   {/* Compare Dropdown */}
                   <div className="relative" ref={compareDropdownRef}>
                      <button 
                        onClick={() => setIsCompareDropdownOpen(!isCompareDropdownOpen)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm transition-colors ${compareVersion ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                      >
                        <GitCompare className={`w-3.5 h-3.5 ${compareVersion ? 'text-indigo-600' : 'text-gray-400'}`} />
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Compare</span>
                        <span className={`font-semibold text-sm ${compareVersion ? 'text-indigo-700' : 'text-gray-900'}`}>{compareVersion ? `v${compareVersion}` : 'Off'}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      {isCompareDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1.5 w-48 bg-white border border-gray-100 rounded-lg shadow-xl z-20 py-1 ring-1 ring-black ring-opacity-5">
                           <button
                              onClick={() => {
                                setCompareVersion(null);
                                setIsCompareDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors font-medium text-gray-600"
                           >
                             None
                           </button>
                           <div className="h-px bg-gray-100 my-1"></div>
                          {availableVersions.filter(v => v.version !== internalVersion).map((info) => {
                            const isSelected = compareVersion === info.version;
                            return (
                              <button
                                key={info.version}
                                onClick={() => {
                                  setCompareVersion(info.version);
                                  setIsCompareDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between group"
                              >
                                <div className="flex flex-col gap-0.5">
                                    <span className={`flex items-center gap-2 ${isSelected ? 'font-semibold text-indigo-600' : 'text-gray-900 font-medium'}`}>
                                      v{info.version}
                                    </span>
                                    {info.date && (
                                      <span className="text-[10px] text-gray-500 font-medium">{info.date}</span>
                                    )}
                                </div>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                   </div>

                   {/* View Mode Toggle */}
                   <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm flex gap-1">
                       <button 
                         onClick={() => setShowMetadata(true)}
                         className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-all ${showMetadata ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}
                       >
                          <LayoutTemplate className="w-3.5 h-3.5" /> Metadata
                       </button>
                       <button 
                         onClick={() => setShowMetadata(false)}
                         className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-all ${!showMetadata ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}
                       >
                          <FileText className="w-3.5 h-3.5" /> Clean
                       </button>
                   </div>
               </div>

               {/* Print/Export */}
               <div className="flex gap-3">
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-xs font-medium border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-all group"
                  >
                    <Printer className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                    Print
                  </button>
                  <button 
                    onClick={() => alert('PDF Export functionality would generate a PDF file here.')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-all group"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-200 group-hover:text-white" />
                    Export PDF
                  </button>
               </div>
            </div>
            
            {/* Document Paper */}
            <div className="max-w-3xl mx-auto w-full bg-white shadow-lg min-h-[800px] p-12 relative rounded-sm">
              
              {/* Header inside paper */}
              <div className="mb-12 text-center border-b-2 border-gray-900 pb-8 relative">
                <span className="absolute top-0 right-0 px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider border border-amber-100 rounded">
                  Preview Mode
                </span>
                
                {/* Dynamic Hospital Logo */}
                <HospitalLogo siteName={currentSite} />

                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{templateName}</h1>
                <p className="text-gray-500 text-sm">Generated on {new Date().toLocaleDateString('en-GB')}</p>
                {compareVersion && (
                   <p className="text-indigo-600 text-xs font-medium mt-1 bg-indigo-50 inline-block px-2 py-0.5 rounded border border-indigo-100">
                      Comparing v{internalVersion} against v{compareVersion}
                   </p>
                )}
              </div>

              {/* Content Flow */}
              <div className="space-y-8">
                {ORDERED_TYPES.map(type => {
                   const items = groupedBlocks[type];
                   if (!items || items.length === 0) return null;
                   
                   return (
                     <div key={type} className="relative group">
                        {/* Metadata Header for Type */}
                        {showMetadata && (
                           <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getTypeStyles(type)}`}>
                                 {type}
                              </span>
                              <span className="text-xs font-semibold text-gray-400">
                                 {items.length} block{items.length !== 1 ? 's' : ''}
                              </span>
                           </div>
                        )}

                        {/* Group Content */}
                        <div className="space-y-6">
                           {items.map(({ block, reason }) => {
                               let oldText = '';
                               if (comparisonBlocks) {
                                  const oldBlock = comparisonBlocks.find(b => b.id === block.id);
                                  oldText = oldBlock ? resolveDynamicContent(oldBlock.content || '', visibleBlocks, comparisonBlocks) : '';
                               }
                               
                               const currentText = resolveDynamicContent(block.content || '', visibleBlocks, blocks);
                               const isSignature = block.type === 'Signature';

                               return (
                                 <div key={block.id} className="relative">
                                    {/* Logic Indicator */}
                                    {showMetadata && reason !== 'Always included' && (
                                       <div className="absolute -left-3 top-1 bottom-1 w-0.5 bg-emerald-300/50 rounded-full" title={`Included by logic: ${reason}`}></div>
                                    )}
                                    
                                    <div className={`max-w-none text-gray-800 leading-relaxed font-serif text-sm ${isSignature ? 'bg-slate-50 border-2 border-slate-200 p-6 rounded-lg break-inside-avoid shadow-sm' : ''}`}>
                                        {isSignature && (
                                            <div className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">
                                                Execution
                                            </div>
                                        )}
                                        {compareVersion ? (
                                           <DiffViewer 
                                             oldText={oldText} 
                                             newText={currentText} 
                                             className="font-serif text-sm"
                                           />
                                        ) : (
                                           currentText ? (
                                              <SimpleMarkdown content={currentText} />
                                           ) : (
                                             <p className="text-gray-400 italic text-xs">
                                               [No content]
                                             </p>
                                           )
                                        )}
                                    </div>

                                    {/* Small Logic Footnote */}
                                    {showMetadata && reason !== 'Always included' && (
                                       <div className="mt-1 flex items-center gap-1.5">
                                          <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                             Match: {reason.replace('Matched: ', '')}
                                          </span>
                                       </div>
                                    )}
                                 </div>
                               );
                           })}
                        </div>
                     </div>
                   );
                })}
                
                {visibleBlocks.length === 0 && (
                   <div className="text-center py-20">
                      <p className="text-gray-400 italic">No blocks match the current simulation context.</p>
                   </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};