
import React from 'react';
import type { ModuleType } from '../App';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { CashIcon } from './icons/CashIcon';
import { ArchiveIcon } from './icons/ArchiveIcon';
import { UsersIcon } from './icons/UsersIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
  isOpen: boolean;
}

const navItems = [
  { id: 'businessPlan', name: 'Kế hoạch Kinh doanh', icon: BriefcaseIcon, indented: false },
  { id: 'savedPlans', name: 'Kế hoạch đã lưu', icon: BookmarkIcon, indented: true },
  { id: 'cashFlow', name: 'Thu - Chi tiền', icon: CashIcon, indented: false },
  { id: 'inventory', name: 'Nhập xuất hàng', icon: ArchiveIcon, indented: false },
  { id: 'salesTeam', name: 'Đội KD & Marketing', icon: UsersIcon, indented: false },
  { id: 'meetingMinutes', name: 'Biên bản họp', icon: DocumentTextIcon, indented: false },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule, isOpen }) => {
  return (
    <div className={`fixed z-30 h-full flex flex-col w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-center h-16 shadow-md flex-shrink-0">
        <ChartBarIcon className="h-8 w-8 text-indigo-600" />
        <h1 className="text-xl font-bold text-gray-800 ml-2">App Quản trị</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id as ModuleType)}
            className={`w-full flex items-center py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
              item.indented ? 'pl-11 pr-4' : 'px-4'
            } ${
              activeModule === item.id
                ? 'bg-indigo-600 text-white shadow-md'
                : `text-gray-600 hover:bg-gray-100 hover:text-gray-800 ${item.indented ? 'font-normal' : 'font-medium'}`
            }`}
          >
            <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="flex-grow text-left">{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
