Vue.component("ba-stock-table", {
  template: "#tpl-stock",
  props: { items: Array, upbjjList: Array, kategoriList: Array },
  data() {
    return {
      filters: { upbjj: "", kategori: "", reorderOnly: false },
      sortBy: "judul",
      showForm: false,
      editKodeLama: null,
      error: "",
      form: this.emptyForm(),
    };
  },
  computed: {
    kategoriOptions() {
      if (!this.filters.upbjj) return [];
      return [
        ...new Set(
          this.items
            .filter((i) => i.upbjj === this.filters.upbjj)
            .map((i) => i.kategori),
        ),
      ];
    },
    filteredItems() {
      let data = [...this.items];
      if (this.filters.upbjj)
        data = data.filter((i) => i.upbjj === this.filters.upbjj);
      if (this.filters.kategori)
        data = data.filter((i) => i.kategori === this.filters.kategori);
      if (this.filters.reorderOnly)
        data = data.filter(
          (i) => Number(i.qty) === 0 || Number(i.qty) < Number(i.safety),
        );
      data.sort((a, b) => {
        if (this.sortBy === "judul")
          return String(a.judul).localeCompare(String(b.judul));
        return Number(a[this.sortBy] || 0) - Number(b[this.sortBy] || 0);
      });
      return data;
    },
  },
  watch: {
    "filters.upbjj"() {
      this.filters.kategori = "";
    },
    "form.qty"(val) {
      if (val !== null && val < 0) this.form.qty = 0;
    },
    "form.safety"(val) {
      if (val !== null && val < 0) this.form.safety = 0;
    },
  },
  methods: {
    emptyForm() {
      return {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: null,
        qty: null,
        safety: null,
        catatanHTML: "",
      };
    },
    openCreateForm() {
      this.cancelEdit(false);
      this.showForm = true;
      this.$nextTick(
        () => this.$refs.kodeInput && this.$refs.kodeInput.focus(),
      );
    },
    resetFilter() {
      this.filters = { upbjj: "", kategori: "", reorderOnly: false };
      this.sortBy = "judul";
    },
    validate() {
      const f = this.form;
      if (!f.kode || !f.judul || !f.kategori || !f.upbjj || !f.lokasiRak)
        return "Kode, judul, kategori, UT-Daerah, dan lokasi rak wajib diisi.";
      if (
        f.harga === null ||
        f.harga === "" ||
        f.qty === null ||
        f.qty === "" ||
        f.safety === null ||
        f.safety === ""
      )
        return "Harga, jumlah stok, dan safety stock wajib diisi.";
      if (Number(f.harga) < 0 || Number(f.qty) < 0 || Number(f.safety) < 0)
        return "Harga, qty, dan safety tidak boleh minus.";
      const duplicate = this.items.some(
        (item) =>
          item.kode.toUpperCase() === f.kode.toUpperCase() &&
          item.kode !== this.editKodeLama,
      );
      if (duplicate) return "Kode mata kuliah sudah ada. Gunakan kode lain.";
      return "";
    },
    saveForm() {
      this.error = this.validate();
      if (this.error) return;
      const payload = {
        kode: this.form.kode.toUpperCase(),
        judul: this.form.judul,
        kategori: this.form.kategori,
        upbjj: this.form.upbjj,
        lokasiRak: this.form.lokasiRak,
        harga: Number(this.form.harga),
        qty: Number(this.form.qty),
        safety: Number(this.form.safety),
        catatanHTML: this.form.catatanHTML || "Tidak ada catatan.",
      };
      if (this.editKodeLama === null) this.$emit("create", payload);
      else this.$emit("update", { kodeLama: this.editKodeLama, payload });
      alert(
        this.editKodeLama === null
          ? "Data stok berhasil ditambahkan."
          : "Data stok berhasil diperbarui.",
      );
      this.cancelEdit();
    },
    editItem(item) {
      this.form = { ...item };
      this.editKodeLama = item.kode;
      this.showForm = true;
      this.error = "";
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    cancelEdit(close = true) {
      this.form = this.emptyForm();
      this.editKodeLama = null;
      this.error = "";
      if (close) this.showForm = false;
    },
  },
});
