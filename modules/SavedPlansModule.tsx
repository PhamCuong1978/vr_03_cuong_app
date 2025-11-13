import React, { useState, useEffect, useMemo } from 'react';
import type { SavedPlan } from '../types';
import { BookmarkIcon } from '../components/icons/BookmarkIcon';
import { EyeIcon } from '../components/icons/EyeIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { recalculateEntirePlan } from '../utils/calculators';
import { generateHtmlReport } from '../utils/reportGenerator';
import { DuplicateIcon } from '../components/icons/DuplicateIcon';
import { DocumentDownloadIcon } from '../components/icons/DocumentDownloadIcon';

interface SavedPlansModuleProps {
  onLoadPlan: (plan: SavedPlan) => void;
}

export const SavedPlansModule: React.FC<SavedPlansModuleProps> = ({ onLoadPlan }) => {
    const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Load plans from localStorage on component mount
    useEffect(() => {
        try {
            const storedPlans = localStorage.getItem('savedBusinessPlans');
            if (storedPlans) {
                setSavedPlans(JSON.parse(storedPlans));
            }
        } catch (error) {
            console.error("Failed to load saved plans from localStorage:", error);
        }
    }, []);
    
    const filteredPlans = useMemo(() => {
        const sortedPlans = [...savedPlans].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (!searchTerm.trim()) {
            return sortedPlans;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return sortedPlans.filter(plan =>
            plan.name.toLowerCase().includes(lowercasedFilter)
        );
    }, [savedPlans, searchTerm]);


    const handleDeletePlan = (planId: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa kế hoạch này không?")) {
            const updatedPlans = savedPlans.filter(p => p.id !== planId);
            setSavedPlans(updatedPlans);
            try {
                localStorage.setItem('savedBusinessPlans', JSON.stringify(updatedPlans));
            } catch (error) {
                console.error("Failed to update localStorage after deleting a plan:", error);
            }
        }
    };

    const handleDeleteAllPlans = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa TẤT CẢ các kế hoạch đã lưu không? Hành động này không thể hoàn tác.")) {
            setSavedPlans([]);
            try {
                localStorage.setItem('savedBusinessPlans', JSON.stringify([]));
            } catch (error) {
                console.error("Failed to update localStorage after deleting all plans:", error);
            }
        }
    };
    
    const handleViewReport = (plan: SavedPlan) => {
        try {
            const recalculatedItems = recalculateEntirePlan(plan.planItems, {
                importRate: plan.settings.exchangeRateImport,
                taxRate: plan.settings.exchangeRateTax,
                ...plan.settings
            });
            
            const reportHtml = generateHtmlReport(recalculatedItems, plan.settings.exchangeRateImport, plan.settings.exchangeRateTax);
            const blob = new Blob([reportHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch(error) {
            console.error("Error generating report from saved plan:", error);
            alert("Đã có lỗi xảy ra khi tạo báo cáo từ kế hoạch đã lưu.");
        }
    };

    const handleExportPlan = (plan: SavedPlan) => {
        try {
            const fileName = `KeHoach_${plan.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
            const dataStr = JSON.stringify(plan, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.download = fileName;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export plan:", error);
            alert("Đã có lỗi xảy ra khi xuất file kế hoạch.");
        }
    };
    
    const totalProducts = (plan: SavedPlan) => {
        return plan.planItems.length;
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                <div className="border-b pb-4 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <BookmarkIcon className="h-5 w-5 mr-2 text-gray-500" />
                        Danh sách Kế hoạch đã lưu
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Xem lại, so sánh hoặc xóa các phương án kinh doanh bạn đã lưu trước đây.
                    </p>
                    <div className="mt-4 flex justify-between items-center flex-wrap gap-2">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên kế hoạch..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                         <button
                            onClick={handleDeleteAllPlans}
                            disabled={savedPlans.length === 0}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            title="Xóa tất cả kế hoạch"
                        >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Xóa tất cả
                        </button>
                    </div>
                </div>

                {filteredPlans.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Kế hoạch</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày lưu</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Số sản phẩm</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPlans.map(plan => (
                                    <tr key={plan.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(plan.createdAt).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                            {totalProducts(plan)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button 
                                                onClick={() => onLoadPlan(plan)}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                                                title="Sử dụng lại Kế hoạch này"
                                            >
                                                <DuplicateIcon className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleViewReport(plan)}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                                                title="Xem Báo cáo"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleExportPlan(plan)}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                                                title="Tải Kế hoạch (JSON)"
                                            >
                                                <DocumentDownloadIcon className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeletePlan(plan.id)}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                                                title="Xóa Kế hoạch"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <BookmarkIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có kế hoạch nào được lưu</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Quay lại module "Kế hoạch Kinh doanh" để tạo và lưu phương án đầu tiên của bạn.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};