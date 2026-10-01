export const CATALOGUE = [
  { id: 'c1',  name: "Men's T-Shirt (M)",     sellPrice: 300, buyPrice: 160 },
  { id: 'c2',  name: "Men's T-Shirt (L)",     sellPrice: 300, buyPrice: 160 },
  { id: 'c3',  name: "Men's T-Shirt (XL)",    sellPrice: 300, buyPrice: 160 },
  { id: 'c4',  name: 'Cotton Lower (M)',       sellPrice: 250, buyPrice: 130 },
  { id: 'c5',  name: 'Cotton Lower (L)',       sellPrice: 250, buyPrice: 130 },
  { id: 'c6',  name: 'Cotton Lower (XL)',      sellPrice: 260, buyPrice: 135 },
  { id: 'c7',  name: 'Ladies Kurta (S)',       sellPrice: 450, buyPrice: 230 },
  { id: 'c8',  name: 'Ladies Kurta (M)',       sellPrice: 450, buyPrice: 230 },
  { id: 'c9',  name: 'Ladies Kurta (L)',       sellPrice: 460, buyPrice: 235 },
  { id: 'c10', name: 'Cotton Saree',           sellPrice: 600, buyPrice: 350 },
  { id: 'c11', name: 'Fancy Saree',            sellPrice: 900, buyPrice: 550 },
  { id: 'c12', name: 'Kids Jacket (4Y)',       sellPrice: 500, buyPrice: 270 },
  { id: 'c13', name: 'Kids Jacket (6Y)',       sellPrice: 520, buyPrice: 280 },
  { id: 'c14', name: "Girls T-Shirt (S)",      sellPrice: 200, buyPrice: 100 },
  { id: 'c15', name: "Boys T-Shirt (M)",       sellPrice: 200, buyPrice: 100 },
  { id: 'c16', name: "Men's Shirt (M)",        sellPrice: 550, buyPrice: 300 },
];

export const VENDORS = [
  'Shree Textiles, Surat',
  'Bombay Saree House',
  'Kidswear Co., Delhi',
  'Rajasthan Fabrics',
  'Tirupur Knitwear',
];

export const INITIAL_BILLS = [
  {
    id: '1042', name: 'Rahul Sharma', sp: 'Raju Kumar', spId: 'raju',
    time: '10:30 AM', date: '29 Sep 2026', pay: 'Cash',
    items: [
      { name: "Men's T-Shirt (M)", qty: 2, price: 300 },
      { name: 'Cotton Lower (L)',  qty: 1, price: 250 },
    ],
    discount: 0, hasReturn: false,
  },
  {
    id: '1041', name: 'Priya Devi', sp: 'Sunita Devi', spId: 'sunita',
    time: '9:55 AM', date: '29 Sep 2026', pay: 'Credit',
    items: [
      { name: 'Ladies Kurta (M)', qty: 3, price: 450 },
      { name: 'Cotton Saree',     qty: 1, price: 600 },
    ],
    discount: 0, hasReturn: false,
  },
  {
    id: '1040', name: 'Anil Kumar', sp: 'Deepak Meena', spId: 'deepak',
    time: '9:10 AM', date: '29 Sep 2026', pay: 'UPI',
    items: [
      { name: 'Kids Jacket (4Y)', qty: 1, price: 500 },
      { name: "Boys T-Shirt (M)", qty: 3, price: 200 },
    ],
    discount: 50, hasReturn: false,
  },
  {
    id: '1039', name: 'Meena Bai', sp: 'Raju Kumar', spId: 'raju',
    time: '8:45 AM', date: '29 Sep 2026', pay: 'Cash',
    items: [
      { name: 'Fancy Saree', qty: 3, price: 900 },
    ],
    discount: 0, hasReturn: true,
  },
  {
    id: '1038', name: 'Sita Devi', sp: 'Sunita Devi', spId: 'sunita',
    time: '5:00 PM', date: '28 Sep 2026', pay: 'UPI',
    items: [
      { name: 'Cotton Saree', qty: 2, price: 600 },
      { name: 'Ladies Kurta (S)', qty: 1, price: 450 },
    ],
    discount: 100, hasReturn: false,
  },
  {
    id: '1037', name: 'Rajesh Patel', sp: 'Deepak Meena', spId: 'deepak',
    time: '3:30 PM', date: '28 Sep 2026', pay: 'Cash',
    items: [
      { name: "Men's T-Shirt (L)", qty: 5, price: 300 },
      { name: 'Cotton Lower (M)',  qty: 3, price: 250 },
    ],
    discount: 200, hasReturn: false,
  },
];

export const INITIAL_RETURNS = [
  {
    id: 'R021', billId: '1039', customerName: 'Meena Bai',
    sp: 'Raju Kumar', date: '29 Sep 2026', time: '11:00 AM',
    reason: 'Size issue',
    items: [{ name: 'Fancy Saree', qty: 1, price: 900 }],
    mode: 'Cash refund', refundAmt: 900, approved: true,
  },
  {
    id: 'R020', billId: '1038', customerName: 'Sita Devi',
    sp: 'Sunita Devi', date: '28 Sep 2026', time: '6:00 PM',
    reason: 'Defective item',
    items: [{ name: 'Cotton Saree', qty: 1, price: 600 }],
    mode: 'Exchange', refundAmt: 600, approved: true,
  },
  {
    id: 'R019', billId: '1037', customerName: 'Rajesh Patel',
    sp: 'Deepak Meena', date: '28 Sep 2026', time: '4:30 PM',
    reason: 'Wrong item',
    items: [{ name: 'Cotton Lower (M)', qty: 1, price: 250 }],
    mode: 'Store credit', refundAmt: 250, approved: false,
  },
];

export const INITIAL_PURCHASES = [
  {
    id: 'p1', vendor: 'Shree Textiles, Surat', invoiceNo: 'ST-2091',
    date: '26 Sep 2026',
    items: [
      { name: "Men's T-Shirts", qty: 100, rate: 150 },
      { name: 'Ladies Kurta',   qty: 50,  rate: 190 },
      { name: 'Cotton Lower',   qty: 60,  rate: 120 },
    ],
    gst: 5, freight: 800, payStatus: 'Paid', paidAmt: 31700,
  },
  {
    id: 'p2', vendor: 'Bombay Saree House', invoiceNo: 'BSH-447',
    date: '22 Sep 2026',
    items: [
      { name: 'Cotton Sarees', qty: 40, rate: 340 },
      { name: 'Fancy Sarees',  qty: 20, rate: 520 },
    ],
    gst: 5, freight: 600, payStatus: 'Partial', paidAmt: 20000,
  },
  {
    id: 'p3', vendor: 'Kidswear Co., Delhi', invoiceNo: 'KC-112',
    date: '18 Sep 2026',
    items: [
      { name: 'Kids Jackets',    qty: 40, rate: 260 },
      { name: "Girls T-Shirts",  qty: 80, rate: 100 },
    ],
    gst: 12, freight: 500, payStatus: 'Unpaid', paidAmt: 0,
  },
];

export const INITIAL_STOCK = [
  { id: 's1', name: "Men's T-Shirt",  sku: 'T001', category: 'T-Shirt',  gender: 'Men',   fabric: 'Cotton',    sizes: 'S / M / L / XL',     qty: 124, lowAlert: 20, buyPrice: 160, sellPrice: 300, vendor: 'Tirupur Knitwear'   },
  { id: 's2', name: 'Cotton Lower',   sku: 'L002', category: 'Lower',    gender: 'Men',   fabric: 'Cotton',    sizes: 'M / L / XL / XXL',   qty: 38,  lowAlert: 25, buyPrice: 130, sellPrice: 250, vendor: 'Rajasthan Fabrics'  },
  { id: 's3', name: 'Ladies Kurta',   sku: 'K004', category: 'Kurta',    gender: 'Women', fabric: 'Rayon',     sizes: 'S / M / L',           qty: 91,  lowAlert: 15, buyPrice: 230, sellPrice: 450, vendor: 'Shree Textiles, Surat' },
  { id: 's4', name: 'Cotton Saree',   sku: 'S003', category: 'Saree',    gender: 'Women', fabric: 'Cotton',    sizes: 'Free size',           qty: 62,  lowAlert: 10, buyPrice: 350, sellPrice: 600, vendor: 'Bombay Saree House' },
  { id: 's5', name: 'Fancy Saree',    sku: 'S008', category: 'Saree',    gender: 'Women', fabric: 'Silk blend',sizes: 'Free size',           qty: 28,  lowAlert: 8,  buyPrice: 550, sellPrice: 900, vendor: 'Bombay Saree House' },
  { id: 's6', name: 'Kids Jacket',    sku: 'J005', category: 'Jacket',   gender: 'Kids',  fabric: 'Polyester', sizes: '2Y / 4Y / 6Y / 8Y',  qty: 6,   lowAlert: 10, buyPrice: 270, sellPrice: 500, vendor: 'Kidswear Co., Delhi'},
  { id: 's7', name: "Girls T-Shirt",  sku: 'T006', category: 'T-Shirt',  gender: 'Kids',  fabric: 'Cotton',    sizes: 'S / M / L',           qty: 55,  lowAlert: 10, buyPrice: 100, sellPrice: 200, vendor: 'Kidswear Co., Delhi'},
  { id: 's8', name: "Boys T-Shirt",   sku: 'T007', category: 'T-Shirt',  gender: 'Kids',  fabric: 'Cotton',    sizes: 'S / M / L',           qty: 42,  lowAlert: 10, buyPrice: 100, sellPrice: 200, vendor: 'Tirupur Knitwear'  },
  { id: 's9', name: "Men's Shirt",    sku: 'SH01', category: 'Shirt',    gender: 'Men',   fabric: 'Cotton',    sizes: 'S / M / L / XL',     qty: 33,  lowAlert: 10, buyPrice: 300, sellPrice: 550, vendor: 'Shree Textiles, Surat' },
];

export const CATEGORIES = ['T-Shirt', 'Lower', 'Saree', 'Kurta', 'Jacket', 'Shirt', 'Jeans', 'Dress', 'Innerwear', 'Other'];
export const GENDERS    = ['Men', 'Women', 'Kids', 'Unisex'];
export const RETURN_REASONS = ['Size issue', 'Defective', 'Wrong item', 'Customer changed mind', 'Quality issue'];
export const REFUND_MODES   = ['Cash refund', 'Exchange', 'Store credit'];
export const PAYMENT_MODES  = ['Cash', 'UPI', 'Card', 'Credit'];
export const PURCHASE_STATUSES = ['Paid full', 'Partial', 'Credit / unpaid'];

export const TEAM_TARGETS = {
  raju:   { target: 8000, today: 7200, bills: 12 },
  sunita: { target: 8000, today: 5800, bills: 8  },
  deepak: { target: 8000, today: 5400, bills: 4  },
};

export const ATTENDANCE = [
  { id: 'raju',   name: 'Raju Kumar',   checkIn: '9:00 AM',  checkOut: '—', status: 'present' },
  { id: 'sunita', name: 'Sunita Devi',  checkIn: '9:15 AM',  checkOut: '—', status: 'present' },
  { id: 'deepak', name: 'Deepak Meena', checkIn: '9:30 AM',  checkOut: '—', status: 'present' },
];

// Helper
export const calcBillTotal = (items = [], discount = 0) =>
  Math.max(0, items.reduce((s, i) => s + i.price * i.qty, 0) - discount);

export const calcPurchaseTotal = (items = [], gst = 0, freight = 0) => {
  const sub = items.reduce((s, i) => s + i.rate * i.qty, 0);
  return sub + Math.round(sub * gst / 100) + freight;
};

export const getStockStatus = (qty, lowAlert) => {
  if (qty <= 0)        return { label: 'Out of stock', cls: 'red' };
  if (qty <= lowAlert) return { label: qty <= lowAlert / 2 ? 'Critical' : 'Low stock', cls: qty <= lowAlert / 2 ? 'red' : 'amber' };
  return { label: 'In stock', cls: 'green' };
};

export const getPayStatusCls = (status) => {
  if (!status) return 'grey';
  const s = status.toLowerCase();
  if (s.includes('paid') || s.includes('cash') || s.includes('upi') || s.includes('card')) return 'green';
  if (s.includes('credit') || s.includes('partial')) return 'amber';
  if (s.includes('unpaid')) return 'red';
  return 'grey';
};
