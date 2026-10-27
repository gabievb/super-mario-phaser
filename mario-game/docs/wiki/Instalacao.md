# Instalação e execução

[Início da wiki](Home.md) · [Como jogar](Como-jogar.md)

## Requisitos

- Node.js 24 e npm. O arquivo [`.nvmrc`](../../.nvmrc) registra a versão principal.
- Navegador moderno com JavaScript habilitado, como Chrome, Firefox ou Edge.
- Git para clonar o projeto e acesso à conta autorizada, se o repositório for privado.
- Internet para baixar as dependências na primeira instalação.

Confira as ferramentas:

```sh
node --version
npm --version
git --version
```

Quem utiliza nvm pode selecionar o Node na pasta do projeto:

```sh
nvm install
nvm use
```

O Vite instalado declara suporte a Node `^20.19.0 || >=22.12.0`; a versão escolhida
para este projeto é a 24.

## Obter o projeto

Se os arquivos já estão na sua máquina, abra o terminal na pasta `mario-game`,
onde está o `package.json`, e vá para a instalação das dependências.

Depois de criar o repositório privado, substitua `SEU_USUARIO` pela conta ou
organização proprietária e ajuste o nome se necessário:

```sh
gh repo clone SEU_USUARIO/super-mario-phaser
cd super-mario-phaser
```

Esse exemplo usa o GitHub CLI autenticado. Outra opção é copiar a URL SSH ou HTTPS
do botão **Code** do repositório e executar `git clone URL_DO_REPOSITORIO`.

## Instalar as dependências

```sh
npm ci
```

Esse comando utiliza as versões registradas em `package-lock.json`. O jogo não
exige arquivo `.env`, chave de API ou configuração de serviços externos.

## Executar em desenvolvimento

```sh
npm run dev
```

Abra o endereço exibido no terminal, normalmente `http://localhost:5173`.
O Vite atualiza a página quando você salva alterações. Use `Ctrl+C` para encerrar.

Para escolher uma porta:

```sh
npm run dev -- --port 5174 --strictPort
```

Para abrir no celular conectado à mesma rede:

```sh
npm run dev -- --host 0.0.0.0
```

Abra no celular o endereço **Network** exibido pelo Vite. O computador precisa
continuar ligado, com o servidor executando, e permitir a porta na rede local.

## Gerar e conferir a versão de produção

```sh
npm run build
npm run preview
```

O build gera os arquivos estáticos em `dist/`. O preview normalmente utiliza
`http://localhost:4173`; consulte o endereço do terminal. Ele serve para conferir
o build localmente. A pasta `dist/` é gerada e não entra no Git.

## Resolver problemas comuns

| Problema                                    | Como resolver                                                                                                                                                    |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node` ou `npm` não encontrado              | Instale o Node e reabra o terminal.                                                                                                                              |
| Erro de versão do Node                      | Execute `nvm install` e `nvm use`, ou instale o Node 24.                                                                                                         |
| `npm ci` informa divergência no lockfile    | Confira se `package.json` e `package-lock.json` vieram do mesmo commit. Se alterou dependências de propósito, execute `npm install` e versione os dois arquivos. |
| Porta ocupada                               | Use outra porta com `--port`, ou encerre o processo que está usando a porta.                                                                                     |
| Página aberta por duplo clique não funciona | Execute o servidor Vite e abra a URL HTTP exibida no terminal.                                                                                                   |
| Jogo sem som                                | Clique ou toque na página para liberar o áudio e confira o botão de som.                                                                                         |
| Jogo pausado ao voltar à aba                | É o comportamento esperado: clique em Continuar.                                                                                                                 |
| Não consigo clonar o repositório privado    | Confira a conta em `gh auth status` e se ela tem acesso ao repositório.                                                                                          |

A interface carrega fontes do Google Fonts, com alternativas locais. Após instalar
as dependências, o jogo não depende de backend ou de imagens hospedadas fora do
projeto para funcionar.
