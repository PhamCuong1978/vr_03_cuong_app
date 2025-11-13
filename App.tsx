
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import BusinessPlanModule from './modules/BusinessPlanModule';
import { CashFlowModule } from './modules/CashFlowModule';
import { InventoryModule } from './modules/InventoryModule';
import { SalesTeamModule } from './modules/SalesTeamModule';
import { Header } from './components/Header';
import { MeetingMinutesModule } from './modules/MeetingMinutesModule';
import { SavedPlansModule } from './modules/SavedPlansModule';
import type { SavedPlan } from './types';

export type ModuleType = 'businessPlan' | 'savedPlans' | 'cashFlow' | 'inventory' | 'salesTeam' | 'meetingMinutes';

const moduleTitles: { [key in ModuleType]: string } = {
  businessPlan: 'Kế hoạch Kinh doanh',
  savedPlans: 'Kế hoạch đã lưu',
  cashFlow: 'Thu - Chi tiền',
  inventory: 'Nhập xuất hàng',
  salesTeam: 'Đội KD & Marketing',
  meetingMinutes: 'Biên bản họp',
};

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>('businessPlan');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(min-width: 768px)').matches;
    }
    return true;
  });
  const [planToLoad, setPlanToLoad] = useState<SavedPlan | null>(null);

  const handleLoadPlan = (plan: SavedPlan) => {
    setPlanToLoad(plan);
    setActiveModule('businessPlan');
  };

  const onPlanLoaded = () => {
    setPlanToLoad(null);
  };


  const renderActiveModule = () => {
    switch (activeModule) {
      case 'businessPlan':
        return <BusinessPlanModule planToLoad={planToLoad} onPlanLoaded={onPlanLoaded} />;
      case 'savedPlans':
        return <SavedPlansModule onLoadPlan={handleLoadPlan} />;
      case 'cashFlow':
        return <CashFlowModule />;
      case 'inventory':
        return <InventoryModule />;
      case 'salesTeam':
        return <SalesTeamModule />;
      case 'meetingMinutes':
        return <MeetingMinutesModule />;
      default:
        return <BusinessPlanModule planToLoad={null} onPlanLoaded={() => {}} />;
    }
  };

  return (
    <div className="h-screen bg-gray-100 text-gray-800 font-sans relative">
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        isOpen={isSidebarOpen}
      />
      <div className={`h-full flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Header
          title={moduleTitles[activeModule]}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
};

export default App;