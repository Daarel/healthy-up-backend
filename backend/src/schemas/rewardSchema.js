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

export { claimRewardSchema, createRewardSchema };
