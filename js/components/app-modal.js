Vue.component('app-modal',{
  template:'#tpl-modal',
  data(){return{show:false,title:'Konfirmasi',message:'',onConfirm:null}},
  methods:{open(options){this.title=options.title||'Konfirmasi';this.message=options.message||'';this.onConfirm=options.onConfirm;this.show=true},confirm(){if(this.onConfirm)this.onConfirm();this.close()},close(){this.show=false;this.onConfirm=null}}
});
