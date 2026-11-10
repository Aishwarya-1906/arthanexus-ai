/**
 * inject_sebi_ui.js — Patches index.html to add SEBI Instructor tab
 * Run via: node.cmd inject_sebi_ui.js
 */

'use strict';
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.join(__dirname, '..', 'apps', 'web', 'public', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

// ── 1. Inject desktop nav button before Settings ─────────────────────────────
const SETTINGS_NAV = `onclick="switchTab('settings')" class="nav-tab px-3.5 py-3 border-b-2 border-transparent hover:text-slate-200 flex items-center gap-2 whitespace-nowrap">
      <i class="fa-solid fa-gear"></i> Settings`;

const SEBI_NAV_INSERT = `onclick="switchTab('sebi')" class="nav-tab px-3.5 py-3 border-b-2 border-transparent hover:text-slate-200 flex items-center gap-2 whitespace-nowrap">
      <i class="fa-solid fa-scale-balanced text-yellow-400"></i> SEBI Instructor
    </button>
    <button onclick="switchTab('settings')" class="nav-tab px-3.5 py-3 border-b-2 border-transparent hover:text-slate-200 flex items-center gap-2 whitespace-nowrap">
      <i class="fa-solid fa-gear"></i> Settings`;

if (!html.includes('switchTab(\'sebi\')')) {
  html = html.replace(SETTINGS_NAV, SEBI_NAV_INSERT);
  console.log('✅ Desktop nav: SEBI button injected');
} else {
  console.log('⚡ Desktop nav: SEBI button already present');
}

// ── 2. Inject mobile nav SEBI button (before the closing </div> of mobile nav) ─
const MOBILE_NAV_DEVOPS = `onclick="switchTab('devops')" class="mobile-nav-btn flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg hover:text-white">
      <i class="fa-solid fa-cloud-bolt text-indigo-400 text-sm"></i>
      <span>DevOps</span>
    </button>
  </div>`;

const MOBILE_NAV_SEBI = `onclick="switchTab('devops')" class="mobile-nav-btn flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg hover:text-white">
      <i class="fa-solid fa-cloud-bolt text-indigo-400 text-sm"></i>
      <span>DevOps</span>
    </button>
    <button onclick="switchTab('sebi')" class="mobile-nav-btn flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg hover:text-white">
      <i class="fa-solid fa-scale-balanced text-yellow-400 text-sm"></i>
      <span>SEBI</span>
    </button>
  </div>`;

if (!html.includes("switchTab('sebi')")) {
  // already inserted above — won't get here twice, but guard:
}
html = html.replace(MOBILE_NAV_DEVOPS, MOBILE_NAV_SEBI);
console.log('✅ Mobile nav: SEBI button injected');

// ── 3. Inject full SEBI Instructor tab section ────────────────────────────────
const SETTINGS_SECTION_START = `    <section id="tab-settings" class="hidden space-y-6">`;

const SEBI_TAB_HTML = `    <!-- ===================================================================== -->
    <!-- TAB: SEBI INSTRUCTOR & MULTI-AGENT FINANCIAL RESEARCH                 -->
    <!-- ===================================================================== -->
    <section id="tab-sebi" class="hidden space-y-6">

      <!-- Market Status Bar -->
      <div class="glass-card rounded-2xl p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-scale-balanced text-yellow-400 text-xl"></i>
            <div>
              <h2 class="text-sm font-bold text-white">SEBI Instructor &amp; AI Financial Agent</h2>
              <p class="text-[11px] text-slate-400">Inspired by: svsairevanth/indian-stock-ai-agent · nabojyoti/agentic-equity-research-system · nighomni123/fsi-skills-india</p>
            </div>
          </div>
          <div id="sebi-market-status" class="flex items-center gap-2 px-3 py-1 rounded-xl border border-slate-700 text-xs font-mono">
            <span class="h-2 w-2 rounded-full bg-slate-500 animate-pulse"></span>
            <span class="text-slate-400">Loading market status…</span>
          </div>
        </div>
      </div>

      <!-- Sub-nav -->
      <div class="flex gap-2 flex-wrap">
        <button onclick="switchSebiTab('research')" id="sebi-tab-research" class="sebi-sub-tab px-4 py-2 rounded-xl text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
          <i class="fa-solid fa-flask mr-1"></i> 6-Agent Research
        </button>
        <button onclick="switchSebiTab('debate')" id="sebi-tab-debate" class="sebi-sub-tab px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 hover:text-white">
          <i class="fa-solid fa-comments mr-1"></i> Bull vs Bear
        </button>
        <button onclick="switchSebiTab('regulations')" id="sebi-tab-regulations" class="sebi-sub-tab px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 hover:text-white">
          <i class="fa-solid fa-gavel mr-1"></i> SEBI Regulations
        </button>
        <button onclick="switchSebiTab('concepts')" id="sebi-tab-concepts" class="sebi-sub-tab px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 hover:text-white">
          <i class="fa-solid fa-graduation-cap mr-1"></i> Market Concepts
        </button>
        <button onclick="switchSebiTab('nism')" id="sebi-tab-nism" class="sebi-sub-tab px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 hover:text-white">
          <i class="fa-solid fa-certificate mr-1"></i> NISM Exams
        </button>
        <button onclick="switchSebiTab('livequote')" id="sebi-tab-livequote" class="sebi-sub-tab px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 hover:text-white">
          <i class="fa-solid fa-chart-line mr-1"></i> Live Quotes
        </button>
      </div>

      <!-- Panel: 6-Agent Research Report -->
      <div id="sebi-panel-research" class="space-y-4">
        <div class="glass-card rounded-2xl p-5">
          <h3 class="text-sm font-bold text-white mb-3"><i class="fa-solid fa-flask text-yellow-400 mr-2"></i>6-Agent Collaborative Equity Research</h3>
          <div class="flex gap-2 flex-wrap mb-4">
            <input id="sebi-research-symbol" type="text" placeholder="NSE Symbol e.g. RELIANCE, TCS, INFY…"
              class="flex-1 min-w-48 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500">
            <button onclick="generateSebiReport()" class="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-sm transition">
              <i class="fa-solid fa-magnifying-glass mr-1"></i> Generate Report
            </button>
          </div>
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="text-xs text-slate-500">Quick pick:</span>
            <button onclick="document.getElementById('sebi-research-symbol').value='RELIANCE';generateSebiReport()" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300">RELIANCE</button>
            <button onclick="document.getElementById('sebi-research-symbol').value='TCS';generateSebiReport()" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300">TCS</button>
            <button onclick="document.getElementById('sebi-research-symbol').value='HDFCBANK';generateSebiReport()" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300">HDFCBANK</button>
            <button onclick="document.getElementById('sebi-research-symbol').value='INFY';generateSebiReport()" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300">INFY</button>
            <button onclick="document.getElementById('sebi-research-symbol').value='LT';generateSebiReport()" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300">L&amp;T</button>
          </div>
          <div id="sebi-report-output" class="text-xs text-slate-400 italic">Enter an NSE symbol above and click Generate Report to run the 6-agent collaborative analysis.</div>
        </div>
      </div>

      <!-- Panel: Bull vs Bear Debate -->
      <div id="sebi-panel-debate" class="space-y-4 hidden">
        <div class="glass-card rounded-2xl p-5">
          <h3 class="text-sm font-bold text-white mb-3"><i class="fa-solid fa-comments text-yellow-400 mr-2"></i>Bull vs Bear AI Debate</h3>
          <div class="flex gap-2 flex-wrap mb-4">
            <input id="sebi-debate-symbol" type="text" placeholder="NSE Symbol for debate…"
              class="flex-1 min-w-48 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500">
            <button onclick="runSebiDebate()" class="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-sm transition">
              <i class="fa-solid fa-swords mr-1"></i> Run Debate
            </button>
          </div>
          <div id="sebi-debate-output" class="text-xs text-slate-400 italic">Enter an NSE symbol to start the Bull vs Bear AI debate.</div>
        </div>
      </div>

      <!-- Panel: SEBI Regulations -->
      <div id="sebi-panel-regulations" class="space-y-4 hidden">
        <div class="glass-card rounded-2xl p-5">
          <h3 class="text-sm font-bold text-white mb-3"><i class="fa-solid fa-gavel text-yellow-400 mr-2"></i>SEBI Regulatory Framework</h3>
          <div class="flex gap-2 flex-wrap mb-4">
            <select id="sebi-reg-topic" class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500">
              <option value="investment_adviser">Investment Adviser Regulations 2013</option>
              <option value="research_analyst">Research Analyst Regulations 2014</option>
              <option value="lodr">LODR Regulations 2015</option>
              <option value="mutual_funds">Mutual Fund Regulations 1996</option>
              <option value="investor_protection">Investor Protection Guidelines</option>
            </select>
            <button onclick="loadSebiRegulation()" class="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-sm transition">
              <i class="fa-solid fa-book mr-1"></i> Load
            </button>
          </div>
          <div id="sebi-reg-output" class="text-xs text-slate-400 italic">Select a regulation topic to view the full rule set.</div>
        </div>
      </div>

      <!-- Panel: Market Concepts -->
      <div id="sebi-panel-concepts" class="space-y-4 hidden">
        <div class="glass-card rounded-2xl p-5">
          <h3 class="text-sm font-bold text-white mb-3"><i class="fa-solid fa-graduation-cap text-yellow-400 mr-2"></i>Indian Market Concepts</h3>
          <div class="flex gap-2 flex-wrap mb-4">
            <select id="sebi-concept-topic" class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500">
              <option value="nifty50">NIFTY 50 — Index Structure</option>
              <option value="circuit_breaker">Market-Wide Circuit Breaker</option>
              <option value="t_plus_one">T+1 Settlement Cycle</option>
              <option value="bulk_block_deals">Bulk vs Block Deals</option>
              <option value="futures_options">Futures &amp; Options Basics</option>
              <option value="debt_market">Indian Debt Market</option>
            </select>
            <button onclick="loadSebiConcept()" class="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-sm transition">
              <i class="fa-solid fa-lightbulb mr-1"></i> Explain
            </button>
          </div>
          <div id="sebi-concept-output" class="text-xs text-slate-400 italic">Select a concept to get a detailed explanation.</div>
        </div>
      </div>

      <!-- Panel: NISM Exams -->
      <div id="sebi-panel-nism" class="space-y-4 hidden">
        <div class="glass-card rounded-2xl p-5">
          <h3 class="text-sm font-bold text-white mb-3"><i class="fa-solid fa-certificate text-yellow-400 mr-2"></i>NISM Certification Modules</h3>
          <div class="flex gap-2 flex-wrap mb-4">
            <select id="sebi-nism-series" class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500">
              <option value="VIII-equity-derivatives">Series VIII — Equity Derivatives</option>
              <option value="V-a-mutual-fund">Series V-A — Mutual Fund Distributors</option>
              <option value="X-a-investment-adviser">Series X-A — Investment Adviser (Level 1)</option>
              <option value="XV-research-analyst">Series XV — Research Analyst</option>
            </select>
            <button onclick="loadNismModule()" class="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-sm transition">
              <i class="fa-solid fa-info-circle mr-1"></i> Details
            </button>
          </div>
          <div id="sebi-nism-output" class="text-xs text-slate-400 italic">Select a NISM certification module to view exam details and syllabus.</div>
        </div>
      </div>

      <!-- Panel: Live Quotes -->
      <div id="sebi-panel-livequote" class="space-y-4 hidden">
        <div class="glass-card rounded-2xl p-5">
          <h3 class="text-sm font-bold text-white mb-3"><i class="fa-solid fa-chart-line text-yellow-400 mr-2"></i>NSE Live / Enriched Quotes</h3>

          <!-- Indices -->
          <div id="sebi-indices-row" class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-slate-900 rounded-xl p-3 border border-slate-700">
              <p class="text-[11px] text-slate-400 mb-1">NIFTY 50</p>
              <p id="nifty-price" class="text-lg font-mono font-bold text-white">—</p>
              <p id="nifty-chg" class="text-xs text-slate-400">—</p>
            </div>
            <div class="bg-slate-900 rounded-xl p-3 border border-slate-700">
              <p class="text-[11px] text-slate-400 mb-1">SENSEX</p>
              <p id="sensex-price" class="text-lg font-mono font-bold text-white">—</p>
              <p id="sensex-chg" class="text-xs text-slate-400">—</p>
            </div>
          </div>

          <div class="flex gap-2 flex-wrap mb-4">
            <input id="sebi-quote-symbol" type="text" placeholder="NSE Symbol e.g. WIPRO, AXISBANK…"
              class="flex-1 min-w-48 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500">
            <button onclick="loadSebiQuote()" class="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-sm transition">
              <i class="fa-solid fa-bolt mr-1"></i> Fetch
            </button>
          </div>
          <div id="sebi-quote-output" class="text-xs text-slate-400 italic">Enter NSE symbol to fetch live enriched quote from Yahoo Finance (via proxy).</div>
        </div>
      </div>

      <!-- SEBI Disclaimer -->
      <div class="glass-card rounded-2xl p-4 border border-yellow-500/20 bg-yellow-500/5">
        <p class="text-[11px] text-yellow-300/80">
          <i class="fa-solid fa-triangle-exclamation mr-1"></i>
          <strong>SEBI Disclaimer:</strong> ArthaNexus AI is strictly an educational and data research tool.
          It is NOT a SEBI-registered Investment Adviser (IA) or Research Analyst (RA).
          Nothing displayed constitutes personalized investment advice, trading calls, or guaranteed returns.
          Investments in securities markets are subject to market risk. Read all scheme documents carefully.
          For grievances: <a href="https://scores.sebi.gov.in" target="_blank" class="underline">scores.sebi.gov.in</a> | Helpline: 1800-266-7575
        </p>
      </div>

    </section>

    ${SETTINGS_SECTION_START}`;

if (!html.includes('tab-sebi')) {
  html = html.replace(SETTINGS_SECTION_START, SEBI_TAB_HTML);
  console.log('✅ SEBI tab section injected');
} else {
  console.log('⚡ SEBI tab section already present');
}

fs.writeFileSync(htmlPath, html, 'utf-8');
console.log('✅ index.html updated successfully');
