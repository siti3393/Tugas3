Vue.component("order-form", {
  template: "#tpl-order",
  props: { tracking: Array, paket: Array, pengirimanList: Array },
  data() {
    return { form: this.emptyForm(), error: "", lastCreatedDo: "" };
  },
  computed: {
    flatTracking() {
      return (this.tracking || []).map((obj) => Object.keys(obj)[0]);
    },
    nextDo() {
      const year = new Date().getFullYear();
      const nums = this.flatTracking
        .filter((n) => n.startsWith("DO" + year))
        .map((n) => parseInt(n.split("-")[1], 10))
        .filter((n) => !isNaN(n));
      const next = (nums.length ? Math.max(...nums) : 0) + 1;
      return `DO${year}-${String(next).padStart(4, "0")}`;
    },
    selectedPaket() {
      return this.paket.find((p) => p.kode === this.form.paket);
    },
    orderedList() {
      return (this.tracking || [])
        .map((obj) => {
          const nomor = Object.keys(obj)[0];
          return { nomor, data: obj[nomor] };
        })
        .slice()
        .sort((a, b) => String(b.nomor).localeCompare(String(a.nomor)));
    },
  },
  watch: {
    "form.paket"() {
      this.error = "";
    },
    "form.tanggalKirim"(val) {
      if (!val) this.form.tanggalKirim = this.today();
    },
  },
  methods: {
    today() {
      return new Date().toISOString().slice(0, 10);
    },
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
    validate() {
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
      this.error = this.validate();
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
      this.lastCreatedDo = nomorBaru;
      this.form = this.emptyForm();
      this.error = "";
    },
  },
});
