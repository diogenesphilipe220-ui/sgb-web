/* painel.js – página index.html: resumo, próximas devoluções e dados de exemplo */
(function () {
  const totalLivros = document.getElementById("totalLivros");
  const totalAtivos = document.getElementById("totalAtivos");
  const totalAtrasos = document.getElementById("totalAtrasos");
  const corpo = document.getElementById("corpoProximas");
  const semProximas = document.getElementById("semProximas");

  function nomeDe(lista, id, campo) {
    const item = lista.filter(function (i) { return i.id === id; })[0];
    return item ? item[campo] : "(removido)";
  }

  function desenhar() {
    const hoje = SGB.hoje();
    const usuarios = Armazenamento.listarUsuarios();
    const livros = Armazenamento.listarLivros();
    const ativos = Armazenamento.listarEmprestimos()
      .filter(function (e) { return e.dataDevolucao === null; })
      .sort(function (a, b) { return a.dataPrevista.localeCompare(b.dataPrevista); });

    totalLivros.textContent = String(livros.length);
    totalAtivos.textContent = String(ativos.length);
    totalAtrasos.textContent = String(ativos.filter(function (e) {
      return SGB.diasDeAtraso(e.dataPrevista, hoje) > 0;
    }).length);

    SGB.limpar(corpo);
    ativos.slice(0, 5).forEach(function (e) {
      const emAtraso = SGB.diasDeAtraso(e.dataPrevista, hoje) > 0;
      corpo.appendChild(SGB.criarLinha([
        nomeDe(usuarios, e.usuarioId, "nome"),
        nomeDe(livros, e.livroId, "titulo"),
        SGB.formatarData(e.dataPrevista)
      ], emAtraso ? "linha-atraso" : ""));
    });
    semProximas.hidden = ativos.length !== 0;
  }

  // Dados de exemplo para demonstrar o sistema (datas relativas a hoje)
  function carregarExemplo() {
    const hoje = SGB.hoje();
    Armazenamento.salvarLivros([
      { id: 1, titulo: "Dom Casmurro", autor: "Machado de Assis", isbn: "9788525432018", exemplares: 1 },
      { id: 2, titulo: "Memórias Póstumas de Brás Cubas", autor: "Machado de Assis", isbn: "9788535911664", exemplares: 2 },
      { id: 3, titulo: "O Cortiço", autor: "Aluísio Azevedo", isbn: "9788508040353", exemplares: 0 },
      { id: 4, titulo: "Vidas Secas", autor: "Graciliano Ramos", isbn: "9788501015433", exemplares: 5 }
    ]);
    Armazenamento.salvarUsuarios([
      { id: 1, nome: "Maria Silva", cpf: "52998224725", email: "maria@email.com" },
      { id: 2, nome: "João Pereira", cpf: "11144477735", email: "joao@email.com" },
      { id: 3, nome: "Ana Souza", cpf: "93541134780", email: "ana@email.com" }
    ]);
    Armazenamento.salvarEmprestimos([
      { id: 1, usuarioId: 1, livroId: 1, dataEmprestimo: SGB.somarDias(hoje, -12), dataPrevista: SGB.somarDias(hoje, -5), dataDevolucao: null, multa: 0 },
      { id: 2, usuarioId: 1, livroId: 2, dataEmprestimo: SGB.somarDias(hoje, -2), dataPrevista: SGB.somarDias(hoje, 5), dataDevolucao: null, multa: 0 },
      { id: 3, usuarioId: 2, livroId: 3, dataEmprestimo: SGB.somarDias(hoje, -3), dataPrevista: SGB.somarDias(hoje, 4), dataDevolucao: null, multa: 0 }
    ]);
  }

  function criarBotao(texto, aoClicar) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "botao botao--secundario";
    botao.textContent = texto;
    botao.addEventListener("click", aoClicar);
    return botao;
  }

  // Área "Dados de demonstração", criada pelo JavaScript no fim da página
  const secao = document.createElement("section");
  secao.setAttribute("aria-labelledby", "titulo-demo");
  const titulo = document.createElement("h2");
  titulo.id = "titulo-demo";
  titulo.textContent = "Dados de demonstração";
  const nota = document.createElement("p");
  nota.className = "nota";
  nota.textContent = "Os dados ficam salvos apenas neste navegador. Use os botões para testar o sistema.";
  const acoes = document.createElement("div");
  acoes.className = "acoes";
  acoes.appendChild(criarBotao("Carregar dados de exemplo", function () {
    carregarExemplo();
    desenhar();
  }));
  acoes.appendChild(criarBotao("Limpar todos os dados", function () {
    if (window.confirm("Apagar todos os livros, usuários e empréstimos salvos neste navegador?")) {
      Armazenamento.limparTudo();
      desenhar();
    }
  }));
  secao.appendChild(titulo);
  secao.appendChild(nota);
  secao.appendChild(acoes);
  document.querySelector("main").appendChild(secao);

  desenhar();
})();
