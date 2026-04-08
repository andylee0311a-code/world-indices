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
    const targetUrl1 = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsString}`;
    const targetUrl2 = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbolsString}`;
    
    let quotes = [];

    // 🌟 終極策略：多重備援路線 (輪詢直到成功為止)
    const fetchRoutes = [
      targetUrl1, // 路線 1: Yahoo query1
      targetUrl2, // 路線 2: Yahoo query2
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl1)}`, // 路線 3: allorigins 代理
      `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(targetUrl1)}` // 路線 4: codetabs 代理
    ];

    for (const route of fetchRoutes) {
      try {
        const response = await fetch(route, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.quoteResponse && data.quoteResponse.result) {
            quotes = data.quoteResponse.result;
            break; // 只要有一條路線成功抓到資料，就立刻跳出迴圈！
          }
        }
      } catch (routeError) {
        // 單一路線失敗不拋出錯誤，繼續嘗試下一條路線
        console.warn(`路線連線失敗，切換下一條備援...`);
      }
    }

    // 3. 整理數據格式回傳給前端 (即使 quotes 是空的，也會回傳 price: 0，不再引發 500 錯誤)
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

    // 永遠回傳 200，讓前端自行處理 0 元的狀態
    res.status(200).json(formattedData);
    
  } catch (error) {
    console.error("Vercel API 伺服器終極錯誤:", error);
    // 即使發生最嚴重的未知錯誤，也回傳 200 與空陣列，保護前端不崩潰
    res.status(200).json([]);
  }
}