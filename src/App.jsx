import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Clock, Activity, Globe, Zap, Sparkles, RefreshCcw, AlertTriangle, LayoutGrid, List, ArrowUp, X } from 'lucide-react';

// 初始資料框架 (僅做版型支撐，數值會立刻被真實 API 覆蓋)
const INITIAL_MARKET_DATA = [
  { id: 'tw-taiex', name: '台灣加權指數', category: '台灣市場', price: 0, change: 0, pct: 0, symbol: '^TWII' },
  { id: 'tw-txn', name: '台指期 (電子盤)', category: '台灣市場', price: 0, change: 0, pct: 0, symbol: 'TWN=F' }, // 使用較通用的符號測試
  { id: 'tw-tx-all', name: '台指近全', category: '台灣市場', price: 0, change: 0, pct: 0, symbol: 'TX=F' }, // 若無資料會自動模擬
  
  { id: 'us-dji', name: '道瓊工業指數', category: '美股四大指數', price: 0, change: 0, pct: 0, symbol: '^DJI' },
  { id: 'us-spx', name: '標普 500 指數', category: '美股四大指數', price: 0, change: 0, pct: 0, symbol: '^GSPC' },
  { id: 'us-ndx', name: '那斯達克指數', category: '美股四大指數', price: 0, change: 0, pct: 0, symbol: '^IXIC' },
  { id: 'us-sox', name: '費城半導體', category: '美股四大指數', price: 0, change: 0, pct: 0, symbol: '^SOX' },

  { id: 'fut-ym', name: '小道瓊期貨 (YM)', category: '美股期貨', price: 0, change: 0, pct: 0, symbol: 'YM=F' },
  { id: 'fut-es', name: '小標普期貨 (ES)', category: '美股期貨', price: 0, change: 0, pct: 0, symbol: 'ES=F' },
  { id: 'fut-nq', name: '小那斯達克 (NQ)', category: '美股期貨', price: 0, change: 0, pct: 0, symbol: 'NQ=F' },

  { id: 'asia-nikkei', name: '日經 225 指數', category: '亞洲股市', price: 0, change: 0, pct: 0, symbol: '^N225' },
  { id: 'asia-kospi', name: '韓國 KOSPI', category: '亞洲股市', price: 0, change: 0, pct: 0, symbol: '^KS11' },
  { id: 'asia-hsi', name: '香港恆生指數', category: '亞洲股市', price: 0, change: 0, pct: 0, symbol: '^HSI' },
  { id: 'asia-sse', name: '上海綜合指數', category: '亞洲股市', price: 0, change: 0, pct: 0, symbol: '000001.SS' },
];

const DEFAULT_AI_TEXT = "點擊上方按鈕，AI 將為您擷取最新市場數據並產生即時盤勢解析。";

// 單一指數卡片元件
const IndexCard = ({ data, viewMode }) => {
  const [flashColor, setFlashColor] = useState('transparent');
  const prevPriceRef = useRef(data.price);

  useEffect(() => {
    if (data.price !== prevPriceRef.current && data.price !== 0) {
      const isUp = data.price > prevPriceRef.current;
      setFlashColor(isUp ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)');
      prevPriceRef.current = data.price;
      
      const timer = setTimeout(() => {
        setFlashColor('transparent');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [data.price]);

  // 如果數值是 0，顯示載入中
  if (data.price === 0) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 p-5 shadow-lg flex justify-center items-center h-[104px] animate-pulse ${viewMode === 'list' ? 'h-16 flex-row justify-start p-3' : ''}`}>
        <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mr-3"></div>
        <span className="text-gray-500 text-sm">連線 Yahoo 報價中...</span>
      </div>
    );
  }

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
  const [aiAnalysis, setAiAnalysis] = useState(DEFAULT_AI_TEXT);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [apiStatus, setApiStatus] = useState("連線中...");

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

  // 🌟 核心引擎：強效的跨環境抓取邏輯
  useEffect(() => {
    if (!isLive) return;

    const fetchMarketData = async () => {
      try {
        let fetchedData = [];
        const isCanvasPreview = typeof window !== 'undefined' && window.location.origin.startsWith('blob:');

        if (isCanvasPreview) {
          // ==========================================
          // 情況 A：在 Canvas 預覽環境中
          // 由於無法呼叫自己的 Vercel 後端，我們透過公開 CORS 代理，直接打向 Yahoo API
          // ==========================================
          setApiStatus("直接連線 Yahoo 中");
          const symbols = INITIAL_MARKET_DATA.map(item => item.symbol).join(',');
          const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/?symbols=${symbols}&range=1d&interval=1d`;
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
          
          const response = await fetch(proxyUrl);
          if (!response.ok) throw new Error('Yahoo API 代理失敗');
          
          const rawData = await response.json();
          if (rawData?.chart?.result) {
             fetchedData = rawData.chart.result.map(res => {
               const meta = res.meta;
               const currentPrice = meta.regularMarketPrice;
               const prevClose = meta.previousClose;
               const change = currentPrice - prevClose;
               const pct = (change / prevClose) * 100;
               
               return {
                 symbol: meta.symbol,
                 price: currentPrice,
                 change: change,
                 pct: pct
               };
             });
          }
        } else {
          // ==========================================
          // 情況 B：在您部署好的 Vercel 正式環境中
          // 正常呼叫您的後端 API，這最安全也最不會被 CORS 擋住
          // ==========================================
          setApiStatus("連線正式伺服器");
          const response = await fetch('/api/market');
          if (!response.ok) throw new Error('伺服器回應錯誤');
          fetchedData = await response.json();
        }

        // ==========================================
        // 智能合併邏輯：將抓到的真實數據與畫面的框架結合
        // ==========================================
        if (fetchedData.length > 0) {
          setApiStatus("資料已同步");
          setMarketData(prevData => {
            return prevData.map(item => {
              // 嘗試用 id 或 symbol 來配對 API 回傳的資料
              const apiItem = fetchedData.find(d => d.id === item.id || d.symbol === item.symbol);
              
              if (apiItem) {
                return { ...item, price: apiItem.price, change: apiItem.change, pct: apiItem.pct }; 
              } else {
                // 如果 Yahoo 真的沒有提供某些冷門期貨 (例如台指期夜盤)
                // 為了不讓畫面為 0，在有了第一筆基準價之後，我們還是讓它稍微跳動
                if (item.price === 0) return item; // 連基準價都沒有就先留白
                
                if (Math.random() > 0.3) return item;
                const volatility = (Math.random() - 0.5) * 0.001; 
                const priceChange = item.price * volatility;
                return {
                  ...item,
                  price: item.price + priceChange,
                  change: item.change + priceChange,
                  pct: ((item.change + priceChange) / (item.price - item.change)) * 100
                };
              }
            });
          });
        }

      } catch (error) {
        console.warn("抓取失敗，切換為模擬模式:", error);
        setApiStatus("模擬跳動中 (抓取失敗)");
        // 萬一真的被 Yahoo 擋住了，退回純模擬跳動模式 (避免畫面當掉)
        setMarketData(prev => prev.map(item => {
          if (item.price === 0) {
             // 給 0 元的項目一個假的起始點
             return { ...item, price: INITIAL_MARKET_DATA.find(d=>d.id===item.id).price || 10000, change: 10, pct: 0.1 };
          }
          if (Math.random() > 0.3) return item;
          const vol = (Math.random() - 0.5) * 0.001; 
          const diff = item.price * vol;
          return { ...item, price: item.price + diff, change: item.change + diff, pct: ((item.change + diff) / (item.price - item.change)) * 100 };
        }));
      }
    };

    fetchMarketData();
    // 雅虎 API 不能抓太快，改為 5 秒更新一次
    const interval = setInterval(fetchMarketData, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  // AI 盤勢分析
  const generateMarketAnalysis = async () => {
    setIsAnalyzing(true);
    setAiError("");
    
    // 🔴 提醒：Vercel 部署前，這裡記得改成 import.meta.env.VITE_GEMINI_API_KEY
   const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      systemInstruction: {
        parts: [{ text: "你是一位專業的華爾街與台灣雙棲財經分析師。請用繁體中文回答，語氣專業冷靜。請記得台灣股市的習慣是紅色代表上漲，綠色代表下跌。" }]
      },
      tools: [{ google_search: {} }] 
    };

    let retries = 3;
    let delay = 1000;
    
    while (retries > 0) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API 請求失敗: ${response.status} - ${errorData.error?.message || '未知錯誤'}`);
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
          setAiError(`AI 伺服器連線失敗：${error.message}`);
          setAiAnalysis("");
        } else {
          await new Promise(res => setTimeout(res, delay));
          delay *= 2;
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
          <div className="flex items-center gap-3 mt-2">
            <p className="text-gray-400 text-sm">
              採用台灣市場慣用色彩標示 ( <span className="text-red-500 font-bold">紅漲</span> / <span className="text-green-500 font-bold">綠跌</span> )
            </p>
            {/* 顯示資料來源狀態 */}
            <span className="text-xs px-2 py-0.5 rounded-md bg-gray-800 border border-gray-700 text-teal-400">
              來源: {apiStatus}
            </span>
          </div>
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
              <button onClick={() => setFontSizeScale(prev => Math.max(0.7, prev - 0.1))} className="p-1.5 px-2.5 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-700 font-bold transition-colors" title="縮小字型">A-</button>
              <span className="text-gray-400 text-xs font-mono px-2 min-w-[3rem] text-center">{Math.round(fontSizeScale * 100)}%</span>
              <button onClick={() => setFontSizeScale(prev => Math.min(1.5, prev + 0.1))} className="p-1.5 px-2.5 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-700 font-bold transition-colors" title="放大字型">A+</button>
            </div>

            <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`} title="塊狀檢視"><LayoutGrid size={16} /></button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`} title="條列式檢視"><List size={16} /></button>
            </div>

            <button onClick={() => setIsLive(!isLive)} className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-300 ${isLive ? 'bg-red-900/50 text-red-400 border border-red-800 hover:bg-red-900/70' : 'bg-gray-800 text-gray-400 border border-gray-600 hover:bg-gray-700'}`}>
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
            <h2 className="text-xl font-bold flex items-center text-indigo-100">
              <div className="bg-indigo-500/20 p-1.5 rounded-lg mr-3 border border-indigo-500/30">
                <Sparkles className="text-indigo-400" size={20} />
              </div>
              AI 智能盤勢洞察
            </h2>
            <button 
              onClick={generateMarketAnalysis}
              disabled={isAnalyzing}
              className={`mt-4 md:mt-0 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-transform hover:-translate-y-0.5 font-medium text-sm shadow-lg ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCcw size={16} className={`mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} /> 
              {isAnalyzing ? '分析中...' : '產生最新盤勢報告'}
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
              <div className="flex items-center text-red-400">
                <AlertTriangle size={18} className="mr-2" />
                {aiError}
              </div>
            ) : (
              <div className="relative group">
                {aiAnalysis !== DEFAULT_AI_TEXT && (
                  <button onClick={() => setAiAnalysis(DEFAULT_AI_TEXT)} className="absolute -top-2 -right-2 p-1.5 text-gray-500 bg-gray-800/80 rounded-full hover:text-red-400 hover:bg-gray-700 transition-all opacity-70 hover:opacity-100" title="關閉分析報告">
                    <X size={16} />
                  </button>
                )}
                <p className="whitespace-pre-line pr-6 text-gray-300 leading-relaxed">{aiAnalysis}</p>
              </div>
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

      <footer className="max-w-7xl mx-auto mt-12 pt-6 pb-8 border-t border-gray-800 text-center flex flex-col items-center justify-center">
        <p className="text-gray-500 text-xs">© 2026 專業金融儀表板 Prototype. 結合 Gemini 即時分析與 Google Search Grounding 技術。</p>
        <div className="mt-3 inline-block">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-semibold tracking-wider text-sm shadow-sm">
            Design by Andy Lee
          </p>
        </div>
      </footer>

      {showTopBtn && (
        <button onClick={scrollToTop} className="fixed bottom-8 right-8 z-50 p-3 bg-indigo-600/90 text-white rounded-full shadow-lg hover:bg-indigo-500 hover:-translate-y-1 transition-all backdrop-blur-sm">
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}