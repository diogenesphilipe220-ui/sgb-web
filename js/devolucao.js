/* devolucao.js – página devolucao.html: devolução e multa (RF04, RN04) */
(function () {
  const form = document.getElementById("formDevolucao");
  const selEmprestimo = document.getElementById("emprestimo");
  const campoData = document.getElementById("dataDevolucao");
  const resumoPrevista = document.getElementById("resumoPrevista");
  const resumoAtraso = document.getElementById("resumoAtraso");
  const resumoMulta = document.getElementById("resumoMulta");

  function nomeDe(lista, id, campo) {
    const item = lista.filter(function (i) { return i.id === id; })[0];
    return item ? item[campo] : "(removido)";
  }

  function carregarOpcoes() {
    const atual = selEmprestimo.value;
    selEmprestimo.length = 1;
    const usuarios = Armazenamento.listarUsuarios();
    const livros = Armazenamento.listarLivros();
    Armazenamento.listarEmprestimos()
      .filter(function (e) { return e.dataDevolucao === null; })
      .sort(function (a, b) { return a.dataPrevista.localeCompare(b.dataPrevista); })
      .forEach(function (e) {
        const opcao = document.createElement("option");
        opcao.value = String(e.id);
        opcao.textContent = "Nº " + e.id + " – " + nomeDe(usuarios, e.usuarioId, "nome") + " – " +
          nomeDe(livros, e.livroId, "titulo") + " (prevista " + SGB.formatarData(e.dataPrevista) + ")";
        selEmprestimo.appendChild(opcao);
      });
    selEmprestimo.value = atual;
  }

  function emprestimoSelecionado() {
    const id = Number(selEmprestimo.value);
    return Armazenamento.listarEmprestimos().filter(function (e) { return e.id === id; })[0] || null;
  }

  function atualizarResumo() {
    const emprestimo = selEmprestimo.value ? emprestimoSelecionado() : null;
    if (!emprestimo) {
      resumoPrevista.textContent = "–";
      resumoAtraso.textContent = "–";
      resumoMulta.textContent = SGB.formatarMoeda(0);
      return;
    }
    resumoPrevista.textContent = SGB.formatarData(emprestimo.dataPrevista);
    if (!campoData.value) {
      resumoAtraso.textContent = "–";
      resumoMulta.textContent = SGB.formatarMoeda(0);
      return;
    }
    resumoAtraso.textContent = String(SGB.diasDeAtraso(emprestimo.dataPrevista, campoData.value));
    resumoMulta.textContent = SGB.formatarMoeda(SGB.calcularMulta(emprestimo.dataPrevista, campoData.value));
  }

  selEmprestimo.addEventListener("change", atualizarResumo);
  campoData.addEventListener("input", atualizarResumo);
  campoData.addEventListener("change", atualizarResumo);

  SGB.limparErroAoDigitar(form);
  form.addEventListener("reset", function () {
    SGB.limparErros(form);
    setTimeout(function () {
      campoData.value = SGB.hoje();
      atualizarResumo();
    }, 0);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    SGB.limparErros(form);

    let invalido = false;
    if (!selEmprestimo.value) { SGB.mostrarErro("emprestimo", "Selecione um empréstimo."); invalido = true; }
    if (!campoData.value) { SGB.mostrarErro("dataDevolucao", "Informe a data da devolução."); invalido = true; }
    if (invalido) {
      SGB.mostrarMensagem("erro", "Corrija os campos destacados.");
      return;
    }

    const emprestimos = Armazenamento.listarEmprestimos();
    const emprestimo = emprestimos.filter(function (x) { return x.id === Number(selEmprestimo.value); })[0];
    if (!emprestimo || emprestimo.dataDevolucao !== null) {
      SGB.mostrarMensagem("erro", "Empréstimo inválido ou já devolvido.");
      carregarOpcoes();
      return;
    }
    if (campoData.value < emprestimo.dataEmprestimo) {
      SGB.mostrarErro("dataDevolucao", "A devolução não pode ser anterior ao empréstimo (" + SGB.formatarData(emprestimo.dataEmprestimo) + ").");
      SGB.mostrarMensagem("erro", "Corrija os campos destacados.");
      return;
    }

    const multa = SGB.calcularMulta(emprestimo.dataPrevista, campoData.value);
    emprestimo.dataDevolucao = campoData.value;
    emprestimo.multa = multa;

    const livros = Armazenamento.listarLivros();
    const livro = livros.filter(function (l) { return l.id === emprestimo.livroId; })[0];
    if (livro) livro.exemplares += 1;

    if (!Armazenamento.salvarEmprestimos(emprestimos) || !Armazenamento.salvarLivros(livros)) {
      SGB.mostrarMensagem("erro", "Não foi possível salvar os dados neste navegador.");
      return;
    }

    const numero = emprestimo.id;
    form.reset();
    carregarOpcoes();
    SGB.mostrarMensagem(multa > 0 ? "aviso" : "sucesso",
      "Devolução do empréstimo nº " + numero + " registrada. Multa: " + SGB.formatarMoeda(multa) + ".");
  });

  campoData.value = SGB.hoje();
  carregarOpcoes();
  atualizarResumo();
  if (selEmprestimo.length === 1) {
    SGB.mostrarMensagem("aviso", "Não há empréstimos ativos para devolver.");
  }
})();
