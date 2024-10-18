import { z } from "zod";

export const numeric = z
	.custom<number>()
	.refine((value) => value ?? false, "Required")
	.refine((value) => Number.isFinite(Number(value)), "Invalid number")
	.transform((value) => Number(value));
