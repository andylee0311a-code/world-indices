import yahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
  // 股市代號對照表 (對應 Yahoo Finance 的 Ticker 格式)
  const symbols = [
    { id: 'tw-taiex', symbol: '^TWII', name: '台灣加權指數', category: '台灣市場' },
    // 注意：Yahoo Finance 沒有提供即時的「台指期夜盤」數據，實務上需串接台灣券商 API。這裡我們先略過台指期。
    
    { id: 'us-dji', symbol: '^DJI', name: '道瓊工業指數', category: '美股四大指數' },
    { id: 'us-spx', symbol: '^GSPC', name: '標普 500 指數', category: '美股四大指數' },
    { id: 'us-ndx', symbol: '^IXIC', name: '那斯達克指數', category: '美股四大指數' },
    { id: 'us-sox', symbol: '^SOX', name: '費城半導體', category: '美股四大指數' },

    { id: 'fut-ym', symbol: 'YM=F', name: '小道瓊期貨 (YM)', category: '美股期貨' },
    { id: 'fut-es', symbol: 'ES=F', name: '小標普期貨 (ES)', category: '美股期貨' },
    { id: 'fut-nq', symbol: 'NQ=F', name: '小那斯達克 (NQ)', category: '美股期貨' },

    { id: 'asia-nikkei', symbol: '^N225', name: '日經 225 指數', category: '亞洲股市' },
    { id: 'asia-kospi', symbol: '^KS11', name: '韓國 KOSPI', category: '亞洲股市' },
    { id: 'asia-hsi', symbol: '^HSI', name: '香港恆生指數', category: '亞洲股市' },
    { id: 'asia-sse', symbol: '000001.SS', name: '上海綜合指數', category: '亞洲股市' }
  ];

  try {
    // 將我們需要的代號抽出來變成陣列 ['^TWII', '^DJI', ...]
    const queries = symbols.map(s => s.symbol);
    
    // 向 Yahoo Finance 發起一次性的批量請求，這是最高效的作法！
    const quotes = await yahooFinance.quote(queries);

    // 將 Yahoo 回傳的複雜資料，整理成我們前端 React 需要的乾淨格式
    const marketData = symbols.map(s => {
      const quote = quotes.find(q => q.symbol === s.symbol);
      if (!quote) return null;

      return {
        id: s.id,
        name: s.name,
        category: s.category,
        price: quote.regularMarketPrice || 0,
        change: quote.regularMarketChange || 0,
        pct: quote.regularMarketChangePercent || 0
      };
    }).filter(Boolean); // 過濾掉空資料

    // 回傳 JSON 給前端
    res.status(200).json(marketData);
  } catch (error) {
    console.error("Yahoo API 錯誤:", error);
    res.status(500).json({ error: '無法獲取市場數據' });
  }
}
```

### 第三步：修改前端 React，替換模擬引擎

現在後端 API 寫好了，我們要把原本 React 裡面「產生亂數假資料」的程式碼，換成「呼叫自己的 API」。

打開你原本的 **`src/App.jsx`**，找到這段原本寫著 `// 模擬即時報價引擎` 的 `useEffect` 區塊，把它**整段刪除**，替換成以下程式碼：

```javascript
  // 🚀 真實 API 報價引擎 (連接 Vercel Serverless Function)
  useEffect(() => {
    if (!isLive) return;

    const fetchMarketData = async () => {
      try {
        // 呼叫我們剛剛寫的 Vercel API
        const response = await fetch('/api/market');
        if (!response.ok) throw new Error('網路回應錯誤');
        
        const data = await response.json();
        if (data && data.length > 0) {
          setMarketData(data); // 將真實數據更新到畫面上！
        }
      } catch (error) {
        console.error("獲取真實報價失敗:", error);
      }
    };

    // 初次載入時，立刻抓取一次最新資料
    fetchMarketData();

    // 💡 專業防呆：Yahoo Finance 抓太快會被封鎖 IP (Rate Limit)
    // 我們將更新頻率設定為每 10 秒抓取一次 (10000 毫秒)
    const interval = setInterval(fetchMarketData, 10000);

    return () => clearInterval(interval);
  }, [isLive]);