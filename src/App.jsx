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

  // 條列式檢視 (List View)
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

  // 塊狀卡片檢視 (Grid View - 預設)
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

// 主儀表板元件
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

  // 字型縮放
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSizeScale * 100}%`;
    return () => {
      document.documentElement.style.fontSize = '100%';
    };
  }, [fontSizeScale]);

  // 監聽滾動事件，控制「回頁首」按鈕
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 真實 API 報價引擎與 fallback 機制
  useEffect(() => {
    if (!isLive) return;

    const fetchMarketData = async () => {
      try {
        if (typeof window !== 'undefined' && window.location.origin.startsWith('blob:')) {
          throw new Error('Fallback to mock engine'); 
        }

        const response = await fetch('/api/market');
        if (!response.ok) throw new Error('網路回應錯誤');
        
        const data = await response.json();
        if (data && data.length > 0) {
          setMarketData(data);
        }
      } catch (error) {
        // Fallback: 模擬跳動
        setMarketData(prevData => {
          return prevData.map(item => {
            if (Math.random() > 0.3) return item;
            const volatility = (Math.random() - 0.5) * 0.001; 
            const priceChange = item.price * volatility;
            const newPrice = item.price + priceChange;
            const newChange = item.change + priceChange;
            const newPct = (newChange / (item.price - item.change)) * 100;

            return {
              ...item,
              price: newPrice,
              change: newChange,
              pct: newPct
            };
          });
        });
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  // 呼叫 Gemini API 進行盤勢分析
  const generateMarketAnalysis = async () => {
    setIsAnalyzing(true);
    setAiError("");
    
    // ==========================================
    // ⚠️ 大師特別提醒：Vercel 部署注意事項！
    // 為了讓右側預覽畫面不報錯，此處必須為空字串。
    // 在您要推送到 Github/Vercel 之前，請在您的本機電腦上把下面這行改成：
    // const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    // ==========================================

   const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    const marketSummary = marketData.map(d => 
      `${d.name}: ${d.price.toFixed(2)} (${d.change >= 0 ? '+' : ''}${d.pct.toFixed(2)}%)`
    ).join('\n');

    const promptText = `請根據以下我提供的「目前全球主要股市與期貨報價」，並結合你所能搜尋到的最新國際財經新聞（例如聯準會動態、重要經濟數據、大型科技股消息等），給出一份約 150-200 字的專業盤勢分析與總結。

    【目前即時報價】
    ${marketSummary}

    請注意：
    1. 語氣要像專業的總體經濟與股市分析師。
    2. 點出領漲或領跌的板塊，並結合最新新聞推測可能的原因。
    3. 結尾給出一個簡短的短線觀察重點。
    4. 請使用繁體中文。`;

    // 使用目前最穩定強大的 preview 版本
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      systemInstruction: {
        parts: [{ text: "你是一位專業的華爾街與台灣雙棲財經分析師。請用繁體中文回答，語氣專業冷靜。請記得台灣股市的習慣是紅色代表上漲，綠色代表下跌。" }]
      },
      tools: [{ google_search: {} }] 
    };

    let retries = 5;
    let delay = 1000;
    
    while (retries > 0) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          throw new Error(`API 請求失敗: ${response.status}`);
        }
        
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (text) {
          setAiAnalysis(text.replace(/\*\*/g, ''));
          break;
        } else {
          throw new Error("無法解析 AI 回應");
        }
      } catch (error) {
        retries--;
        console.error("AI 分析錯誤:", error);
        if (retries === 0) {
          setAiError("抱歉，目前連線 AI 伺服器發生錯誤，請稍後再試。");
          setAiAnalysis("");
        } else {
          await new Promise(res => setTimeout(res, delay));
          delay *= 2; // 指數退避重試
        }
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
          <p className="text-gray-400 mt-2 text-sm flex items-center">
            採用台灣市場慣用色彩標示 ( <span className="text-red-500 mx-1 font-bold">紅漲</span> / <span className="text-green-500 mx-1 font-bold">綠跌</span> )
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col items-end">
          <div className="flex items-center bg-gray-800 rounded-full px-4 py-2 border border-gray-700 shadow-inner">
            <Clock size={16} className="text-gray-400 mr-2" />
            <span className="font-mono text-sm tracking-wider text-teal-100">
              {currentTime.toLocaleDateString('zh-TW')} {currentTime.toLocaleTimeString('zh-TW')}
            </span>
          </div>
          
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700">
              <button 
                onClick={() => setFontSizeScale(prev => Math.max(0.7, prev - 0.1))}
                className="p-1.5 px-2.5 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-700 font-bold transition-colors"
                title="縮小字型"
              >
                A-
              </button>
              <span className="text-gray-400 text-xs font-mono px-2 min-w-[3rem] text-center">
                {Math.round(fontSizeScale * 100)}%
              </span>
              <button 
                onClick={() => setFontSizeScale(prev => Math.min(1.5, prev + 0.1))}
                className="p-1.5 px-2.5 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-700 font-bold transition-colors"
                title="放大字型"
              >
                A+
              </button>
            </div>

            <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                title="塊狀檢視"
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                title="條列式檢視"
              >
                <List size={16} />
              </button>
            </div>

            <button 
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-300 ${
                isLive ? 'bg-red-900/50 text-red-400 border border-red-800 hover:bg-red-900/70' : 'bg-gray-800 text-gray-400 border border-gray-600 hover:bg-gray-700'
              }`}
            >
              <Zap size={14} className={`mr-1 ${isLive ? 'animate-pulse' : ''}`} />
              {isLive ? 'LIVE 報價連線中' : '報價已暫停'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        <section className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 relative z-10">
            <div className="flex items-center">
              <div className="bg-indigo-500/20 p-2 rounded-lg mr-3 border border-indigo-500/30">
                <Sparkles className="text-indigo-400" size={24} />
              </div>
              <h2 className="text-xl font-bold text-indigo-100">AI 智能盤勢洞察</h2>
            </div>
            <button 
              onClick={generateMarketAnalysis}
              disabled={isAnalyzing}
              className={`mt-4 md:mt-0 flex items-center px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg ${
                isAnalyzing 
                  ? 'bg-indigo-800/50 text-indigo-300 cursor-not-allowed border border-indigo-700/50' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border border-indigo-400/50 hover:shadow-indigo-500/25 hover:-translate-y-0.5'
              }`}
            >
              <RefreshCcw size={16} className={`mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? '✨ AI 正在分析即時盤勢...' : '✨ 產生最新盤勢報告'}
            </button>
          </div>

          <div className="bg-gray-900/60 rounded-xl p-5 border border-indigo-500/20 text-gray-300 leading-relaxed text-sm md:text-base min-h-[100px] relative z-10 backdrop-blur-sm">
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
              <div className="flex items-center text-red-400">
                <AlertTriangle size={18} className="mr-2" />
                {aiError}
              </div>
            ) : (
              <p className="whitespace-pre-line">{aiAnalysis}</p>
            )}
          </div>
        </section>

        {categories.map(category => (
          <section key={category}>
            <div className="flex items-center mb-4">
              <div className="h-6 w-1.5 bg-blue-500 rounded-full mr-3"></div>
              <h2 className="text-xl font-bold text-gray-200">{category}</h2>
            </div>
            
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col space-y-2"}>
              {marketData
                .filter(item => item.category === category)
                .map(item => (
                  <IndexCard key={item.id} data={item} viewMode={viewMode} />
                ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-800 text-center text-gray-500 text-xs">
        <p>© 2026 專業金融儀表板 Prototype. 結合 Gemini 即時分析與 Google Search Grounding 技術。</p>
      </footer>

      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-indigo-600/90 text-white rounded-full shadow-lg hover:bg-indigo-500 hover:-translate-y-1 hover:shadow-indigo-500/50 transition-all duration-300 backdrop-blur-sm focus:outline-none"
          title="回到頁首"
          aria-label="回到頁首"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}