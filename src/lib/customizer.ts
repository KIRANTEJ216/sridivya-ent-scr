import { z } from "zod";
import {
  isBoxId,
  isFluteId,
  isPrintId,
  isFinishId,
  isGradeId,
} from "./boxes";

export const customParamsSchema = z.object({
  type: z.string().refine(isBoxId, "Unknown box type").catch("die-cut-mailer"),
  l: z.coerce.number().min(40).max(2000).catch(305),
  w: z.coerce.number().min(40).max(2000).catch(229),
  h: z.coerce.number().min(20).max(2000).catch(102),
  flute: z.string().refine(isFluteId, "Unknown flute").catch("E"),
  grade: z.string().refine(isGradeId, "Unknown grade").catch("kraft-5ply"),
  print: z.string().refine(isPrintId, "Unknown print method").catch("digital"),
  finish: z.string().refine(isFinishId, "Unknown finish").catch("matte-lam"),
  qty: z.coerce.number().min(1).max(1_000_000).catch(500),
});
export type CustomParams = z.infer<typeof customParamsSchema>;

/** Parse loose search params into safe, defaulted CustomParams. */
export function parseCustomParams(
  raw: Record<string, string | string[] | number | undefined>
): CustomParams {
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "string") flat[k] = v;
    else if (typeof v === "number") flat[k] = String(v);
    else if (Array.isArray(v) && v.length) flat[k] = v[0];
  }
  return customParamsSchema.parse(flat);
}

export const quoteFormSchema = z.object({
  company: z.string().trim().min(2, "Company name is required").max(120),
  contactName: z.string().trim().min(2, "Your name is required").max(120),
  email: z.string().trim().email("Valid email required"),
  phone: z.string().trim().min(7, "Phone number looks too short").max(20),
  boxType: z.string().min(1, "Select a box type"),
  length: z.coerce.number().min(1, "Length required (mm)").max(3000),
  width: z.coerce.number().min(1, "Width required (mm)").max(3000),
  height: z.coerce.number().min(1, "Height required (mm)").max(3000),
  flute: z.string().min(1, "Select a flute"),
  grade: z.string().min(1, "Select a board grade"),
  print: z.string().min(1, "Select a print method"),
  finish: z.string().optional().default(""),
  quantity: z.coerce.number().min(1, "Quantity required").max(1_000_000),
  industries: z.array(z.string()).default([]),
  message: z.string().max(2000).optional().default(""),
  artworkNote: z.string().max(500).optional().default(""),
  dielineNote: z.string().max(500).optional().default(""),
});
export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
