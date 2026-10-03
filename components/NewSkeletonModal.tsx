
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Layers, Plus, Trash2, GripVertical, Check } from 'lucide-react';
import { BlockType, Skeleton } from '../types';
import { BLOCK_TYPES } from '../constants';

interface NewSkeletonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, blocks: { type: BlockType; name: string; content: string }[]) => void;
  initialSkeleton?: Skeleton | null;
}

interface SkeletonBlockInput {
  id: string; // Internal ID for list management
  type: BlockType;
  name: string;
  content: string;
}

export const NewSkeletonModal: React.FC<NewSkeletonModalProps> = ({ isOpen, onClose, onSave, initialSkeleton }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [blocks, setBlocks] = useState<SkeletonBlockInput[]>([
    { id: '1', type: 'Universal', name: 'Introduction', content: '' },
    { id: '2', type: 'Domain', name: 'Risks & Benefits', content: '' }
  ]);

  useEffect(() => {
    if (isOpen) {
      if (initialSkeleton) {
        setName(initialSkeleton.name);
        setDescription(initialSkeleton.description);
        setBlocks(initialSkeleton.blocks.map((b, index) => ({
          id: `existing_${index}_${Date.now()}`,
          type: b.type,
          name: b.contentName,
          content: b.content || ''
        })));
      } else {
        // Reset for new creation
        setName('');
        setDescription('');
        setBlocks([
          { id: '1', type: 'Universal', name: 'Introduction', content: '' },
          { id: '2', type: 'Domain', name: 'Risks & Benefits', content: '' }
        ]);
      }
    }
  }, [isOpen, initialSkeleton]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim() && blocks.length > 0) {
      const finalBlocks = blocks.map(b => ({
        type: b.type,
        name: b.name,
        content: b.content
      }));
      onSave(name, description, finalBlocks);
    }
  };

  const addBlock = () => {
    setBlocks([...blocks, { 
      id: Date.now().toString(), 
      type: 'Universal', 
      name: `Section ${blocks.length + 1}`, 
      content: '' 
    }]);
  };

  const updateBlock = (id: string, field: keyof SkeletonBlockInput, value: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const removeBlock = (id: string) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter(b => b.id !== id));
    }
  };

  const isEditing = !!initialSkeleton;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{isEditing ? 'Edit Skeleton' : 'New Skeleton'}</h2>
            <p className="text-sm text-gray-500 mt-1">{isEditing ? 'Modify structure and default content.' : 'Define a new starting structure and default content for templates.'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-8 overflow-y-auto space-y-8 bg-white">
          
          {/* Skeleton Metadata */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Skeleton Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Minimal Consent"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all placeholder:text-gray-400 text-sm"
                autoFocus
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all placeholder:text-gray-400 text-sm"
              />
            </div>
          </div>

          <div className="h-px bg-gray-100"></div>

          {/* Block Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" /> Structure Definition
              </h3>
              <button 
                onClick={addBlock}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Block
              </button>
            </div>

            <div className="space-y-4">
              {blocks.map((block, index) => (
                <div key={block.id} className="bg-gray-50 rounded-xl border border-gray-200 p-4 relative group transition-all hover:shadow-md hover:border-gray-300">
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 cursor-move opacity-0 group-hover:opacity-100 hidden sm:block">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  
                  <div className="sm:pl-4 space-y-3">
                    <div className="flex gap-4 items-start">
                       <div className="w-1/3 min-w-[140px]">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Type</label>
                          <div className="relative">
                            <select 
                              value={block.type}
                              onChange={(e) => updateBlock(block.id, 'type', e.target.value)}
                              className="w-full text-sm px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-shadow appearance-none cursor-pointer"
                            >
                              {BLOCK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                              <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                            </div>
                          </div>
                       </div>
                       
                       <div className="flex-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Block Name</label>
                          <input 
                            type="text" 
                            value={block.name}
                            onChange={(e) => updateBlock(block.id, 'name', e.target.value)}
                            className="w-full text-sm px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-shadow"
                            placeholder="Section Name"
                          />
                       </div>

                       <button 
                         onClick={() => removeBlock(block.id)}
                         disabled={blocks.length <= 1}
                         className="mt-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                         title="Remove block"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Default Content (Optional)</label>
                      <textarea 
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                        rows={2}
                        className="w-full text-sm px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-shadow resize-y placeholder:text-gray-400"
                        placeholder="Enter default text content for this block..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!name.trim() || blocks.length === 0}
            className="px-6 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isEditing ? 'Save Changes' : 'Create Skeleton'} {isEditing ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
