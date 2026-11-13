import { z } from "zod"

export const carteSearchSchema = z.object({
  ville: z.string().optional(),
  a: z.string().optional(),
  b: z.string().optional(),
})
export type CarteSearch = z.infer<typeof carteSearchSchema>
