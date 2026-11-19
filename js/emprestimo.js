/* emprestimo.js – página emprestimo.html: novo empréstimo (RF03, RN01, RN02, RN03) */
(function () {
  const form = document.getElementById("formEmprestimo");
  const selUsuario = document.getElementById("usuario");
  const selLivro = document.getElementById("livro");
  const resumoDisponiveis = document.getElementById("resumoDisponiveis");
  const resumoAtivos = document.getElementById("resumoAtivos");
  const resumoPrazo = document.getElementById("resumoPrazo");

  function criarOpcao(valor, texto) {
    const opcao = document.createElement("option");
    opcao.value = String(valor);
    opcao.textContent = texto;
    return opcao;
  }

  function carregarOpcoes() {
    const usuarioAtual = selUsuario.value;
    const livroAtual = selLivro.value;
    selUsuario.length = 1;
    selLivro.length = 1;

    Armazenamento.listarUsuarios()
      .sort(function (a, b) { return a.nome.localeCompare(b.nome); })
      .forEach(function (u) {
        selUsuario.appendChild(criarOpcao(u.id, u.nome + " – CPF " + Validacoes.formatarCpf(u.cpf)));
      });
    Armazenamento.listarLivros()
      .sort(function (a, b) { return a.titulo.localeCompare(b.titulo); })
      .forEach(function (l) {
        const rotulo = l.exemplares === 1 ? "disponível" : "disponíveis";
        selLivro.appendChild(criarOpcao(l.id, l.titulo + " (" + l.exemplares + " " + rotulo + ")"));
      });

    selUsuario.value = usuarioAtual;
    selLivro.value = livroAtual;
  }

  function buscarLivro() {
    const id = Number(selLivro.value);
    return Armazenamento.listarLivros().filter(function (l) { return l.id === id; })[0] || null;
  }

  function atualizarResumo() {
    const livro = selLivro.value ? buscarLivro() : null;
    resumoDisponiveis.textContent = livro ? String(livro.exemplares) : "–";
    resumoAtivos.textContent = selUsuario.value
      ? SGB.ativosDoUsuario(Number(selUsuario.value)) + " de " + SGB.LIMITE_EMPRESTIMOS
      : "–";
    resumoPrazo.textContent = (selUsuario.value && selLivro.value)
      ? SGB.formatarData(SGB.somarDias(SGB.hoje(), SGB.PRAZO_EM_DIAS))
      : "–";
  }

  selUsuario.addEventListener("change", atualizarResumo);
  selLivro.addEventListener("change", atualizarResumo);

  SGB.limparErroAoDigitar(form);
  form.addEventListener("reset", function () {
    SGB.limparErros(form);
    setTimeout(atualizarResumo, 0);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    SGB.limparErros(form);

    let invalido = false;
    if (!selUsuario.value) { SGB.mostrarErro("usuario", "Selecione um usuário."); invalido = true; }
    if (!selLivro.value) { SGB.mostrarErro("livro", "Selecione um livro."); invalido = true; }
    if (invalido) {
      SGB.mostrarMensagem("erro", "Corrija os campos destacados.");
      return;
    }

    const usuarioId = Number(selUsuario.value);
    const livros = Armazenamento.listarLivros();
    const livro = livros.filter(function (l) { return l.id === Number(selLivro.value); })[0];
    const usuario = Armazenamento.listarUsuarios().filter(function (u) { return u.id === usuarioId; })[0];
    if (!livro || !usuario) {
      SGB.mostrarMensagem("erro", "Usuário ou livro não encontrado.");
      return;
    }

    // RN03: livro precisa ter exemplar disponível
    if (livro.exemplares <= 0) {
      SGB.mostrarMensagem("erro", "Livro sem exemplares disponíveis.");
      return;
    }
    // RN02: no máximo 3 empréstimos ativos por usuário
    if (SGB.ativosDoUsuario(usuarioId) >= SGB.LIMITE_EMPRESTIMOS) {
      SGB.mostrarMensagem("erro", "O usuário atingiu o limite de " + SGB.LIMITE_EMPRESTIMOS + " empréstimos ativos.");
      return;
    }

    // RN01: prazo de 7 dias
    const dataEmprestimo = SGB.hoje();
    const dataPrevista = SGB.somarDias(dataEmprestimo, SGB.PRAZO_EM_DIAS);
    const emprestimos = Armazenamento.listarEmprestimos();
    livro.exemplares -= 1;
    emprestimos.push({
      id: Armazenamento.proximoId(emprestimos),
      usuarioId: usuarioId,
      livroId: livro.id,
      dataEmprestimo: dataEmprestimo,
      dataPrevista: dataPrevista,
      dataDevolucao: null,
      multa: 0
    });
    if (!Armazenamento.salvarLivros(livros) || !Armazenamento.salvarEmprestimos(emprestimos)) {
      SGB.mostrarMensagem("erro", "Não foi possível salvar os dados neste navegador.");
      return;
    }

    form.reset();
    carregarOpcoes();
    SGB.mostrarMensagem("sucesso", "Empréstimo registrado. Devolução prevista para " + SGB.formatarData(dataPrevista) + ".");
  });

  carregarOpcoes();
  atualizarResumo();
  if (selUsuario.length === 1 || selLivro.length === 1) {
    SGB.mostrarMensagem("aviso", "Cadastre ao menos um usuário e um livro antes de registrar empréstimos.");
  }
})();
