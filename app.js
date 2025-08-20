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
