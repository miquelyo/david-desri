// ===========================================================
// 1. Inisialisasi Supabase
// ===========================================================
const { createClient } = supabase;

const supabaseUrl = 'https://snqcfnshzjeacswtkptx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNucWNmbnNoemplYWNzd3RrcHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyOTc1MzMsImV4cCI6MjA2NTg3MzUzM30.tkSIoB_mkPUu8e8wn5sjfsX_qpwbprWoeQ4P6aCKojE'; // (sudah kamu punya)
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// ===========================================================
// 2. DOM Ready Handler
// ===========================================================
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const guestCode = params.get('code');
  let guestName = 'Tamu Undangan';

  const openBtn = document.getElementById('open-button');
  const welcome = document.getElementById('welcome-screen');
  const sections = document.getElementById('invitation-sections');
  const music = document.getElementById('bg-music');
  const floatingNav = document.getElementById('floating-nav');
  const audioToggle = document.getElementById('audio-toggle');
  const audioIcon = document.getElementById('audio-icon');

  // Ambil nama tamu dari Supabase berdasarkan kode
  if (guestCode) {
    const { data } = await supabaseClient
      .from('guests')
      .select('name')
      .eq('code', guestCode)
      .single();

    if (data?.name) {
      guestName = data.name;
    }
  }

  // Tampilkan nama tamu
  document.getElementById('guest-name').textContent = guestName;

  // Saat tombol buka undangan diklik
  openBtn.addEventListener('click', () => {
    welcome.classList.add('zoom-out');

    setTimeout(() => {
      welcome.style.display = 'none';
      sections.style.display = 'block';
      if (floatingNav) floatingNav.style.display = 'block';
      if (audioToggle) audioToggle.style.display = 'block';

      if (music) {
        music.muted = false;
        music.play().catch(() => {});
      }

      // Icon awal volume
      if (audioIcon) {
        audioIcon.className = 'fa-solid fa-volume-high';
      }

      // Efek daun jatuh mulai
      createFallingEffect();
    }, 600);
  });

  // Toggle Mute/Unmute
  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      if (!music) return;
      music.muted = !music.muted;

      if (audioIcon) {
        audioIcon.className = music.muted
          ? 'fa-solid fa-volume-xmark'
          : 'fa-solid fa-volume-high';
      }
    });
  }

  // ===========================================================
  // 3. Fade-In Section saat scroll
  // ===========================================================
  const fadeInElements = document.querySelectorAll('.fade-in-section');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.1 });

  fadeInElements.forEach(el => observer.observe(el));

  // ===========================================================
  // 4. Floating Navigation
  // ===========================================================
  window.scrollToSection = function (id) {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ===========================================================
  // 5. Countdown to Wedding
  // ===========================================================
  function updateCountdown() {
    const targetDate = new Date("2025-07-17T10:00:00+07:00");
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      ['days', 'hours', 'minutes', 'seconds'].forEach(id =>
        document.getElementById(id).textContent = '0'
      );
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
  updateCountdown();

  // ===========================================================
  // 6. Supabase - Ucapan
  // ===========================================================
  const ucapanForm = document.getElementById('ucapan-form');
  const namaInput = document.getElementById('nama-pengirim');
  const pesanInput = document.getElementById('pesan-ucapan');
  const listUcapan = document.getElementById('list-ucapan');

  function tampilkanUcapan({ name, message }) {
    const item = document.createElement('div');
    item.classList.add('ucapan-item');
    item.innerHTML = `
      <div class="ucapan-card">
        <p class="ucapan-nama"><strong>${name}</strong></p>
        <p class="ucapan-pesan">"${message}"</p>
      </div>
    `;
    listUcapan.prepend(item);
  }


  async function loadUcapan() {
    const { data } = await supabaseClient
      .from('ucapan')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      listUcapan.innerHTML = '';
      data.forEach(tampilkanUcapan);
    }
  }

  if (ucapanForm) {
    ucapanForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = namaInput.value.trim();
      const message = pesanInput.value.trim();
      if (!name || !message) return;

      const { data, error } = await supabaseClient
        .from('ucapan')
        .insert([{ name, message }]);

      if (error) {
        alert('Gagal mengirim ucapan.');
        console.error(error);
      } else {
        tampilkanUcapan({ name, message });
        ucapanForm.reset();
      }

    });
  }

  loadUcapan();
});

// ===========================================================
// 7. Efek Daun/Bunga Jatuh
// ===========================================================
function createFallingEffect() {
  const container = document.getElementById('falling-effects');
  const images = [
    'assets/effects/e1.png',
    'assets/effects/e2.png',
    'assets/effects/e3.png',
  ];

  function createSinglePetal() {
    const img = document.createElement('img');
    img.src = images[Math.floor(Math.random() * images.length)];
    img.classList.add('falling-item');

    const startLeft = Math.random() * window.innerWidth;
    const size = 20 + Math.random() * 30;
    const duration = 10 + Math.random() * 10;
    const swing = Math.random() * 100;

    img.style.width = size + 'px';
    img.style.height = size + 'px';
    img.style.left = startLeft + 'px';

    container.appendChild(img);

    let startTime = null;
    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / 1000;
      const y = progress * 100;
      const x = Math.sin(progress) * swing;

      img.style.transform = `translate(${x}px, ${y}px) rotate(${progress * 100}deg)`;

      if (y < window.innerHeight + 50) {
        requestAnimationFrame(animate);
      } else {
        img.remove();
      }
    }

    requestAnimationFrame(animate);
  }

  setInterval(createSinglePetal, 300);
}

// Fungsi klik gambar
const galleryImages = document.querySelectorAll('.gallery-grid img');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');

galleryImages.forEach(img => {
  img.addEventListener('click', () => {
    modal.style.display = 'block';
    modalImg.src = img.src;
  });
});

function closeModal() {
  modal.style.display = 'none';
}
