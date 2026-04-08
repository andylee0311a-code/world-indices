export default async function handler(req, res) {
  // 1. 設定 CORS 標頭，允許前端跨域請求
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 處理 OPTIONS 預檢請求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. 定義要抓取的全球指數與期貨代號 (與前端完全對應)
  const SYMBOLS_MAP = [
    { id: 'tw-taiex', symbol: '^TWII', name: '台灣加權指數', category: '台灣市場' },
    { id: 'tw-txn', symbol: 'TWN=F', name: '台指期 (電子盤)', category: '台灣市場' },
    { id: 'tw-tx-all', symbol: 'TX=F', name: '台指近全', category: '台灣市場' },
    
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
    // 將代號組合成 Yahoo API 需要的格式 (例如: ^TWII,TWN=F,^DJI...)
    const symbolsString = SYMBOLS_MAP.map(s => s.symbol).join(',');
    
    // 使用 Yahoo Finance 輕量級 Quote API，一次抓回所有最新報價
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsString}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Yahoo API 請求失敗，狀態碼: ${response.status}`);
    }

    const data = await response.json();
    const quotes = data.quoteResponse.result;

    // 3. 將 Yahoo 回傳的資料重新整理成前端好閱讀的格式
    const formattedData = SYMBOLS_MAP.map(item => {
      // 從回傳陣列中找出對應代碼的資料
      const quote = quotes.find(q => q.symbol === item.symbol);
      
      if (quote) {
        return {
          ...item,
          price: quote.regularMarketPrice || 0,
          change: quote.regularMarketChange || 0,
          pct: quote.regularMarketChangePercent || 0
        };
      } else {
        // 萬一有找不到的項目 (例如期貨非交易時段)，回傳 0 交給前端處理 (模擬跳動)
        return { ...item, price: 0, change: 0, pct: 0 };
      }
    });

    // 4. 將整理好的資料回傳給前端
    res.status(200).json(formattedData);
    
  } catch (error) {
    console.error("Vercel API 伺服器錯誤:", error);
    res.status(500).json({ error: '獲取市場報價失敗' });
  }
}