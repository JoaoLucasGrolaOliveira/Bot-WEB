if (!localStorage.adonai_users) {
  const admin = { user: 'joaolucas', pass: 'joao123', isAdmin: true };
  localStorage.adonai_users = JSON.stringify([admin]);
}

let currentUser = null;
const adminModal = new bootstrap.Modal(document.getElementById('adminModal'));

function showPage(id) {
  ['login-page','register-page','dashboard-page'].forEach(pid=>{
    document.getElementById(pid).classList.add('d-none');
  });
  document.getElementById(id).classList.remove('d-none');
}

document.addEventListener('DOMContentLoaded', ()=>{

  document.getElementById('show-register').onclick = e=>{
    e.preventDefault();
    showPage('register-page');
  };
  document.getElementById('show-login').onclick = e=>{
    e.preventDefault();
    showPage('login-page');
  };

  document.getElementById('register-btn').onclick = ()=>{
    const u = document.getElementById('reg-user').value.trim();
    const p = document.getElementById('reg-pass').value;
    const p2= document.getElementById('reg-pass2').value;
    const al = document.getElementById('register-alert');
    al.classList.add('d-none');
    if (!u||!p) {
      al.textContent = 'Preencha todos os campos';
      return al.classList.remove('d-none');
    }
    if (p !== p2) {
      al.textContent = 'Senhas não coincidem';
      return al.classList.remove('d-none');
    }
    let users = JSON.parse(localStorage.adonai_users);
    if (users.find(x=>x.user===u)) {
      al.textContent = 'Usuário já existe';
      return al.classList.remove('d-none');
    }
    users.push({user:u, pass:p, isAdmin:false});
    localStorage.adonai_users = JSON.stringify(users);
    alert('Usuário cadastrado com sucesso!');
    showPage('login-page');
  };

  document.getElementById('login-btn').onclick = ()=>{
    const u = document.getElementById('login-user').value.trim();
    const p = document.getElementById('login-pass').value;
    const usr = JSON.parse(localStorage.adonai_users)
                  .find(x=>x.user===u && x.pass===p);
    if (!usr) {
      const al = document.getElementById('login-alert');
      al.textContent = 'Credenciais inválidas';
      return al.classList.remove('d-none');
    }
    document.getElementById('login-alert').classList.add('d-none');
    currentUser = usr;
    document.getElementById('user-name').textContent = u;
    if (usr.isAdmin) {
      document.getElementById('admin-btn').classList.remove('d-none');
    }
    showPage('dashboard-page');
  };

  document.getElementById('logout-btn').onclick = ()=>{
    currentUser = null;
    document.getElementById('admin-btn').classList.add('d-none');
    showPage('login-page');
  };

  function refreshUsers() {
    const ul = document.getElementById('users-list');
    ul.innerHTML = '';
    JSON.parse(localStorage.adonai_users).forEach(u=>{
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = u.user + (u.isAdmin?' (ADM)':'');
      li.onclick = ()=> {
        ul.querySelectorAll('li').forEach(x=>x.classList.remove('active'));
        li.classList.add('active');
      };
      ul.appendChild(li);
    });
  }
  document.getElementById('admin-btn').onclick = ()=> {
    refreshUsers();
    adminModal.show();
  };
  document.getElementById('add-user-btn').onclick = ()=>{
    const u = document.getElementById('new-user').value.trim();
    const p = document.getElementById('new-pass').value;
    const ia= document.getElementById('new-admin').checked;
    const al = document.getElementById('admin-alert');
    al.classList.add('d-none');
    if (!u||!p) {
      al.textContent='Preencha todos os campos';
      return al.classList.remove('d-none');
    }
    let users = JSON.parse(localStorage.adonai_users);
    if (users.find(x=>x.user===u)) {
      al.textContent='Usuário já existe';
      return al.classList.remove('d-none');
    }
    users.push({user:u, pass:p, isAdmin:ia});
    localStorage.adonai_users = JSON.stringify(users);
    document.getElementById('new-user').value='';
    document.getElementById('new-pass').value='';
    document.getElementById('new-admin').checked=false;
    refreshUsers();
  };
  document.getElementById('del-user-btn').onclick = ()=>{
    const sel = document.querySelector('#users-list li.active');
    if (!sel) return alert('Selecione um usuário');
    const u = sel.textContent.split(' ')[0];
    if (u === currentUser.user) return alert('Não pode excluir você mesmo');
    if (!confirm(`Excluir ${u}?`)) return;
    let users = JSON.parse(localStorage.adonai_users)
                    .filter(x=>x.user!==u);
    localStorage.adonai_users = JSON.stringify(users);
    refreshUsers();
  };

  let campaignData = [];
  document.getElementById('camp-file').onchange = async e=>{
    const f = e.target.files[0];
    const wb = XLSX.read(await f.arrayBuffer(),{type:'array'});
    const ws = wb.Sheets[wb.SheetNames[0]];
    campaignData = XLSX.utils.sheet_to_json(ws,{defval:null});
    alert(`Campanha carregada: ${campaignData.length} linhas`);
  };

  document.getElementById('process-btn').onclick = async ()=>{
    const f = document.getElementById('sales-file').files[0];
    if (!f) return alert('Selecione a planilha de vendas');
    const wb = XLSX.read(await f.arrayBuffer(),{type:'array'});
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws,{header:1,defval:null}).slice(1);
    const results = data.map(r=>({
      Marketplace:   r[8],
      TituloProduto: r[25],
      PrecoVenda:    r[22],
      Status:        "Correto",
      Justificativa: "Preço OK"
    }));
    const outWB = XLSX.utils.book_new();
    const outWS = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(outWB,outWS,'Resultado');
    XLSX.writeFile(outWB,'resultado_corretos.xlsx');
  };

  showPage('login-page');
});
