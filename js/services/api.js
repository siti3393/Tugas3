const ApiService = {
  async getData(){
    const res = await fetch('data/dataBahanAjar.json');
    if(!res.ok) throw new Error('Data JSON gagal dimuat');
    return await res.json();
  }
};
