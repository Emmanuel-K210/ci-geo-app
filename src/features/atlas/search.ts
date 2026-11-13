import { z } from "zod"

export const atlasSearchSchema = z.object({
  district: z.string().optional(),
  ville: z.string().optional(),
  localite: z.string().optional(),
})
export type AtlasSearch = z.infer<typeof atlasSearchSchema>
