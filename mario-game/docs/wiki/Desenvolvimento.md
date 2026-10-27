# Desenvolvimento e testes

[Início da wiki](Home.md) · [Instalação](Instalacao.md)

## Tecnologias e estrutura

O jogo usa JavaScript com módulos ES, Phaser 3, Arcade Physics, Vite e ícones
Lucide. A tela lógica mede 960 × 540 pixels e é redimensionada para caber no
contêiner. O HUD e os diálogos são elementos HTML atualizados por eventos do jogo.

| Arquivo ou pasta                                                           | Responsabilidade                                            |
| -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`index.html`](../../index.html)                                           | Estrutura da página, HUD, botões e diálogos                 |
| [`style.css`](../../style.css)                                             | Visual da interface e adaptação para telas menores          |
| [`src/main.js`](../../src/main.js)                                         | Inicializa o Phaser; conecta teclado, toque, HUD e diálogos |
| [`src/scenes/PlatformScene.js`](../../src/scenes/PlatformScene.js)         | Monta a fase, aplica física, colisões, regras e progressão  |
| [`src/game/level.js`](../../src/game/level.js)                             | Configura os três mundos e suas coordenadas                 |
| [`src/game/art.js`](../../src/game/art.js)                                 | Gera as texturas pixeladas utilizadas pela plataforma       |
| [`src/gameobjects/PiranhaPlant.js`](../../src/gameobjects/PiranhaPlant.js) | Controla ciclo, recorte visual e colisão das plantas        |
| [`tests/game.spec.js`](../../tests/game.spec.js)                           | Testes funcionais e de interface no navegador               |
| [`playwright.config.js`](../../playwright.config.js)                       | Servidor de teste, navegador e URL de execução              |
| [`vite.config.js`](../../vite.config.js)                                   | Configuração do build, com caminhos relativos               |
| `public/`, outras cenas e objetos                                          | Arquivos preservados do template original de nave           |

A entrada atual registra apenas `PlatformScene`. As outras cenas e os sprites do
template de nave não são carregados pelo jogo de plataforma.

## Comandos disponíveis

| Comando           | Resultado                                    |
| ----------------- | -------------------------------------------- |
| `npm ci`          | Instala as dependências a partir do lockfile |
| `npm run dev`     | Inicia o Vite em desenvolvimento             |
| `npm run build`   | Gera o build em `dist/`                      |
| `npm run preview` | Serve o último build para conferência local  |
| `npm test`        | Executa os testes Playwright                 |
| `npm run test:ui` | Abre a interface interativa do Playwright    |

## Executar os testes

Após instalar as dependências, execute:

```sh
npm test
```

Por padrão, o Playwright utiliza o **Google Chrome** instalado na máquina.
Caso ele não esteja instalado, você pode instalar o Chromium do Playwright e
informar seu executável. Em Bash (Linux/macOS):

```sh
npx playwright install chromium
CHROME_PATH="$(node --input-type=module -e 'import { chromium } from "@playwright/test"; console.log(chromium.executablePath())')" npm test
```

Se o navegador indicar bibliotecas de sistema ausentes no Linux, utilize
`npx playwright install --with-deps chromium` e repita o teste.

Também é possível apontar para um Chromium já instalado:

```sh
CHROME_PATH=/caminho/para/chromium npm test
```

No PowerShell, defina a variável antes do comando:

```powershell
$env:CHROME_PATH = "C:\caminho\para\chrome.exe"
npm test
```

A configuração inicia ou reutiliza um Vite em `http://127.0.0.1:5174`.
Para testar um servidor de desenvolvimento já em execução em outro endereço:

```sh
GAME_URL=http://127.0.0.1:5173 npm test
```

Os testes precisam do servidor de **desenvolvimento**: usam
`window.__MARIO_GAME__`, disponível somente nesse modo. O preview de produção
não expõe esse objeto.

A suíte verifica renderização, animação, movimento, saltos, moedas, blocos,
colisões, vidas, tempo, checkpoints, pausa, reinício, plantas, tiros, progressão
entre mundos e controles por toque. As capturas ficam em `test-results/`, pasta
ignorada pelo Git.

## Alterar uma fase

Edite os objetos de `LEVELS` em `src/game/level.js`:

| Campo                 | Conteúdo                                                       |
| --------------------- | -------------------------------------------------------------- |
| `name`, `description` | Nome e descrição exibidos na interface                         |
| `time`                | Tempo inicial em segundos                                      |
| `ground`              | Intervalos `[início, fim]` com chão; os espaços formam buracos |
| `blocks`              | Posições `[x, y, textura]` dos blocos                          |
| `pipes`               | Canos definidos por `[x, altura]`                              |
| `coins`               | Posições `[x, y]` das moedas                                   |
| `enemies`             | Posição, limites de patrulha, resistência e velocidade         |
| `checkpoints`         | Pares `[posição de ativação, posição de reaparecimento]`       |
| `plant`               | Durações em milissegundos e configuração dos projéteis         |
| `theme`               | Cores usadas na construção do cenário                          |

Use `brick` para tijolos e `question` para blocos que dão uma moeda.
O helper `walker(x, left, right, health, speed)` cria a configuração de um inimigo;
as resistências previstas pela arte atual são 1, 2 e 3.

Depois de alterar o mapa, confira se buracos e plataformas são alcançáveis e se
os checkpoints ficam em chão seguro. Execute `npm test` e `npm run build`.
Se mudar valores que os testes verificam, atualize as expectativas de acordo com
a nova regra e ajuste a página [Fases](Fases.md).

Para adicionar um quarto mundo, revise também a interface em `index.html`, os
textos que mencionam três mundos em `src/main.js`, a seleção de arte em
`PlatformScene.js` e os testes. Apenas acrescentar um objeto em `LEVELS` não
atualiza todas essas partes.

## Arquivos gerados

Versione código, documentação, recursos e `package-lock.json`. Dependências,
builds e resultados de testes são recriados localmente. A configuração atual não
utiliza segredos nem arquivos `.env`.
