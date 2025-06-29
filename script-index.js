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
  const guestTo = params.get('to');
  let guestName = 'Tamu Undangan';

  const openBtn = document.getElementById('open-button');
  const welcome = document.getElementById('welcome-screen');
  const sections = document.getElementById('invitation-sections');
  const music = document.getElementById('bg-music');
  const floatingNav = document.getElementById('floating-nav');
  const audioToggle = document.getElementById('audio-toggle');
  const audioIcon = document.getElementById('audio-icon');

// 1. Cek kode (pakai metode lama)
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

// 2. Kalau pakai `to` (langsung dari URL)
else if (guestTo) {
  guestName = decodeURIComponent(guestTo.replace(/\+/g, ' '));
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
const paginationContainer = document.getElementById('pagination');
const counterElement = document.getElementById('ucapan-counter');

let allUcapan = [];
let currentPage = 1;
const itemsPerPage = 5;

// Fungsi tampilkan 1 ucapan
function tampilkanUcapan({ name, message, created_at }) {
  const tanggal = new Date(created_at).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  const waktu = new Date(created_at).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit'
  });

  const item = document.createElement('div');
  item.classList.add('ucapan-item');
  item.innerHTML = `
    <p class="ucapan-nama">🕊️ <span>${name}</span></p>
    <p class="ucapan-tanggal">${tanggal} - ${waktu}</p>
    <p class="ucapan-pesan">“${message}”</p>
  `;
  listUcapan.appendChild(item);
}

// Tampilkan komentar per halaman
function tampilkanHalamanUcapan() {
  listUcapan.innerHTML = '';
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const halamanUcapan = allUcapan.slice(start, end);
  halamanUcapan.forEach(tampilkanUcapan);
  renderPagination();
}

// Buat pagination tombol
function renderPagination() {
  paginationContainer.innerHTML = '';
  const totalPages = Math.ceil(allUcapan.length / itemsPerPage);
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentPage = i;
      tampilkanHalamanUcapan();
    });
    paginationContainer.appendChild(btn);
  }
}

// Load komentar dari Supabase
async function loadUcapan() {
  const { data, error } = await supabaseClient
    .from('ucapan')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Gagal memuat ucapan:', error);
    return;
  }

  allUcapan = data;
  tampilkanHalamanUcapan();
  updateUcapanCounter();
}

// Update counter jumlah ucapan
function updateUcapanCounter() {
  if (counterElement) {
    counterElement.textContent = `${allUcapan.length} Wishes`;
  }
}


// Kirim ucapan baru
if (ucapanForm) {
  ucapanForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = namaInput.value.trim();
    const message = pesanInput.value.trim();
    if (!name || !message) return;

    const { data, error } = await supabaseClient
      .from('ucapan')
      .insert([{ name, message }])
      .select()
      .single();

    if (error) {
      alert('Gagal mengirim ucapan.');
      console.error(error);
    } else {
      allUcapan.unshift(data);
      currentPage = 1;
      tampilkanHalamanUcapan();
      updateUcapanCounter();
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
    '../assets/effects/e1.png',
    '../assets/effects/e2.png',
    '../assets/effects/e3.png',
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

// === TOGGLE GIFT REKENING ===
const toggleGiftBtn = document.getElementById('toggle-gift-button');
const giftDetails = document.getElementById('gift-details');

if (toggleGiftBtn) {
  toggleGiftBtn.addEventListener('click', () => {
    giftDetails.classList.toggle('hidden');
    toggleGiftBtn.innerHTML = giftDetails.classList.contains('hidden')
      ? '<i class="fa-solid fa-gift"></i> Tampilkan Rekening'
      : '<i class="fa-solid fa-gift"></i> Sembunyikan Rekening';
  });
}

  const layer = document.getElementById('sparkle-layer');

  for (let i = 0; i < 30; i++) {
    const sparkle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    sparkle.setAttribute("viewBox", "0 0 24 24");
    sparkle.setAttribute("class", "sparkle");
    sparkle.style.left = `${Math.random() * 100}vw`;
    sparkle.style.top = `-${Math.random() * 20}vh`;
    sparkle.style.animationDuration = `${3 + Math.random() * 3}s`;
    sparkle.style.animationDelay = `${Math.random() * 5}s`;

    sparkle.innerHTML = `
      <path d="M12 2C13 6 18 11 22 12C18 13 13 18 12 22C11 18 6 13 2 12C6 11 11 6 12 2Z" fill="white"/>
    `;
    layer.appendChild(sparkle);
  }




