Folder ini disediakan sesuai struktur project, tapi secara default index.html
memuat GSAP, particles.js, typed.js, canvas-confetti, dan howler.js lewat CDN
(cdnjs.cloudflare.com) supaya project langsung jalan tanpa setup tambahan.

Kalau kamu butuh 100% offline (tanpa internet sama sekali):
1. Download versi minified dari masing-masing library ke folder ini dengan nama:
   gsap.min.js, typed.min.js, particles.min.js, confetti.min.js, howler.min.js
2. Di index.html, ganti setiap tag <script src="https://cdnjs..."> menjadi:
   <script src="libs/nama-file.min.js"></script>
