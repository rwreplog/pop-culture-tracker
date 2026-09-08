import { z } from "zod";

import {
  accentColorEnum,
  fontFamilyEnum,
  themeEnum,
} from "@/lib/db/schema/users";

export const appearanceSchema = z.object({
  theme: z.enum(themeEnum.enumValues),
  accentColor: z.enum(accentColorEnum.enumValues),
  fontFamily: z.enum(fontFamilyEnum.enumValues),
});

export type AppearanceInput = z.infer<typeof appearanceSchema>;
