
import React from 'react';

export const SimpleMarkdown = ({ content }: { content: string }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let currentList: { type: 'ul' | 'ol', items: string[] } | null = null;

  const flushList = () => {
    if (currentList) {
      const ListTag = currentList.type;
      elements.push(
        <ListTag key={`list-${elements.length}`} className={`mb-4 pl-5 ${currentList.type === 'ul' ? 'list-disc' : 'list-decimal'} space-y-1`}>
          {currentList.items.map((item, i) => (
            <li key={i} className="pl-1"><InlineParser text={item} /></li>
          ))}
        </ListTag>
      );
      currentList = null;
    }
  };

  lines.forEach((line, index) => {
    const trimLine = line.trim();

    // Headers
    if (trimLine.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={`h1-${index}`} className="text-2xl font-bold mt-6 mb-4 text-gray-900 font-serif">{trimLine.substring(2)}</h1>);
        return;
    }
    if (trimLine.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={`h2-${index}`} className="text-xl font-bold mt-5 mb-3 text-gray-900 font-serif">{trimLine.substring(3)}</h2>);
        return;
    }
    if (trimLine.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={`h3-${index}`} className="text-lg font-bold mt-4 mb-2 text-gray-800 font-serif">{trimLine.substring(4)}</h3>);
        return;
    }
    
    // Unordered List
    if (trimLine.startsWith('- ') || trimLine.startsWith('• ')) {
      if (currentList && currentList.type !== 'ul') flushList();
      if (!currentList) currentList = { type: 'ul', items: [] };
      currentList.items.push(trimLine.replace(/^[-•]\s+/, ''));
      return;
    }
    
    // Ordered List
    const orderedMatch = trimLine.match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      if (currentList && currentList.type !== 'ol') flushList();
      if (!currentList) currentList = { type: 'ol', items: [] };
      currentList.items.push(orderedMatch[2]);
      return;
    }

    // Not a list item
    flushList();

    if (trimLine === '') {
        // Elements typically have mb-4, so empty lines might just add spacing or be ignored
        return; 
    }

    // Paragraph
    elements.push(
      <p key={`p-${index}`} className="mb-4 text-gray-800 leading-relaxed min-h-[1.2em]">
        <InlineParser text={line} />
      </p>
    );
  });

  flushList(); // Final flush

  return <div className="text-sm font-serif">{elements}</div>;
};

const InlineParser = ({ text }: { text: string }) => {
  // Regex to split by special tokens:
  // **bold**, *italic*, __underline__, [link](url), {{variable}}
  const parts = text.split(/(\*\*.*?\*\*|__.*?__|\[.*?\]\(.*?\)|{{.*?}}|\*.*?\*)/g);
  
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('__') && part.endsWith('__') && part.length >= 4) {
          return <u key={i} className="underline decoration-gray-400 underline-offset-2">{part.slice(2, -2)}</u>;
        }
        if (part.startsWith('{{') && part.endsWith('}}')) {
          return <span key={i} className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded border border-indigo-100 font-mono text-xs mx-0.5">{part}</span>;
        }
        if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
          const match = part.match(/\[(.*?)\]\((.*?)\)/);
          if (match) {
            return <a key={i} href={match[2]} className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>{match[1]}</a>;
          }
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
          return <em key={i} className="italic text-gray-800">{part.slice(1, -1)}</em>;
        }
        return part;
      })}
    </>
  );
};
