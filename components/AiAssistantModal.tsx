

import React, { useState, useEffect, useRef } from 'react';
// Fix: Replaced deprecated 'FunctionCallPart' with 'FunctionCall' from '@google/genai'.
import { GoogleGenAI, Type, FunctionDeclaration, FunctionCall, Chat } from "@google/genai";
import type { PlanItem, Product, AddProductDetails } from '../types';
import { XIcon } from './icons/XIcon';
import { SendIcon } from './icons/SendIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[]; // Master product list
  planItems: PlanItem[];
  updatePlanItem: (id: string, field: string, value: number) => void;
  removePlanItem: (id: string) => void;
  addProductToPlan: (details: AddProductDetails) => void;
  setters: {
    [key: string]: (value: number) => void;
  }
}

interface Message {
  id: number;
  sender: 'user' | 'ai' | 'system';
  text: string;
}

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = false;
  recognition.lang = 'vi-VN';
  recognition.interimResults = false;
}

const propertyMap: { [key: string]: string } = {
  "so_luong_kg": "quantityInKg", "gia_mua_usd": "priceUSDPerTon", "gia_ban_vnd": "sellingPriceVNDPerKg",
  "phi_hai_quan": "costs.customsFee", "phi_kiem_dich": "costs.quarantineFee", "phi_thue_cont": "costs.containerRentalFee",
  "phi_luu_kho_cang": "costs.portStorageFee", "don_gia_nhap_kho": "costs.generalWarehouseCostRatePerKg",
  "lai_suat_vay": "costs.loanInterestRatePerYear", "tien_vay_lan_1_usd": "costs.loanFirstTransferUSD",
  "ngay_lai_lan_1": "costs.loanFirstTransferInterestDays", "so_ngay_luu_kho": "costs.postClearanceStorageDays",
  "don_gia_luu_kho": "costs.postClearanceStorageRatePerKgDay", "thue_suat_vat": "costs.importVatRate",
  "phi_dich_vu_mua_hang": "costs.purchasingServiceFeeInMillionsPerCont", "phi_vc_den_kho_mua": "costs.buyerDeliveryFee",
  "chi_phi_quoc_te_khac": "costs.otherInternationalCosts", "chi_phi_ban_hang_khac": "costs.otherSellingCosts",
};

const settingMap: { [key: string]: string } = {
  "ty_gia_nhap_khau": "setExchangeRateImport", "ty_gia_thue": "setExchangeRateTax", "ty_le_luong_ban_hang": "setSalesSalaryRate",
  "tong_luong_gian_tiep": "setTotalMonthlyIndirectSalary", "so_ngay_lam_viec": "setWorkingDaysPerMonth",
  "chi_phi_thue_nha": "setTotalMonthlyRent", "chi_phi_dien": "setTotalMonthlyElectricity", "chi_phi_nuoc": "setTotalMonthlyWater",
  "chi_phi_vpp": "setTotalMonthlyStationery", "chi_phi_khau_hao": "setTotalMonthlyDepreciation",
  "chi_phi_dich_vu_ngoai": "setTotalMonthlyExternalServices", "chi_phi_tien_mat_khac": "setTotalMonthlyOtherCashExpenses",
  "chi_phi_tai_chinh": "setTotalMonthlyFinancialCost",
};

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen, onClose, products, planItems, updatePlanItem, removePlanItem, addProductToPlan, setters
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    if (isOpen) {
      chatRef.current = null; // Reset chat session when modal opens
      setMessages([{ id: Date.now(), sender: 'ai', text: 'Em chào Anh Cường ạ, em có thể giúp anh điều chỉnh kế hoạch kinh doanh như thế nào ạ?' }]);
    }
  }, [isOpen]);

  useEffect(() => {
    // Reset the chat session if the underlying plan data changes,
    // so the AI gets a fresh context on the next message.
    if (chatRef.current) {
        chatRef.current = null;
    }
  }, [planItems]);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    if (!recognition) return;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
          setMicError('Không nghe rõ. Vui lòng thử lại...');
          setTimeout(() => setMicError(''), 3000);
      } else if (event.error === 'not-allowed') {
          alert('Bạn đã từ chối quyền truy cập micro. Vui lòng cho phép truy cập micro trong cài đặt trình duyệt để sử dụng tính năng này.');
      } else {
          alert(`Đã xảy ra lỗi khi nhận dạng giọng nói: ${event.error}. Vui lòng thử lại.`);
      }
      setIsListening(false);
    };
  }, []);

  const handleVoiceInput = () => {
    if (!recognition) {
        alert('Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.');
        return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const findProductInPlan = (name: string): PlanItem | null => {
    const searchTerm = name.toLowerCase().trim();
    // Prioritize matches that are more specific
    const itemsWithCombinedName = planItems.map(p => ({
        ...p,
        combinedName: `${p.group.toLowerCase()} - ${p.nameVI.toLowerCase()}`.trim()
    }));

    // Exact match on combined name
    const exactCombined = itemsWithCombinedName.find(p => p.combinedName === searchTerm);
    if (exactCombined) return exactCombined;

    // Exact match on just VI name
    const exactVI = planItems.find(p => p.nameVI.toLowerCase().trim() === searchTerm);
    if (exactVI) return exactVI;

    // Partial match on combined name
    const partialCombined = itemsWithCombinedName.find(p => p.combinedName.includes(searchTerm));
    if (partialCombined) return partialCombined;
    
    // Partial match on just VI name
    const partialVI = planItems.find(p => p.nameVI.toLowerCase().trim().includes(searchTerm));
    return partialVI || null;
  };
  
  const findMasterProduct = (name: string): Product | null => {
    const searchTerm = name.toLowerCase().trim();
     const productsWithCombinedName = products.map(p => ({
        ...p,
        combinedName: `${p.group.toLowerCase()} - ${p.nameVI.toLowerCase()}`.trim()
    }));

    // Exact match on combined name
    const exactCombined = productsWithCombinedName.find(p => p.combinedName === searchTerm);
    if (exactCombined) return exactCombined;

    // Exact match on just VI name
    const exactVI = products.find(p => p.nameVI.toLowerCase().trim() === searchTerm);
    if (exactVI) return exactVI;
    
    // Partial match on combined name
    const partialCombined = productsWithCombinedName.find(p => p.combinedName.includes(searchTerm));
    if (partialCombined) return partialCombined;

    // Partial match on just VI name
    const partialVI = products.find(p => p.nameVI.toLowerCase().trim().includes(searchTerm));
    return partialVI || null;
  };

  // Fix: Replaced deprecated 'FunctionCallPart' with 'FunctionCall' from '@google/genai'.
  const executeFunctionCalls = (calls: FunctionCall[]) => {
    let systemMessages: string[] = [];

    for (const fc of calls) {
        let resultMessage = '';
        switch (fc.name) {
            case 'update_product_property': {
              // Fix: Cast function call arguments to their expected types to resolve type errors.
              const { product_name, property_name, new_value } = fc.args as { product_name: string; property_name: string; new_value: number };
              const productToUpdate = findProductInPlan(product_name);
              const fieldToUpdate = propertyMap[property_name];
              if (productToUpdate && fieldToUpdate) {
                const val = property_name === 'phi_dich_vu_mua_hang' ? new_value / 1000000 : new_value;
                updatePlanItem(productToUpdate.id, fieldToUpdate, val);
                resultMessage = `Đã cập nhật '${property_name}' của sản phẩm '${product_name}' thành '${new_value}'.`;
              } else {
                resultMessage = `Lỗi: Không tìm thấy sản phẩm '${product_name}' trong kế hoạch hoặc thuộc tính '${property_name}' không hợp lệ.`;
              }
              break;
            }
            case 'bulk_update_products': {
              // Fix: Cast function call arguments to their expected types to resolve type errors.
              const { filter_property, filter_value, target_property, update_type, update_value } = fc.args as { filter_property: string; filter_value: string; target_property: string; update_type: string; update_value: number };
              const targetField = propertyMap[target_property];
              if (!targetField) {
                  resultMessage = `Lỗi: Thuộc tính '${target_property}' không hợp lệ.`;
                  break;
              }

              let affectedItems = planItems.filter(item => {
                  if (filter_property === 'all') return true;
                  if (filter_property === 'brand') return item.brand.toLowerCase() === filter_value.toLowerCase();
                  if (filter_property === 'group') return item.group.toLowerCase() === filter_value.toLowerCase();
                  return false;
              });

              if (affectedItems.length === 0) {
                  resultMessage = `Không tìm thấy sản phẩm nào khớp với điều kiện: ${filter_property} = '${filter_value}'.`;
                  break;
              }

              affectedItems.forEach(item => {
                  const path = targetField.split('.');
                  let currentValueHolder: any = item.userInput;
                  for (let i = 0; i < path.length - 1; i++) {
                      currentValueHolder = currentValueHolder[path[i]];
                  }
                  let currentValue = currentValueHolder[path[path.length - 1]];
                  
                  if (target_property === 'phi_dich_vu_mua_hang') {
                      currentValue *= 1000000;
                  }

                  let newValue = 0;
                  switch (update_type) {
                      case 'percentage_increase': newValue = currentValue * (1 + update_value / 100); break;
                      case 'percentage_decrease': newValue = currentValue * (1 - update_value / 100); break;
                      case 'absolute_increase': newValue = currentValue + update_value; break;
                      case 'absolute_decrease': newValue = currentValue - update_value; break;
                      case 'set_value': newValue = update_value; break;
                      default: newValue = currentValue;
                  }
                  
                  const valToUpdate = target_property === 'phi_dich_vu_mua_hang' ? newValue / 1000000 : newValue;
                  updatePlanItem(item.id, targetField, valToUpdate);
              });
              resultMessage = `Đã cập nhật '${target_property}' cho ${affectedItems.length} sản phẩm.`;
              break;
            }
            case 'add_product_to_plan': {
              // Fix: Cast function call arguments to their expected types to resolve type errors.
              const { product_name: productNameToAdd, quantity_kg, price_usd_per_ton, selling_price_vnd_per_kg } = fc.args as { product_name: string; quantity_kg: number; price_usd_per_ton?: number; selling_price_vnd_per_kg?: number };
              const masterProduct = findMasterProduct(productNameToAdd);
              if (masterProduct) {
                  addProductToPlan({
                      productCode: masterProduct.code,
                      quantityInKg: quantity_kg,
                      priceUSDPerTon: price_usd_per_ton ?? masterProduct.defaultPriceUSDPerTon,
                      sellingPriceVNDPerKg: selling_price_vnd_per_kg ?? masterProduct.defaultSellingPriceVND,
                  });
                  resultMessage = `Đã thêm sản phẩm '${productNameToAdd}' vào kế hoạch.`;
              } else {
                  resultMessage = `Lỗi: Không tìm thấy sản phẩm '${productNameToAdd}' trong danh mục sản phẩm.`;
              }
              break;
            }
            case 'update_general_setting': {
              // Fix: Cast function call arguments to their expected types to resolve type errors.
              const { setting_name, new_value: setting_value } = fc.args as { setting_name: string; new_value: number };
              const setterName = settingMap[setting_name];
              if (setterName && setters[setterName]) {
                setters[setterName](setting_value);
                resultMessage = `Đã cập nhật cài đặt '${setting_name}' thành '${setting_value}'.`;
              } else {
                resultMessage = `Lỗi: Không tìm thấy cài đặt '${setting_name}'.`;
              }
              break;
            }
            case 'remove_product_from_plan': {
                // Fix: Cast function call arguments to their expected types to resolve type errors.
                const { product_name: product_to_remove_name } = fc.args as { product_name: string };
                const productToRemove = findProductInPlan(product_to_remove_name);
                if(productToRemove) {
                    removePlanItem(productToRemove.id);
                    resultMessage = `Đã xóa sản phẩm '${product_to_remove_name}' khỏi kế hoạch.`;
                } else {
                    resultMessage = `Lỗi: Không tìm thấy sản phẩm '${product_to_remove_name}' trong kế hoạch để xóa.`;
                }
                break;
            }
        }
        if (resultMessage) {
            systemMessages.push(resultMessage);
        }
    }

    if (systemMessages.length > 0) {
        setMessages(prev => [...prev, { id: Date.now() + Math.random(), sender: 'system', text: systemMessages.join('\n') }]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const tools: FunctionDeclaration[] = [
          {
            name: 'update_product_property',
            description: 'Cập nhật một thuộc tính của MỘT sản phẩm cụ thể trong kế hoạch.',
            parameters: {
              type: Type.OBJECT, properties: {
                product_name: { type: Type.STRING, description: 'Tên tiếng Việt của sản phẩm, bao gồm cả nhóm hàng. Ví dụ: "Thịt trâu - Thăn ngoại".' },
                property_name: { type: Type.STRING, description: `Tên thuộc tính cần thay đổi. Giá trị hợp lệ: ${Object.keys(propertyMap).join(', ')}.` },
                new_value: { type: Type.NUMBER, description: 'Giá trị số mới.' },
              }, required: ['product_name', 'property_name', 'new_value'],
            },
          },
          {
            name: 'bulk_update_products',
            description: 'Cập nhật hàng loạt một thuộc tính cho nhiều sản phẩm dựa trên một điều kiện lọc.',
            parameters: {
              type: Type.OBJECT, properties: {
                filter_property: { type: Type.STRING, description: "Tiêu chí lọc sản phẩm. Dùng 'brand' để lọc theo thương hiệu, 'group' để lọc theo nhóm (ví dụ: 'Thịt trâu'), 'all' để áp dụng cho tất cả sản phẩm." },
                filter_value: { type: Type.STRING, description: "Giá trị để lọc. Ví dụ: 'Alana' nếu filter_property là 'brand'." },
                target_property: { type: Type.STRING, description: `Tên thuộc tính cần thay đổi. Giá trị hợp lệ: ${Object.keys(propertyMap).join(', ')}.` },
                update_type: { type: Type.STRING, description: "Loại cập nhật: 'percentage_increase' (tăng phần trăm), 'percentage_decrease' (giảm phần trăm), 'absolute_increase' (tăng giá trị tuyệt đối), 'absolute_decrease' (giảm giá trị tuyệt đối), 'set_value' (đặt giá trị mới)." },
                update_value: { type: Type.NUMBER, description: 'Giá trị cho việc cập nhật (ví dụ: 10 cho 10%, 5000 cho 5000 VND).' },
              }, required: ['filter_property', 'target_property', 'update_type', 'update_value'],
            },
          },
          {
            name: 'add_product_to_plan',
            description: 'Thêm một sản phẩm mới từ danh mục vào kế hoạch kinh doanh.',
            parameters: {
              type: Type.OBJECT, properties: {
                product_name: { type: Type.STRING, description: 'Tên tiếng Việt chính xác của sản phẩm cần thêm, bao gồm cả nhóm hàng.' },
                quantity_kg: { type: Type.NUMBER, description: 'Số lượng tính bằng kg.' },
                price_usd_per_ton: { type: Type.NUMBER, description: 'Giá mua USD/tấn. Nếu không cung cấp, sẽ dùng giá mặc định.' },
                selling_price_vnd_per_kg: { type: Type.NUMBER, description: 'Giá bán VND/kg. Nếu không cung cấp, sẽ dùng giá mặc định.' },
              }, required: ['product_name', 'quantity_kg'],
            },
          },
          {
            name: 'update_general_setting',
            description: 'Cập nhật một cài đặt chung của toàn bộ kế hoạch.',
            parameters: {
              type: Type.OBJECT, properties: {
                setting_name: { type: Type.STRING, description: `Tên cài đặt cần thay đổi. Giá trị hợp lệ: ${Object.keys(settingMap).join(', ')}.` },
                new_value: { type: Type.NUMBER, description: 'Giá trị số mới.' },
              }, required: ['setting_name', 'new_value'],
            },
          },
          {
            name: 'remove_product_from_plan',
            description: 'Xóa một sản phẩm khỏi kế hoạch kinh doanh.',
            parameters: {
              type: Type.OBJECT, properties: {
                product_name: { type: Type.STRING, description: 'Tên tiếng Việt của sản phẩm cần xóa, bao gồm cả nhóm hàng.' },
              }, required: ['product_name'],
            },
          }
        ];

        const systemInstruction = `You are a helpful AI assistant for a business planning application. The user is creating a business plan for importing and selling frozen food products in Vietnam.
- The user will give instructions in Vietnamese. You must respond in Vietnamese.
- Your primary goal is to help the user modify their business plan using the provided tools.
- If the user's request is ambiguous (e.g., "update the price for Alana"), you MUST ask for clarification (e.g., "Which Alana product do you mean? And do you want to update the purchase price or selling price?").
- Be concise and helpful. 
- **Current Plan Context:**
  - Products currently in the plan (Tên sản phẩm): ${planItems.length > 0 ? planItems.map(p => `'${p.group} - ${p.nameVI}' (thương hiệu ${p.brand}, mã ${p.code})`).join(', ') : 'Chưa có sản phẩm nào'}.
- **Available Products for Adding:**
  - You can add products from this master list: ${products.map(p => `'${p.group} - ${p.nameVI}' (thương hiệu ${p.brand}, mã ${p.code})`).join(', ')}.
- **Function Calling Rules:**
  - ALWAYS use the exact Vietnamese product name with its group (e.g., 'Thịt trâu - Thăn ngoại') as found in the context when calling functions. Do not guess or abbreviate.`;

        chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            tools: [{ functionDeclarations: tools }],
            systemInstruction: systemInstruction,
          },
        });
      }

      const response = await chatRef.current.sendMessage({ message: currentInput });

      if (response.functionCalls && response.functionCalls.length > 0) {
        executeFunctionCalls(response.functionCalls);
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: 'Em đã thực hiện xong. Anh Cường cần em giúp gì nữa không ạ?' }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: response.text }]);
      }

    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: 'Xin lỗi, bạn không có quyền truy cập' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Trợ lý AI Tinh chỉnh Kế hoạch</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="h-6 w-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${
                msg.sender === 'user' ? 'bg-blue-500 text-white' : 
                msg.sender === 'ai' ? 'bg-gray-200 text-gray-800' : 
                'bg-yellow-100 text-yellow-800 border border-yellow-200 text-sm italic w-full'
              }`}>
                {msg.text.split('\n').map((line, index) => <p key={index}>{line}</p>)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 p-3 rounded-lg">
                <span className="animate-pulse">AI đang suy nghĩ...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </main>

        <footer className="p-4 border-t bg-white">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={micError || "Nhập yêu cầu của bạn..."}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleVoiceInput}
              disabled={isLoading || !recognition}
              className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'} disabled:bg-gray-100 disabled:text-gray-400`}
              aria-label={isListening ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
            >
              <MicrophoneIcon className="h-6 w-6" />
            </button>
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300"
              aria-label="Gửi"
            >
              <SendIcon className="h-6 w-6" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};