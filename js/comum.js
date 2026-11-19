/* ==========================================================
   comum.js – regras de negócio e utilitários usados por todas as páginas
   As constantes e os cálculos espelham o código Java do SGB.
   ========================================================== */
const SGB = (function () {

  /* ---------- Regras de negócio (RN01, RN02, RN04) ---------- */
  const PRAZO_EM_DIAS = 7;
  const LIMITE_EMPRESTIMOS = 3;
  const MULTA_POR_DIA = 1.0;

  /* ---------- Datas (sempre no formato ISO "aaaa-mm-dd") ---------- */
  function paraISO(data) {
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return data.getFullYear() + "-" + mes + "-" + dia;
  }

  function daISO(iso) {
    const partes = iso.split("-").map(Number);
    return new Date(partes[0], partes[1] - 1, partes[2]);
  }

  function hoje() {
    return paraISO(new Date());
  }

  function somarDias(iso, dias) {
    const data = daISO(iso);
    data.setDate(data.getDate() + dias);
    return paraISO(data);
  }

  function diasEntre(inicioISO, fimISO) {
    return Math.round((daISO(fimISO) - daISO(inicioISO)) / 86400000);
  }

  function formatarData(iso) {
    if (!iso) return "–";
    const p = iso.split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }

  function formatarMoeda(valor) {
    return "R$ " + valor.toFixed(2).replace(".", ",");
  }

  /* ---------- Cálculos (equivalem a Emprestimo.diasDeAtraso e CalculadoraMulta) ---------- */
  function diasDeAtraso(dataPrevista, dataReferencia) {
    return Math.max(diasEntre(dataPrevista, dataReferencia), 0);
  }

  function calcularMulta(dataPrevista, dataDevolucao) {
    return diasDeAtraso(dataPrevista, dataDevolucao) * MULTA_POR_DIA;
  }

  function ativosDoUsuario(usuarioId) {
    return Armazenamento.listarEmprestimos().filter(function (e) {
      return e.usuarioId === usuarioId && e.dataDevolucao === null;
    }).length;
  }

  /* ---------- Mensagens e erros nos formulários ---------- */
  function mostrarMensagem(tipo, texto) {
    const area = document.getElementById("mensagem");
    if (!area) return;
    area.className = "mensagem mensagem--" + tipo;
    area.textContent = texto;
    area.hidden = false;
  }

  function esconderMensagem() {
    const area = document.getElementById("mensagem");
    if (area) {
      area.hidden = true;
      area.textContent = "";
    }
  }

  function mostrarErro(idCampo, texto) {
    const campo = document.getElementById(idCampo);
    const aviso = document.getElementById("erro-" + idCampo);
    if (campo) {
      campo.classList.add("invalido");
      campo.setAttribute("aria-invalid", "true");
    }
    if (aviso) aviso.textContent = texto;
  }

  function limparErroDoCampo(idCampo) {
    const campo = document.getElementById(idCampo);
    const aviso = document.getElementById("erro-" + idCampo);
    if (campo) {
      campo.classList.remove("invalido");
      campo.removeAttribute("aria-invalid");
    }
    if (aviso) aviso.textContent = "";
  }

  function limparErros(formulario) {
    formulario.querySelectorAll(".invalido").forEach(function (campo) {
      campo.classList.remove("invalido");
      campo.removeAttribute("aria-invalid");
    });
    formulario.querySelectorAll(".erro").forEach(function (aviso) {
      aviso.textContent = "";
    });
    esconderMensagem();
  }

  // Quando a pessoa volta a digitar num campo, o erro dele some
  function limparErroAoDigitar(formulario) {
    ["input", "change"].forEach(function (evento) {
      formulario.addEventListener(evento, function (e) {
        if (e.target && e.target.id) limparErroDoCampo(e.target.id);
      });
    });
  }

  /* ---------- Tabelas ---------- */
  function limpar(elemento) {
    while (elemento.firstChild) elemento.removeChild(elemento.firstChild);
  }

  // Cria uma linha de tabela. Cada valor pode ser texto ou um elemento (Node).
  function criarLinha(valores, classe) {
    const tr = document.createElement("tr");
    if (classe) tr.className = classe;
    valores.forEach(function (valor) {
      const td = document.createElement("td");
      if (valor instanceof Node) td.appendChild(valor);
      else td.textContent = valor;
      tr.appendChild(td);
    });
    return tr;
  }

  function criarLinhaVazia(colunas, texto) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = colunas;
    td.textContent = texto;
    tr.appendChild(td);
    return tr;
  }

  function criarEtiqueta(texto, tipo) {
    const span = document.createElement("span");
    span.className = "etiqueta etiqueta--" + tipo;
    span.textContent = texto;
    return span;
  }

  // Busca sem diferenciar maiúsculas e acentos
  function normalizar(texto) {
    return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  return {
    PRAZO_EM_DIAS: PRAZO_EM_DIAS,
    LIMITE_EMPRESTIMOS: LIMITE_EMPRESTIMOS,
    MULTA_POR_DIA: MULTA_POR_DIA,
    hoje: hoje,
    somarDias: somarDias,
    diasEntre: diasEntre,
    formatarData: formatarData,
    formatarMoeda: formatarMoeda,
    diasDeAtraso: diasDeAtraso,
    calcularMulta: calcularMulta,
    ativosDoUsuario: ativosDoUsuario,
    mostrarMensagem: mostrarMensagem,
    esconderMensagem: esconderMensagem,
    mostrarErro: mostrarErro,
    limparErros: limparErros,
    limparErroAoDigitar: limparErroAoDigitar,
    limpar: limpar,
    criarLinha: criarLinha,
    criarLinhaVazia: criarLinhaVazia,
    criarEtiqueta: criarEtiqueta,
    normalizar: normalizar
  };
})();
