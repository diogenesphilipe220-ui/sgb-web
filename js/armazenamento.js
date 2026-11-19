/* ==========================================================
   armazenamento.js – camada de dados do front-end
   Guarda livros, usuários e empréstimos no localStorage do navegador
   (não há back-end nesta fase). Equivale aos "repositórios" do Java.
   ========================================================== */
const Armazenamento = (function () {
  const CHAVES = {
    livros: "sgb_livros",
    usuarios: "sgb_usuarios",
    emprestimos: "sgb_emprestimos"
  };

  function ler(chave) {
    try {
      const texto = localStorage.getItem(chave);
      return texto ? JSON.parse(texto) : [];
    } catch (erro) {
      return [];
    }
  }

  function gravar(chave, lista) {
    try {
      localStorage.setItem(chave, JSON.stringify(lista));
      return true;
    } catch (erro) {
      return false;
    }
  }

  function proximoId(lista) {
    return lista.reduce(function (maior, item) { return Math.max(maior, item.id); }, 0) + 1;
  }

  return {
    proximoId: proximoId,
    listarLivros: function () { return ler(CHAVES.livros); },
    salvarLivros: function (lista) { return gravar(CHAVES.livros, lista); },
    listarUsuarios: function () { return ler(CHAVES.usuarios); },
    salvarUsuarios: function (lista) { return gravar(CHAVES.usuarios, lista); },
    listarEmprestimos: function () { return ler(CHAVES.emprestimos); },
    salvarEmprestimos: function (lista) { return gravar(CHAVES.emprestimos, lista); },
    limparTudo: function () {
      Object.keys(CHAVES).forEach(function (nome) {
        try { localStorage.removeItem(CHAVES[nome]); } catch (erro) { /* ignora */ }
      });
    }
  };
})();
