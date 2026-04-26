/**
 * Quick KV Connection Check
 * Verifies if KV is properly connected
 */

import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      let value = valueParts.join('=').trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key.trim()] = value;
    }
  });
}

import { getKV } from '../lib/kv';

async function checkKV() {
  console.log('\n🔍 Checking KV Connection...\n');
  
  console.log('Environment Variables:');
  console.log(`  KV_REST_API_URL: ${process.env.KV_REST_API_URL ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`  KV_REST_API_TOKEN: ${process.env.KV_REST_API_TOKEN ? '✅ SET' : '❌ NOT SET'}`);
  
  const kv = await getKV();
  
  if (!kv) {
    console.log('\n❌ KV is null - cannot connect to database');
    process.exit(1);
  }
  
  console.log('\n✅ KV Connected! Testing with a test key...\n');
  
  try {
    // Test write
    await kv.set('kv-health-check', 'ok', { ex: 60 });
    console.log('✅ Write test successful');
    
    // Test read
    const value = await kv.get('kv-health-check');
    console.log(`✅ Read test successful: ${value}`);
    
    // Check existing data
    const resultsCount = await kv.llen('results:list');
    const publicCount = await kv.zcard('ledger:public:zset');
    const teamsCount = await kv.llen('teams:list');
    
    console.log('\n📊 Current Database State:');
    console.log(`  Results in results:list: ${resultsCount}`);
    console.log(`  Results in ledger:public:zset: ${publicCount}`);
    console.log(`  Teams: ${teamsCount}`);
    
    console.log('\n✨ KV is working correctly!\n');
  } catch (error) {
    console.error('\n❌ Error during KV test:', error);
    process.exit(1);
  }
}

checkKV().catch(console.error);
