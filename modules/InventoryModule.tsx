
import React from 'react';
import { ArchiveIcon } from '../components/icons/ArchiveIcon';

export const InventoryModule: React.FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center py-16 bg-white rounded-lg shadow-md border border-gray-200">
        <ArchiveIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h1 className="mt-4 text-xl font-bold text-gray-800">Module Nhập - Xuất hàng</h1>
        <p className="mt-2 text-gray-600">Xin lỗi, bạn không có quyền truy cập</p>
      </div>
    </div>
  );
};
