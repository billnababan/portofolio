import { defineConfig } from "vite";

export default defineConfig({
  // Pengaturan base path, sesuaikan jika aplikasi di-host di sub-folder
  base: "/",

  build: {
    // Matikan sourcemap untuk menghindari error terkait sourcemap
    sourcemap: false,

    // Optimasi chunking untuk membagi aplikasi menjadi chunk yang lebih kecil
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Pisahkan semua node_modules ke dalam chunk 'vendor'
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },

    // Mengoptimalkan dependensi untuk meminimalkan ukuran bundle
    commonjsOptions: {
      include: /node_modules/,
    },

    // Untuk menghindari warning ukuran chunk besar
    chunkSizeWarningLimit: 600, // Peringatan untuk chunk lebih dari 600KB
  },

  // Plugin tambahan jika diperlukan, seperti untuk React atau lainnya
  // plugins: [react()],

  // Jika Anda menggunakan server proxy atau API yang perlu diatur
  server: {
    proxy: {
      // Contoh pengaturan API proxy
      "/api": {
        target: "https://api.example.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
