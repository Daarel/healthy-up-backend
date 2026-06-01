import { z } from 'zod';

export const missionIdParamSchema = z.strictObject({
  id: z
    .string({ required_error: 'ID Misi wajib disertakan di URL' })
    .uuid('Format ID Misi tidak valid'),
});

export const updateMissionStatusSchema = z.strictObject({
  status: z.enum(['in_progress', 'completed', 'failed'], {
    invalid_type_error: "Status hanya boleh 'in_progress', 'completed', atau 'failed'",
    required_error: 'Status misi wajib diisi',
  }),
  proofImagePath: z.string().url('Format URL gambar tidak valid').optional(),
});