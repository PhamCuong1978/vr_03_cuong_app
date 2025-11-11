import type { Product } from '../types';

const BEEF_WEIGHT = 28000; // Includes buffalo
const CHICKEN_WEIGHT = 22000;
const PORK_WEIGHT = 25000;
const SEAFOOD_WEIGHT = 20000;

// Placeholder default prices for newly added products
const DEFAULT_BEEF_PRICE_USD = 4100;
const DEFAULT_BEEF_SELLING_VND = 125000;
const DEFAULT_CHICKEN_PRICE_USD = 1450;
const DEFAULT_CHICKEN_SELLING_VND = 48000;
const DEFAULT_PORK_PRICE_USD = 2500;
const DEFAULT_PORK_SELLING_VND = 80000;
const DEFAULT_SEAFOD_PRICE_USD = 5000;
const DEFAULT_SEAFOD_SELLING_VND = 150000;


// Function to avoid duplicating code when creating new products
const createProduct = (code: string, nameVI: string, brand: string, group: string, nameEN: string = 'N/A'): Product => {
    let defaultWeightKg = BEEF_WEIGHT;
    let defaultPriceUSDPerTon = DEFAULT_BEEF_PRICE_USD;
    let defaultSellingPriceVND = DEFAULT_BEEF_SELLING_VND;

    const lowerCaseGroup = group.toLowerCase();

    if (lowerCaseGroup.includes('gà')) { // chicken
        defaultWeightKg = CHICKEN_WEIGHT;
        defaultPriceUSDPerTon = DEFAULT_CHICKEN_PRICE_USD;
        defaultSellingPriceVND = DEFAULT_CHICKEN_SELLING_VND;
    } else if (lowerCaseGroup.includes('lợn')) { // pork
        defaultWeightKg = PORK_WEIGHT;
        defaultPriceUSDPerTon = DEFAULT_PORK_PRICE_USD;
        defaultSellingPriceVND = DEFAULT_PORK_SELLING_VND;
    } else if (lowerCaseGroup.includes('thủy hải sản')) { // seafood
        defaultWeightKg = SEAFOOD_WEIGHT;
        defaultPriceUSDPerTon = DEFAULT_SEAFOD_PRICE_USD;
        defaultSellingPriceVND = DEFAULT_SEAFOD_SELLING_VND;
    }
    // Default is beef/buffalo

    return {
        code,
        nameEN,
        nameVI,
        brand,
        group,
        defaultWeightKg,
        defaultPriceUSDPerTon,
        defaultSellingPriceVND,
    };
};

export const PRODUCTS: Product[] = [
    // Page 1 - Updated with details from user's example sheet
    { ...createProduct('46-ALANA', 'Thăn ngoại', 'Alana', 'Thịt trâu'), nameEN: 'Striploin C', defaultPriceUSDPerTon: 4675 },
    { ...createProduct('47-BLACKGOLD', 'Bắp rùa đóng xá', 'Black Gold', 'Thịt trâu'), nameEN: 'Kasila IWP', defaultPriceUSDPerTon: 4275 },
    { ...createProduct('25-BLACKGOLD', 'Nạm bụng rời', 'Black Gold', 'Thịt lợn'), nameEN: 'Flank IWP', defaultPriceUSDPerTon: 2625 },
    { ...createProduct('123-AMBER', 'Dẻ sườn đóng rời', 'Amber', 'Thịt trâu'), nameEN: 'Ribmeat', defaultPriceUSDPerTon: 3100 },
    { ...createProduct('64-ALANA', 'Bắp cá lóc', 'Alana', 'Thịt trâu'), nameEN: 'Chuck tender', defaultPriceUSDPerTon: 4675 },
    { ...createProduct('65-ALANA', 'Nạc vai', 'Alana', 'Thịt trâu'), nameEN: 'Blade', defaultPriceUSDPerTon: 4275 },
    { ...createProduct('60A-ALANA', 'Bắp hoa đóng xá', 'Alana', 'Thịt trâu'), nameEN: 'Shin shank IWP', defaultPriceUSDPerTon: 4675 },
    { ...createProduct('M41-ALANA', 'Nạc đùi', 'Alana', 'Thịt trâu'), nameEN: 'Chuck Tender', defaultPriceUSDPerTon: 4450 },
    { ...createProduct('M42-ALANA', 'Đùi ngọ', 'Alana', 'Thịt trâu'), nameEN: 'Blade / Top Blade', defaultPriceUSDPerTon: 4450 },
    { ...createProduct('M44-ALANA', 'Thăn lá cờ', 'Alana', 'Thịt trâu'), nameEN: 'Rib Meat', defaultPriceUSDPerTon: 4450 },
    { ...createProduct('M45-ALANA', 'Nạc mông', 'Alana', 'Thịt trâu'), nameEN: 'Shin/Shank', defaultPriceUSDPerTon: 4450 },
    
    // Original Products (with some codes adjusted to avoid conflicts)
    createProduct('9-ALANA', 'Gân chữ Y', 'Alana', 'Thịt trâu'),
    createProduct('11-ALANA', 'Nạm', 'Alana', 'Thịt trâu'),
    createProduct('19-ALANA', 'Nạm bụng', 'Alana', 'Thịt trâu'),
    createProduct('222-ALANA', 'Vụn', 'Alana', 'Thịt trâu'),
    createProduct('31-ALANA', 'Thăn nội', 'Alana', 'Thịt trâu'),
    createProduct('41-ALANA-OLD', 'Nạc đùi', 'Alana', 'Thịt trâu'),
    createProduct('42-ALANA-OLD', 'Đùi gọ', 'Alana', 'Thịt trâu'),
    createProduct('44-ALANA-OLD', 'Thịt thăn', 'Alana', 'Thịt trâu'),
    createProduct('45-ALANA-OLD', 'Nạc mông', 'Alana', 'Thịt trâu'),
    createProduct('57-ALANA', 'Đuôi', 'Alana', 'Thịt trâu'),
    createProduct('58-ALANA', 'Dẻ sườn', 'Alana', 'Thịt trâu'),
    createProduct('60S-ALANA-OLD', 'Bắp hoa', 'Alana', 'Thịt trâu'),
    createProduct('67-ALANA', 'Đầu thăn ngoại', 'Alana', 'Thịt trâu'),
    createProduct('67-AMBER', 'Diềm thăn', 'Amber', 'Thịt trâu'),
    createProduct('123-BLACKGOLD', 'Dẻ sườn', 'Black Gold', 'Thịt trâu'),
    createProduct('60S-BLACKGOLD', 'Bắp hoa', 'Black Gold', 'Thịt trâu'),
    createProduct('57-BLACKGOLD', 'Đuôi', 'Black Gold', 'Thịt trâu'),
    createProduct('19-BLACKGOLD', 'Nạm', 'Black Gold', 'Thịt trâu'),
    createProduct('19-ALSAMI', 'Nạm', 'Alsami', 'Thịt trâu'),
    createProduct('45-ALSAMI', 'Nạc mông', 'Alsami', 'Thịt trâu'),
    createProduct('13-MINHA', 'Nạm giòn', 'Minha', 'Thịt trâu'),
    createProduct('31-TOURO', 'Thăn nội', 'Touro', 'Thịt trâu'),
    createProduct('60B-TOURO', 'Bắp rùa', 'Touro', 'Thịt trâu'),
    createProduct('09-TOURO', 'Gân', 'Touro', 'Thịt trâu'),
    createProduct('52-TOURO', 'Gân ngắn', 'Touro', 'Thịt trâu'),
    createProduct('42-TOURO', 'Đùi gọ', 'Touro', 'Thịt trâu'),
    createProduct('44-TOURO', 'Thịt thăn lá cờ', 'Touro', 'Thịt trâu'),
    createProduct('45-TOURO', 'Nạc mông', 'Touro', 'Thịt trâu'),
    createProduct('65-TOURO', 'Nạm vai', 'Touro', 'Thịt trâu'),
    createProduct('19-TOURO', 'Nạm bụng', 'Touro', 'Thịt trâu'),
    createProduct('MA-LON-TOURO', 'Má lớn', 'Touro', 'Thịt trâu'),
    createProduct('60S-MKEEN', 'Bắp hoa', 'Mkeen', 'Thịt trâu'),

    // Page 2
    createProduct('19-ALHILAL', 'Nạm bụng', 'AL-HILAL', 'Thịt trâu'),
    createProduct('46-ALHILAL', 'Thăn ngoại', 'AL-HILAL', 'Thịt trâu'),
    createProduct('42-ALHABIBI', 'Đùi gọ', 'AL-HABIBI', 'Thịt trâu'),
    createProduct('41-ALHABIBI', 'Thịt đùi', 'AL-HABIBI', 'Thịt trâu'),
    createProduct('65-ALHABIBI', 'Nạm vai', 'AL-HABIBI', 'Thịt trâu'),
    createProduct('19-ALHABIBI', 'Nạm bụng', 'AL-HABIBI', 'Thịt trâu'),
    createProduct('46-ALHABIBI', 'Thăn ngoại', 'AL-HABIBI', 'Thịt trâu'),
    createProduct('67-ALHABIBI', 'Đầu thăn ngoại', 'AL-HABIBI', 'Thịt trâu'),
    createProduct('44-ALHABIBI', 'Thăn lá cờ', 'AL-HABIBI', 'Thịt trâu'),
    createProduct('45-ALHABIBI', 'Thịt mông', 'AL-HABIBI', 'Thịt trâu'),
    createProduct('11-ALHABIBI', 'Thịt vụn', 'AL-HABIBI', 'Thịt trâu'),
    createProduct('31-ALHABIBI', 'Thăn nội', 'AL-HABIBI', 'Thịt trâu'),
    createProduct('17-ALHABIBI', 'Thịt cổ', 'AL-HABIBI', 'Thịt trâu'),
    createProduct('07-SAHIBA', 'Gân Y cọng to', 'Sahiba', 'Thịt trâu'),
    createProduct('152-SAHIBA', 'Thịt vụn', 'Sahiba', 'Thịt trâu'),
    createProduct('86-SAHIBA', 'Lưỡi', 'Sahiba', 'Thịt trâu'),
    createProduct('70-SAHIBA', 'Bắp rùa', 'Sahiba', 'Thịt trâu'),
    createProduct('57-SAHIBA', 'Đuôi', 'Sahiba', 'Thịt trâu'),
    createProduct('46-SAHIBA', 'Thăn ngoại', 'Sahiba', 'Thịt trâu'),
    createProduct('123-SAHIBA', 'Dẻ sườn', 'Sahiba', 'Thịt trâu'),
    createProduct('64-IAF', 'Bắp cá lóc', 'IAF', 'Thịt trâu'),
    createProduct('64-ZAKIYAH', 'Bắp cá lóc', 'ZAKIYAH', 'Thịt trâu'),
    createProduct('MACAN-MIRATORG', 'Ba chỉ Có da - Có Xương', 'Miratorg', 'Thịt lợn'),
    createProduct('MACAN-APK-VLMK', 'Ba chỉ Có da - Rút xương', 'APK/VLMK', 'Thịt lợn'),
    createProduct('MACAN-RUSAGO', 'Ba chỉ Có da - Rút xương', 'RUSAGO', 'Thịt lợn'),
    createProduct('MACAN-CHANGIO', 'Chân giò trước nguyên cái', 'Generic', 'Thịt lợn'),
    createProduct('MACAN-M3Q6', 'Da heo lưng M3/Q6', 'M3/Q6', 'Thịt lợn'),
    createProduct('MACAN-APK', 'Khoanh trước APK', 'APK', 'Thịt lợn'),
    createProduct('MACAN-BZAXIN', 'Khoanh trước Bzaxin Palmali Đóng túi', 'Bzaxin Palmali Đóng túi', 'Thịt lợn'),
    createProduct('MACAN-VLMK-SAU', 'Khoanh sau VLMK', 'VLMK', 'Thịt lợn'),
    createProduct('MACAN-VLMK-TRUOC', 'Khoanh trước VLMK', 'VLMK', 'Thịt lợn'),
    createProduct('MACAN-OLYMEL', 'Khoanh trước Olymel', 'Olymel', 'Thịt lợn'),
    createProduct('LUOIHEO-TONNIES', 'Lưỡi heo - không có cuống', 'Tonnies', 'Thịt lợn'),
    createProduct('MUIHEO-TONNIES', 'Mũi heo Tonnies', 'Tonnies', 'Thịt lợn'),

    // Page 3
    createProduct('MACAN-MIKABALAN', 'Má heo Mika Balan - không có Da', 'Mika Balan', 'Thịt lợn'),
    createProduct('MONGSAUDAI-TONNIES', 'Móng sau dài - Tonnies', 'Tonnies', 'Thịt lợn'),
    createProduct('MONGSAU-YONNONI', 'Móng sau Ý Onnoni - đẹp', 'Ý Onnoni', 'Thịt lợn'),
    createProduct('MONGSAUNGAN-Y', 'Móng sau ngắn - Y', 'Y', 'Thịt lợn'),
    createProduct('MONGTRUOC-MIKAB', 'Móng trước Mika B', 'Mika B', 'Thịt lợn'),
    createProduct('MONGTRUOC-NWT', 'Móng trước NWT', 'NWT', 'Thịt lợn'),
    createProduct('MONGTRUOC-M77', 'Móng trước M77', 'M77', 'Thịt lợn'),
    createProduct('MONGTRUOC-APK', 'Móng trước - APK - trắng đẹp', 'APK', 'Thịt lợn'),
    createProduct('MONGTRUOC-Y', 'Móng trước Ý', 'Y', 'Thịt lợn'),
    createProduct('MOHEOCAT-ANIMEX', 'Mỡ heo cắt Animex', 'Animex', 'Thịt lợn'),
    createProduct('MACAN-MOHEOLUNG', 'Mỡ heo lưng', 'Generic', 'Thịt lợn'),
    createProduct('NACMONG-FRIMESA', 'Nạc mông - Frimesa', 'Frimesa', 'Thịt lợn'),
    createProduct('MACAN-NACMONG-APK', 'Nạc mông - APK', 'APK', 'Thịt lợn'),
    createProduct('MACAN-NACVAI-MIRATOG', 'Nạc vai - Miratog', 'Miratog', 'Thịt lợn'),
    createProduct('NACVAI-SEARA', 'Nạc vai - Seara', 'Seara', 'Thịt lợn'),
    createProduct('SCB-TONIS', 'Sườn cánh buồm Tonis', 'Tonis', 'Thịt lợn'),
    createProduct('SCB-DANISH', 'Sườn cánh buồm Danish', 'Danish', 'Thịt lợn'),
    createProduct('MACAN-SCB-RAINHA', 'Sườn cánh buôm Rainha - Nhiều Thịt', 'Rainha', 'Thịt lợn'),
    createProduct('SVT-CDS', 'Sụn vầng trăng CDS', 'CDS', 'Thịt lợn'),
    createProduct('SUNNON-NWT', 'Sụn non Đức NWT', 'NWT', 'Thịt lợn'),
    createProduct('MACAN-TAITAYXANH', 'Tai tấy xanh Zamesky', 'Zamesky', 'Thịt lợn'),
    createProduct('MACAN-TAI-M77A', 'Tai M77 Loại A', 'M77', 'Thịt lợn'),
    createProduct('MACAN-TAI-APKA', 'Tai APK loại A', 'APK', 'Thịt lợn'),
    createProduct('MACAN-TAI-M3Q6', 'Tai M3(Q6)', 'M3(Q6)', 'Thịt lợn'),
    createProduct('MACAN-TIMHEO-TBN', 'Tim heo TBN - RETXACH', 'TBN - RETXACH', 'Thịt lợn'),
    createProduct('XOS-NIPOK-MIKA', 'Xương ống sau Nipok và Mika', 'Nipok và Mika', 'Thịt lợn'),
    { ...createProduct('L-CHICKEN', 'Gà Hàn Quốc (L)', 'Generic', 'Thịt gà'), nameEN: 'L Size FROZEN WHOLE CHICKEN', defaultPriceUSDPerTon: 1500 },
    { ...createProduct('M-CHICKEN', 'Gà Hàn Quốc (M)', 'Generic', 'Thịt gà'), nameEN: 'M Size FROZEN WHOLE CHICKEN', defaultPriceUSDPerTon: 1450 },
    { ...createProduct('S-CHICKEN', 'Gà Hàn Quốc (S)', 'Generic', 'Thịt gà'), nameEN: 'S Size FROZEN WHOLE CHICKEN', defaultPriceUSDPerTon: 1400 },
    createProduct('DUIMAI-LAMEX', 'Đùi Mái Lamex', 'Lamex', 'Thịt gà'),
    createProduct('DUIMAI-SHINWOO', 'Đùi Mái mía Shinwoo', 'Shinwoo', 'Thịt gà'),
    createProduct('DUIMAITO-SHINWOO', 'Đùi Mái Shin Woo - to đẹp', 'Shinwoo', 'Thịt gà'),
    createProduct('DUITRONG-SHINWOO', 'Đùi Trống Shin Woo - to đẹp', 'Shinwoo', 'Thịt gà'),
    createProduct('DUITRONG-TIPTOP', 'Đùi Trống TipTop', 'TipTop', 'Thịt gà'),
    createProduct('DUINON-MOUTE', 'Đùi non Moute ( đùi mềm)', 'Moute', 'Thịt gà'),
    createProduct('DUITOI-SANDERSON', 'Đùi tỏi Sanderson size 4-5 cái/kg', 'Sanderson', 'Thịt gà'),
    createProduct('DUITOI-MOUNTAIRE', 'Đùi tỏi Mountaire size 4-5 cái/kg', 'Mountaire', 'Thịt gà'),
    createProduct('DUITOI-TYSON', 'Đùi tỏi Tyson size 5-6 cái/kg', 'Tyson', 'Thịt gà'),
    createProduct('CGNC-XEPROI', 'Cánh gà nguyên cái – xếp rối', 'Generic', 'Thịt gà'),
    createProduct('CGNC-CEDAL', 'Cánh gà nguyên cái – xếp lớp CEDAL', 'CEDAL', 'Thịt gà'),
    createProduct('CGNC-SINGREEN', 'Cánh gà nguyên cái – Cánh gà già Singreen', 'Singreen', 'Thịt gà'),
    createProduct('CG-KHUCGIUA', 'Cánh gà - Khúc giữa', 'Generic', 'Thịt gà'),
    createProduct('CHANGA-HUNGARY-A35', 'Chân gà Hungary A 35gr+', 'Hungary', 'Thịt gà'),

    // Page 4
    createProduct('CHANGA-KZEROA-35', 'Chân gà KZEROA 35gr +', 'KZEROA', 'Thịt gà'),
    createProduct('CHANGA-THANHTUNG-50', 'Chân gà Thanh Tùng 50gr+', 'Thanh Tùng', 'Thịt gà'),
    createProduct('CGRX-NET5', 'Chân gà rút xương net 5', 'Generic', 'Thịt gà'),
    createProduct('CGRX-NET9', 'Chân gà rút xương net 9', 'Generic', 'Thịt gà'),
    createProduct('10D2-SHINWOO', 'Gà 10con (120-129kg/thùng)', 'Shinwoo', 'Thịt gà'),
    createProduct('10D3N-SHINWOO', 'Gà 10con (130-134kg/thùng) - nhỏ', 'Shinwoo', 'Thịt gà'),
    createProduct('10D3T-SHINWOO', 'Gà 10con (135-139kg/thùng) – to', 'Shinwoo', 'Thịt gà'),
    createProduct('10D4N-SHINWOO', 'Gà 10con (140-144kg/thùng) - nhỏ', 'Shinwoo', 'Thịt gà'),
    createProduct('10D4T-SHINWOO', 'Gà 10con (145-149kg/thùng) – to', 'Shinwoo', 'Thịt gà'),
    createProduct('10D5-SHINWOO', 'Gà 10con (150-159kg/thùng)', 'Shinwoo', 'Thịt gà'),
    createProduct('10D6N-SHINWOO', 'Gà 10con (160-164kg/thùng) - nhỏ', 'Shinwoo', 'Thịt gà'),
    createProduct('10D6T-SHINWOO', 'Gà 10con (165-169kg/thùng) - to', 'Shinwoo', 'Thịt gà'),
    createProduct('10D7-SHINWOO', 'Gà 10con (170-179kg/thùng)', 'Shinwoo', 'Thịt gà'),
    createProduct('12D911-SHINWOO', 'Gà 12con (90-110kg/thùng)', 'Shinwoo', 'Thịt gà'),
    createProduct('12D234-SHINWOO', 'Gà 12con (120-149kg/thùng)', 'Shinwoo', 'Thịt gà'),
    createProduct('GAXAY-PALET-SHINWOO', 'Thịt gà xay Shinwoo - Palet', 'Shinwoo', 'Thịt gà'),
    createProduct('GAXAY-CATON-SHINWOO', 'Thịt gà xay Shinwoo - Thùng Caton', 'Shinwoo', 'Thịt gà'),
    createProduct('SUNUCGA-HUNGARY', 'Sụn ức gà Hungary', 'Hungary', 'Thịt gà'),
    createProduct('THITUC-PALET-SHINWOO', 'Thịt ức gà ShinWoo - palet', 'Shinwoo', 'Thịt gà'),
    createProduct('THITUC-CATON-SHINWOO', 'Thịt ức gà Shin Woo - thùng caton', 'Shinwoo', 'Thịt gà'),
    createProduct('BASA-KHUC-GODACO', 'Cá Basa cắt khúc', 'GoDaCo', 'Thủy hải sản'),
    createProduct('BASA-KHUC-NAVICO', 'Cá Basa cắt khúc', 'NaViCo', 'Thủy hải sản'),
    createProduct('BASA-FILE-NAVICO', 'Cá Basa File', 'NaViCo', 'Thủy hải sản'),
    createProduct('CANUC-NHAT', 'Cá Nục Nhật 200/300g', 'Nhật', 'Thủy hải sản'),
    createProduct('BASA-NGUYENCON-VN', 'Cá Basa nguyên con', 'Việt Nam', 'Thủy hải sản'),
].sort((a, b) => a.brand.localeCompare(b.brand) || a.nameVI.localeCompare(b.nameVI));