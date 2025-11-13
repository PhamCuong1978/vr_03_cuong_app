import React, { useState } from 'react';
import type { PlanItem, SavedPlan, SavedPlanSettings } from '../types';
import { generateHtmlReport } from '../utils/reportGenerator';
import { DocumentDownloadIcon } from './icons/DocumentDownloadIcon';
import { EyeIcon } from './icons/EyeIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { GoogleGenAI } from "@google/genai";
import { formatCurrency } from '../utils/formatters';
import { PencilIcon } from './icons/PencilIcon';
import { SaveIcon } from './icons/SaveIcon';
import { XIcon } from './icons/XIcon';
import { UploadIcon } from './icons/UploadIcon';

interface ReportGeneratorProps {
  items: PlanItem[];
  uncalculatedItems: PlanItem[];
  settings: SavedPlanSettings;
  onOpenAiAssistant: () => void;
}

const calculateTotalsForAI = (items: PlanItem[]) => {
  return items.reduce(
    (acc, item) => {
      acc.totalRevenue += item.calculated.totalRevenue || 0;
      acc.grossProfit += item.calculated.grossProfit || 0;
      acc.profitBeforeTax += item.calculated.profitBeforeTax || 0;
      acc.netProfit += item.calculated.netProfit || 0;
      acc.totalSellingCost += item.calculated.totalSellingCost || 0;
      acc.totalGaCost += item.calculated.totalGaCost || 0;
      acc.totalCOGS += item.calculated.totalCOGS || 0;
      acc.totalFinancialCost += item.calculated.totalFinancialCost || 0;
      return acc;
    },
    {
      totalRevenue: 0,
      grossProfit: 0,
      profitBeforeTax: 0,
      netProfit: 0,
      totalSellingCost: 0,
      totalGaCost: 0,
      totalCOGS: 0,
      totalFinancialCost: 0,
    }
  );
};


export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ items, uncalculatedItems, settings, onOpenAiAssistant }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [planNameToSave, setPlanNameToSave] = useState('');
  
  const generateReportBlob = (analysisHtml?: string): Blob | null => {
    if (items.length === 0) {
      if (!isGenerating) { // Avoid duplicate alerts
        alert("Vui lòng thêm ít nhất một sản phẩm vào kế hoạch để tạo báo cáo.");
      }
      return null;
    }
    const reportHtml = generateHtmlReport(items, settings.exchangeRateImport, settings.exchangeRateTax, analysisHtml);
    return new Blob([reportHtml], { type: 'text/html' });
  };

  const handlePreview = () => {
    const blob = generateReportBlob();
    if (blob) {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      // The URL is intentionally not revoked so the new tab can use it.
    }
  };
  
  const handleDownload = () => {
    if (items.length === 0 || isGenerating) return;

    setIsGenerating(true);
    setShowProgress(true);
    setProgress(0);
    setStatusText('Đang chuẩn bị file...');

    setTimeout(() => {
        const blob = generateReportBlob();
        if (blob) {
            setProgress(100);
            setStatusText('Hoàn tất! Đang tải xuống...');
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'KeHoachKinhDoanh.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setTimeout(() => {
                setShowProgress(false);
                setIsGenerating(false);
            }, 2000);
        } else {
            setShowProgress(false);
            setIsGenerating(false);
        }
    }, 300);
  };
  
  const handleOpenSaveModal = () => {
    if (items.length === 0) {
        alert("Vui lòng thêm ít nhất một sản phẩm vào kế hoạch để lưu.");
        return;
    }
    setIsSaveModalOpen(true);
  };
  
  const handleSavePlan = () => {
      if (!planNameToSave.trim()) {
          alert("Vui lòng nhập tên cho kế hoạch.");
          return;
      }

      try {
          const newPlan: SavedPlan = {
              id: `plan-${Date.now()}`,
              name: planNameToSave.trim(),
              createdAt: new Date().toISOString(),
              planItems: uncalculatedItems,
              settings: settings,
          };

          const existingPlansJson = localStorage.getItem('savedBusinessPlans');
          const existingPlans: SavedPlan[] = existingPlansJson ? JSON.parse(existingPlansJson) : [];
          
          existingPlans.push(newPlan);

          localStorage.setItem('savedBusinessPlans', JSON.stringify(existingPlans));
          
          alert(`Đã lưu thành công kế hoạch "${newPlan.name}"!`);
          setPlanNameToSave('');
          setIsSaveModalOpen(false);

      } catch (error) {
          console.error("Failed to save plan:", error);
          alert("Đã có lỗi xảy ra khi lưu kế hoạch. Vui lòng thử lại.");
      }
  };

  const handleGenerateWithAI = async () => {
    if (items.length === 0) {
      alert("Vui lòng thêm ít nhất một sản phẩm vào kế hoạch để tạo phân tích.");
      return;
    }
    setIsGenerating(true);
    setShowProgress(true);
    setProgress(10);
    setStatusText('Bắt đầu quá trình...');

    try {
        const totals = calculateTotalsForAI(items);
        const netRevenue = totals.totalRevenue;
        
        const grossProfitMargin = netRevenue > 0 ? (totals.grossProfit / netRevenue * 100).toFixed(2) : '0';
        const netProfitMargin = netRevenue > 0 ? (totals.netProfit / netRevenue * 100).toFixed(2) : '0';
        
        setProgress(30);
        setStatusText('Đang chuẩn bị dữ liệu cho AI...');

        const prompt = `
          **Bối cảnh:**
          Đóng vai một AI chuyên ngành phân tích tài chính doanh nghiệp với nhiều năm kinh nghiệm trong lĩnh vực định giá và đánh giá hiệu quả hoạt động kinh doanh.
          
          **Nhiệm vụ:**
          Dựa vào dữ liệu tóm tắt từ một kế hoạch kinh doanh dưới đây, hãy đọc và phân tích báo cáo kết quả kinh doanh. Hãy trình bày một bản phân tích chuyên sâu, logic, và có luận cứ rõ ràng.

          **Dữ liệu kế hoạch kinh doanh:**
          - **Tổng Doanh thu thuần:** ${formatCurrency(netRevenue)} VND
          - **Tổng Giá vốn hàng bán (COGS):** ${formatCurrency(totals.totalCOGS)} VND
          - **Tổng Lợi nhuận gộp:** ${formatCurrency(totals.grossProfit)} VND
          - **Tổng Chi phí hoạt động (Bán hàng + QLDN):** ${formatCurrency(totals.totalSellingCost + totals.totalGaCost)} VND
          - **Tổng Chi phí tài chính:** ${formatCurrency(totals.totalFinancialCost)} VND
          - **Tổng Lợi nhuận trước thuế:** ${formatCurrency(totals.profitBeforeTax)} VND
          - **Tổng Lợi nhuận ròng (sau thuế):** ${formatCurrency(totals.netProfit)} VND

          **Các chỉ số hiệu suất chính:**
          - **Tỷ suất lợi nhuận gộp:** ${grossProfitMargin}%
          - **Tỷ suất lợi nhuận ròng:** ${netProfitMargin}%
          - **Cơ cấu chi phí trên doanh thu:**
            - Tỷ lệ Giá vốn: ${(netRevenue > 0 ? totals.totalCOGS / netRevenue * 100 : 0).toFixed(2)}%
            - Tỷ lệ Chi phí hoạt động: ${(netRevenue > 0 ? (totals.totalSellingCost + totals.totalGaCost) / netRevenue * 100 : 0).toFixed(2)}%
          - **Số lượng sản phẩm trong kế hoạch:** ${items.length}

          **Lưu ý cực kỳ quan trọng về dữ liệu:**
          Báo cáo này CHỈ cung cấp dữ liệu từ Báo cáo kết quả hoạt động kinh doanh (P&L). Hoàn toàn KHÔNG có dữ liệu từ Bảng cân đối kế toán (Tài sản, Nợ, Vốn chủ sở hữu) hoặc Báo cáo lưu chuyển tiền tệ. Do đó, khi được yêu cầu phân tích các chỉ số như ROE, ROA, P/E, hệ số nợ, khả năng thanh toán, vòng quay vốn, vòng quay hàng tồn kho, bạn PHẢI nêu rõ là không có đủ dữ liệu và phải đưa ra các giả định hợp lý để ước tính và phân tích một cách định tính. Ví dụ: "Giả sử tổng tài sản là X và vốn chủ sở hữu là Y...". Ghi chú rõ ràng về các giả định này.

          **Yêu cầu cấu trúc và nội dung phân tích:**
          Bản phân tích cần có các mục sau:
          1.  **Phân tích tổng quan:** Tóm tắt ngắn gọn về doanh nghiệp (ngành thương mại nhập khẩu thực phẩm đông lạnh), lĩnh vực hoạt động và quy mô dựa trên doanh thu.
          2.  **Đánh giá kết quả kinh doanh:**
              - Phân tích doanh thu, lợi nhuận gộp, lợi nhuận thuần, chi phí hoạt động và các biên lợi nhuận.
              - So sánh (ước tính) kết quả hiện tại với các doanh nghiệp cùng ngành thương mại nhập khẩu bán hàng thực phẩm đông lạnh tại Việt Nam.
          3.  **Phân tích điểm hòa vốn (Break-even Point):**
              - Ước tính điểm hòa vốn bằng cách phân loại chi phí (giá vốn, chi phí bán hàng...) thành biến phí và định phí. Nêu rõ giả định phân loại của bạn.
              - Đánh giá mối quan hệ giữa điểm hòa vốn và cấu trúc chi phí của doanh nghiệp.
              - Nhận xét về mức độ an toàn tài chính và năng lực sinh lợi.
          4.  **Phân tích các chỉ số tài chính chính (Dựa trên giả định):**
              - ROE, ROA, EPS, P/E, hệ số nợ/vốn, khả năng thanh toán.
              - Vòng quay của vốn, vòng quay của hàng tồn kho (dựa trên giả định về thời gian, ví dụ: kế hoạch này cho 1 tháng hay 1 quý).
              - Tính toán thời gian 1 năm quay được mấy vòng và hiệu quả tỷ lệ % lợi nhuận.
          5.  **Nhận định và dự báo:**
              - Đánh giá xu hướng tài chính, các rủi ro và cơ hội tiềm năng của ngành hàng này.
          6.  **Kết luận:** Tóm tắt sức khỏe tài chính tổng thể và triển vọng tương lai của doanh nghiệp dựa trên kế hoạch này.

          **Yêu cầu trình bày:**
          - Trả về dưới dạng HTML. Chỉ sử dụng các thẻ sau: \`<h3>\` cho tiêu đề mục, \`<p>\` cho đoạn văn, \`<ul>\`, \`<li>\` cho danh sách, \`<strong>\` để nhấn mạnh, và \`<table>\`, \`<thead>\`, \`<tbody>\`, \`<tr>\`, \`<th>\`, \`<td>\` cho bảng. Không bao gồm thẻ \`<html>\`, \`<body>\` hay \`<head>\`.
          - Ngôn ngữ chuyên nghiệp, rõ ràng, súc tích và mang phong cách học thuật.
        `;

        setProgress(50);
        setStatusText('Đang gửi yêu cầu đến AI...');

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const analysisHtml = response.text;

        setProgress(85);
        setStatusText('AI đã phân tích xong, đang tạo file báo cáo...');

        const blob = generateReportBlob(analysisHtml);
        if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'KeHoachKinhDoanh_CoPhanTich.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        
        setProgress(100);
        setStatusText('Hoàn tất! Báo cáo đã được tải xuống.');
        setTimeout(() => {
          setShowProgress(false);
          setIsGenerating(false);
        }, 3000);

    } catch (error) {
        console.error("Error generating AI analysis:", error);
        setProgress(100);
        setStatusText('Đã có lỗi xảy ra! Vui lòng thử lại.');
        setTimeout(() => {
          setShowProgress(false);
          setIsGenerating(false);
        }, 4000);
    }
  };

  return (
    <>
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4 flex items-center">
                <DocumentDownloadIcon className="h-5 w-5 mr-2 text-gray-500" />
                Báo cáo & Phân tích
            </h3>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                  Lưu, tạo báo cáo tổng hợp, chi tiết và phân tích kế hoạch kinh doanh bằng AI.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                  Chọn một trong các tùy chọn dưới đây để xem trước hoặc tải về.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                    onClick={handlePreview}
                    disabled={items.length === 0 || isGenerating}
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                    <EyeIcon className="h-5 w-5 mr-2" />
                    Xem trước
                </button>
                 <button
                    onClick={onOpenAiAssistant}
                    disabled={items.length === 0 || isGenerating}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Yêu cầu chỉnh sửa
                </button>
                 <button
                    onClick={handleOpenSaveModal}
                    disabled={items.length === 0 || isGenerating}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    <SaveIcon className="h-5 w-5 mr-2" />
                    Lưu Kế hoạch
                </button>
                <button
                    onClick={handleDownload}
                    disabled={items.length === 0 || isGenerating}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    <DocumentDownloadIcon className="h-5 w-5 mr-2" />
                    Tải Về
                </button>
                <div className="hidden sm:block"></div>
                <button
                    onClick={handleGenerateWithAI}
                    disabled={items.length === 0 || isGenerating}
                    className="col-span-2 sm:col-span-3 w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    {isGenerating ? 'Đang xử lý...' : 'Tải về & Phân tích (AI)'}
                </button>
            </div>
            {showProgress && (
              <div className="mt-4">
                <p className="text-sm text-center text-gray-600 mb-2">{statusText}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
        </div>
        {isSaveModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setIsSaveModalOpen(false)}>
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Lưu Kế hoạch Kinh doanh</h2>
                    <button onClick={() => setIsSaveModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </header>
                <main className="p-6 space-y-4">
                    <label htmlFor="plan-name" className="block text-sm font-medium text-gray-700">
                      Đặt tên cho kế hoạch của bạn để dễ dàng nhận biết sau này.
                    </label>
                    <input
                      id="plan-name"
                      type="text"
                      value={planNameToSave}
                      onChange={(e) => setPlanNameToSave(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSavePlan()}
                      placeholder="Ví dụ: Phương án kinh doanh tháng 10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      autoFocus
                    />
                </main>
                 <footer className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg space-x-2">
                    <button
                        onClick={() => setIsSaveModalOpen(false)}
                        className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSavePlan}
                        className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Lưu
                    </button>
                </footer>
              </div>
            </div>
        )}
    </>
  );
};