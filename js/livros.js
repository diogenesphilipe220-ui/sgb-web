/* livros.js – página livros.html: busca, listagem e cadastro (RF01, RN05) */
(function () {
  const corpo = document.getElementById("corpoLivros");
  const contador = document.getElementById("contador");
  const formBusca = document.getElementById("formBusca");
  const campoBusca = document.getElementById("busca");
  const form = document.getElementById("formLivro");

  function filtrar(termo) {
    const busca = SGB.normalizar(termo.trim());
    const todos = Armazenamento.listarLivros();
    if (busca === "") return todos;
    const digitos = busca.replace(/\D/g, "");
    return todos.filter(function (l) {
      return SGB.normalizar(l.titulo).indexOf(busca) !== -1 ||
             SGB.normalizar(l.autor).indexOf(busca) !== -1 ||
             (digitos !== "" && l.isbn.indexOf(digitos) !== -1);
    });
  }

  function desenhar() {
    const termo = campoBusca.value;
    const lista = filtrar(termo);
    SGB.limpar(corpo);
    if (lista.length === 0) {
      corpo.appendChild(SGB.criarLinhaVazia(4, "Nenhum livro encontrado."));
    } else {
      lista.forEach(function (l) {
        corpo.appendChild(SGB.criarLinha([l.titulo, l.autor, l.isbn, String(l.exemplares)]));
      });
    }
    const rotulo = termo.trim() === "" ? " cadastrado(s)" : " encontrado(s)";
    contador.textContent = lista.length + " livro(s)" + rotulo;
  }

  formBusca.addEventListener("submit", function (e) {
    e.preventDefault();
    desenhar();
  });
  campoBusca.addEventListener("input", desenhar);

  SGB.limparErroAoDigitar(form);
  form.addEventListener("reset", function () { SGB.limparErros(form); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    SGB.limparErros(form);

    const titulo = document.getElementById("titulo").value.trim();
    const autor = document.getElementById("autor").value.trim();
    const isbnDigitado = document.getElementById("isbn").value;
    const exemplares = document.getElementById("exemplares").value;

    const erros = {
      titulo: Validacoes.textoObrigatorio(titulo, 2, "Título"),
      autor: Validacoes.textoObrigatorio(autor, 3, "Autor"),
      isbn: Validacoes.validarIsbn(isbnDigitado),
      exemplares: Validacoes.validarInteiroNaoNegativo(exemplares, "Exemplares")
    };
    let invalido = false;
    Object.keys(erros).forEach(function (campo) {
      if (erros[campo] !== "") {
        SGB.mostrarErro(campo, erros[campo]);
        invalido = true;
      }
    });
    if (invalido) {
      SGB.mostrarMensagem("erro", "Corrija os campos destacados.");
      return;
    }

    // RN05: o ISBN não pode se repetir
    const isbn = Validacoes.somenteDigitos(isbnDigitado);
    const livros = Armazenamento.listarLivros();
    if (livros.some(function (l) { return l.isbn === isbn; })) {
      SGB.mostrarErro("isbn", "ISBN já cadastrado.");
      SGB.mostrarMensagem("erro", "Já existe um livro com esse ISBN.");
      return;
    }

    livros.push({
      id: Armazenamento.proximoId(livros),
      titulo: titulo,
      autor: autor,
      isbn: isbn,
      exemplares: Number(exemplares)
    });
    if (!Armazenamento.salvarLivros(livros)) {
      SGB.mostrarMensagem("erro", "Não foi possível salvar os dados neste navegador.");
      return;
    }
    form.reset();
    SGB.mostrarMensagem("sucesso", "Livro \"" + titulo + "\" cadastrado com sucesso.");
    desenhar();
  });

  desenhar();
})();
