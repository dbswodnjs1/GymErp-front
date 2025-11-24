import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(
    react({
      // ✅ 최신 JSX 트랜스폼 사용 (경고 제거)
      jsxRuntime: 'automatic',
      babel: {
        plugins: ['@babel/plugin-transform-react-jsx'],
      },
    }),
  )],
    server: {
    proxy: {
      '/api': {  // 프록시할 경로
        //target: 'http://43.203.95.181:9000', // 백엔드 서버 주소
        target:'http://localhost:9000',
        changeOrigin: true, 
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), // '/api' 제거 
      },
      '/upload':{// upload 된 이미지를 로딩하기 위한 프록시
        //target:'http://43.203.95.181:9000',
        target:'http://localhost:9000',
        changeOrigin:true
      }
    },
  },
})
