/* usuarios.js – página usuarios.html: busca, listagem e cadastro (RF02, RN05) */
(function () {
  const corpo = document.getElementById("corpoUsuarios");
  const contador = document.getElementById("contador");
  const formBusca = document.getElementById("formBusca");
  const campoBusca = document.getElementById("busca");
  const form = document.getElementById("formUsuario");
  const campoCpf = document.getElementById("cpf");

  function filtrar(termo) {
    const busca = SGB.normalizar(termo.trim());
    const todos = Armazenamento.listarUsuarios();
    if (busca === "") return todos;
    const digitos = busca.replace(/\D/g, "");
    return todos.filter(function (u) {
      return SGB.normalizar(u.nome).indexOf(busca) !== -1 ||
             (digitos !== "" && u.cpf.indexOf(digitos) !== -1);
    });
  }

  function desenhar() {
    const termo = campoBusca.value;
    const lista = filtrar(termo);
    SGB.limpar(corpo);
    if (lista.length === 0) {
      corpo.appendChild(SGB.criarLinhaVazia(3, "Nenhum usuário encontrado."));
    } else {
      lista.forEach(function (u) {
        corpo.appendChild(SGB.criarLinha([u.nome, Validacoes.formatarCpf(u.cpf), u.email]));
      });
    }
    const rotulo = termo.trim() === "" ? " cadastrado(s)" : " encontrado(s)";
    contador.textContent = lista.length + " usuário(s)" + rotulo;
  }

  formBusca.addEventListener("submit", function (e) {
    e.preventDefault();
    desenhar();
  });
  campoBusca.addEventListener("input", desenhar);

  // Máscara do CPF enquanto digita
  campoCpf.addEventListener("input", function () {
    campoCpf.value = Validacoes.formatarCpf(campoCpf.value);
  });

  SGB.limparErroAoDigitar(form);
  form.addEventListener("reset", function () { SGB.limparErros(form); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    SGB.limparErros(form);

    const nome = document.getElementById("nome").value.trim();
    const cpfDigitado = document.getElementById("cpf").value;
    const email = document.getElementById("email").value.trim();

    const erros = {
      nome: Validacoes.textoObrigatorio(nome, 3, "Nome"),
      cpf: Validacoes.validarCpf(cpfDigitado),
      email: Validacoes.validarEmail(email)
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

    // RN05: o CPF não pode se repetir
    const cpf = Validacoes.somenteDigitos(cpfDigitado);
    const usuarios = Armazenamento.listarUsuarios();
    if (usuarios.some(function (u) { return u.cpf === cpf; })) {
      SGB.mostrarErro("cpf", "CPF já cadastrado.");
      SGB.mostrarMensagem("erro", "Já existe um usuário com esse CPF.");
      return;
    }

    usuarios.push({
      id: Armazenamento.proximoId(usuarios),
      nome: nome,
      cpf: cpf,
      email: email
    });
    if (!Armazenamento.salvarUsuarios(usuarios)) {
      SGB.mostrarMensagem("erro", "Não foi possível salvar os dados neste navegador.");
      return;
    }
    form.reset();
    SGB.mostrarMensagem("sucesso", "Usuário \"" + nome + "\" cadastrado com sucesso.");
    desenhar();
  });

  desenhar();
})();
