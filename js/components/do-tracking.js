Vue.component("do-tracking", {
  template: "#tpl-tracking",
  props: { tracking: Array, paket: Array, pengirimanList: Array },
  data() {
    return {
      keyword: "",
      selected: null,
      message: "",
      progressText: "",
      showDoForm: false,
      error: "",
      form: this.emptyForm(),
    };
  },
  computed: {
    flatTracking() {
      return (this.tracking || []).map((obj) => {
        const nomor = Object.keys(obj)[0];
        return { nomor, data: obj[nomor] };
      });
    },
    nextDo() {
      const year = new Date().getFullYear();
      const nums = this.flatTracking
        .map((t) => t.nomor)
        .filter((n) => n && n.startsWith("DO" + year))
        .map((n) => parseInt(n.split("-")[1], 10))
        .filter((n) => !isNaN(n));
      const next = (nums.length ? Math.max(...nums) : 0) + 1;
      return `DO${year}-${String(next).padStart(4, "0")}`;
    },
    selectedPaket() {
      return this.paket.find((p) => p.kode === this.form.paket);
    },
    orderedList() {
      return this.flatTracking
        .slice()
        .sort((a, b) => String(b.nomor).localeCompare(String(a.nomor)));
    },
  },
  watch: {
    keyword(val) {
      if (!val) {
        this.selected = null;
        this.message = "";
      }
    },
    "form.paket"() {
      this.error = "";
    },
  },
  methods: {
    emptyForm() {
      return {
        nim: "",
        nama: "",
        ekspedisi: "",
        paket: "",
        tanggalKirim: new Date().toISOString().slice(0, 10),
      };
    },
    getPaketName(kode) {
      const item = this.paket.find((p) => p.kode === kode);
      return item ? `${item.kode} - ${item.nama}` : kode || "-";
    },
    doSearch() {
      const key = this.keyword.trim().toLowerCase();
      if (!key) {
        this.message = "Masukkan Nomor DO atau NIM terlebih dahulu.";
        this.selected = null;
        return;
      }
      const found = this.flatTracking.find(
        (t) =>
          t.nomor.toLowerCase() === key ||
          String(t.data.nim).toLowerCase() === key,
      );
      this.selected = found || null;
      this.message = found ? "" : "Data DO/NIM tidak ditemukan.";
    },
    clearSearch() {
      this.keyword = "";
      this.selected = null;
      this.message = "";
      this.progressText = "";
    },
    validateOrder() {
      if (
        !this.form.nim ||
        !this.form.nama ||
        !this.form.ekspedisi ||
        !this.form.paket ||
        !this.form.tanggalKirim
      )
        return "Semua field Delivery Order wajib diisi.";
      if (!/^\d{6,}$/.test(this.form.nim)) return "NIM minimal 6 digit angka.";
      if (!this.selectedPaket) return "Paket bahan ajar tidak valid.";
      return "";
    },
    submitOrder() {
      this.error = this.validateOrder();
      if (this.error) return;
      const p = this.selectedPaket;
      const nomorBaru = this.nextDo;
      this.$emit("created", {
        [nomorBaru]: {
          nim: this.form.nim,
          nama: this.form.nama,
          status: "Diproses",
          ekspedisi: this.form.ekspedisi,
          tanggalKirim: this.form.tanggalKirim,
          paket: p.kode,
          total: p.harga,
          detailPengiriman: `Paket ${p.nama} dikirim menggunakan ${this.form.ekspedisi}.`,
          perjalanan: [
            {
              waktu: new Date().toLocaleString("id-ID"),
              keterangan: "Pemesanan DO berhasil dibuat",
            },
            {
              waktu: new Date().toLocaleString("id-ID"),
              keterangan: "Status awal: Diproses oleh petugas UT",
            },
          ],
        },
      });
      this.keyword = nomorBaru;
      this.form = this.emptyForm();
      this.showDoForm = false;
      this.error = "";
      this.$nextTick(this.doSearch);
    },
    submitProgress() {
      if (!this.selected) return;
      if (!this.progressText.trim()) {
        this.message = "Keterangan progress wajib diisi.";
        return;
      }
      this.$emit("add-progress", {
        nomor: this.selected.nomor,
        keterangan: this.progressText.trim(),
      });
      this.progressText = "";
      this.message = "";
    },
    pilihDO(item) {
      this.keyword = item.nomor;
      this.selected = item;
      this.message = "";
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  },
});
