import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/in-out/', // กำหนด Path ให้ตรงกับชื่อ Repository
})
