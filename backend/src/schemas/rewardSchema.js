import { z } from 'zod';

const createRewardSchema = z.strictObject({
  name: z
    .string({ required_error: 'Nama reward wajib diisi' })
    .trim()
    .min(3, 'Nama reward minimal 3 karakter')
    .max(255, 'Nama maksimal 255 karakter'),
  pointsCost: z
    .number({
      required_error: 'Harga poin wajib diisi',
      invalid_type_error: 'Harga poin harus berupa angka',
    })
    .int('Harga poin harus bilangan bulat')
    .positive('Harga poin harus bernilai positif (lebih dari 0)'),
  stockQuantity: z
    .number({
      required_error: 'Stok awal wajib diisi',
      invalid_type_error: 'Stok harus berupa angka',
    })
    .int('Stok harus bilangan bulat')
    .nonnegative('Stok tidak boleh bernilai minus (minimal 0)')
    .default(0),
  isActive: z.boolean().optional().default(true),
});

const claimRewardSchema = z.strictObject({
  rewardId: z
    .string({ required_error: 'ID Reward wajib diisi' })
    .uuid('Format ID Reward tidak valid'),
});

export const useCouponSchema = z.strictObject({
  redemptionCode: z
    .string({ required_error: 'Kode penukaran wajib diisi' })
    .trim()
    .min(5, 'Format kode tidak valid'),
});

const getMyRewardsQuerySchema = z.object({
  status: z
    .enum(['active', 'used', 'all'], {
      invalid_type_error: "Status hanya boleh 'active', 'used', atau 'all'",
    })
    .default('all'),
});

const deleteRewardSchema = z.strictObject({
  id: z
    .string({ required_error: 'ID Reward wajib disertakan di URL' })
    .uuid('Format ID Reward tidak valid'),
});

const toggleRewardSchema = z.strictObject({
  id: z
    .string({ required_error: 'ID Reward wajib disertakan di URL' })
    .uuid('Format ID Reward tidak valid'),
});

export {
  claimRewardSchema,
  createRewardSchema,
  deleteRewardSchema,
  getMyRewardsQuerySchema,
  toggleRewardSchema
};
