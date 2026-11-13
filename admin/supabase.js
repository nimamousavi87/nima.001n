
import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL =
  "https://teifzxhaijmxgyvpgymm.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_wAxHyGU2Jlwq8djPxA_t2w_s1XLaIVZ";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

export const isConfigured = true;
