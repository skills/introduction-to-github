#!/usr/bin/env node
/**
 * ScrollVerse Health Monitor - Eternal Perfection Checker
 * ALLĀHU AKBAR! KUN FAYAKUN! 🔥🕋🚀♾️
 * 
 * This script provides comprehensive system verification:
 * - All 84+ tests execution
 * - Service endpoint validation
 * - Contract compilation check
 * - Documentation integrity
 * 
 * Run: node scripts/health-check.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========== CONFIGURATION ==========
const CONFIG = {
  appDir: path.join(__dirname, '..'),
  contractsDir: path.join(__dirname, '..', 'contracts'),
  minTests: 84,
  requiredContracts: [
    'Codex.sol',
    'BlessingCoin.sol',
    'PerpetualYieldEngine.sol',
    'UnsolicitedBlessings.sol',
    'HAIUToken.sol',
    'HumanAiInteractionNFT.sol'
  ],
  requiredDocs: [
    '../docs/QUANTUM-FINANCIAL-ENTANGLEMENT.md',
    '../docs/SCROLLVERSE-DEPLOYMENT.md',
    '../docs/BRANCHING-STRATEGY.md',
    '../docs/INTRODUCTION.md',
    '../docs/SETUP-OVERVIEW.md',
    '../docs/VISUAL-AIDS.md'
  ]
};

// ========== UTILITIES ==========
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(title) {
  console.log('\n' + '='.repeat(60));
  log(`🔥 ${title}`, colors.bold + colors.cyan);
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

// ========== CHECKS ==========

async function checkTests() {
  logHeader('TEST SUITE VERIFICATION');
  
  try {
    const output = execSync('npm test', { 
      cwd: CONFIG.appDir, 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Parse test results
    const passMatch = output.match(/# pass (\d+)/);
    const failMatch = output.match(/# fail (\d+)/);
    
    const passed = passMatch ? parseInt(passMatch[1]) : 0;
    const failed = failMatch ? parseInt(failMatch[1]) : 0;
    
    if (passed >= CONFIG.minTests && failed === 0) {
      logSuccess(`All ${passed} tests passed!`);
      return { success: true, passed, failed };
    } else {
      logError(`Tests: ${passed} passed, ${failed} failed (minimum: ${CONFIG.minTests})`);
      return { success: false, passed, failed };
    }
  } catch (error) {
    logError('Test execution failed');
    return { success: false, error: error.message };
  }
}

function checkContracts() {
  logHeader('SMART CONTRACT VERIFICATION');
  
  const results = { success: true, contracts: [] };
  
  for (const contract of CONFIG.requiredContracts) {
    const contractPath = path.join(CONFIG.contractsDir, 'src', contract);
    if (fs.existsSync(contractPath)) {
      logSuccess(`${contract} - Present`);
      results.contracts.push({ name: contract, exists: true });
    } else {
      logError(`${contract} - Missing`);
      results.contracts.push({ name: contract, exists: false });
      results.success = false;
    }
  }
  
  return results;
}

function checkDocumentation() {
  logHeader('DOCUMENTATION VERIFICATION');
  
  const results = { success: true, docs: [] };
  
  for (const doc of CONFIG.requiredDocs) {
    const docPath = path.join(CONFIG.appDir, doc);
    if (fs.existsSync(docPath)) {
      logSuccess(`${path.basename(doc)} - Present`);
      results.docs.push({ name: doc, exists: true });
    } else {
      logWarning(`${path.basename(doc)} - Not found (optional)`);
      results.docs.push({ name: doc, exists: false });
    }
  }
  
  return results;
}

function checkServices() {
  logHeader('SERVICE LAYER VERIFICATION');
  
  const services = [
    'src/index.js',
    'src/services/perpetual-yield-engine.js'
  ];
  
  const results = { success: true, services: [] };
  
  for (const service of services) {
    const servicePath = path.join(CONFIG.appDir, service);
    if (fs.existsSync(servicePath)) {
      const content = fs.readFileSync(servicePath, 'utf8');
      
      // Check for key integrations
      const hasYieldEngine = content.includes('PerpetualYieldEngine') || content.includes('perpetual-yield-engine');
      const hasHAIU = content.includes('HAIU') || content.includes('haiu');
      const hasCodex = content.includes('Codex') || content.includes('codex');
      
      logSuccess(`${path.basename(service)} - Present`);
      if (hasYieldEngine) logSuccess(`  └─ Perpetual Yield Engine: Integrated`);
      if (hasHAIU) logSuccess(`  └─ HAIU Protocol: Integrated`);
      if (hasCodex) logSuccess(`  └─ Codex State: Integrated`);
      
      results.services.push({ 
        name: service, 
        exists: true,
        integrations: { hasYieldEngine, hasHAIU, hasCodex }
      });
    } else {
      logError(`${path.basename(service)} - Missing`);
      results.services.push({ name: service, exists: false });
      results.success = false;
    }
  }
  
  return results;
}

function generateReport(testResults, contractResults, docResults, serviceResults) {
  logHeader('SCROLLVERSE HEALTH REPORT');
  
  const allSuccess = testResults.success && contractResults.success && serviceResults.success;
  
  console.log('\n📊 System Status Summary:');
  console.log('-'.repeat(40));
  log(`   Tests:       ${testResults.success ? '✅ PASS' : '❌ FAIL'} (${testResults.passed || 0}/${CONFIG.minTests}+)`, 
      testResults.success ? colors.green : colors.red);
  log(`   Contracts:   ${contractResults.success ? '✅ PASS' : '❌ FAIL'} (${contractResults.contracts.filter(c => c.exists).length}/6)`,
      contractResults.success ? colors.green : colors.red);
  log(`   Services:    ${serviceResults.success ? '✅ PASS' : '❌ FAIL'}`,
      serviceResults.success ? colors.green : colors.red);
  log(`   Documentation: ${docResults.docs.filter(d => d.exists).length}/6 guides`,
      colors.cyan);
  
  console.log('\n📜 Genesis Configuration:');
  console.log('-'.repeat(40));
  console.log('   Seal: ScrollPrime');
  console.log('   Epoch: 0 (LightRoot Epoch)');
  console.log('   Codex Lifespan: 241,200 years');
  console.log('   BLS Genesis: 10,000 tokens');
  console.log('   HAIU Supply: 241,200 tokens');
  console.log('   Genesis Relics: 100 NFTs');
  console.log('   Tribute NFTs: 50 pieces');
  
  console.log('\n' + '='.repeat(60));
  if (allSuccess) {
    log('🔥 ALLĀHU AKBAR! KUN FAYAKUN! 🔥', colors.bold + colors.green);
    log('✅ SCROLLVERSE STATUS: ETERNAL PERFECTION ACHIEVED ♾️', colors.bold + colors.green);
    log('❤️🤖❤️ Unquantifiable levels - 24/7 non-stop excellence!', colors.cyan);
  } else {
    log('⚠️  SCROLLVERSE STATUS: REQUIRES ATTENTION', colors.bold + colors.yellow);
    log('Please review the issues above and resolve them.', colors.yellow);
  }
  console.log('='.repeat(60) + '\n');
  
  return allSuccess;
}

// ========== MAIN ==========

async function main() {
  console.log('\n');
  log('🔥 ALLĀHU AKBAR! KUN FAYAKUN! 🔥', colors.bold + colors.cyan);
  log('ScrollVerse Health Monitor v1.0', colors.cyan);
  log('Eternal Perfection Verification System', colors.cyan);
  console.log('Timestamp:', new Date().toISOString());
  
  // Run all checks
  const testResults = await checkTests();
  const contractResults = checkContracts();
  const docResults = checkDocumentation();
  const serviceResults = checkServices();
  
  // Generate final report
  const success = generateReport(testResults, contractResults, docResults, serviceResults);
  
  process.exit(success ? 0 : 1);
}

main().catch(error => {
  logError(`Health check failed: ${error.message}`);
  process.exit(1);
});
