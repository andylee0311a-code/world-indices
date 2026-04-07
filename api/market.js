// 注意這裡的開頭大寫 Y
import YahooFinance from 'yahoo-finance2'; 

// 新增這一行：先建立一個專屬的實體 (這是最新版的要求！)
const yahooFinance = new YahooFinance();

export default async function handler(req, res) {
  const symbols = [
    { id: 'tw-taiex', symbol: '^TWII', name: '台灣加權指數', category: '台灣市場' },
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
    const queries = symbols.map(s => s.symbol);
    
    // 現在我們使用的是剛剛 new 出來的 yahooFinance 實體
    const quotes = await yahooFinance.quote(queries);

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
    }).filter(Boolean);

    res.status(200).json(marketData);
  } catch (error) {
    console.error("Yahoo API 錯誤:", error);
    res.status(500).json({ 
      error: '無法獲取市場數據', 
      details: error.message || error.toString() 
    });
  }
}