import z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; 
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const UserSchema = z
  .object({
    email: z.string().email({ message: "Enter a valid email" }),
    password: z.string().min(8, { message: "Minimum 8 characters" }),
    confirmPassword: z.string().min(8, { message: "Minimum 8 characters" }),
    role: z.enum(["user", "admin", "moderator"]),
    image: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
        message: "Max file size is 5MB",
      })
      .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
        message: "Only .jpg, .jpeg, .png and .webp formats are supported",
      }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type UserData = z.infer<typeof UserSchema>;

export const UserEditSchema = UserSchema.partial()
  .extend({
    role: z.enum(["user", "admin", "moderator"]).optional(),
    password: z.string().min(8, { message: "Minimum 8 characters" }).optional(),
    confirmPassword: z
      .string()
      .min(8, { message: "Minimum 8 characters" })
      .optional(),
  })
  .refine((v) => !v.password || v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type UserEditData = z.infer<typeof UserEditSchema>;
