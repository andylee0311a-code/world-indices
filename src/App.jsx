import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Clock, Activity, Globe, Zap, Sparkles, RefreshCcw, AlertTriangle, LayoutGrid, List, ArrowUp, X } from 'lucide-react';

// 初始資料：加入 prevClose 基準點，讓計算漲跌幅更精準
const INITIAL_MARKET_DATA = [
  { id: 'tw-taiex', symbol: '^TWII', name: '台灣加權指數', category: '台灣市場', price: 23540.21, prevClose: 23414.71 },
  { id: 'tw-txn', symbol: 'TWN=F', name: '台指期 (電子盤)', category: '台灣市場', price: 23565.00, prevClose: 23425.00 },
  { id: 'tw-tx-all', symbol: 'TX=F', name: '台指近全', category: '台灣市場', price: 23555.00, prevClose: 23425.00 },
  
  { id: 'us-dji', symbol: '^DJI', name: '道瓊工業指數', category: '美股四大指數', price: 41250.30, prevClose: 41370.70 },
  { id: 'us-spx', symbol: '^GSPC', name: '標普 500 指數', category: '美股四大指數', price: 5210.80, prevClose: 5216.00 },
  { id: 'us-ndx', symbol: '^IXIC', name: '那斯達克指數', category: '美股四大指數', price: 16850.45, prevClose: 16805.15 },
  { id: 'us-sox', symbol: '^SOX', name: '費城半導體', category: '美股四大指數', price: 4950.12, prevClose: 4889.62 },

  { id: 'fut-ym', symbol: 'YM=F', name: '小道瓊期貨 (YM)', category: '美股期貨', price: 41300.00, prevClose: 41400.00 },
  { id: 'fut-es', symbol: 'ES=F', name: '小標普期貨 (ES)', category: '美股期貨', price: 5225.25, prevClose: 5227.75 },
  { id: 'fut-nq', symbol: 'NQ=F', name: '小那斯達克 (NQ)', category: '美股期貨', price: 16900.50, prevClose: 16850.50 },

  { id: 'asia-nikkei', symbol: '^N225', name: '日經 225 指數', category: '亞洲股市', price: 39850.00, prevClose: 39500.00 },
  { id: 'asia-kospi', symbol: '^KS11', name: '韓國 KOSPI', category: '亞洲股市', price: 2750.60, prevClose: 2762.90 },
  { id: 'asia-hsi', symbol: '^HSI', name: '香港恆生指數', category: '亞洲股市', price: 16725.10, prevClose: 16930.50 },
  { id: 'asia-sse', symbol: '000001.SS', name: '上海綜合指數', category: '亞洲股市', price: 3045.22, prevClose: 3032.87 },
].map(item => ({
  ...item,
  change: item.price - item.prevClose,
  pct: ((item.price - item.prevClose) / item.prevClose) * 100
}));

const DEFAULT_AI_TEXT = "點擊上方按鈕，AI 將為您擷取最新市場數據並產生即時盤勢解析。";

// 單一指數卡片元件
const IndexCard = ({ data, viewMode }) => {
  const [flashColor, setFlashColor] = useState('transparent');
  const prevPriceRef = useRef(data.price);

  useEffect(() => {
    if (data.price !== prevPriceRef.current) {
      const isUp = data.price > prevPriceRef.current;
      setFlashColor(isUp ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)');
      prevPriceRef.current = data.price;
      
      const timer = setTimeout(() => setFlashColor('transparent'), 300);
      return () => clearTimeout(timer);
    }
  }, [data.price]);

  const isPositive = data.change >= 0;
  const colorClass = isPositive ? 'text-red-500' : 'text-green-500';
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const sign = isPositive ? '+' : '';

  const formatNumber = (num) => Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (viewMode === 'list') {
    return (
      <div 
        className="relative overflow-hidden rounded-lg bg-gray-800 border border-gray-700 p-3 shadow transition-all duration-300 flex items-center justify-between"
        style={{ backgroundColor: flashColor === 'transparent' ? '#1f2937' : flashColor, transition: 'background-color 0.3s ease-out' }}
      >
        <div className="flex items-center w-1/3 sm:w-1/4">
          <Activity size={16} className="text-gray-500 mr-2 hidden sm:block" />
          <h3 className="text-gray-300 font-medium text-sm sm:text-base truncate">{data.name}</h3>
        </div>
        <div className={`text-lg sm:text-2xl font-bold tracking-tight w-1/4 text-right ${colorClass}`}>{formatNumber(data.price)}</div>
        <div className={`flex flex-col sm:flex-row items-end sm:items-center justify-end w-1/3 sm:w-1/2 text-xs sm:text-sm font-semibold ${colorClass}`}>
          <div className="flex items-center"><Icon size={14} className="mr-1 hidden sm:block" /><span className="sm:w-20 text-right">{sign}{formatNumber(data.change)}</span></div>
          <span className="hidden sm:inline mx-2 text-gray-600">|</span>
          <span className="sm:w-16 text-right mt-1 sm:mt-0">{sign}{data.pct.toFixed(2)}%</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 p-5 shadow-lg transition-all duration-300"
      style={{ backgroundColor: flashColor === 'transparent' ? '#1f2937' : flashColor, transition: 'background-color 0.3s ease-out' }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-300 font-medium text-lg tracking-wide">{data.name}</h3>
        <Activity size={18} className="text-gray-500" />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div className="flex flex-col">
          <span className={`text-3xl font-bold tracking-tight ${colorClass}`}>{formatNumber(data.price)}</span>
          <div className={`flex items-center mt-1 text-sm font-semibold ${colorClass}`}>
            <Icon size={16} className="mr-1" />
            <span>{sign}{formatNumber(data.change)}</span><span className="mx-2">|</span><span>{sign}{data.pct.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [anchorData, setAnchorData] = useState(INITIAL_MARKET_DATA); // 引擎 1：真實基準資料
  const [displayData, setDisplayData] = useState(INITIAL_MARKET_DATA); // 引擎 2：前端跳動畫面
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [fontSizeScale, setFontSizeScale] = useState(1);
  const [aiAnalysis, setAiAnalysis] = useState(DEFAULT_AI_TEXT);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [apiStatus, setApiStatus] = useState("連線雙引擎 (Live 模擬 + Yahoo 基準)");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSizeScale * 100}%`;
    return () => document.documentElement.style.fontSize = '100%';
  }, [fontSizeScale]);

  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ==========================================
  // 引擎 1：背景抓取真實資料 (每 10 秒更新基準點)
  // ==========================================
  useEffect(() => {
    if (!isLive) return;
    const fetchAnchorData = async () => {
      try {
        const isCanvasPreview = typeof window !== 'undefined' && window.location.origin.startsWith('blob:');
        let fetchedQuotes = [];

        if (isCanvasPreview) {
          const symbols = INITIAL_MARKET_DATA.map(item => item.symbol).join(',');
          const targetUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
          const response = await fetch(proxyUrl);
          if (response.ok) {
            const data = await response.json();
            fetchedQuotes = data.quoteResponse?.result || [];
          }
        } else {
          const response = await fetch('/api/market');
          if (response.ok) {
            fetchedQuotes = await response.json();
          }
        }

        if (fetchedQuotes.length > 0) {
          setAnchorData(prev => prev.map(item => {
            const quote = fetchedQuotes.find(q => q.symbol === item.symbol || q.id === item.id);
            // 只要 API 有回傳正確大於 0 的數字，就更新基準點
            if (quote && quote.price > 0) {
               return { ...item, price: quote.price, prevClose: quote.price - quote.change };
            }
            return item;
          }));
        }
      } catch (error) {
        console.warn("背景基準更新失敗，繼續沿用舊基準");
      }
    };

    fetchAnchorData();
    const interval = setInterval(fetchAnchorData, 10000); // 10秒拉一次基準
    return () => clearInterval(interval);
  }, [isLive]);

  // ==========================================
  // 引擎 2：前端高頻跳動模擬 (每 1.5 秒更新畫面)
  // ==========================================
  useEffect(() => {
    if (!isLive) return;
    const tickSimulator = setInterval(() => {
      setDisplayData(prevDisplay => {
        return prevDisplay.map(item => {
          // 抓取目前最新的錨點基準
          const anchor = anchorData.find(a => a.id === item.id);
          const basePrice = anchor.price;
          
          // 隨機決定要不要跳動 (70% 機率跳動)
          if (Math.random() > 0.7) return item;

          // 產生微幅震盪 (-0.05% 到 +0.05%)
          const volatility = (Math.random() - 0.5) * 0.001;
          const tickPrice = basePrice * (1 + volatility);
          
          // 重新計算基於昨日收盤價的準確漲跌
          const tickChange = tickPrice - anchor.prevClose;
          const tickPct = (tickChange / anchor.prevClose) * 100;

          return { ...item, price: tickPrice, change: tickChange, pct: tickPct };
        });
      });
    }, 1500); // 1.5秒的高頻跳動快感

    return () => clearInterval(tickSimulator);
  }, [isLive, anchorData]);

  // AI 盤勢分析
  const generateMarketAnalysis = async () => {
    setIsAnalyzing(true);
    setAiError("");
    
    // 🔴 預覽環境修復編譯錯誤。上 Vercel 前請務必改回： 
    // const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    
    const marketSummary = displayData.map(d => 
      `${d.name}: ${d.price.toFixed(2)} (${d.change >= 0 ? '+' : ''}${d.pct.toFixed(2)}%)`
    ).join('\n');

    const promptText = `請根據以下我提供的「目前全球主要股市與期貨報價」，並結合你所能搜尋到的最新國際財經新聞，給出一份約 150-200 字的專業盤勢分析與總結。
    【目前即時報價】\n${marketSummary}\n
    請注意：語氣專業冷靜，點出領漲跌板塊及原因，使用繁體中文。`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      systemInstruction: { parts: [{ text: "你是專業財經分析師。請記得台灣股市紅漲綠跌。" }] },
      tools: [{ google_search: {} }] 
    };

    let retries = 3;
    while (retries > 0) {
      try {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) { setAiAnalysis(text.replace(/\*\*/g, '')); break; }
      } catch (error) {
        retries--;
        if (retries === 0) { setAiError(`AI 連線失敗：請確認 API Key`); setAiAnalysis(""); }
        else await new Promise(r => setTimeout(r, 1000));
      }
    }
    setIsAnalyzing(false);
  };

  const categories = [...new Set(displayData.map(item => item.category))];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-700 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
            <Globe className="mr-3 text-blue-400" size={32} />
            全球股市與期貨即時監控
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-gray-400 text-sm">採用台灣市場慣用色彩標示 ( <span className="text-red-500 font-bold">紅漲</span> / <span className="text-green-500 font-bold">綠跌</span> )</p>
            <span className="text-xs px-2 py-0.5 rounded-md bg-gray-800 border border-gray-700 text-teal-400 animate-pulse">來源: {apiStatus}</span>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col items-end">
          <div className="flex items-center bg-gray-800 rounded-full px-4 py-2 border border-gray-700 shadow-inner">
            <Clock size={16} className="text-gray-400 mr-2" />
            <span className="font-mono text-sm tracking-wider text-teal-100">{currentTime.toLocaleDateString('zh-TW')} {currentTime.toLocaleTimeString('zh-TW')}</span>
          </div>
          
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700">
              <button onClick={() => setFontSizeScale(prev => Math.max(0.7, prev - 0.1))} className="p-1.5 px-2.5 text-gray-400 hover:text-white font-bold">A-</button>
              <span className="text-gray-400 text-xs font-mono px-2 text-center">{Math.round(fontSizeScale * 100)}%</span>
              <button onClick={() => setFontSizeScale(prev => Math.min(1.5, prev + 0.1))} className="p-1.5 px-2.5 text-gray-400 hover:text-white font-bold">A+</button>
            </div>
            <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}><LayoutGrid size={16} /></button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}><List size={16} /></button>
            </div>
            <button onClick={() => setIsLive(!isLive)} className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full transition-all ${isLive ? 'bg-red-900/50 text-red-400 border border-red-800' : 'bg-gray-800 text-gray-400 border border-gray-600'}`}>
              <Zap size={14} className={`mr-1 ${isLive ? 'animate-pulse' : ''}`} />{isLive ? 'LIVE 引擎連線中' : '報價已暫停'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        <section className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 relative z-10">
            <h2 className="text-xl font-bold flex items-center text-indigo-100">
              <div className="bg-indigo-500/20 p-1.5 rounded-lg mr-3 border border-indigo-500/30"><Sparkles className="text-indigo-400" size={20} /></div>
              AI 智能盤勢洞察
            </h2>
            <button onClick={generateMarketAnalysis} disabled={isAnalyzing} className={`mt-4 md:mt-0 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-transform font-medium text-sm shadow-lg ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}>
              <RefreshCcw size={16} className={`mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />{isAnalyzing ? '分析中...' : '產生最新盤勢報告'}
            </button>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-5 border border-indigo-500/20 min-h-[100px] relative z-10 backdrop-blur-sm">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-3">
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <p className="text-indigo-400 text-sm animate-pulse">正在整合報價資料與即時新聞...</p>
              </div>
            ) : aiError ? (
              <div className="flex items-center text-red-400"><AlertTriangle size={18} className="mr-2" />{aiError}</div>
            ) : (
              <div className="relative group">
                {aiAnalysis !== DEFAULT_AI_TEXT && (
                  <button onClick={() => setAiAnalysis(DEFAULT_AI_TEXT)} className="absolute -top-2 -right-2 p-1.5 text-gray-500 bg-gray-800/80 rounded-full hover:text-red-400 hover:bg-gray-700 transition-all opacity-70 hover:opacity-100" title="關閉分析報告"><X size={16} /></button>
                )}
                <p className="whitespace-pre-line pr-6 text-gray-300 leading-relaxed">{aiAnalysis}</p>
              </div>
            )}
          </div>
        </section>

        {categories.map(category => (
          <section key={category}>
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-200"><div className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></div>{category}</h2>
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col space-y-2"}>
              {displayData.filter(item => item.category === category).map(item => <IndexCard key={item.id} data={item} viewMode={viewMode} />)}
            </div>
          </section>
        ))}
      </main>

      <footer className="max-w-7xl mx-auto mt-12 pt-6 pb-8 border-t border-gray-800 text-center flex flex-col items-center justify-center">
        <p className="text-gray-500 text-xs">© 2026 專業金融儀表板 Prototype. 雙引擎即時模擬架構。</p>
        <div className="mt-3 inline-block">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-semibold tracking-wider text-sm shadow-sm">Design by Andy Lee</p>
        </div>
      </footer>

      {showTopBtn && (
        <button onClick={scrollToTop} className="fixed bottom-8 right-8 z-50 p-3 bg-indigo-600/90 text-white rounded-full shadow-lg hover:bg-indigo-500 hover:-translate-y-1 transition-all backdrop-blur-sm"><ArrowUp size={24} /></button>
      )}
    </div>
  );
}