import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avowtghynpybkrncafjs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // TA CLÉ

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;