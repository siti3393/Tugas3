Vue.filter("rupiah", (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value || 0)),
);
Vue.filter(
  "satuanBuah",
  (value) => `${Number(value || 0).toLocaleString("id-ID")} buah`,
);
Vue.filter("tanggalIndo", (value) =>
  value
    ? new Date(value).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-",
);

new Vue({
  el: "#app",
  data: {
    tab: "stok",
    state: {
      upbjjList: [],
      kategoriList: [],
      pengirimanList: [],
      paket: [],
      stok: [],
      tracking: [],
    },
  },
  computed: {
    totalQty() {
      return this.state.stok.reduce(
        (sum, item) => sum + Number(item.qty || 0),
        0,
      );
    },
  },
  async created() {
    try {
      const saved = localStorage.getItem("sitta-ut-tugas3-data");
      this.state = saved ? JSON.parse(saved) : await ApiService.getData();
      this.normalisasiData();
      this.simpanData();
    } catch (err) {
      alert(
        "Gagal memuat dataBahanAjar.json. Jalankan menggunakan Live Server/localhost.",
      );
      console.error(err);
    }
  },
  methods: {
    normalisasiData() {
      this.state.tracking = this.state.tracking || [];

      // Contoh data Rina wajib tetap tersedia sebagai contoh DO awal.
      // const adaRina = this.state.tracking.some(obj => Object.keys(obj)[0] === 'DO2025-0000');
      // if (!adaRina) {
      //   this.state.tracking.unshift({
      //     'DO2025-0000': {
      //       nim: '123456789',
      //       nama: 'Rina Wulandari',
      //       status: 'Dalam Perjalanan',
      //       ekspedisi: 'JNE Reguler (3-5 hari)',
      //       tanggalKirim: '2025-08-25',
      //       paket: 'PAKET-UT-001',
      //       total: 120000,
      //       detailPengiriman: 'Paket PAKET IPS Dasar dikirim menggunakan JNE Reguler (3-5 hari).',
      //       perjalanan: [
      //         { waktu: '25/8/2025 10.12.20', keterangan: 'Penerimaan di Loket: TANGSEL' },
      //         { waktu: '25/8/2025 14.45.00', keterangan: 'Paket diproses di gudang sortir JNE' },
      //         { waktu: '26/8/2025 09.15.00', keterangan: 'Paket dalam perjalanan menuju alamat mahasiswa' }
      //       ]
      //     }
      //   });
      // }

      const seen = new Set();
      this.state.tracking = this.state.tracking.filter((obj) => {
        const nomor = Object.keys(obj)[0];
        if (!nomor || seen.has(nomor)) return false;
        seen.add(nomor);

        const data = obj[nomor];
        if (!Array.isArray(data.perjalanan)) data.perjalanan = [];
        if (!data.status)
          data.status = data.perjalanan.length
            ? "Dalam Perjalanan"
            : "Diproses";
        if (!data.detailPengiriman)
          data.detailPengiriman = `Paket ${data.paket || "-"} dikirim menggunakan ${data.ekspedisi || "-"}.`;
        return true;
      });
    },
    simpanData() {
      localStorage.setItem("sitta-ut-tugas3-data", JSON.stringify(this.state));
    },
    addStock(item) {
      this.state.stok.push(item);
      this.simpanData();
    },
    updateStock({ kodeLama, payload }) {
      const i = this.state.stok.findIndex((x) => x.kode === kodeLama);
      if (i > -1) {
        this.$set(this.state.stok, i, payload);
        this.simpanData();
      }
    },
    askDeleteStock(item) {
      this.$refs.modal.open({
        title: "Hapus Data Stok",
        message: `Yakin menghapus ${item.kode} - ${item.judul}?`,
        onConfirm: () => {
          const i = this.state.stok.indexOf(item);
          if (i > -1) {
            this.state.stok.splice(i, 1);
            this.simpanData();
          }
        },
      });
    },
    addOrder(order) {
      this.state.tracking.push(order);
      this.simpanData();
      this.tab = "tracking";
      alert("Delivery Order berhasil dibuat. Data sudah masuk ke Tracking DO.");
    },
    addProgress({ nomor, keterangan }) {
      const obj = this.state.tracking.find((o) => Object.keys(o)[0] === nomor);
      if (obj) {
        obj[nomor].perjalanan.push({
          waktu: new Date().toLocaleString("id-ID"),
          keterangan,
        });
        obj[nomor].status = "Dalam Perjalanan";
        this.simpanData();
      }
    },
  },
});
