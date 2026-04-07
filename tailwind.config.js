export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <--- 確保這行有正確指到 src 資料夾底下的檔案
  ],
  theme: {
    extend: {
      // 這裡保留為空，代表使用 Tailwind 預設的強大設計系統。
      // 未來如果你想自訂企業標準色或特殊字體，可以加在這裡。
    },
  },
  plugins: [],
}