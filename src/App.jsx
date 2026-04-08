import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Clock, Activity, Globe, Zap, Sparkles, RefreshCcw, AlertTriangle, LayoutGrid, List, ArrowUp, X, ExternalLink } from 'lucide-react';

// 初始資料：作為畫面初次載入的版型框架
const INITIAL_MARKET_DATA = [
  { id: 'tw-taiex', symbol: '^TWII', name: '台灣加權指數', category: '台灣市場', price: 0, change: 0, pct: 0 },
  { id: 'tw-txn', symbol: 'TWN=F', name: '台指期 (電子盤)', category: '台灣市場', price: 0, change: 0, pct: 0 },
  { id: 'tw-tx-all', symbol: 'TX=F', name: '台指近全', category: '台灣市場', price: 0, change: 0, pct: 0 },
  
  { id: 'us-dji', symbol: '^DJI', name: '道瓊工業指數', category: '美股四大指數', price: 0, change: 0, pct: 0 },
  { id: 'us-spx', symbol: '^GSPC', name: '標普 500 指數', category: '美股四大指數', price: 0, change: 0, pct: 0 },
  { id: 'us-ndx', symbol: '^IXIC', name: '那斯達克指數', category: '美股四大指數', price: 0, change: 0, pct: 0 },
  { id: 'us-sox', symbol: '^SOX', name: '費城半導體', category: '美股四大指數', price: 0, change: 0, pct: 0 },

  { id: 'fut-ym', symbol: 'YM=F', name: '小道瓊期貨 (YM)', category: '美股期貨', price: 0, change: 0, pct: 0 },
  { id: 'fut-es', symbol: 'ES=F', name: '小標普期貨 (ES)', category: '美股期貨', price: 0, change: 0, pct: 0 },
  { id: 'fut-nq', symbol: 'NQ=F', name: '小那斯達克 (NQ)', category: '美股期貨', price: 0, change: 0, pct: 0 },

  { id: 'asia-nikkei', symbol: '^N225', name: '日經 225 指數', category: '亞洲股市', price: 0, change: 0, pct: 0 },
  { id: 'asia-kospi', symbol: '^KS11', name: '韓國 KOSPI', category: '亞洲股市', price: 0, change: 0, pct: 0 },
  { id: 'asia-hsi', symbol: '^HSI', name: '香港恆生指數', category: '亞洲股市', price: 0, change: 0, pct: 0 },
  { id: 'asia-sse', symbol: '000001.SS', name: '上海綜合指數', category: '亞洲股市', price: 0, change: 0, pct: 0 },
];

const DEFAULT_AI_TEXT = "點擊上方按鈕，AI 將為您擷取最新市場數據並產生即時盤勢解析。";

// 單一指數卡片元件 (已升級為可點擊連動至雅虎財經的連結)
const IndexCard = ({ data, viewMode }) => {
  const [flashColor, setFlashColor] = useState('transparent');
  const prevPriceRef = useRef(data.price);

  useEffect(() => {
    if (data.price !== prevPriceRef.current && data.price !== 0) {
      const isUp = data.price > prevPriceRef.current;
      setFlashColor(isUp ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)');
      prevPriceRef.current = data.price;
      
      const timer = setTimeout(() => setFlashColor('transparent'), 500);
      return () => clearTimeout(timer);
    }
  }, [data.price]);

  // 資料尚未載入時顯示 Loading 狀態
  if (data.price === 0) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 p-5 shadow-lg flex justify-center items-center h-[116px] animate-pulse ${viewMode === 'list' ? 'h-[72px] flex-row justify-start p-3' : ''}`}>
        <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mr-3"></div>
        <span className="text-gray-500 text-sm">同步雅虎報價中...</span>
      </div>
    );
  }

  const isPositive = data.change >= 0;
  const colorClass = isPositive ? 'text-red-500' : 'text-green-500';
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const sign = isPositive ? '+' : '';

  const formatNumber = (num) => Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  // 點擊卡片跳轉至 Yahoo Finance 對應頁面
  const yahooLink = `https://finance.yahoo.com/quote/${data.symbol}`;

  if (viewMode === 'list') {
    return (
      <a 
        href={yahooLink}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative overflow-hidden rounded-lg bg-gray-800 border border-gray-700 p-3 shadow transition-all duration-300 hover:border-indigo-500 hover:shadow-indigo-500/20 flex items-center justify-between"
        style={{ backgroundColor: flashColor === 'transparent' ? '#1f2937' : flashColor, transition: 'background-color 0.3s ease-out' }}
        title="點擊前往 Yahoo Finance 查看詳情"
      >
        <div className="flex items-center w-1/3 sm:w-1/4">
          <Activity size={16} className="text-gray-500 mr-2 hidden sm:block group-hover:text-indigo-400 transition-colors" />
          <h3 className="text-gray-300 font-medium text-sm sm:text-base truncate group-hover:text-white transition-colors">{data.name}</h3>
        </div>
        <div className={`text-lg sm:text-2xl font-bold tracking-tight w-1/4 text-right ${colorClass}`}>{formatNumber(data.price)}</div>
        <div className={`flex flex-col sm:flex-row items-end sm:items-center justify-end w-1/3 sm:w-1/2 text-xs sm:text-sm font-semibold ${colorClass}`}>
          <div className="flex items-center"><Icon size={14} className="mr-1 hidden sm:block" /><span className="sm:w-20 text-right">{sign}{formatNumber(data.change)}</span></div>
          <span className="hidden sm:inline mx-2 text-gray-600">|</span>
          <span className="sm:w-16 text-right mt-1 sm:mt-0">{sign}{data.pct.toFixed(2)}%</span>
          <ExternalLink size={14} className="ml-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
        </div>
      </a>
    );
  }

  return (
    <a 
      href={yahooLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 p-5 shadow-lg transition-all duration-300 hover:border-indigo-500 hover:shadow-indigo-500/20 hover:-translate-y-1"
      style={{ backgroundColor: flashColor === 'transparent' ? '#1f2937' : flashColor, transition: 'background-color 0.3s ease-out' }}
      title="點擊前往 Yahoo Finance 查看詳情"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-300 font-medium text-lg tracking-wide group-hover:text-white transition-colors">{data.name}</h3>
        <ExternalLink size={16} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
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
    </a>
  );
};

export default function App() {
  const [marketData, setMarketData] = useState(INITIAL_MARKET_DATA);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [fontSizeScale, setFontSizeScale] = useState(1);
  const [aiAnalysis, setAiAnalysis] = useState(DEFAULT_AI_TEXT);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [apiStatus, setApiStatus] = useState("等待同步...");

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
  // 純淨的 Yahoo 同步引擎 (無任何假亂數模擬)
  // ==========================================
  useEffect(() => {
    if (!isLive) {
      setApiStatus("同步已暫停");
      return;
    }

    const fetchYahooData = async () => {
      try {
        setApiStatus("連線 Yahoo 同步中...");
        const isCanvasPreview = typeof window !== 'undefined' && window.location.origin.startsWith('blob:');
        let fetchedQuotes = [];

        if (isCanvasPreview) {
          // 在預覽環境直接使用 CORS Proxy 抓取 Yahoo API
          const symbols = INITIAL_MARKET_DATA.map(item => item.symbol).join(',');
          const targetUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
          const response = await fetch(proxyUrl);
          
          if (response.ok) {
            const data = await response.json();
            fetchedQuotes = data.quoteResponse?.result || [];
          }
        } else {
          // 在 Vercel 正式機，呼叫我們寫好的後端
          const response = await fetch('/api/market');
          if (response.ok) {
            fetchedQuotes = await response.json();
          }
        }

        if (fetchedQuotes.length > 0) {
          setMarketData(prev => prev.map(item => {
            const quote = fetchedQuotes.find(q => q.symbol === item.symbol || q.id === item.id);
            
            // 嚴格將 Yahoo 真實回傳的欄位寫入畫面 (若 Yahoo 回傳 null 則保持不變)
            if (quote) {
               // 判斷資料來源是 Yahoo 原生格式還是 Vercel 後端整理過的格式
               const currentPrice = quote.regularMarketPrice ?? quote.price;
               const currentChange = quote.regularMarketChange ?? quote.change;
               const currentPct = quote.regularMarketChangePercent ?? quote.pct;
               
               if (currentPrice !== undefined && currentPrice !== null) {
                 return { ...item, price: currentPrice, change: currentChange, pct: currentPct };
               }
            }
            return item;
          }));
          setApiStatus("✅ 已同步雅虎最新數據");
        } else {
          setApiStatus("⚠️ 雅虎回傳空白");
        }
      } catch (error) {
        console.warn("Yahoo 同步失敗:", error);
        setApiStatus("❌ 同步失敗，等待重試");
      }
    };

    // 啟動立即抓取，隨後每 8 秒嚴格輪詢一次雅虎真實資料
    fetchYahooData();
    const interval = setInterval(fetchYahooData, 8000); 
    
    return () => clearInterval(interval);
  }, [isLive]);

  // AI 盤勢分析
  const generateMarketAnalysis = async () => {
    setIsAnalyzing(true);
    setAiError("");
    
    // 🔴 上 Vercel 前請務必改回： const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
 const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    
    // 只取已經成功載入真實價格的項目餵給 AI
    const validData = marketData.filter(d => d.price > 0);
    const marketSummary = validData.map(d => 
      `${d.name}: ${d.price.toFixed(2)} (${d.change >= 0 ? '+' : ''}${d.pct.toFixed(2)}%)`
    ).join('\n');

    const promptText = `請根據以下我提供的「目前雅虎財經最新全球股市與期貨報價」，並結合你所能搜尋到的最新國際財經新聞，給出一份約 150-200 字的專業盤勢分析與總結。
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

  const categories = [...new Set(marketData.map(item => item.category))];

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
            <span className={`text-xs px-2 py-0.5 rounded-md border ${apiStatus.includes('✅') ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-gray-800 border-gray-700 text-teal-400 animate-pulse'}`}>
              狀態: {apiStatus}
            </span>
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
            <button onClick={() => setIsLive(!isLive)} className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full transition-all ${isLive ? 'bg-indigo-900/50 text-indigo-400 border border-indigo-800 hover:bg-indigo-800/60' : 'bg-gray-800 text-gray-400 border border-gray-600'}`}>
              <Zap size={14} className={`mr-1 ${isLive ? 'animate-pulse' : ''}`} />{isLive ? '雅虎同步中' : '同步已暫停'}
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
              {marketData.filter(item => item.category === category).map(item => <IndexCard key={item.id} data={item} viewMode={viewMode} />)}
            </div>
          </section>
        ))}
      </main>

      <footer className="max-w-7xl mx-auto mt-12 pt-6 pb-8 border-t border-gray-800 text-center flex flex-col items-center justify-center">
        <p className="text-gray-500 text-xs">© 2026 專業金融儀表板 Prototype. 數據嚴格同步至 Yahoo Finance。</p>
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