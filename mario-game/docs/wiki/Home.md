# Wiki — Super Mario / Phaser Pilot

Este projeto é um jogo de plataforma de teste, feito com JavaScript, Phaser 3,
Arcade Physics e Vite. A campanha tem três mundos, arte pixelada gerada por código,
efeitos sonoros sintetizados e controles por teclado ou toque.

O objetivo é atravessar cada fase, coletar moedas, evitar perigos e alcançar a
bandeira. A última bandeira encerra a campanha.

## Por onde começar

| Quero…                                      | Página                                        |
| ------------------------------------------- | --------------------------------------------- |
| Instalar e jogar no meu computador          | [Instalação e execução](Instalacao.md)        |
| Entender os comandos e as regras            | [Como jogar](Como-jogar.md)                   |
| Conhecer cada mundo e seus desafios         | [Fases](Fases.md)                             |
| Alterar o jogo ou executar os testes        | [Desenvolvimento](Desenvolvimento.md)         |
| Subir o projeto para um repositório privado | [Repositório privado](Repositorio-privado.md) |

## O que está implementado

- Três mundos com cenários, distribuição de obstáculos e dificuldade diferentes.
- Movimento, corrida, salto de altura variável e câmera que acompanha o jogador.
- Moedas, blocos surpresa, inimigos comuns, blindados e elites.
- Plantas que emergem dos canos; no terceiro mundo, disparam bolas de fogo.
- Vidas, cronômetro, checkpoints e pontuação preservada entre mundos.
- Pausa, reinício, controle de som, tela cheia e interface responsiva.
- Testes de navegador com Playwright.

O progresso permanece na sessão em memória; recarregar a página começa uma nova
campanha. Não há backend, banco de dados nem cadastro de jogadores.

Esta wiki é uma pasta de Markdown dentro do próprio projeto. Ela acompanha os
commits e a visibilidade do repositório; a publicação na aba **Wiki** do GitHub é
uma ação separada.

[Voltar ao README](../../readme.md)
