const supabase = supabase.createClient(
 "https://snqcfnshzjeacswtkptx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNucWNmbnNoemplYWNzd3RrcHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyOTc1MzMsImV4cCI6MjA2NTg3MzUzM30.tkSIoB_mkPUu8e8wn5sjfsX_qpwbprWoeQ4P6aCKojE"
);

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const guestName = decodeURIComponent(params.get("to") || "Tamu Undangan");
  document.getElementById("guest-name").textContent = guestName;
  document.getElementById("guest").value = guestName;

  // Tombol "Buka Undangan"
  document.getElementById("open-invitation").addEventListener("click", () => {
    document.getElementById("welcome-screen").style.display = "none";
    document.getElementById("main-content").style.display = "block";
  });

  // Submit Kehadiran
  document.getElementById("attendance-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const guest = e.target.guest.value;
    const is_attending = e.target.is_attending.value === "true";
    await supabase.from("guests").upsert({ name: guest, is_attending });
    alert("Konfirmasi kehadiran terkirim!");
  });

  // Submit Ucapan
  document.getElementById("message-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const message = e.target.message.value;
    await supabase.from("guests").upsert({ name, message });
    alert("Ucapan terkirim!");
    e.target.reset();
    loadMessages();
  });

  // Load Komentar
  async function loadMessages() {
    const { data } = await supabase
      .from("guests")
      .select("name, message")
      .not("message", "is", null)
      .order("created_at", { ascending: false });

    const list = document.getElementById("comments");
    list.innerHTML = "";
    data.forEach(({ name, message }) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${name}</strong>: ${message}`;
      list.appendChild(li);
    });
  }

  loadMessages();
});
