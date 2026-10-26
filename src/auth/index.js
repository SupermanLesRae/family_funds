import { USE_SUPABASE } from "../lib/config.js";
import { localAuth } from "./localAuth.js";
import { remoteAuth } from "./remoteAuth.js";

export const auth = USE_SUPABASE ? remoteAuth : localAuth;
