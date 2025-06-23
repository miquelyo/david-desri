// ===========================================================
// 1. Inisialisasi Supabase
// ===========================================================
const { createClient } = supabase;

const supabaseUrl = 'https://snqcfnshzjeacswtkptx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNucWNmbnNoemplYWNzd3RrcHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyOTc1MzMsImV4cCI6MjA2NTg3MzUzM30.tkSIoB_mkPUu8e8wn5sjfsX_qpwbprWoeQ4P6aCKojE';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// ===========================================================
// 2. DOM Ready Handler
// ===========================================================
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const guestCode = params.get('code');
  let guestName = 'Tamu Undangan';

  // Ambil nama tamu dari Supabase berdasarkan kode
  if (guestCode) {
    const { data, error } = await supabaseClient
      .from('guests')
      .select('name')
      .eq('code', guestCode)
      .single();

    if (data && data.name) {
      guestName = data.name;
    }
  }

  // Tampilkan nama tamu di halaman
  document.getElementById('guest-name').textContent = guestName;

  // Ambil elemen penting
  const openBtn = document.getElementById('open-button');
  const welcome = document.getElementById('welcome-screen');
  const sections = document.getElementById('invitation-sections');
  const music = document.getElementById('bg-music');
  const floatingNav = document.getElementById('floating-nav'); // floating nav

  // Event ketika tombol "Buka Undangan" diklik
  openBtn.addEventListener('click', () => {
    welcome.classList.add('zoom-out');

    setTimeout(() => {
      welcome.style.display = 'none';
      sections.style.display = 'block';
      if (floatingNav) floatingNav.style.display = 'block'; // munculkan tombol navigasi

      // Coba mainkan musik
      if (music) {
        music.play().catch(() => {
          console.warn("Audio tidak bisa diputar otomatis, perlu interaksi pengguna.");
        });
      }
    }, 600); // sesuai dengan durasi animasi
  });

  // ===========================================================
  // 3. Fade-In Animation saat scroll (untuk section)
  // ===========================================================
  const fadeInElements = document.querySelectorAll('.fade-in-section');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, {
    threshold: 0.1
  });

  fadeInElements.forEach(el => {
    observer.observe(el);
  });

  // ===========================================================
  // 4. Fungsi Navigasi Floating Button
  // ===========================================================
  window.scrollToSection = function (id) {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
});


// === Countdown ke tanggal pemberkatan ===
function updateCountdown() {
  const targetDate = new Date("2025-07-17T10:00:00+07:00"); // WIB
  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    document.getElementById('days').textContent = '0';
    document.getElementById('hours').textContent = '0';
    document.getElementById('minutes').textContent = '0';
    document.getElementById('seconds').textContent = '0';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById('days').textContent = days;
  document.getElementById('hours').textContent = hours;
  document.getElementById('minutes').textContent = minutes;
  document.getElementById('seconds').textContent = seconds;
}

setInterval(updateCountdown, 1000);
updateCountdown(); // Panggil langsung saat halaman dimuat


// ==== Supabase - Menyimpan dan Menampilkan Ucapan ====

document.addEventListener('DOMContentLoaded', async () => {
  // ... bagian awal tetap ...

  // ========== Ucapan - Supabase ==========

  const ucapanForm = document.getElementById('ucapan-form');
  const namaInput = document.getElementById('nama-pengirim');
  const pesanInput = document.getElementById('pesan-ucapan');
  const listUcapan = document.getElementById('list-ucapan');

  // Fungsi render ucapan
  function tampilkanUcapan({ name, message }) {
    const item = document.createElement('div');
    item.classList.add('ucapan-item');
    item.innerHTML = `
      <p><strong>Nama:</strong> ${name}</p>
      <p><strong>Ucapan:</strong> ${message}</p>
    `;
    listUcapan.prepend(item);
  }


  // Ambil ucapan dari Supabase
  async function loadUcapan() {
    const { data, error } = await supabaseClient
      .from('ucapan')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      listUcapan.innerHTML = '';
      data.forEach(tampilkanUcapan);
    } else {
      console.error("Gagal memuat ucapan:", error.message);
    }
  }

  // Kirim ucapan ke Supabase
  if (ucapanForm) {
    ucapanForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = namaInput.value.trim();
      const message = pesanInput.value.trim();

      if (!name || !message) return;

      const { data, error } = await supabaseClient
        .from('ucapan')
        .insert([{ name, message }]);

      if (data) {
        tampilkanUcapan({ name, message });
        ucapanForm.reset();
      } else {
        alert('Gagal mengirim ucapan.');
        console.error("Supabase error:", error.message);
      }
    });
  }

  loadUcapan(); // panggil saat pertama kali
});
