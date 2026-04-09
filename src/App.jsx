import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Clock, Activity, Globe, Zap, Sparkles, RefreshCcw, AlertTriangle, LayoutGrid, List, ArrowUp, X, ExternalLink, Lightbulb, Target, Sun, Moon } from 'lucide-react';

// 初始資料：作為畫面初次載入的版型框架
const INITIAL_MARKET_DATA = [
  { id: 'tw-taiex', symbol: '^TWII', name: '台灣加權指數', category: '台灣市場', price: 0, change: 0, pct: 0 },
  { id: 'tw-tsm', symbol: 'TSM', name: '台積電 ADR', category: '台灣市場', price: 0, change: 0, pct: 0 },
  { id: 'tw-usdtwd', symbol: 'TWD=X', name: '美元兌台幣', category: '台灣市場', price: 0, change: 0, pct: 0 },
  
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

const DEFAULT_AI_TEXT = "點擊上方按鈕，AI 將為您擷取最新市場數據並產生即時盤勢解析或投資建議。";

// 單一指數卡片元件
const IndexCard = ({ data, viewMode, isFirstLoad }) => {
  const [flashColor, setFlashColor] = useState('transparent');
  const prevPriceRef = useRef(data.price);

  useEffect(() => {
    if (data.price !== prevPriceRef.current && data.price !== 0) {
      const isUp = data.price > prevPriceRef.current;
      setFlashColor(isUp ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)');
      prevPriceRef.current = data.price;
      
      const timer = setTimeout(() => setFlashColor('transparent'), 500);
      return () => clearTimeout(timer);
    }
  }, [data.price]);

  if (data.price === 0) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-sm dark:shadow-lg flex justify-center items-center h-[116px] ${isFirstLoad ? 'animate-pulse' : ''} ${viewMode === 'list' ? 'h-[72px] flex-row justify-start p-3' : ''}`}>
        {isFirstLoad ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mr-3"></div>
            <span className="text-gray-500 text-sm">同步雅虎報價中...</span>
          </>
        ) : (
          <span className="text-gray-500 text-sm">雅虎目前暫無報價</span>
        )}
      </div>
    );
  }

  const isPositive = data.change >= 0;
  const colorClass = isPositive ? 'text-red-500' : 'text-green-500 dark:text-green-400';
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const sign = isPositive ? '+' : '';

  const isCurrency = data.symbol === 'TWD=X';
  const fractionDigits = isCurrency ? 3 : 2;

  const formatNumber = (num) => Number(num).toLocaleString('en-US', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
  
  const yahooLink = `https://finance.yahoo.com/quote/${data.symbol}`;

  if (viewMode === 'list') {
    return (
      <a 
        href={yahooLink}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 shadow-sm dark:shadow transition-all duration-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20 flex items-center justify-between"
        style={flashColor !== 'transparent' ? { backgroundColor: flashColor, transition: 'background-color 0.3s ease-out' } : { transition: 'background-color 0.3s ease-out' }}
        title="點擊前往 Yahoo Finance 查看詳情"
      >
        <div className="flex items-center w-1/3 sm:w-1/4">
          <Activity size={16} className="text-gray-400 dark:text-gray-500 mr-2 hidden sm:block group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
          <h3 className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{data.name}</h3>
        </div>
        <div className={`text-lg sm:text-2xl font-bold tracking-tight w-1/4 text-right ${colorClass}`}>{formatNumber(data.price)}</div>
        <div className={`flex flex-col sm:flex-row items-end sm:items-center justify-end w-1/3 sm:w-1/2 text-xs sm:text-sm font-semibold ${colorClass}`}>
          <div className="flex items-center"><Icon size={14} className="mr-1 hidden sm:block" /><span className="sm:w-20 text-right">{sign}{formatNumber(data.change)}</span></div>
          <span className="hidden sm:inline mx-2 text-gray-300 dark:text-gray-600">|</span>
          <span className="sm:w-16 text-right mt-1 sm:mt-0">{sign}{data.pct.toFixed(2)}%</span>
          <ExternalLink size={14} className="ml-3 text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
        </div>
      </a>
    );
  }

  return (
    <a 
      href={yahooLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-sm dark:shadow-lg transition-all duration-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20 hover:-translate-y-1"
      style={flashColor !== 'transparent' ? { backgroundColor: flashColor, transition: 'background-color 0.3s ease-out' } : { transition: 'background-color 0.3s ease-out' }}
      title="點擊前往 Yahoo Finance 查看詳情"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-700 dark:text-gray-300 font-medium text-lg tracking-wide group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{data.name}</h3>
        <ExternalLink size={16} className="text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div className="flex flex-col">
          <span className={`text-3xl font-bold tracking-tight ${colorClass}`}>{formatNumber(data.price)}</span>
          <div className={`flex items-center mt-1 text-sm font-semibold ${colorClass}`}>
            <Icon size={16} className="mr-1" />
            <span>{sign}{formatNumber(data.change)}</span><span className="mx-2 text-gray-300 dark:text-gray-600">|</span><span>{sign}{data.pct.toFixed(2)}%</span>
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
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [apiStatus, setApiStatus] = useState("等待同步...");
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // 🌟 主題狀態管理 (預設啟用暗色模式，維持原有視覺)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // AI 狀態管理
  const [aiContent, setAiContent] = useState(DEFAULT_AI_TEXT);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisType, setAiAnalysisType] = useState(''); // 'insight' 或 'advice'
  const [aiError, setAiError] = useState("");

  // 根據狀態動態切換 document 主題
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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

  // Yahoo 同步引擎
  useEffect(() => {
    if (!isLive) {
      setApiStatus("同步已暫停");
      return;
    }

    const fetchYahooData = async () => {
      try {
        setApiStatus("連線 Yahoo 同步中...");
        let fetchedQuotes = [];
        const symbols = INITIAL_MARKET_DATA.map(item => item.symbol).join(',');
        const targetUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;

        let backendSuccess = false;
        const isLocalOrPreview = typeof window !== 'undefined' && 
          (window.location.origin.startsWith('blob:') || window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'));

        if (!isLocalOrPreview) {
          try {
            const res = await fetch('/api/market');
            if (res.ok) {
              fetchedQuotes = await res.json();
              backendSuccess = true;
            }
          } catch (e) {
            console.warn("後端 API 連線失敗，切換備用方案...");
          }
        }

        if (!backendSuccess) {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
          const response = await fetch(proxyUrl);
          
          if (response.ok) {
            const data = await response.json();
            fetchedQuotes = data.quoteResponse?.result || [];
          } else {
            throw new Error('代理伺服器連線失敗');
          }
        }

        if (fetchedQuotes.length > 0) {
          setMarketData(prev => prev.map(item => {
            const quote = fetchedQuotes.find(q => q.symbol === item.symbol || q.id === item.id);
            if (quote) {
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

    fetchYahooData().finally(() => setIsFirstLoad(false));
    
    const interval = setInterval(fetchYahooData, 8000); 
    return () => clearInterval(interval);
  }, [isLive]);

  // AI 雙模式請求函數
  const fetchAiResponse = async (type) => {
    setIsAnalyzing(true);
    setAiError("");
    setAiAnalysisType(type);
    
    // 🔴 為了避免在非 Vercel 環境中報錯，此處留空。
    // 在推送到 Vercel 前，若要啟用 AI 分析，請手動將下方改為：
    // const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
   const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 
    
    if (!apiKey) {
      setAiError("AI 功能已被停用：請在程式碼中設定您的 Gemini API Key。");
      setIsAnalyzing(false);
      return;
    }

    const validData = marketData.filter(d => d.price > 0);
    const marketSummary = validData.map(d => 
      `${d.name}: ${d.price.toFixed(2)} (${d.change >= 0 ? '+' : ''}${d.pct.toFixed(2)}%)`
    ).join('\n');

    let promptText = "";
    if (type === 'insight') {
      promptText = `請根據以下我提供的「目前雅虎財經最新全球股市與期貨報價」，並結合你所能搜尋到的最新國際財經新聞，給出一份約 150-200 字的專業盤勢分析與總結。
      【目前即時報價】\n${marketSummary}\n
      請注意：語氣專業冷靜，點出領漲跌板塊及可能原因，使用繁體中文。`;
    } else if (type === 'advice') {
      promptText = `請根據以下我提供的「目前雅虎財經最新全球股市報價」，扮演一位專業理財顧問，提供最新的投資策略建議。
      【目前即時報價】\n${marketSummary}\n
      請注意：
      1. 請分別針對「積極型投資人」與「保守型投資人」給出簡短明確的資金配置或標的關注建議。
      2. 語氣要有自信但保持客觀中立，使用繁體中文，約 200 字。
      3. 結尾務必加上免責聲明：「注意：本建議由 AI 生成，僅供參考，不構成實際投資勸誘，投資人應自負盈虧。」`;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      systemInstruction: { parts: [{ text: "你是專業財經分析師與理財顧問。請記得台灣股市紅漲綠跌。" }] },
      tools: [{ google_search: {} }] 
    };

    let retries = 3;
    while (retries > 0) {
      try {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) { setAiContent(text.replace(/\*\*/g, '')); break; }
      } catch (error) {
        retries--;
        if (retries === 0) { setAiError(`AI 連線失敗：請確認 API Key 是否正確設定`); setAiContent(DEFAULT_AI_TEXT); }
        else await new Promise(r => setTimeout(r, 1000));
      }
    }
    setIsAnalyzing(false);
  };

  const categories = [...new Set(marketData.map(item => item.category))];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6 font-sans transition-colors duration-300">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-300 dark:border-gray-700 pb-4 transition-colors duration-300">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300">
            <Globe className="mr-3 text-blue-600 dark:text-blue-400" size={32} />
            全球股市與期貨即時監控
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-gray-500 dark:text-gray-400 text-sm">採用台灣市場慣用色彩標示 ( <span className="text-red-500 font-bold">紅漲</span> / <span className="text-green-500 dark:text-green-400 font-bold">綠跌</span> )</p>
            <span className={`text-xs px-2 py-0.5 rounded-md border transition-colors ${apiStatus.includes('✅') ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-teal-600 dark:text-teal-400 animate-pulse'}`}>
              狀態: {apiStatus}
            </span>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col items-end">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-4 py-2 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-inner transition-colors duration-300">
            <Clock size={16} className="text-gray-400 mr-2" />
            <span className="font-mono text-sm tracking-wider text-teal-700 dark:text-teal-100">{currentTime.toLocaleDateString('zh-TW')} {currentTime.toLocaleTimeString('zh-TW')}</span>
          </div>
          
          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
            {/* 🌟 新增：主題切換按鈕 */}
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                title={isDarkMode ? "切換亮色模式" : "切換暗色模式"}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
              <button onClick={() => setFontSizeScale(prev => Math.max(0.7, prev - 0.1))} className="p-1.5 px-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold transition-colors">A-</button>
              <span className="text-gray-500 dark:text-gray-400 text-xs font-mono px-2 text-center">{Math.round(fontSizeScale * 100)}%</span>
              <button onClick={() => setFontSizeScale(prev => Math.min(1.5, prev + 0.1))} className="p-1.5 px-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold transition-colors">A+</button>
            </div>

            <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}><LayoutGrid size={16} /></button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}><List size={16} /></button>
            </div>

            <button onClick={() => setIsLive(!isLive)} className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full transition-all shadow-sm ${isLive ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-200 dark:hover:bg-indigo-800/60' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600'}`}>
              <Zap size={14} className={`mr-1 ${isLive ? 'animate-pulse' : ''}`} />{isLive ? '雅虎同步中' : '同步已暫停'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        <section className="bg-indigo-50/80 dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-purple-900/40 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-6 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-200/50 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-5 relative z-10">
            <h2 className="text-xl font-bold flex items-center text-indigo-900 dark:text-indigo-100 mb-4 lg:mb-0">
              <div className="bg-indigo-100 dark:bg-indigo-500/20 p-1.5 rounded-lg mr-3 border border-indigo-200 dark:border-indigo-500/30">
                <Sparkles className="text-indigo-600 dark:text-indigo-400" size={20} />
              </div>
              AI 智能洞察與理財顧問
            </h2>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => fetchAiResponse('insight')} 
                disabled={isAnalyzing} 
                className={`flex items-center px-4 py-2 rounded-lg transition-all font-medium text-sm shadow-sm dark:shadow-lg
                  ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}
                  ${aiAnalysisType === 'insight' ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-indigo-50 dark:ring-offset-gray-900' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-600/80 dark:text-indigo-100 dark:hover:bg-indigo-500'}
                `}
              >
                <RefreshCcw size={16} className={`mr-2 ${isAnalyzing && aiAnalysisType === 'insight' ? 'animate-spin' : ''}`} />
                {isAnalyzing && aiAnalysisType === 'insight' ? '分析中...' : '📊 產生盤勢分析'}
              </button>
              
              <button 
                onClick={() => fetchAiResponse('advice')} 
                disabled={isAnalyzing} 
                className={`flex items-center px-4 py-2 rounded-lg transition-all font-medium text-sm shadow-sm dark:shadow-lg
                  ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}
                  ${aiAnalysisType === 'advice' ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 ring-offset-2 ring-offset-indigo-50 dark:ring-offset-gray-900' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-600/80 dark:text-emerald-50 dark:hover:bg-emerald-500'}
                `}
              >
                <Target size={16} className={`mr-2 ${isAnalyzing && aiAnalysisType === 'advice' ? 'animate-pulse text-emerald-200' : ''}`} />
                {isAnalyzing && aiAnalysisType === 'advice' ? '思考策略中...' : '💡 獲取投資建議'}
              </button>
            </div>
          </div>

          <div className={`rounded-xl p-5 border min-h-[120px] relative z-10 backdrop-blur-sm transition-colors duration-500 shadow-inner
            ${aiAnalysisType === 'advice' ? 'bg-white/80 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-500/30' : 'bg-white/80 border-indigo-200 dark:bg-gray-900/60 dark:border-indigo-500/20'}
          `}>
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-3">
                <div className="flex space-x-2">
                  <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${aiAnalysisType === 'advice' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-indigo-600 dark:bg-indigo-500'}`} style={{ animationDelay: '0ms' }}></div>
                  <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${aiAnalysisType === 'advice' ? 'bg-teal-500 dark:bg-teal-400' : 'bg-purple-600 dark:bg-purple-500'}`} style={{ animationDelay: '150ms' }}></div>
                  <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${aiAnalysisType === 'advice' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-indigo-600 dark:bg-indigo-500'}`} style={{ animationDelay: '300ms' }}></div>
                </div>
                <p className={`text-sm animate-pulse font-medium ${aiAnalysisType === 'advice' ? 'text-emerald-700 dark:text-emerald-400' : 'text-indigo-700 dark:text-indigo-400'}`}>
                  {aiAnalysisType === 'advice' ? '正在為您量身打造投資策略...' : '正在整合報價資料與即時新聞...'}
                </p>
              </div>
            ) : aiError ? (
              <div className="flex items-center text-red-600 dark:text-red-400 font-medium"><AlertTriangle size={18} className="mr-2" />{aiError}</div>
            ) : (
              <div className="relative group w-full">
                {aiContent !== DEFAULT_AI_TEXT && (
                  <button onClick={() => {setAiContent(DEFAULT_AI_TEXT); setAiAnalysisType('');}} className="absolute -top-2 -right-2 md:top-0 md:right-0 p-1.5 text-gray-500 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:border-gray-600 dark:hover:text-red-400 dark:hover:bg-gray-700 rounded-full transition-all shadow-sm z-20" title="清除內容"><X size={16} /></button>
                )}
                <div className="flex items-start">
                  {aiAnalysisType === 'advice' && <Lightbulb className="text-emerald-600 dark:text-emerald-400 mr-3 mt-1 flex-shrink-0" size={24} />}
                  <div className="flex-1 w-full">
                    <p className="whitespace-pre-line pr-6 md:pr-8 text-gray-800 dark:text-gray-300 leading-relaxed font-medium">{aiContent}</p>
                    
                    {/* 🌟 新增：文章底部的明顯關閉按鈕 */}
                    {aiContent !== DEFAULT_AI_TEXT && (
                      <div className="mt-6 flex justify-end border-t border-gray-200 dark:border-gray-700/50 pt-4">
                        <button 
                          onClick={() => {setAiContent(DEFAULT_AI_TEXT); setAiAnalysisType('');}} 
                          className="px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center shadow-sm"
                        >
                          <X size={16} className="mr-1.5" /> 完成閱讀並關閉
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {categories.map(category => (
          <section key={category}>
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800 dark:text-gray-200 transition-colors">
              <div className="w-1.5 h-6 bg-blue-600 dark:bg-blue-500 rounded-full mr-3"></div>{category}
            </h2>
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col space-y-2"}>
              {marketData.filter(item => item.category === category).map(item => <IndexCard key={item.id} data={item} viewMode={viewMode} isFirstLoad={isFirstLoad} />)}
            </div>
          </section>
        ))}
      </main>

      <footer className="max-w-7xl mx-auto mt-12 pt-6 pb-8 border-t border-gray-300 dark:border-gray-800 text-center flex flex-col items-center justify-center transition-colors">
        <p className="text-gray-500 text-xs">© 2026 專業金融儀表板 Prototype. 數據嚴格同步至 Yahoo Finance。</p>
        <div className="mt-3 inline-block">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400 font-semibold tracking-wider text-sm shadow-sm">Designed by Andy Lee</p>
        </div>
      </footer>

      {showTopBtn && (
        <button onClick={scrollToTop} className="fixed bottom-8 right-8 z-50 p-3 bg-indigo-600/90 text-white rounded-full shadow-lg hover:bg-indigo-500 hover:-translate-y-1 transition-all backdrop-blur-sm"><ArrowUp size={24} /></button>
      )}
    </div>
  );
}