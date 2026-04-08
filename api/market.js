export default async function handler(req, res) {
  // 1. 設定 CORS 標頭
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. 定義代號
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
    const symbolsString = SYMBOLS_MAP.map(s => s.symbol).join(',');
    const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsString}`;
    
    let quotes = [];

    // 🌟 策略 A：嘗試直接連線 Yahoo (附帶防阻擋標頭)
    try {
      const response = await fetch(yahooUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
        }
      });

      if (!response.ok) {
        throw new Error(`Direct connection blocked, status: ${response.status}`);
      }

      const data = await response.json();
      quotes = data.quoteResponse?.result || [];
      
    } catch (directError) {
      console.warn("直接連線被 Yahoo 阻擋，自動切換至代理伺服器...", directError.message);
      
      // 🌟 策略 B：如果 Vercel IP 被封鎖，無縫切換到第三方代理抓取
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`;
      const proxyResponse = await fetch(proxyUrl);
      
      if (!proxyResponse.ok) {
        throw new Error(`Proxy fallback failed, status: ${proxyResponse.status}`);
      }
      
      const proxyData = await proxyResponse.json();
      quotes = proxyData.quoteResponse?.result || [];
    }

    // 3. 整理數據格式回傳給前端
    const formattedData = SYMBOLS_MAP.map(item => {
      const quote = quotes.find(q => q.symbol === item.symbol);
      if (quote) {
        return {
          ...item,
          price: quote.regularMarketPrice || 0,
          change: quote.regularMarketChange || 0,
          pct: quote.regularMarketChangePercent || 0
        };
      } else {
        return { ...item, price: 0, change: 0, pct: 0 };
      }
    });

    res.status(200).json(formattedData);
    
  } catch (error) {
    console.error("Vercel API 伺服器終極錯誤:", error);
    res.status(500).json({ error: '獲取市場報價失敗', details: error.message });
  }
}