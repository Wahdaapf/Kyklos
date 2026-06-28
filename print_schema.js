const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oexqytcajybyoudwinbu.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9leHF5dGNhanlieW91ZHdpbmJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjUxNDEzMiwiZXhwIjoyMDk4MDkwMTMyfQ.xOWAMbZK-NpFFuGs-P1x8jKhC3sJ23YmrGJodJ140g4';

const supabase = createClient(supabaseUrl, serviceKey);

async function run() {
  const { data: comms } = await supabase.from('communities').select('*').limit(1);
  if (comms && comms.length > 0) {
    console.log("Community columns:", Object.keys(comms[0]));
    console.log("Sample community:", comms[0]);
  } else {
    console.log("No communities found");
  }

  const { data: pockets } = await supabase.from('fund_pockets').select('*').limit(1);
  if (pockets && pockets.length > 0) {
    console.log("Pocket columns:", Object.keys(pockets[0]));
    console.log("Sample pocket:", pockets[0]);
  }

  const { data: bills } = await supabase.from('dues_bills').select('*').limit(1);
  if (bills && bills.length > 0) {
    console.log("Bill columns:", Object.keys(bills[0]));
    console.log("Sample bill:", bills[0]);
  }
}

run();
