// ===========================================================
// Inisialisasi Supabase
// ===========================================================
const supabaseUrl = 'https://snqcfnshzjeacswtkptx.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNucWNmbnNoemplYWNzd3RrcHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyOTc1MzMsImV4cCI6MjA2NTg3MzUzM30.tkSIoB_mkPUu8e8wn5sjfsX_qpwbprWoeQ4P6aCKojE';

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// ===========================================================
// DOM Elements
// ===========================================================
const form = document.getElementById('form-tamu');
const resultBox = document.getElementById('result');
const urlPreview = document.getElementById('url-preview');
const tabelBody = document.getElementById('tabel-tamu-body');

// ===========================================================
// Tambah Tamu
// ===========================================================
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('nama-tamu').value.trim();
  resultBox.style.display = 'none';
  resultBox.classList.remove('error');
  urlPreview.textContent = '';

  if (!name) return;

  const { error } = await supabase.from('guests').insert([{ name }]);

  if (error) {
    resultBox.textContent = '❌ Gagal menyimpan tamu.';
    resultBox.classList.add('error');
    resultBox.style.display = 'block';
    console.error(error);
  } else {
    resultBox.textContent = '✅ Tamu berhasil ditambahkan.';
    resultBox.classList.remove('error');
    resultBox.style.display = 'block';
    form.reset();
    loadTamu();
  }
});

// ===========================================================
// Load Tamu
// ===========================================================
async function loadTamu() {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Gagal memuat tamu:', error);
    return;
  }

  const domain = window.location.origin;
  const filterDropdown = document.getElementById('filter-undangan');
  const searchInput = document.getElementById('search-nama');
  const filter = filterDropdown ? filterDropdown.value : 'all';
  const keyword = searchInput ? searchInput.value.toLowerCase() : '';
  let filteredData = data;

  // Filter undangan
  if (filter === 'invited') {
    filteredData = filteredData.filter(t => t.invited);
  } else if (filter === 'not_invited') {
    filteredData = filteredData.filter(t => !t.invited);
  }

  // Search nama
  if (keyword) {
    filteredData = filteredData.filter(t => t.name.toLowerCase().includes(keyword));
  }

  tabelBody.innerHTML = '';
  let number = 1;

  filteredData.forEach((tamu) => {
    const encodedName = encodeURIComponent(tamu.name);
    const invitationLink = `${domain}/?to=${encodedName}`;
    const undanganTemplate = `Kepada Yth.
Bapak/Ibu/Saudara/i
${tamu.name}
_____________________
Dengan penuh sukacita dan kerendahan hati, izinkan kami mengundang Bapak/Ibu/Saudara/i untuk menjadi bagian dari hari bahagia kami, saat kami memulai perjalanan baru sebagai pasangan suami istri.

💍 David & Desri

Acara pernikahan kami akan dilangsungkan pada bulan Juli 2025. Informasi lengkap mengenai waktu dan tempat dapat dilihat melalui undangan digital berikut:

📨 ${invitationLink}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Terima kasih atas perhatian dan kasih yang telah diberikan.
Salam hangat dari kami,
David & Desri`;

    const card = document.createElement('div');
    card.className = 'guest-card';
    card.innerHTML = `
      <div class="guest-info">
        <h3>${number++}. ${tamu.name}</h3>
        <div class="guest-actions">
          <button class="copy-btn" data-text="${undanganTemplate.replace(/"/g, '&quot;')}">
            <i class="fa-solid fa-copy"></i> Copy Undangan
          </button>
          <button class="invite-btn ${tamu.invited ? 'invited' : ''}" data-id="${tamu.id}">
            ${tamu.invited ? '✔️ Diundang' : '❌ Belum Diundang'}
          </button>
          <button class="delete-btn" data-id="${tamu.id}">
            <i class="fa-solid fa-trash"></i> Hapus
          </button>
        </div>
      </div>
    `;
    tabelBody.appendChild(card);
  });

  // Event: Copy Template (mobile friendly)
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.text;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          showToast('📋 Undangan berhasil disalin!');
          btn.innerHTML = '✅ Disalin!';
          setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy Undangan';
          }, 1500);
        }).catch(() => {
          fallbackCopy(text);
        });
      } else {
        fallbackCopy(text);
      }
    });
  });

  // Fallback for mobile Safari or old browsers
  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      const successful = document.execCommand('copy');
      showToast(successful ? '📋 Disalin (fallback)!' : '❌ Gagal menyalin.');
    } catch (err) {
      alert('Browser tidak mendukung fitur salin otomatis.');
    }
    document.body.removeChild(textarea);
  }

  // Event: Tandai Diundang
  document.querySelectorAll('.invite-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const isInvited = btn.classList.contains('invited');
      const { error } = await supabase
        .from('guests')
        .update({ invited: !isInvited })
        .eq('id', id);
      if (error) return alert('Gagal memperbarui status.');
      loadTamu();
    });
  });

  // Event: Hapus
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const confirmDelete = confirm('Yakin ingin menghapus tamu ini?');
      if (!confirmDelete) return;
      const { error } = await supabase.from('guests').delete().eq('id', id);
      if (error) {
        alert('Gagal menghapus tamu.');
        console.error(error);
      } else {
        loadTamu();
      }
    });
  });
}

// ===========================================================
// Load Kehadiran
// ===========================================================
async function loadKehadiran() {
  const { data, error } = await supabase
    .from('kehadiran')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Gagal memuat data kehadiran:', error);
    return;
  }

  const kehadiranBody = document.getElementById('tabel-kehadiran-body');
  kehadiranBody.innerHTML = '';

  data.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'kehadiran-card'; // CSS nanti kita atur di bawah

    const statusText = 
      item.status === 'hadir' ? '✅ Hadir' :
      item.status === 'tidak_hadir' ? '❌ Tidak Hadir' :
      '❓ Belum Konfirmasi';

    card.innerHTML = `
      <div><strong>Nama:</strong> ${item.nama}</div>
      <div><strong>Jumlah:</strong> ${item.jumlah ?? '-'}</div>
      <div><strong>Pesan:</strong> ${item.pesan || '-'}</div>
      <div><strong>Status:</strong> ${statusText}</div>
      <div><strong>Waktu:</strong> ${new Date(item.created_at).toLocaleString('id-ID')}</div>
    `;

    kehadiranBody.appendChild(card);
  });
}


// ===========================================================
// Tab Switch
// ===========================================================
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  if (tabId === 'tamu-tab') {
    document.querySelector('.tab-button:nth-child(1)').classList.add('active');
  } else {
    document.querySelector('.tab-button:nth-child(2)').classList.add('active');
  }
}

// ===========================================================
// Toast Notification
// ===========================================================
function showToast(message) {
  let toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ===========================================================
// Event Listeners
// ===========================================================
document.getElementById('filter-undangan').addEventListener('change', loadTamu);
document.getElementById('search-nama').addEventListener('input', loadTamu);

// ===========================================================
// Load Awal
// ===========================================================
loadTamu();
loadKehadiran();
