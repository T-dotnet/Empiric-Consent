
import React, { useMemo } from 'react';

type DiffType = 'added' | 'removed' | 'unchanged';

interface DiffPart {
  type: DiffType;
  value: string;
}

// A simple word-based diff algorithm
const diffWords = (text1: string, text2: string): DiffPart[] => {
  if (!text1) text1 = "";
  if (!text2) text2 = "";
  
  // Split by whitespace boundaries but keep the delimiters
  const words1 = text1.split(/(\s+)/);
  const words2 = text2.split(/(\s+)/);
  
  const n = words1.length;
  const m = words2.length;
  
  // LCS Matrix
  const lcs = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (words1[i - 1] === words2[j - 1]) {
        lcs[i][j] = lcs[i - 1][j - 1] + 1;
      } else {
        lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
      }
    }
  }
  
  // Backtrack to generate diff
  const result: DiffPart[] = [];
  let i = n;
  let j = m;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && words1[i - 1] === words2[j - 1]) {
      result.unshift({ type: 'unchanged', value: words1[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      result.unshift({ type: 'added', value: words2[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || lcs[i][j - 1] < lcs[i - 1][j])) {
      result.unshift({ type: 'removed', value: words1[i - 1] });
      i--;
    }
  }
  
  // Consolidate adjacent parts of same type for cleaner DOM rendering
  const consolidated: DiffPart[] = [];
  if (result.length > 0) {
      let current = result[0];
      for(let k=1; k<result.length; k++) {
          if (result[k].type === current.type) {
              current.value += result[k].value;
          } else {
              consolidated.push(current);
              current = result[k];
          }
      }
      consolidated.push(current);
  }
  
  return consolidated;
};

interface DiffViewerProps {
  oldText: string;
  newText: string;
  viewMode?: 'inline' | 'split';
  className?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ oldText, newText, viewMode = 'inline', className }) => {
  const parts = useMemo(() => diffWords(oldText, newText), [oldText, newText]);
  
  if (viewMode === 'split') {
    return (
      <div className={`grid grid-cols-2 gap-0 leading-relaxed h-full ${className || 'font-mono text-xs'}`}>
        <div className="border-r border-gray-100 pr-3 overflow-x-auto">
          {parts.map((part, i) => {
             if (part.type === 'removed') {
                return <span key={i} className="bg-red-50 text-red-700 px-0.5 rounded mx-0.5 border border-red-100">{part.value}</span>;
             }
             if (part.type === 'unchanged') {
                return <span key={i} className="text-gray-500">{part.value}</span>;
             }
             return null;
          })}
        </div>
        <div className="pl-3 overflow-x-auto">
           {parts.map((part, i) => {
             if (part.type === 'added') {
                return <span key={i} className="bg-emerald-50 text-emerald-700 px-0.5 rounded mx-0.5 border border-emerald-100">{part.value}</span>;
             }
             if (part.type === 'unchanged') {
                return <span key={i} className="text-gray-900">{part.value}</span>;
             }
             return null;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`leading-relaxed whitespace-pre-wrap break-words ${className || 'font-mono text-xs'}`}>
      {parts.map((part, i) => {
        if (part.type === 'added') {
          return (
            <span key={i} className="bg-emerald-100 text-emerald-800 px-0.5 rounded mx-0.5 decoration-clone border border-emerald-200">
              {part.value}
            </span>
          );
        }
        if (part.type === 'removed') {
          return (
            <span key={i} className="bg-red-100 text-red-800 line-through decoration-red-400/50 px-0.5 rounded mx-0.5 opacity-70 decoration-clone border border-red-200 select-none">
              {part.value}
            </span>
          );
        }
        return <span key={i} className="text-gray-600">{part.value}</span>;
      })}
    </div>
  );
};
