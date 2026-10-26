import { USE_SUPABASE } from "../lib/config.js";
import { localRepo } from "./localRepo.js";
import { supabaseRepo } from "./supabaseRepo.js";

export const repo = USE_SUPABASE ? supabaseRepo : localRepo;
