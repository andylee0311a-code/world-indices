/** @type {import('tailwindcss').Config} */
export default {
  // 🌟 關鍵新增：啟用 class 模式，讓我們能透過按鈕手動切換亮/暗主題
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 這裡保留為空，代表使用 Tailwind 預設的強大設計系統。
    },
  },
  plugins: [],
}