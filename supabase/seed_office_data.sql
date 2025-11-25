-- ============================================================================
-- MWRD MARKETPLACE - OFFICE SUPPLIES SAMPLE DATA
-- B2B Office Products, Furniture, Pantry & Supplies
-- ============================================================================

-- Get user IDs for reference
DO $$
DECLARE
  client_id UUID;
  supplier_id UUID;
  admin_id UUID;
BEGIN
  SELECT id INTO client_id FROM users WHERE email = 'client@mwrd.com';
  SELECT id INTO supplier_id FROM users WHERE email = 'supplier@mwrd.com';
  SELECT id INTO admin_id FROM users WHERE email = 'admin@mwrd.com';

  -- ============================================================================
  -- OFFICE PRODUCTS (Approved - Ready to Order)
  -- ============================================================================

  -- Office Furniture
  INSERT INTO products (supplier_id, name, description, category, image, status, cost_price, sku) VALUES
  (supplier_id, 'Executive Mesh Office Chair', 'Ergonomic high-back chair with lumbar support, adjustable armrests, and breathable mesh. Weight capacity 300lbs.', 'Office Furniture', 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400', 'APPROVED', 185.00, 'OFF-CHR-001'),
  (supplier_id, 'Standing Desk Converter', 'Height adjustable sit-stand desk converter, 32" wide workspace, smooth lift mechanism, supports dual monitors.', 'Office Furniture', 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=400', 'APPROVED', 145.00, 'OFF-DSK-002'),
  (supplier_id, 'Mobile Filing Cabinet 3-Drawer', 'Lockable metal filing cabinet with smooth-glide drawers, fits letter/legal size, powder-coated steel.', 'Office Furniture', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400', 'APPROVED', 89.00, 'OFF-CAB-003'),
  (supplier_id, 'Conference Table 8-Person', 'Modern boardroom table, 96"x42", scratch-resistant laminate top, cable management grommets.', 'Office Furniture', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', 'APPROVED', 425.00, 'OFF-TBL-004'),

  -- Office Electronics
  (supplier_id, '27" LED Monitor Full HD', 'IPS display, 1920x1080, HDMI/DisplayPort, VESA mountable, 75Hz refresh rate, flicker-free.', 'Electronics', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400', 'APPROVED', 165.00, 'OFF-MON-005'),
  (supplier_id, 'Wireless Keyboard & Mouse Combo', 'Slim profile wireless keyboard with numeric pad, ergonomic mouse, 2.4GHz USB receiver, 2-year battery life.', 'Electronics', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', 'APPROVED', 32.00, 'OFF-KBD-006'),
  (supplier_id, 'All-in-One Laser Printer', 'Multifunction printer/scanner/copier, 35ppm, duplex printing, WiFi, mobile printing, 250-sheet tray.', 'Electronics', 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400', 'APPROVED', 285.00, 'OFF-PRT-007'),
  (supplier_id, 'USB-C Docking Station', '11-in-1 USB-C hub, dual 4K HDMI, 100W power delivery, SD card reader, 4x USB ports, Ethernet.', 'Electronics', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400', 'APPROVED', 68.00, 'OFF-DOC-008'),

  -- Office Supplies
  (supplier_id, 'Copy Paper 10-Ream Case', 'Premium multipurpose paper, 8.5"x11", 20lb, 92 brightness, 5000 sheets total, FSC certified.', 'Office Supplies', 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400', 'APPROVED', 38.00, 'OFF-PAP-009'),
  (supplier_id, 'Ballpoint Pens Box of 60', 'Smooth-writing ballpoint pens, medium point, black ink, comfortable grip, bulk office pack.', 'Office Supplies', 'https://images.unsplash.com/photo-1586947200452-bc8c3b07c40d?w=400', 'APPROVED', 12.00, 'OFF-PEN-010'),
  (supplier_id, 'Heavy Duty Stapler with Staples', 'Desktop stapler, 100-sheet capacity, includes 5000 staples, metal construction, jam-free mechanism.', 'Office Supplies', 'https://images.unsplash.com/photo-1611532736570-0bba5d55f96d?w=400', 'APPROVED', 18.50, 'OFF-STP-011'),
  (supplier_id, 'Sticky Notes Assorted 24-Pack', 'Post-it style notes, 3"x3", bright colors, super sticky, 100 sheets per pad, 24 pads per pack.', 'Office Supplies', 'https://images.unsplash.com/photo-1592501011737-7fc7c0f99222?w=400', 'APPROVED', 16.00, 'OFF-STK-012'),

  -- Pantry & Break Room
  (supplier_id, 'Premium Coffee Pods 100-Count', 'Medium roast coffee K-cups, 100% Arabica beans, compatible with Keurig brewers, variety pack.', 'Pantry Supplies', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', 'APPROVED', 42.00, 'OFF-COF-013'),
  (supplier_id, 'Bottled Water 24-Pack', 'Purified drinking water, 16.9oz bottles, 24 per case, BPA-free, convenient for offices.', 'Pantry Supplies', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400', 'APPROVED', 5.50, 'OFF-WAT-014'),
  (supplier_id, 'Snack Mix Variety Box 30-Count', 'Assorted snacks including chips, pretzels, crackers, nuts. Perfect for break rooms and meetings.', 'Pantry Supplies', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400', 'APPROVED', 28.00, 'OFF-SNK-015'),
  (supplier_id, 'Paper Towels 12-Roll Pack', 'Commercial-grade paper towels, 2-ply, perforated sheets, strong and absorbent, bulk pack.', 'Cleaning Supplies', 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400', 'APPROVED', 22.00, 'OFF-TWL-016');

  -- ============================================================================
  -- PENDING PRODUCTS (Awaiting Admin Approval)
  -- ============================================================================

  INSERT INTO products (supplier_id, name, description, category, image, status, cost_price, sku) VALUES
  (supplier_id, 'Commercial Coffee Maker 12-Cup', 'Programmable drip coffee maker, thermal carafe, auto-shutoff, brew-pause feature, commercial grade.', 'Break Room', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400', 'PENDING', 78.00, 'OFF-MAK-017'),
  (supplier_id, 'Hand Sanitizer Dispenser Auto', 'Touchless automatic dispenser, wall-mount or countertop, battery operated, 1200ml capacity.', 'Cleaning Supplies', 'https://images.unsplash.com/photo-1584744982491-665f46d6f0a3?w=400', 'PENDING', 45.00, 'OFF-SAN-018'),
  (supplier_id, 'Whiteboard 6ft x 4ft Magnetic', 'Large magnetic dry erase board, aluminum frame, includes marker tray, mounting hardware included.', 'Office Supplies', 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=400', 'PENDING', 125.00, 'OFF-WHT-019');

  -- ============================================================================
  -- SAMPLE RFQs (Request for Quotes)
  -- ============================================================================

  -- RFQ 1: Office Furniture Order (OPEN - Awaiting Quotes)
  INSERT INTO rfqs (client_id, status, date) VALUES
  (client_id, 'OPEN', CURRENT_DATE - INTERVAL '2 days')
  RETURNING id INTO supplier_id; -- reusing variable for rfq_id

  INSERT INTO rfq_items (rfq_id, product_id, quantity, notes)
  SELECT
    supplier_id,
    id,
    CASE
      WHEN name = 'Executive Mesh Office Chair' THEN 15
      WHEN name = 'Standing Desk Converter' THEN 8
      WHEN name = 'Mobile Filing Cabinet 3-Drawer' THEN 5
    END,
    CASE
      WHEN name = 'Executive Mesh Office Chair' THEN 'Need delivery within 2 weeks'
      ELSE NULL
    END
  FROM products
  WHERE name IN ('Executive Mesh Office Chair', 'Standing Desk Converter', 'Mobile Filing Cabinet 3-Drawer');

  -- RFQ 2: Office Electronics Upgrade (QUOTED - Has Pending Quotes)
  INSERT INTO rfqs (client_id, status, date) VALUES
  (client_id, 'QUOTED', CURRENT_DATE - INTERVAL '5 days')
  RETURNING id INTO admin_id; -- reusing variable for rfq2_id

  INSERT INTO rfq_items (rfq_id, product_id, quantity, notes)
  SELECT
    admin_id,
    id,
    CASE
      WHEN name = '27" LED Monitor Full HD' THEN 20
      WHEN name = 'Wireless Keyboard & Mouse Combo' THEN 20
      WHEN name = 'USB-C Docking Station' THEN 10
    END,
    'For new employee workstations'
  FROM products
  WHERE name IN ('27" LED Monitor Full HD', 'Wireless Keyboard & Mouse Combo', 'USB-C Docking Station');

  -- Create quotes for RFQ 2
  INSERT INTO quotes (rfq_id, supplier_id, supplier_price, lead_time, margin_percent, status)
  SELECT
    admin_id,
    supplier_id,
    5250.00,
    '7-10 business days',
    12.0,
    'SENT_TO_CLIENT';

  -- RFQ 3: Monthly Office Supplies (CLOSED - Order Placed)
  INSERT INTO rfqs (client_id, status, date) VALUES
  (client_id, 'CLOSED', CURRENT_DATE - INTERVAL '10 days')
  RETURNING id INTO supplier_id; -- reusing for rfq3_id

  INSERT INTO rfq_items (rfq_id, product_id, quantity, notes)
  SELECT
    supplier_id,
    id,
    CASE
      WHEN name = 'Copy Paper 10-Ream Case' THEN 5
      WHEN name = 'Ballpoint Pens Box of 60' THEN 10
      WHEN name = 'Sticky Notes Assorted 24-Pack' THEN 8
    END,
    'Monthly recurring order'
  FROM products
  WHERE name IN ('Copy Paper 10-Ream Case', 'Ballpoint Pens Box of 60', 'Sticky Notes Assorted 24-Pack');

  -- Quote for RFQ 3 (ACCEPTED)
  INSERT INTO quotes (rfq_id, supplier_id, supplier_price, lead_time, margin_percent, status)
  SELECT
    supplier_id,
    (SELECT id FROM users WHERE email = 'supplier@mwrd.com'),
    438.00,
    '3-5 business days',
    10.0,
    'ACCEPTED';

  -- Create order from accepted quote
  INSERT INTO orders (client_id, supplier_id, amount, status, date)
  VALUES (
    client_id,
    (SELECT id FROM users WHERE email = 'supplier@mwrd.com'),
    481.80,
    'In Transit',
    CURRENT_DATE - INTERVAL '8 days'
  );

  -- ============================================================================
  -- ADDITIONAL SAMPLE DATA
  -- ============================================================================

  -- Another order (Delivered)
  INSERT INTO orders (client_id, supplier_id, amount, status, date)
  VALUES (
    client_id,
    (SELECT id FROM users WHERE email = 'supplier@mwrd.com'),
    1250.00,
    'Delivered',
    CURRENT_DATE - INTERVAL '15 days'
  );

END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show summary of created data
SELECT 'Products' as type, COUNT(*) as count FROM products
UNION ALL
SELECT 'RFQs', COUNT(*) FROM rfqs
UNION ALL
SELECT 'RFQ Items', COUNT(*) FROM rfq_items
UNION ALL
SELECT 'Quotes', COUNT(*) FROM quotes
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders;

-- Show products by status
SELECT status, COUNT(*) as count, category
FROM products
GROUP BY status, category
ORDER BY status, category;

SELECT '✅ Sample office supplies data loaded successfully!' as message;
