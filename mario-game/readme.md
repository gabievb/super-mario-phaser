# Super Mario — Phaser Pilot

Jogo de plataforma experimental para estudar **Phaser 3**, **Arcade Physics** e
**Vite**, com interface em português e três mundos de dificuldade crescente.
Colete moedas, salte sobre inimigos e alcance a bandeira de cada fase.

Projeto de estudo não oficial. A arte usada pelo jogo de plataforma é gerada em
[`src/game/art.js`](src/game/art.js) e os efeitos sonoros são sintetizados com Web Audio.

## Instalar e jogar

Requisitos: **Node.js 24**, npm e um navegador moderno. Se usa nvm, execute
`nvm install` e `nvm use` na pasta do projeto; a versão está em `.nvmrc`.

No terminal, dentro da pasta que contém `package.json`:

```sh
npm ci
npm run dev
```

Abra o endereço mostrado pelo Vite, normalmente `http://localhost:5173`.
Encerre o servidor com `Ctrl+C`.

## Controles

| Ação                    | Teclas                                   |
| ----------------------- | ---------------------------------------- |
| Mover                   | ← / → ou A / D                           |
| Pular                   | Espaço, ↑ ou W                           |
| Correr                  | Shift + movimento                        |
| Pausar ou continuar     | P; Escape também abre/fecha a pausa      |
| Reiniciar o mundo atual | R, fora do diálogo, ou botão de reinício |

Em celulares, use os botões de direção e salto na tela. Segurar o salto aumenta
sua altura. A interface também oferece som, tela cheia e reinício.

## Campanha

| Mundo                     | Tempo inicial | Inimigos terrestres | Desafio                                                              |
| ------------------------- | ------------- | ------------------- | -------------------------------------------------------------------- |
| 1 — Campos Verdes         | 180 s         | 6                   | Moedas, saltos e quatro plantas em canos                             |
| 2 — Floresta dos Espinhos | 170 s         | 10                  | Cinco plantas e inimigos que exigem dois saltos                      |
| 3 — Fortaleza de Lava     | 160 s         | 14                  | Seis plantas com tiros de fogo e inimigos que exigem até três saltos |

Ao completar um mundo, pontos, moedas e vidas seguem para o próximo. A vitória
da campanha acontece na terceira bandeira. Os detalhes estão no
[guia das fases](docs/wiki/Fases.md).

## Documentação / wiki

A wiki fica versionada com o código em [`docs/wiki`](docs/wiki/Home.md), acessível
pelos links abaixo tanto no editor quanto no repositório:

- [Início da wiki](docs/wiki/Home.md)
- [Instalar e executar na máquina](docs/wiki/Instalacao.md)
- [Como jogar: controles, pontuação e vidas](docs/wiki/Como-jogar.md)
- [Fases e inimigos](docs/wiki/Fases.md)
- [Estrutura do código, testes e personalização](docs/wiki/Desenvolvimento.md)
- [Criar e enviar para um repositório privado no GitHub](docs/wiki/Repositorio-privado.md)

## Build e testes

```sh
npm run build
npm run preview
```

O build gera `dist/`; o preview normalmente abre em `http://localhost:4173`.

```sh
npm test
```

Os testes usam Playwright e Google Chrome. A instalação de um navegador
compatível e as opções `CHROME_PATH` e `GAME_URL` estão no
[guia de desenvolvimento](docs/wiki/Desenvolvimento.md).
