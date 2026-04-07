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
    { id: 'asia-kospi', symbol: '^KS11', name: '韓國 KOSPI', category: '亞洲股市' }
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
    console.error("Yahoo API 錯誤細節:", error);
    // 把錯誤訊息轉成字串，直接傳給前端，這樣我們按 F12 就能看到真正死因！
    res.status(500).json({ 
      error: '無法獲取市場數據', 
      details: error.message || error.toString() 
    });
  }
}