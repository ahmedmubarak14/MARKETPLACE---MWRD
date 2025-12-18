import { Product, RFQ, Quote, User, UserRole, Order, OrderStatus, PaymentStatus } from '../types/types';

export const USERS: User[] = [
  { id: 'u1', name: 'John Client', email: 'client@mwrd.com', role: UserRole.CLIENT, companyName: 'Tech Solutions Ltd', verified: true, publicId: 'Client-8492', status: 'ACTIVE', dateJoined: '2023-01-10' },
  { id: 'u2', name: 'Sarah Supplier', email: 'supplier@mwrd.com', role: UserRole.SUPPLIER, companyName: 'Global Parts Inc', verified: true, publicId: 'Supplier-3921', rating: 4.8, status: 'APPROVED', kycStatus: 'VERIFIED', dateJoined: '2023-01-15' },
  { id: 'u3', name: 'Admin Alice', email: 'admin@mwrd.com', role: UserRole.ADMIN, companyName: 'mwrd HQ', verified: true },
  // Additional Suppliers for Quote comparison
  { id: 'u4', name: 'Indie Parts Co', email: 'indie@mwrd.com', role: UserRole.SUPPLIER, companyName: 'Indie Parts Co', verified: true, publicId: 'Supplier-1102', rating: 4.5, status: 'APPROVED', kycStatus: 'VERIFIED', dateJoined: '2023-05-20' },
  { id: 'u5', name: 'Teal Tech Supplies', email: 'teal@mwrd.com', role: UserRole.SUPPLIER, companyName: 'Teal Tech', verified: true, publicId: 'Supplier-8854', rating: 4.9, status: 'APPROVED', kycStatus: 'VERIFIED', dateJoined: '2023-06-10' },
  // New Suppliers for Product Approval Demo
  { id: 'sup_flexi', name: 'Flexi Rep', email: 'sales@flexistands.com', role: UserRole.SUPPLIER, companyName: 'FlexiStands Inc.', verified: true, publicId: 'Supplier-9012', status: 'APPROVED', kycStatus: 'VERIFIED', dateJoined: '2023-08-05' },
  { id: 'sup_tech', name: 'Tech Rep', email: 'sales@techperipherals.com', role: UserRole.SUPPLIER, companyName: 'Tech Peripherals', verified: true, publicId: 'Supplier-3456', status: 'APPROVED', kycStatus: 'VERIFIED', dateJoined: '2023-09-12' },
  { id: 'sup_vision', name: 'Vision Rep', email: 'sales@vision.com', role: UserRole.SUPPLIER, companyName: 'Vision Electronics', verified: true, publicId: 'Supplier-7890', status: 'APPROVED', kycStatus: 'VERIFIED', dateJoined: '2023-09-30' },
  // New Suppliers for Supplier Management View
  { 
    id: 'sup_global_imports', 
    name: 'Global Admin', 
    email: 'admin@globalimports.com', 
    role: UserRole.SUPPLIER, 
    companyName: 'Global Imports Inc.', 
    verified: true, 
    publicId: 'Supplier-5543',
    status: 'APPROVED',
    kycStatus: 'VERIFIED',
    dateJoined: '2023-10-26'
  },
  { 
    id: 'sup_creative', 
    name: 'Creative Admin', 
    email: 'admin@creative.com', 
    role: UserRole.SUPPLIER, 
    companyName: 'Creative Solutions LLC', 
    verified: false, 
    publicId: 'Supplier-2211',
    status: 'PENDING',
    kycStatus: 'IN_REVIEW',
    dateJoined: '2023-10-25'
  },
  { 
    id: 'sup_tech_inno', 
    name: 'Tech Innovator', 
    email: 'admin@techinno.com', 
    role: UserRole.SUPPLIER, 
    companyName: 'Tech Innovators Co.', 
    verified: false, 
    publicId: 'Supplier-6677',
    status: 'REJECTED',
    kycStatus: 'REJECTED',
    dateJoined: '2023-10-24'
  },
  { 
    id: 'sup_national', 
    name: 'National Rep', 
    email: 'admin@national.com', 
    role: UserRole.SUPPLIER, 
    companyName: 'National Supplies', 
    verified: true, 
    publicId: 'Supplier-9988',
    status: 'APPROVED',
    kycStatus: 'VERIFIED',
    dateJoined: '2023-10-23'
  },
  { 
    id: 'sup_sunrise', 
    name: 'Sunrise Rep', 
    email: 'admin@sunrise.com', 
    role: UserRole.SUPPLIER, 
    companyName: 'Sunrise Goods', 
    verified: true, 
    publicId: 'Supplier-4433',
    status: 'REQUIRES_ATTENTION',
    kycStatus: 'INCOMPLETE',
    dateJoined: '2023-10-22'
  },
  // New Clients for Client Management View
  {
    id: 'cli_eleanor',
    name: 'Eleanor Vance',
    email: 'eleanor@innovate.com',
    role: UserRole.CLIENT,
    companyName: 'Innovate Inc.',
    verified: true,
    publicId: 'Client-1001',
    status: 'ACTIVE',
    dateJoined: '2023-10-26'
  },
  {
    id: 'cli_marcus',
    name: 'Marcus Thorne',
    email: 'marcus.t@quantum.com',
    role: UserRole.CLIENT,
    companyName: 'Quantum Solutions',
    verified: false,
    publicId: 'Client-1002',
    status: 'PENDING',
    dateJoined: '2023-10-25'
  },
  {
    id: 'cli_isabella',
    name: 'Isabella Rossi',
    email: 'i.rossi@apexlog.co',
    role: UserRole.CLIENT,
    companyName: 'Apex Logistics',
    verified: true,
    publicId: 'Client-1003',
    status: 'ACTIVE',
    dateJoined: '2023-10-24'
  },
  {
    id: 'cli_julian',
    name: 'Julian Croft',
    email: 'j.croft@synergy.org',
    role: UserRole.CLIENT,
    companyName: 'Synergy Corp',
    verified: false,
    publicId: 'Client-1004',
    status: 'DEACTIVATED',
    dateJoined: '2023-10-22'
  },
  {
    id: 'cli_sofia',
    name: 'Sofia Reyes',
    email: 'sofia.reyes@stellar.io',
    role: UserRole.CLIENT,
    companyName: 'Stellar Goods',
    verified: true,
    publicId: 'Client-1005',
    status: 'ACTIVE',
    dateJoined: '2023-10-21'
  }
];

export const PRODUCTS: Product[] = [
  { 
    id: 'p1', 
    supplierId: 'u2', 
    name: 'Precision Runner X1', 
    description: 'High-performance athletic footwear for professional runners. Features advanced shock absorption and breathable mesh.', 
    category: 'Footwear', 
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5Y5kwewKVFAvGucJqCTlJsHDZ0xxXii8W862yAqGjjE8xUU0WGIhly-OmLBwBIFMrQE4v31TpkSqac4PVAyEWEYDvleTMI_knl6w-W83KfINH17a4iSWyShUMh0CigP2WHZLlG4CncIilbrXhzonrf8bmUJKRzHJR02LWui6IqZcKO5BFRWV1eNUUIYLyIc-igbg4xMJo3rCw3nd-v6__GxZb4rZot55s_MY9jklUkyRyx0flkm5l_l5_soT8cu5Nnk-rzxw1jFYY', 
    status: 'APPROVED', 
    costPrice: 85,
    sku: 'FTW-84301'
  },
  { 
    id: 'p2', 
    supplierId: 'u2', 
    name: 'ChronoGuard Watch', 
    description: 'Elegant timepiece with stainless steel construction, sapphire crystal glass, and water resistance up to 50m.', 
    category: 'Accessories', 
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC_A7nCaOovzOOTgMeEEnxp_wT0gGt-TYD0HIoVSwsXRDcKxUM2IPTPFqetSN0piX53987y9MeVGKGtjRu0vCYAC1bzgFG7d1GjrKXJHvUUOrB2MlFEo7oZcV54GoDiE7Q55ineeVbHVAtxv7wbmROjnH9Zm4aa-gPB9OaTLZv8h-ODv1VjciVlqkT-0Xz8ymCz3VTi6tGCwWK7bqETaP9bxppv6HmAD5R1fXNmUNddz-5Etg8QJ2pCMAP6h4ohcOGwfHaVhdaufLt', 
    status: 'APPROVED', 
    costPrice: 120,
    sku: 'WCH-10556'
  },
  { 
    id: 'p3', 
    supplierId: 'u2', 
    name: 'AudioLuxe Pro', 
    description: 'Studio-grade headphones with active noise cancellation, 40-hour battery life, and premium memory foam ear cups.', 
    category: 'Electronics', 
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfQuoQDrFVcbH8cVUU9AdpJzWP4t3zVPAWNPLQFhX3oxgTauVxBPnG9VRxa8DSmLq4hs_W8RgLNiMMlcOXM6F4fK72u2aIH9Mma7VDZkV1VFrQNi8AMq3WhSlTUFP5lIHhT1ZKRKRxfIZv4hctBFZE-zNs5N6VVlkYtpJB1VBC3WKklmo2-wPbpTQYjacQsiYmpXML8AUmp3E0O6xRoqdBYnpBweOeU_W5dhidOYMaxb-OIUiEXK5sp2fiDvac-t5zLvYSXCL4es2s', 
    status: 'APPROVED', 
    costPrice: 180,
    sku: 'AUD-78921'
  },
  { 
    id: 'p4', 
    supplierId: 'u2', 
    name: 'ErgoChair 2000', 
    description: 'Ergonomic office chair with lumbar support, adjustable armrests, and breathable mesh back for all-day comfort.', 
    category: 'Furniture', 
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAC8_UbLcbxULp_9vGOtgtTDefePZo7u05BPZ3d7EWngVLTdhtZ7GT9G2VNoWlOPyLV2nI-rckEI-BJ8UQNkvhfuvgJeH_WSDzsOkkHZI1XB7I8zFeDcZ136S96VsXj-iSuwbX41BWqsFVOcJTUFQwUYnR4muJkFahAErEZXHlpe-C9w5qeTwJhodv1yw-XbTObtrS6wK17Drnukx55JueycisTE_sCjyaI9zDIsg90Ci4CFgR06OWsRRt_J7IRYFRGVbL4r5lyHTwO', 
    status: 'APPROVED', 
    costPrice: 250,
    sku: 'CHR-33214'
  },
  { 
    id: 'p5', 
    supplierId: 'u2', 
    name: 'CulinaryMaster Knives', 
    description: 'Professional 8-piece kitchen knife set forged from high-carbon stainless steel. Includes wooden block.', 
    category: 'Kitchenware', 
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5l3n2MphG8KAEpjR4NPVJgU-_t5yigTyjHO4EYRj5RFl7LuUsDbpAPp2ZH7EhDyIMGNF-jRt8pvyqaXjkhIcXHXklC1qkd-IRZmt59R7rg7Ug0taCusDuapnDViZka1gKGcJqR032kHUe9KwjKTnm0-A6r7yJ44xR4Xc5ibp3zVU4cAPASbJ6zLmTg0fxTefISFB9rFyJH7YYroP96wq2o8sRhzr-OXKz-ZtQyHSrDgV_L8SLI4kdAV5VxnV2m6v69gWxIV2m2Sba', 
    status: 'APPROVED', 
    costPrice: 95,
    sku: 'KTN-01123'
  },
  { 
    id: 'p6', 
    supplierId: 'u2', 
    name: 'Stiletto Glam', 
    description: 'Luxury high-heels for formal occasions. Features premium leather finish and comfortable sole design.', 
    category: 'Footwear', 
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB33l205_vWA3y6iJiuJYCDmtP3bgEflmK7Nj9VBwfRF45B8YdMjp4I2D_YZP1i89yFOUJm2nr0ByEtLIt53j3GPOE-fKFImnyq6JChuLJ3hlgEvDu4RuCk9F7sKnL5YmpYyigz85iC653vRmeMpSsCXw1iv3Taatm4psHUiJWoQLOYBMqwWXLh9sZeC1Z6dx7uYcqNlPYFmy0sIUg6Y6an_YoJSgpfcqbEP3Duw4IhaJyojdydNQQrSVueqzjMDsaJ2I4h-XA5S9Dz', 
    status: 'APPROVED', 
    costPrice: 110,
    sku: 'SHO-99874'
  },
  // Industrial Items
  {
    id: 'ind1',
    supplierId: 'u2',
    name: 'Centrifugal Pump',
    description: 'High-efficiency industrial pump.',
    category: 'Industrial',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnEVoc3ZiA4axQ_zAuRs0_hFZKoSwsiSiefBuKzOfvRxXgZovA6kSfZSut1vOEhS_wX7nnfr_aw-AoKEDggwXGiNZRnLYjoP1X11quGKii3ju2MYX4wHEtua6L5pNnm15qXQC14t17_TNCZWeHlZyjE4Up07PonZTb2w7-tMwOGSnx-imXEi8SO-XQOO5fR8AZ_on0Unv_iINHXPNUCWa7elArSZPE1f53crO4xUEXtBnWvevuxQxkEfQbNdRiI_D8xNEOMWUgD6RD',
    status: 'APPROVED', 
    costPrice: 450,
    sku: 'IND-PMP-001'
  },
  {
    id: 'ind2',
    supplierId: 'u2',
    name: 'Nitrile Safety Gloves',
    description: 'Pack of 100, chemical resistant.',
    category: 'Safety Gear',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLq7kjPt_lY9J_WTN0ECS9bQ1O2gda-SHFGz7JxZUBYiPuGvwr33Ig-Pbew4vc97ARpWoUWOwJdlHpInuAiBzI6-JOWGDViIqAB3R0DT8PrJUfEvn5h67szLQRk86GErPVkgKWqFmNkvGYfceRe4Mo6gXALhSevKE1YRmGFcEYvj-c4Idr7DiGFzjZbWloLQm4I2Oj70rUKmcXUXZf3Wpv7mI-A6982lCWuMURaK0JyGUDqPAac0icMCDnPqHE3Vk4yEYw1hu-26Vy',
    status: 'APPROVED', 
    costPrice: 25,
    sku: 'SFT-GLV-100'
  },
  {
    id: 'ind3',
    supplierId: 'u2',
    name: 'Stainless Steel Valve',
    description: 'DN50, PN16 rating.',
    category: 'Industrial',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAzsDOYqk98U4s_0REj1QP4iNj1V4Esg-DRqpFz0YJTYX0q92wc0SbHMU0S2-JtulNJm8gS4YhoBZZ_thHp1oeSgQIvewp1Cav8IQ-PwM1bAJrHErgb1KC-mue-ymgDB6Eu7ju2nZdg4FK74X_7zVuuF3Wl0Q8f-BWS22iy9XAYqwuEDc21dK2W9_Gg5ZbsrX--Chq6fY7WjdQhNRVj14mXmszqk_OHp7Q24NMqCfl9J3qUJW1Ce8y82m9oSOj3N1aDqQ-O600B-uU',
    status: 'APPROVED', 
    costPrice: 120,
    sku: 'IND-VLV-050'
  },
  {
    id: 'ind4',
    supplierId: 'u2',
    name: 'Copper Insulated Cable',
    description: '500m spool, 2.5mm diameter.',
    category: 'Electrical',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQMd5K3hNmaGZugzGKBaViXJLdbM26ytmd80m6yVE9jaLaHGjlt67YiO70FvkxNtWAd5cG1FUvmFvvQhov52PuaZ4Chqs6Efv-hqN-cudou6vWga8Rb5HTCZHDKXVFRFkNBnfDDDVPmT7CHmFtAJHVS9gBm42izAwi7I8DOEAK8E-qZH9fxoQ8TcqQ0yDusylXJLMiLjpLRPjmhUzrhly31NCx_X9D8H1IT8KAVoRryrWT1FJptLPxcWwmDkRgUMa04x-YW3wXTUVs',
    status: 'APPROVED', 
    costPrice: 300,
    sku: 'ELE-CBL-500'
  },
  // Pending Items for Approval Demo
  {
    id: 'pend1',
    supplierId: 'sup_flexi',
    name: 'Ergonomic Mesh Chair',
    description: 'Adjustable ergonomic office chair with breathable mesh back.',
    category: 'Furniture',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5eBQQZ5-5WsNQRO4I4M9CVO7r92_zBZuTklqz_-dTQxjAvWUw70LajcwE1iQFiTApbsSndzDKNTvW5N2i4HZIDlvU3yrTdYjrJBzQMEcpAtDr6i8RvwugNDPXL3YA_h-r6aHZwsJ4zwJmbx8ARn4XbZVvWIEA6nZcSWHL6FVRT9RlaOA5kG1FCarffkqv1Kwwh82qvFv8xx8-8I3Y_uVH5BY8mdyefmlm1eH2LiObbyBqDs135L5Y1GEwDo9bcr3guMCHsquPbwDF',
    status: 'PENDING',
    costPrice: 180.00,
    sku: 'FN-CH-1024'
  },
  {
    id: 'pend2',
    supplierId: 'sup_tech',
    name: 'Wireless Ergo Mouse',
    description: 'Vertical wireless mouse designed to reduce wrist strain.',
    category: 'Electronics',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAepAo5uSwYdLgtvVQglDsMVWVI14p30eeabCrMeJiQqpH3YD8NHYVDdY3i01jsoaxylszZV9jO_IHBwa9SS5tXu67wQFJ_YuubZOO7iV_tIzYeljlDRnRu0EmQ_lWHfm35nCEndmYqxumz6I0kuL6c9oeRy2NJNCBB7HZMGtMP7y4QVofp-bjnew6AisfAwcVzkCU6iuKOPo_9XcYzFlNEAokwJqqyAZbuzscgJeJ5VRnIO66ivKfGtCTYU4d3Eb6V9ZIpt3YdTTJ8',
    status: 'PENDING',
    costPrice: 75.50,
    sku: 'TP-MS-5501'
  },
  {
    id: 'pend3',
    supplierId: 'sup_flexi',
    name: 'Adjustable Standing Desk',
    description: 'Electric standing desk with dual motors and memory presets.',
    category: 'Furniture',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC65PrZWYkEYTWeRAncFd-mgpe9RaXunzuZKGQSHuGBRRRGHyEGgNl4WeK6uAiDapXOFIpL3BhYHbbuKP5yvPXbu-zyEs02HZ06SlGN5lyqB7Jjf7CiylFi6vshUZXGH9af4_6d8vqSXoBfDJeiBJwDTpCcYUwT2zlIeCoLszlEBSV7w8GqZmzDqm9xc7njxEXlXrnYNu44miUkOhYhQEvxePRkIlQCUYBb2UmPvwiamTstA-NZmJZggwPTqBOqsvGhZiCnR8DqeECE',
    status: 'PENDING',
    costPrice: 320.00,
    sku: 'FN-DK-3080'
  },
  {
    id: 'pend4',
    supplierId: 'sup_vision',
    name: '4K UHD 27" Monitor',
    description: 'Professional grade IPS monitor with 100% sRGB color accuracy.',
    category: 'Electronics',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBVmNY_yXqvmJlcDdWhCpu4AD301dyWxrL5KxwKY-Xbz2Cszkcd1SPDcy1nlYM88UKU_l8B_RQaYFrFfLK1Chz1uGT1VSoVuvOOHWNu8MVanAe3h1D7TADsBAlILofF1i23_zn8k60GOuDuGCsPUKRw_uVSqCVAmFlRWSQ-TCI66iV7V4aU3PdXuTZREDZpWo9GKKucl9wDQR2UQWBBTAsulMgtBS8G-XfSbH4VnoQ9E3UAWYoa-iwFU2e0dCh5ZXIqrwO5gOA_fgs',
    status: 'PENDING',
    costPrice: 299.99,
    sku: 'VE-MN-9001'
  }
];

export const RFQS: RFQ[] = [
  { id: 'r1', clientId: 'u1', items: [{ productId: 'p1', quantity: 50, notes: 'Urgent delivery required' }], status: 'OPEN', date: '2023-10-25' },
  { id: 'r2', clientId: 'u1', items: [{ productId: 'p2', quantity: 10, notes: '' }], status: 'QUOTED', date: '2023-10-20' },
  { id: 'r3', clientId: 'u1', items: [{ productId: 'p3', quantity: 25, notes: 'Standard packaging' }, { productId: 'p4', quantity: 5, notes: '' }], status: 'CLOSED', date: '2023-09-15' },
];

export const QUOTES: Quote[] = [
  { id: 'q1', rfqId: 'r2', supplierId: 'u2', supplierPrice: 1200, leadTime: '14 Days', marginPercent: 10, finalPrice: 1320, status: 'SENT_TO_CLIENT' },
  // Additional quotes for r2
  { id: 'q3', rfqId: 'r2', supplierId: 'u4', supplierPrice: 1150, leadTime: '10 Days', marginPercent: 12, finalPrice: 1288, status: 'SENT_TO_CLIENT' },
  { id: 'q4', rfqId: 'r2', supplierId: 'u5', supplierPrice: 1250, leadTime: '7 Days', marginPercent: 8, finalPrice: 1350, status: 'SENT_TO_CLIENT' },
  // Other quotes
  { id: 'q2', rfqId: 'r3', supplierId: 'u2', supplierPrice: 5500, leadTime: '5 Days', marginPercent: 15, finalPrice: 6325, status: 'ACCEPTED' },
];

export const ORDERS: Order[] = [
  { 
    id: 'ORD-9876', 
    clientId: 'u1', 
    supplierId: 'u2', 
    amount: 2450.00, 
    status: OrderStatus.IN_TRANSIT, 
    paymentStatus: PaymentStatus.CONFIRMED,
    paymentReference: 'MWRD-9876-ABC123',
    paymentConfirmedAt: '2023-10-26',
    date: '2023-10-28' 
  },
  { 
    id: 'ORD-9877', 
    clientId: 'u1', 
    supplierId: 'u2', 
    amount: 3200.00, 
    status: OrderStatus.AWAITING_CONFIRMATION, 
    paymentStatus: PaymentStatus.AWAITING_CONFIRMATION,
    paymentReference: 'MWRD-9877-DEF456',
    paymentSubmittedAt: '2023-10-27',
    date: '2023-10-27' 
  },
  { 
    id: 'ORD-9878', 
    clientId: 'u1', 
    supplierId: 'u4', 
    amount: 1850.00, 
    status: OrderStatus.PENDING_PAYMENT, 
    paymentStatus: PaymentStatus.PENDING,
    date: '2023-10-29' 
  },
  { 
    id: 'ORD-9875', 
    clientId: 'u1', 
    supplierId: 'u2', 
    amount: 1120.50, 
    status: OrderStatus.DELIVERED, 
    paymentStatus: PaymentStatus.CONFIRMED,
    paymentReference: 'MWRD-9875-GHI789',
    paymentConfirmedAt: '2023-10-10',
    date: '2023-10-15' 
  },
  { 
    id: 'ORD-9874', 
    clientId: 'u1', 
    supplierId: 'u5', 
    amount: 5800.00, 
    status: OrderStatus.CANCELLED, 
    date: '2023-10-01' 
  },
];