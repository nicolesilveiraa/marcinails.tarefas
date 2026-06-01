const SUPABASE_URL = "https://dlpksezngjmsrihxvibt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FjV7N1uV1g0DZQ8p1jSHdQ_QS5eiZ5T";

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabaseClient = client;