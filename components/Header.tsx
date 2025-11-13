
import React from 'react';
import { MenuIcon } from './icons/MenuIcon';

interface HeaderProps {
  title: string;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, toggleSidebar }) => {

  return (
    <header className="bg-white shadow-sm flex-shrink-0">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center">
        <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 focus:outline-none mr-4">
          <MenuIcon className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
    </header>
  );
};
