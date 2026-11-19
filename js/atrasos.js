/* atrasos.js – página atrasos.html: empréstimos ativos e em atraso (RF05) */
(function () {
  const corpo = document.getElementById("corpoEmprestimos");
  const semResultados = document.getElementById("semResultados");
  const campoReferencia = document.getElementById("dataReferencia");
  const abas = document.querySelectorAll(".aba");
  const resumoAtivos = document.getElementById("resumoAtivos");
  const resumoAtrasos = document.getElementById("resumoAtrasos");
  const resumoMultaTotal = document.getElementById("resumoMultaTotal");

  let filtro = "ativos";

  function nomeDe(lista, id, campo) {
    const item = lista.filter(function (i) { return i.id === id; })[0];
    return item ? item[campo] : "(removido)";
  }

  function desenhar() {
    const referencia = campoReferencia.value || SGB.hoje();
    const usuarios = Armazenamento.listarUsuarios();
    const livros = Armazenamento.listarLivros();
    const ativos = Armazenamento.listarEmprestimos()
      .filter(function (e) { return e.dataDevolucao === null; })
      .sort(function (a, b) { return a.dataPrevista.localeCompare(b.dataPrevista); });

    let totalAtrasos = 0;
    let multaTotal = 0;
    const exibidos = [];
    ativos.forEach(function (e) {
      const atraso = SGB.diasDeAtraso(e.dataPrevista, referencia);
      if (atraso > 0) {
        totalAtrasos += 1;
        multaTotal += SGB.calcularMulta(e.dataPrevista, referencia);
      }
      if (filtro === "ativos" || atraso > 0) exibidos.push({ emprestimo: e, atraso: atraso });
    });

    SGB.limpar(corpo);
    exibidos.forEach(function (item) {
      const e = item.emprestimo;
      const situacao = item.atraso > 0
        ? SGB.criarEtiqueta("Atraso de " + item.atraso + " dia(s)", "atraso")
        : SGB.criarEtiqueta("No prazo", "ok");
      corpo.appendChild(SGB.criarLinha([
        String(e.id),
        nomeDe(usuarios, e.usuarioId, "nome"),
        nomeDe(livros, e.livroId, "titulo"),
        SGB.formatarData(e.dataEmprestimo),
        SGB.formatarData(e.dataPrevista),
        situacao
      ], item.atraso > 0 ? "linha-atraso" : ""));
    });
    semResultados.hidden = exibidos.length !== 0;
    resumoAtivos.textContent = String(ativos.length);
    resumoAtrasos.textContent = String(totalAtrasos);
    resumoMultaTotal.textContent = SGB.formatarMoeda(multaTotal);
  }

  abas.forEach(function (aba) {
    aba.setAttribute("aria-pressed", aba.classList.contains("aba--ativa") ? "true" : "false");
    aba.addEventListener("click", function () {
      filtro = aba.getAttribute("data-filtro");
      abas.forEach(function (outra) {
        const ativa = outra === aba;
        outra.classList.toggle("aba--ativa", ativa);
        outra.setAttribute("aria-pressed", ativa ? "true" : "false");
      });
      desenhar();
    });
  });

  campoReferencia.addEventListener("input", desenhar);
  campoReferencia.addEventListener("change", desenhar);

  campoReferencia.value = SGB.hoje();
  desenhar();
})();
