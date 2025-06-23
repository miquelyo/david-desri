const supabase = window.supabase.createClient(
  "https://snqcfnshzjeacswtkptx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNucWNmbnNoemplYWNzd3RrcHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyOTc1MzMsImV4cCI6MjA2NTg3MzUzM30.tkSIoB_mkPUu8e8wn5sjfsX_qpwbprWoeQ4P6aCKojE"
);

function generateCode(name) {
  return name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
}

// Load semua tamu dan tampilkan dalam tabel
async function loadGuests() {
  const { data, error } = await supabase.from("guests").select("*").order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal ambil data tamu:", error);
    return;
  }

  const tbody = document.getElementById("guest-table-body");
  tbody.innerHTML = ""; // Kosongkan dulu

  data.forEach(guest => {
    const tr = document.createElement("tr");
    const link = `${window.location.origin}/index.html?code=${guest.code}`;

    tr.innerHTML = `
      <td>${guest.name}</td>
      <td>${guest.code}</td>
      <td><input type="text" value="${link}" readonly style="width:100%"></td>
      <td><button onclick="copyText('${link}')">Salin</button></td>
    `;

    tbody.appendChild(tr);
  });
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("Link disalin!");
  });
}

document.getElementById("add-guest-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("guest-name").value.trim();
  if (!name) return alert("Nama tidak boleh kosong!");

  const code = generateCode(name);

  const { error } = await supabase.from("guests").insert([{ name, code }]);

  if (error) {
    alert("❌ Gagal menambahkan tamu.");
    console.error(error);
    return;
  }

  const link = `${window.location.origin}/index.html?code=${code}`;
  document.getElementById("result").innerHTML = `
    <p><strong>${name}</strong> berhasil ditambahkan.</p>
    <p>Link Undangan:</p>
    <input type="text" value="${link}" id="copy-link" readonly style="width:100%; padding: 10px;">
    <button onclick="copyText('${link}')">Salin Link</button>
  `;

  document.getElementById("add-guest-form").reset();
  loadGuests(); // 🔁 refresh daftar tamu
});

loadGuests(); // 🔁 muat saat pertama kali
