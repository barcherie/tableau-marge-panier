import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avowtghynpybkrncafjs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2b3d0Z2h5bnB5YmtybmNhZmpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NjQ2NDQsImV4cCI6MjA2MDU0MDY0NH0.rti8M0nB1VP_E5Dd89x4hsj2HrAwlLLZygzh6kCjmkw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
