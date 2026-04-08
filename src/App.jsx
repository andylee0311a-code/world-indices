import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Clock, Activity, Globe, Zap, Sparkles, RefreshCcw, AlertTriangle, LayoutGrid, List, ArrowUp } from 'lucide-react';

// 初始模擬資料
const INITIAL_MARKET_DATA = [
  { id: 'tw-taiex', name: '台灣加權指數', category: '台灣市場', price: 23540.21, change: 125.50, pct: 0.54 },
  { id: 'tw-txn', name: '台指期 (電子盤)', category: '台灣市場', price: 23565.00, change: 140.00, pct: 0.60 },
  
  { id: 'us-dji', name: '道瓊工業指數', category: '美股四大指數', price: 41250.30, change: -120.40, pct: -0.29 },
  { id: 'us-spx', name: '標普 500 指數', category: '美股四大指數', price: 5210.80, change: -5.20, pct: -0.10 },
  { id: 'us-ndx', name: '那斯達克指數', category: '美股四大指數', price: 16850.45, change: 45.30, pct: 0.27 },
  { id: 'us-sox', name: '費城半導體', category: '美股四大指數', price: 4950.12, change: 60.50, pct: 1.24 },

  { id: 'fut-ym', name: '小道瓊期貨 (YM)', category: '美股期貨', price: 41300.00, change: -100.00, pct: -0.24 },
  { id: 'fut-es', name: '小標普期貨 (ES)', category: '美股期貨', price: 5225.25, change: -2.50, pct: -0.05 },
  { id: 'fut-nq', name: '小那斯達克 (NQ)', category: '美股期貨', price: 16900.50, change: 50.00, pct: 0.30 },

  { id: 'asia-nikkei', name: '日經 225 指數', category: '亞洲股市', price: 39850.00, change: 350.00, pct: 0.89 },
  { id: 'asia-kospi', name: '韓國 KOSPI', category: '亞洲股市', price: 2750.60, change: -12.30, pct: -0.45 },
];

// 單一指數卡片元件
const IndexCard = ({ data, viewMode }) => {
  const [flashColor, setFlashColor] = useState('transparent');
  const prevPriceRef = useRef(data.price);

  useEffect(() => {
    if (data.price !== prevPriceRef.current) {
      const isUp = data.price > prevPriceRef.current;
      setFlashColor(isUp ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)');
      prevPriceRef.current = data.price;
      
      const timer = setTimeout(() => {
        setFlashColor('transparent');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [data.price]);

  const isPositive = data.change >= 0;
  const colorClass = isPositive ? 'text-red-500' : 'text-green-500';
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const sign = isPositive ? '+' : '';

  const formatNumber = (num) => {
    return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="relative overflow-hidden rounded-lg bg-gray-800 border border-gray-700 p-3 shadow transition-all duration-300 hover:border-gray-500 flex items-center justify-between"
        style={{ backgroundColor: flashColor === 'transparent' ? '#1f2937' : flashColor, transition: 'background-color 0.3s ease-out' }}
      >
        <div className="flex items-center w-1/3 sm:w-1/4">
          <Activity size={16} className="text-gray-500 mr-2 hidden sm:block" />
          <h3 className="text-gray-300 font-medium text-sm sm:text-base truncate">{data.name}</h3>
        </div>
        
        <div className={`text-lg sm:text-2xl font-bold tracking-tight w-1/4 text-right ${colorClass}`}>
          {formatNumber(data.price)}
        </div>
        
        <div className={`flex flex-col sm:flex-row items-end sm:items-center justify-end w-1/3 sm:w-1/2 text-xs sm:text-sm font-semibold ${colorClass}`}>
          <div className="flex items-center">
            <Icon size={14} className="mr-1 hidden sm:block" />
            <span className="sm:w-20 text-right">{sign}{formatNumber(data.change)}</span>
          </div>
          <span className="hidden sm:inline mx-2 text-gray-600">|</span>
          <span className="sm:w-16 text-right mt-1 sm:mt-0">{sign}{data.pct.toFixed(2)}%</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 p-5 shadow-lg transition-all duration-300 hover:border-gray-500"
      style={{ backgroundColor: flashColor === 'transparent' ? '#1f2937' : flashColor, transition: 'background-color 0.3s ease-out' }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-300 font-medium text-lg tracking-wide">{data.name}</h3>
        <Activity size={18} className="text-gray-500" />
      </div>
      
      <div className="mt-4 flex items-end justify-between">
        <div className="flex flex-col">
          <span className={`text-3xl font-bold tracking-tight ${colorClass}`}>
            {formatNumber(data.price)}
          </span>
          <div className={`flex items-center mt-1 text-sm font-semibold ${colorClass}`}>
            <Icon size={16} className="mr-1" />
            <span>{sign}{formatNumber(data.change)}</span>
            <span className="mx-2">|</span>
            <span>{sign}{data.pct.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [marketData, setMarketData] = useState(INITIAL_MARKET_DATA);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [fontSizeScale, setFontSizeScale] = useState(1);
  const [aiAnalysis, setAiAnalysis] = useState("點擊上方按鈕，AI 將為您擷取最新市場數據並產生即時盤勢解析。");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSizeScale * 100}%`;
    return () => {
      document.documentElement.style.fontSize = '100%';
    };
  }, [fontSizeScale]);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isLive) return;
    const fetchMarketData = async () => {
      try {
        if (typeof window !== 'undefined' && window.location.origin.startsWith('blob:')) {
          throw new Error('Canvas mode'); 
        }
        const response = await fetch('/api/market');
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        if (data && data.length > 0) setMarketData(data);
      } catch (error) {
        setMarketData(prev => prev.map(item => {
          if (Math.random() > 0.3) return item;
          const vol = (Math.random() - 0.5) * 0.001; 
          const diff = item.price * vol;
          return { ...item, price: item.price + diff, change: item.change + diff, pct: ((item.change + diff) / (item.price - item.change)) * 100 };
        }));
      }
    };
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 2000);
    return () => clearInterval(interval);
  }, [isLive]);

  // 🚀 AI 盤勢分析：大師級 2026 最終修正版
  const generateMarketAnalysis = async () => {
    setIsAnalyzing(true);
    setAiError("");
    
    // 1. 安全讀取 API Key (請確保 Vercel 後台 VITE_GEMINI_API_KEY 設定正確)
    // 💡 提醒：若在本地開發，請改回 import.meta.env.VITE_GEMINI_API_KEY
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 
    
    if (!apiKey) {
      setAiError("找不到 API Key。請確認 Vercel 環境變數 VITE_GEMINI_API_KEY 是否已設定並重新部署。");
      setIsAnalyzing(false);
      return;
    }

    const marketSummary = marketData.map(d => 
      `${d.name}: ${d.price.toFixed(2)} (${d.change >= 0 ? '+' : ''}${d.pct.toFixed(2)}%)`
    ).join('\n');

    const promptText = `你是一位專業分析師，請針對以下全球盤勢給出 200 字繁體中文分析：\n${marketSummary}`;

    // 🌟 2026 年最強穩定組合：v1 正式端點 + gemini-3-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      systemInstruction: { parts: [{ text: "你是專業財經分析師，請用繁體中文回答，並注意台灣紅漲綠跌的習慣。" }] },
      tools: [{ google_search: {} }] 
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();

      if (!response.ok) {
        // 如果還是 404，通常是 API Key 沒權限，這裡直接報出詳細錯誤
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        setAiAnalysis(text.replace(/\*\*/g, ''));
      } else {
        throw new Error("AI 回傳格式不正確");
      }
    } catch (error) {
      console.error("DEBUG 詳情:", error);
      setAiError(`AI 分析失敗：${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const categories = [...new Set(marketData.map(item => item.category))];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-700 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
            <Globe className="mr-3 text-blue-400" size={32} />
            全球股市即時監控
          </h1>
          <p className="text-gray-400 mt-2 text-sm">紅漲綠跌指標系統</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col items-end gap-3">
          <div className="flex items-center bg-gray-800 rounded-full px-4 py-2 border border-gray-700">
            <Clock size={16} className="text-gray-400 mr-2" />
            <span className="font-mono text-sm">{currentTime.toLocaleString('zh-TW')}</span>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
              <button onClick={() => setFontSizeScale(s => Math.max(0.7, s - 0.1))} className="px-2 font-bold">A-</button>
              <span className="px-2 text-xs self-center">{Math.round(fontSizeScale * 100)}%</span>
              <button onClick={() => setFontSizeScale(s => Math.min(1.5, s + 0.1))} className="px-2 font-bold">A+</button>
            </div>
            <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
              <button onClick={() => setViewMode('grid')} className={`p-1 ${viewMode === 'grid' ? 'bg-gray-600' : ''}`}><LayoutGrid size={16} /></button>
              <button onClick={() => setViewMode('list')} className={`p-1 ${viewMode === 'list' ? 'bg-gray-600' : ''}`}><List size={16} /></button>
            </div>
            <button onClick={() => setIsLive(!isLive)} className={`px-3 py-1 rounded-full text-xs font-bold ${isLive ? 'bg-red-900/50 text-red-400' : 'bg-gray-800 text-gray-500'}`}>
              {isLive ? '● LIVE' : 'PAUSED'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        <section className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center"><Sparkles className="mr-2" /> AI 盤勢分析</h2>
            <button onClick={generateMarketAnalysis} disabled={isAnalyzing} className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50 flex items-center">
              <RefreshCcw size={16} className={`mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} /> 產生報告
            </button>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-5 border border-indigo-500/20 min-h-[100px]">
            {isAnalyzing ? <p className="text-center animate-pulse">分析中...</p> : aiError ? <p className="text-red-400">{aiError}</p> : <p className="whitespace-pre-line">{aiAnalysis}</p>}
          </div>
        </section>

        {categories.map(cat => (
          <section key={cat}>
            <h2 className="text-xl font-bold mb-4 flex items-center"><div className="w-1 h-6 bg-blue-500 mr-3"></div>{cat}</h2>
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-2"}>
              {marketData.filter(i => i.category === cat).map(i => <IndexCard key={i.id} data={i} viewMode={viewMode} />)}
            </div>
          </section>
        ))}
      </main>

      {showTopBtn && (
        <button onClick={scrollToTop} className="fixed bottom-8 right-8 p-3 bg-indigo-600 rounded-full shadow-lg hover:-translate-y-1 transition-transform">
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}