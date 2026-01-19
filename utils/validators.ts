import { z } from 'zod';

// Task validation
export const taskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: z.string().max(2000, 'Description too long'),
    storyPoints: z.enum(['1', '2', '3', '5', '8', '13', '21']),
    lifeWheelAreaId: z.string().min(1, 'Life wheel area is required'),
    eisenhowerQuadrantId: z.string().min(1, 'Priority is required'),
    epicId: z.string().optional(),
    sprintId: z.string().optional(),
});

// Bill validation
export const billSchema = z.object({
    vendorName: z.string().min(1, 'Vendor name is required'),
    amount: z.number().positive('Amount must be positive'),
    dueDate: z.string().min(1, 'Due date is required'),
    categoryId: z.string().min(1, 'Category is required'),
});

// Challenge validation
export const challengeSchema = z.object({
    goal: z.string().min(1, 'Goal is required').max(200, 'Goal too long'),
    unit: z.string().min(1, 'Unit is required'),
    targetValue: z.number().positive('Target must be positive'),
    challengeType: z.enum(['solo', 'group']),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
});

// Challenge entry validation
export const challengeEntrySchema = z.object({
    entryValue: z.number().positive('Value must be positive'),
    entryDate: z.string().min(1, 'Date is required'),
});

// Login validation
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type TaskFormData = z.infer<typeof taskSchema>;
export type BillFormData = z.infer<typeof billSchema>;
export type ChallengeFormData = z.infer<typeof challengeSchema>;
export type ChallengeEntryFormData = z.infer<typeof challengeEntrySchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
