// ===========================================================
// Inisialisasi Supabase
// ===========================================================
const supabaseUrl = 'https://snqcfnshzjeacswtkptx.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNucWNmbnNoemplYWNzd3RrcHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyOTc1MzMsImV4cCI6MjA2NTg3MzUzM30.tkSIoB_mkPUu8e8wn5sjfsX_qpwbprWoeQ4P6aCKojE';

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// ===========================================================
// Element DOM
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
    urlPreview.innerHTML = `
      <strong>Undangan Link:</strong><br>
      <code>https://namadomainmu.com/?to=${encodeURIComponent(name)}</code>
    `;
    form.reset();
    loadTamu();
  }
});

// ===========================================================
// Load dan Tampilkan Tamu
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

  tabelBody.innerHTML = '';

  const domain = window.location.origin;

  data.forEach((tamu) => {
    const encodedName = encodeURIComponent(tamu.name);
    const invitationLink = `${domain}/?to=${encodedName}`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${tamu.name}</td>
      <td>
        <input type="text" value="${invitationLink}" readonly style="width: 240px;" onclick="this.select()" />
      </td>
      <td>
        <button class="delete-btn" data-id="${tamu.id}">Hapus</button>
      </td>
    `;

    tabelBody.appendChild(tr);
  });

  // Pasang event listener untuk hapus
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

// Jalankan saat halaman terbuka
loadTamu();

document.getElementById('kirim-whatsapp').addEventListener('click', async () => {
  const { data, error } = await supabase
    .from('guests')
    .select('name');

  if (error) {
    alert('Gagal mengambil data tamu');
    console.error(error);
    return;
  }

  // Susun pesan daftar tamu
  let pesan = '*Daftar Tamu Undangan:*%0A%0A'; // %0A = line break di URL
  data.forEach((tamu, index) => {
    pesan += `${index + 1}. ${tamu.name}%0A`;
  });

  // Nomor tujuan WhatsApp (ganti dengan nomormu)
  const nomor = '6281214412001'; // <- ganti ini

  // Redirect ke WhatsApp
  const url = `https://wa.me/${nomor}?text=${pesan}`;
  window.open(url, '_blank');
});
