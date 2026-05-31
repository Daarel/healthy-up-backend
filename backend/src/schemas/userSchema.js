import { z } from 'zod';

const getAllUsersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
});

const updateProfilePictureSchema = z.object({
  profilePicture: z.string().url('Format URL gambar tidak valid'), // deprecated need change
});

const deleteUserByAdminSchema = z.strictObject({
  id: z
    .string({ required_error: 'ID User wajib disertakan di URL' })
    .uuid('Format ID User tidak valid'),
});

export {
  deleteUserByAdminSchema,
  getAllUsersSchema,
  updateProfilePictureSchema,
};
