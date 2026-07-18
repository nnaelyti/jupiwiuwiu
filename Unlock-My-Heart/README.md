# Unlock My Heart ❤️

Website interaktif premium — sebuah "mini web game" yang membawa seseorang lewat 5 level singkat sebelum akhirnya membuka surat pesan pribadi.

Dibangun dengan **HTML5, CSS3, dan Vanilla JavaScript (ES6)**, tanpa framework. Efek visual & audio memakai GSAP, particles.js, Typed.js, canvas-confetti, dan Howler.js.

---

## 1. Struktur Folder

```
Unlock-My-Heart/
├── assets/          # musik, sound effect, gambar (isi sendiri, lihat assets/README.txt)
├── css/
│   └── style.css    # semua styling
├── js/
│   └── script.js    # semua logika & interaksi
├── libs/            # opsional, untuk versi 100% offline (lihat libs/README.txt)
├── index.html
└── README.md
```

## 2. Cara Menjalankan Project

Website ini murni HTML/CSS/JS statis, jadi tidak perlu proses build.

**Cara paling gampang:**
1. Buka folder `Unlock-My-Heart/`.
2. Klik dua kali `index.html`, atau buka lewat browser (Chrome/Edge/Firefox terbaru).

**Disarankan pakai local server** (supaya audio & beberapa fitur browser jalan lebih stabil):

```bash
# Kalau ada Python
cd Unlock-My-Heart
python3 -m http.server 8080
# lalu buka http://localhost:8080

# Atau pakai VS Code + extension "Live Server"
```

> Musik baru mulai diputar setelah tombol **START** ditekan — ini memang disengaja, karena kebanyakan browser memblokir autoplay audio sebelum ada interaksi user.

## 3. Cara Mengganti Musik & Sound Effect

Semua path audio diatur di satu tempat: bagian `CONFIG.audio` paling atas file `js/script.js`.

```js
const CONFIG = {
  audio: {
    music:   'assets/music.mp3',
    click:   'assets/click.mp3',
    success: 'assets/success.mp3'
  },
  ...
}
```

Langkah:
1. Taruh file audio baru kamu ke folder `assets/` (format `.mp3` disarankan).
2. Ganti nama file di `CONFIG.audio` sesuai nama file barumu, atau timpa langsung file `music.mp3` / `click.mp3` / `success.mp3` yang lama dengan file baru bernama sama.
3. Volume musik & sound effect bisa diatur lewat slider volume di pojok kiri bawah (musik), atau lewat angka `volume` di dalam `AudioManager.init()` untuk sound effect.

## 4. Cara Mengganti Pesan (Surat Final)

Buka `js/script.js`, cari properti `finalLetter` di dalam `CONFIG`:

```js
const CONFIG = {
  ...
  finalLetter:
`Aku tahu kamu suka main.

Dan aku nggak pernah minta kamu berhenti melakukan hal yang kamu suka.
...
`,
};
```

Ganti isi teks di antara tanda backtick (`` ` ``) dengan pesanmu sendiri. Baris kosong akan otomatis jadi jeda paragraf di animasi mengetik (typewriter).

Kalau mau ganti pertanyaan/quiz di Level 1–3, cukup edit teks tombol & pertanyaan langsung di `index.html` pada bagian `<!-- LEVEL 1 : QUIZ -->`, `LEVEL 2`, `LEVEL 3`, dst — atribut `data-answer="true"` menandai jawaban yang benar.

## 5. Cara Mengganti Background

Background galaxy dibuat murni dengan CSS gradient + `<canvas>` (bintang & shooting star) + particles.js — jadi tidak butuh file gambar sama sekali secara default.

**Kalau mau pakai foto sebagai background** (misalnya `assets/bg.jpg`):

Buka `css/style.css`, cari selector `#cosmos`, lalu tambahkan `background-image`:

```css
#cosmos{
  position: fixed; inset:0; z-index:0; overflow:hidden;
  background-image: url('../assets/bg.jpg');
  background-size: cover;
  background-position: center;
  /* gradient lama bisa dijadikan overlay di atasnya kalau mau tetap ada nuansa aurora */
}
```

**Kalau mau ganti warna tema** (aurora / neon glow), semua warna diatur lewat CSS variables di paling atas `css/style.css`:

```css
:root{
  --aurora-violet: #7c3aed;
  --aurora-pink:   #ec4899;
  --neon-cyan:     #22d3ee;
  --heart-pink:    #ff5d8f;
  --gold:          #ffcf6b;
}
```

## 6. Cara Deploy ke GitHub Pages

1. Buat repository baru di GitHub, misalnya `unlock-my-heart`.
2. Push folder ini ke repo tersebut:
   ```bash
   cd Unlock-My-Heart
   git init
   git add .
   git commit -m "Initial commit: Unlock My Heart"
   git branch -M main
   git remote add origin https://github.com/USERNAME/unlock-my-heart.git
   git push -u origin main
   ```
3. Di GitHub, buka repo → **Settings → Pages**.
4. Pada **Source**, pilih branch `main` dan folder `/ (root)`, lalu **Save**.
5. Tunggu 1–2 menit, website akan bisa diakses di:
   `https://USERNAME.github.io/unlock-my-heart/`

> Pastikan file audio di `assets/` ukurannya tidak terlalu besar (idealnya di bawah beberapa MB per file) supaya loading tetap cepat di GitHub Pages.

## 7. Catatan Library

Secara default, `index.html` memuat GSAP, particles.js, Typed.js, canvas-confetti, dan Howler.js lewat CDN (cdnjs.cloudflare.com) — jadi butuh koneksi internet saat dibuka. Untuk versi offline, lihat instruksi di `libs/README.txt`.

## 8. Easter Egg 🥚

Ada dua easter egg tersembunyi:
- Konami Code (`↑ ↑ ↓ ↓ ← → ← → B A`) di keyboard.
- Double-click judul "Unlock My Heart ❤️" di halaman menu utama.

Keduanya memunculkan pesan lucu + efek hujan hati. Cari & modifikasi pesannya di fungsi `initEasterEgg()` dalam `js/script.js`.

---

Dibuat dengan ❤️ — semoga pesannya sampai.
