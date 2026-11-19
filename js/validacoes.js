/* ==========================================================
   validacoes.js – funções de validação dos formulários
   Cada função devolve "" (válido) ou a mensagem de erro.
   ========================================================== */
const Validacoes = (function () {

  function somenteDigitos(texto) {
    return String(texto).replace(/\D/g, "");
  }

  function textoObrigatorio(valor, minimo, rotulo) {
    const texto = String(valor).trim();
    if (texto === "") return rotulo + " é obrigatório.";
    if (texto.length < minimo) return rotulo + " deve ter pelo menos " + minimo + " caracteres.";
    return "";
  }

  // Valida os dígitos verificadores do CPF
  function cpfValido(cpf) {
    const d = somenteDigitos(cpf);
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    for (let tamanho = 9; tamanho <= 10; tamanho++) {
      let soma = 0;
      for (let i = 0; i < tamanho; i++) {
        soma += Number(d[i]) * (tamanho + 1 - i);
      }
      let digito = (soma * 10) % 11;
      if (digito === 10) digito = 0;
      if (digito !== Number(d[tamanho])) return false;
    }
    return true;
  }

  function validarCpf(valor) {
    if (String(valor).trim() === "") return "CPF é obrigatório.";
    if (!cpfValido(valor)) return "CPF inválido.";
    return "";
  }

  // Aplica a máscara 000.000.000-00 enquanto a pessoa digita
  function formatarCpf(valor) {
    return somenteDigitos(valor).slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  // ISBN com 10 ou 13 dígitos (hífens e espaços são ignorados)
  function validarIsbn(valor) {
    if (String(valor).trim() === "") return "ISBN é obrigatório.";
    const d = somenteDigitos(valor);
    if (d.length !== 10 && d.length !== 13) return "O ISBN deve ter 10 ou 13 dígitos.";
    return "";
  }

  function validarEmail(valor) {
    const texto = String(valor).trim();
    if (texto === "") return "E-mail é obrigatório.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto)) return "Informe um e-mail válido.";
    return "";
  }

  function validarInteiroNaoNegativo(valor, rotulo) {
    const texto = String(valor).trim();
    if (texto === "") return rotulo + " é obrigatório.";
    if (!/^\d+$/.test(texto)) return "Informe um número inteiro maior ou igual a 0.";
    return "";
  }

  return {
    somenteDigitos: somenteDigitos,
    textoObrigatorio: textoObrigatorio,
    cpfValido: cpfValido,
    validarCpf: validarCpf,
    formatarCpf: formatarCpf,
    validarIsbn: validarIsbn,
    validarEmail: validarEmail,
    validarInteiroNaoNegativo: validarInteiroNaoNegativo
  };
})();
