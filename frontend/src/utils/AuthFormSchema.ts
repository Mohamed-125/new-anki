import { z } from "zod";
const ALLOWED_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "proton.me",
  "icloud.com",
  // Add more trusted providers as needed
];

// export const AuthFormSchema = z.object({
//   email: z
//     .string()
//     .min(1, "Email is required")
//     .email("Invalid email format")
//     .refine((val) => val.length <= 255, {
//       message: "String can't be more than 255 characters",
//     })
//     .refine(
//       (email) => {
//         const domain = email.split("@")[1];
//         return ALLOWED_EMAIL_DOMAINS.includes(domain);
//       },
//       {
//         message: "Please use a valid email provider",
//       }
//     ),

//   password: z
//     .string()
//     .min(1, "Password is required")
//     .min(3, "Password should be at least 3 characters ")
//     .max(20, "Password should be contain less than 20 characters"),
// });

export const AuthFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required") // Add this line to make email required
    .email("Invalid email format")
    .refine((val) => val.length <= 255, {
      message: "String can't be more than 255 characters",
    })
    .refine(
      (email) => {
        const domain = email.split("@")[1];
        return ALLOWED_EMAIL_DOMAINS.includes(domain);
      },
      {
        message: "Please use a valid email provider",
      }
    ),
  password: z
    .string() // Add this to make password required
    .min(1, "Password is required")
    .min(3, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
});

export type AuthFormSchemaType = z.infer<typeof AuthFormSchema>;
