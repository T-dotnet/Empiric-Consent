
import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center h-16 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-[#4F46E5] p-1.5 rounded-lg flex items-center justify-center">
            <svg 
              viewBox="0 0 24 24" 
              className="w-5 h-5 text-white" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z" />
            </svg>
          </div>
          <span className="font-sans font-extrabold text-[#111827] text-xl tracking-tight uppercase">Empiric</span>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-200 mx-2"></div>

        {/* Workspace Dropdown */}
        <button className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] transition-colors group">
          <span className="text-sm font-medium">Incept</span>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        </button>
      </div>
    </nav>
  );
};
