import { z } from 'zod';

// ==================== ENUMS ====================
export const UserRoleSchema = z.enum(['GUEST', 'CLIENT', 'SUPPLIER', 'ADMIN']);
export const UserStatusSchema = z.enum(['APPROVED', 'PENDING', 'REJECTED', 'REQUIRES_ATTENTION', 'ACTIVE', 'DEACTIVATED']);
export const KycStatusSchema = z.enum(['VERIFIED', 'IN_REVIEW', 'REJECTED', 'INCOMPLETE']);
export const ProductStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export const RfqStatusSchema = z.enum(['OPEN', 'QUOTED', 'CLOSED']);
export const QuoteStatusSchema = z.enum(['PENDING_ADMIN', 'SENT_TO_CLIENT', 'ACCEPTED', 'REJECTED']);
export const OrderStatusSchema = z.enum(['In Transit', 'Delivered', 'Cancelled']);

// ==================== USER SCHEMAS ====================
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name must be less than 200 characters'),
  role: z.enum(['CLIENT', 'SUPPLIER']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: UserRoleSchema,
  companyName: z.string().min(1).max(200),
  verified: z.boolean(),
  publicId: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  status: UserStatusSchema.optional(),
  kycStatus: KycStatusSchema.optional(),
  dateJoined: z.string().optional(),
});

// ==================== PRODUCT SCHEMAS ====================
export const ProductSchema = z.object({
  id: z.string().min(1),
  supplierId: z.string().min(1),
  name: z
    .string()
    .min(1, 'Product name is required')
    .min(3, 'Product name must be at least 3 characters')
    .max(200, 'Product name must be less than 200 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  category: z
    .string()
    .min(1, 'Category is required'),
  image: z
    .string()
    .url('Please enter a valid image URL')
    .or(z.string().length(0)),
  status: ProductStatusSchema,
  costPrice: z
    .number()
    .min(0.01, 'Cost price must be greater than 0')
    .max(1000000, 'Cost price must be less than 1,000,000')
    .optional(),
  sku: z
    .string()
    .max(50, 'SKU must be less than 50 characters')
    .optional(),
});

export const CreateProductSchema = ProductSchema.omit({ id: true, status: true }).extend({
  costPrice: z
    .number()
    .min(0.01, 'Cost price is required and must be greater than 0')
    .max(1000000, 'Cost price must be less than 1,000,000'),
});

// ==================== RFQ SCHEMAS ====================
export const RfqItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(100000, 'Quantity must be less than 100,000'),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters'),
});

export const RfqSchema = z.object({
  id: z.string().min(1),
  clientId: z.string().min(1),
  items: z
    .array(RfqItemSchema)
    .min(1, 'At least one item is required'),
  status: RfqStatusSchema,
  date: z.string().min(1),
});

export const CreateRfqSchema = z.object({
  items: z
    .array(RfqItemSchema)
    .min(1, 'Please add at least one item to your RFQ'),
});

// ==================== QUOTE SCHEMAS ====================
export const QuoteSchema = z.object({
  id: z.string().min(1),
  rfqId: z.string().min(1),
  supplierId: z.string().min(1),
  supplierPrice: z
    .number()
    .min(0.01, 'Price must be greater than 0')
    .max(10000000, 'Price must be less than 10,000,000'),
  leadTime: z
    .string()
    .min(1, 'Lead time is required'),
  marginPercent: z
    .number()
    .min(0, 'Margin cannot be negative')
    .max(100, 'Margin cannot exceed 100%'),
  finalPrice: z
    .number()
    .min(0, 'Final price must be positive'),
  status: QuoteStatusSchema,
});

export const SubmitQuoteSchema = z.object({
  rfqId: z.string().min(1, 'Please select an RFQ'),
  supplierPrice: z
    .number({ invalid_type_error: 'Please enter a valid price' })
    .min(0.01, 'Price must be greater than 0')
    .max(10000000, 'Price must be less than 10,000,000'),
  leadTime: z
    .string()
    .min(1, 'Lead time is required'),
});

export const AdminQuoteReviewSchema = z.object({
  marginPercent: z
    .number({ invalid_type_error: 'Please enter a valid margin' })
    .min(0, 'Margin cannot be negative')
    .max(100, 'Margin cannot exceed 100%'),
});

// ==================== ORDER SCHEMAS ====================
export const OrderSchema = z.object({
  id: z.string().min(1),
  amount: z
    .number()
    .min(0, 'Amount must be positive'),
  status: OrderStatusSchema,
  date: z.string().min(1),
});

// ==================== SEARCH SCHEMAS ====================
export const SearchSchema = z.object({
  query: z
    .string()
    .max(200, 'Search query too long'),
});

export const ProductFilterSchema = z.object({
  category: z.string().optional(),
  status: ProductStatusSchema.optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  search: z.string().max(200).optional(),
});

export const RfqFilterSchema = z.object({
  status: RfqStatusSchema.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().max(200).optional(),
});

// ==================== TYPE EXPORTS ====================
export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type ProductFormData = z.infer<typeof CreateProductSchema>;
export type RfqItemFormData = z.infer<typeof RfqItemSchema>;
export type CreateRfqFormData = z.infer<typeof CreateRfqSchema>;
export type SubmitQuoteFormData = z.infer<typeof SubmitQuoteSchema>;
export type AdminQuoteReviewFormData = z.infer<typeof AdminQuoteReviewSchema>;
export type ProductFilterData = z.infer<typeof ProductFilterSchema>;
export type RfqFilterData = z.infer<typeof RfqFilterSchema>;
