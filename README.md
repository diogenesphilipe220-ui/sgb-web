# SGB – Front-end (Sistema de Gerenciamento de Biblioteca)

Front-end do Projeto Integrador, feito com **HTML, CSS e JavaScript** puros (sem back-end).
Os dados (livros, usuários e empréstimos) ficam salvos no `localStorage` do navegador.

## Como abrir
1. Baixe ou clone o projeto.
2. Dê duplo clique em `index.html` (recomendado: Google Chrome).
3. Na página inicial, use **Carregar dados de exemplo** para testar o sistema.

## Páginas
| Página | Função | Requisito |
|---|---|---|
| `index.html` | Painel com resumo e próximas devoluções | – |
| `livros.html` | Buscar, listar e cadastrar livros | RF01 |
| `usuarios.html` | Buscar, listar e cadastrar usuários | RF02, RN05 |
| `emprestimo.html` | Registrar empréstimo | RF03, RN01, RN02, RN03 |
| `devolucao.html` | Registrar devolução e calcular a multa | RF04, RN04 |
| `atrasos.html` | Empréstimos ativos e em atraso | RF05 |

## Regras de negócio aplicadas
- Prazo de devolução de 7 dias (RN01)
- Máximo de 3 empréstimos ativos por usuário (RN02)
- Não é possível emprestar livro sem exemplares (RN03)
- Multa de R$ 1,00 por dia de atraso (RN04)
- CPF e ISBN não podem se repetir (RN05)

## Estrutura
```
index.html, livros.html, usuarios.html, emprestimo.html, devolucao.html, atrasos.html
css/estilo.css          estilos de todas as páginas
js/armazenamento.js     dados no localStorage
js/validacoes.js        validação de CPF, ISBN, e-mail e campos
js/comum.js             regras de negócio, datas, mensagens e tabelas
js/painel.js, livros.js, usuarios.js, emprestimo.js, devolucao.js, atrasos.js
wireframes/             wireframes das 6 páginas (PNG e PDF)
```

## Projeto relacionado
Camada de regras de negócio em Java: https://github.com/diogenesphilipe220-ui/sgb-negocio
