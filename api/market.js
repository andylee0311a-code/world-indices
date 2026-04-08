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

  // 2. 定義代號 (已將台指期替換為台積電 ADR 與美元兌台幣)
  const SYMBOLS_MAP = [
    { id: 'tw-taiex', symbol: '^TWII', name: '台灣加權指數', category: '台灣市場' },
    { id: 'tw-tsm', symbol: 'TSM', name: '台積電 ADR', category: '台灣市場' },
    { id: 'tw-usdtwd', symbol: 'TWD=X', name: '美元兌台幣', category: '台灣市場' },
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
    let quotes = [];

    // 🌟 終極策略：混用 Quote 與 Spark 雙重端點
    // Yahoo 近期針對 /quote 端點進行了嚴格的 Cookie/Crumb 驗證，會阻擋 Vercel IP 並回傳空陣列。
    // 但是 /spark 端點通常是免驗證的！我們將其加入作為最強力的備援。
    const fetchRoutes = [
      { url: `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsString}`, type: 'quote' },
      { url: `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${symbolsString}&range=1d`, type: 'spark' },
      { url: `https://query2.finance.yahoo.com/v7/finance/spark?symbols=${symbolsString}&range=1d`, type: 'spark' },
      { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v7/finance/spark?symbols=${symbolsString}&range=1d`)}`, type: 'spark' }
    ];

    for (const route of fetchRoutes) {
      try {
        const response = await fetch(route.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // 解析 Quote 格式 (確定回傳的 result 不是空的才算成功)
          if (route.type === 'quote' && data?.quoteResponse?.result?.length > 0) {
            quotes = data.quoteResponse.result;
            break; 
          } 
          // 解析 Spark 格式 (抽出走勢圖資料夾帶的最新 Meta 報價)
          else if (route.type === 'spark' && data?.spark?.result?.length > 0) {
            quotes = data.spark.result.map(r => {
              const meta = r.response?.[0]?.meta || {};
              const price = meta.regularMarketPrice || meta.chartPreviousClose || 0;
              const prevClose = meta.previousClose || meta.chartPreviousClose || price;
              return {
                symbol: r.symbol,
                regularMarketPrice: price,
                regularMarketChange: price - prevClose,
                regularMarketChangePercent: prevClose !== 0 ? ((price - prevClose) / prevClose) * 100 : 0
              };
            });
            break; 
          }
        }
      } catch (routeError) {
        console.warn(`路線連線失敗: ${route.url}，切換下一條備援...`);
      }
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
    res.status(200).json([]);
  }
}