// ----- Estado -----
// Array que armazena todos os itens da lista.
// Cada item é um objeto com: { id, name, qty, done, createdAt }
let items = [];
const STORAGE_KEY = "shopping.items.v1"; // chave usada no localStorage

// ----- Elementos -----
// Capturando elementos do DOM
const form = document.getElementById("form-add");
const inputName = document.getElementById("input-name");
const inputQty = document.getElementById("input-qty");
const listEl = document.getElementById("list");
const tmpl = document.getElementById("item-template"); // <template> usado como base para cada item
const countEl = document.getElementById("count");
const clearDoneBtn = document.getElementById("clear-done");
const searchEl = document.getElementById("search");
const sortEl = document.getElementById("sort");
const filterBtns = document.querySelectorAll(".filters button");

// Controle de filtros, busca e ordenação
let currentFilter = "all";   // opções: all | pending | done
let currentQuery = "";       // texto da busca
let currentSort = "created"; // created | name | status

// ----- Persistência -----
// Salva o array de itens no localStorage
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
// Carrega os itens do localStorage quando a página abre
function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  items = raw ? JSON.parse(raw) : [];
}

// ----- CRUD (Create, Read, Update, Delete) -----
// Adiciona um novo item à lista
function addItem(name, qty) {
  items.push({
    id: crypto.randomUUID(),   // id único
    name,
    qty: Number(qty),
    done: false,               // começa como pendente
    createdAt: Date.now()      // data/hora de criação
  });
  save(); render();
}

// Alterna o status de "comprado" de um item
function toggleItem(id) {
  const it = items.find(i => i.id === id);
  if (it) it.done = !it.done;
  save(); render();
}

// Remove um item pelo id
function removeItem(id) {
  items = items.filter(i => i.id !== id);
  save(); render();
}

// Edita nome e quantidade de um item
function editItem(id, newName, newQty) {
  const it = items.find(i => i.id === id);
  if (it) {
    it.name = newName;
    it.qty = Number(newQty);
  }
  save(); render();
}

// ----- Filtro / Busca / Ordenação -----
// Aplica todos os "filtros" (status, busca, ordenação) antes de renderizar
function applyViewPipeline(arr) {
  let out = arr;

  // Filtra por status
  if (currentFilter !== "all") {
    out = out.filter(i => currentFilter === "done" ? i.done : !i.done);
  }

  // Filtra por busca (nome)
  if (currentQuery) {
    const q = currentQuery.toLowerCase();
    out = out.filter(i => i.name.toLowerCase().includes(q));
  }

  // Ordena conforme seleção
  if (currentSort === "name") {
    out = [...out].sort((a, b) => a.name.localeCompare(b.name));
  } else if (currentSort === "status") {
    out = [...out].sort((a, b) => Number(a.done) - Number(b.done));
  } else {
    // Padrão: ordem de criação
    out = [...out].sort((a, b) => a.createdAt - b.createdAt);
  }

  return out;
}

// ----- Renderização -----
// Atualiza a interface (HTML) de acordo com o estado "items"
function render() {
  listEl.innerHTML = ""; // limpa lista antes de redesenhar
  const view = applyViewPipeline(items); // aplica filtros/busca/ordenação

  // Cria elementos <li> com base no template
  view.forEach(item => {
    const node = tmpl.content.firstElementChild.cloneNode(true);
    const checkbox = node.querySelector(".toggle");
    const title = node.querySelector(".title");
    const qty = node.querySelector(".qty");

    // Preenche dados do item
    title.textContent = item.name;
    qty.textContent = `× ${item.qty}`;
    checkbox.checked = item.done;
    if (item.done) title.classList.add("done");

    // Eventos do item
    checkbox.addEventListener("change", () => toggleItem(item.id));
    node.querySelector(".remove").addEventListener("click", () => removeItem(item.id));
    node.querySelector(".edit").addEventListener("click", () => {
      const newName = prompt("Novo nome:", item.name);
      if (newName === null) return; // cancelou
      const newQty = prompt("Nova quantidade:", item.qty);
      if (newQty === null) return; // cancelou
      if (newName.trim()) editItem(item.id, newName.trim(), newQty || 1);
    });

    // Adiciona item pronto na lista
    listEl.appendChild(node);
  });

  // Atualiza contador de pendentes
  const pending = items.filter(i => !i.done).length;
  countEl.textContent = `${pending} pendente(s) de ${items.length}`;

  // Atualiza estado visual dos botões de filtro
  document.querySelectorAll(".filters button").forEach(b =>
    b.classList.toggle("is-active", b.dataset.filter === currentFilter)
  );
}

// ----- Eventos globais -----
// Submissão do formulário para adicionar item
form.addEventListener("submit", (e) => {
  e.preventDefault(); // evita recarregar a página
  const name = inputName.value.trim();
  const qty = inputQty.value;
  if (!name) return;
  addItem(name, qty);
  form.reset(); // limpa inputs
  inputName.focus();
});

// Botão "remover comprados"
clearDoneBtn.addEventListener("click", () => {
  items = items.filter(i => !i.done);
  save(); render();
});

// Campo de busca
searchEl.addEventListener("input", (e) => {
  currentQuery = e.target.value;
  render();
});

// Select de ordenação
sortEl.addEventListener("change", (e) => {
  currentSort = e.target.value;
  render();
});

// Botões de filtro (Todos, Pendentes, Comprados)
filterBtns.forEach(btn =>
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    render();
  })
);

// ----- Boot -----
// Ao carregar a página: lê do localStorage e desenha a interface
load();
render();
