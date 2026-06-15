Vue.component("status-badge", {
  template: "#tpl-badge",
  props: {
    qty: { type: Number, required: true },
    safety: { type: Number, required: true },
  },
  computed: {
    label() {
      if (this.qty === 0) return "Kosong";
      if (this.qty < this.safety) return "Menipis";
      return "Aman";
    },
    statusClass() {
      return this.label.toLowerCase();
    },
    icon() {
      return this.label === "Aman"
        ? "✅"
        : this.label === "Menipis"
          ? "⚠️"
          : "⛔";
    },
  },
});
