# Fases e inimigos

[Início da wiki](Home.md) · [Como jogar](Como-jogar.md)

A campanha contém três mundos em sequência, definidos em
[`src/game/level.js`](../../src/game/level.js). Cada mundo tem largura de 4.800
pixels, dois buracos e dois checkpoints. A bandeira conclui a fase quando o
jogador chega à posição horizontal `x >= 4440`.

## Visão geral

| Mundo                     | Tempo | Inimigos terrestres | Plantas | Moedas no cenário | Blocos surpresa |
| ------------------------- | ----- | ------------------- | ------- | ----------------- | --------------- |
| 1 — Campos Verdes         | 180 s | 6                   | 4       | 29                | 9               |
| 2 — Floresta dos Espinhos | 170 s | 10                  | 5       | 25                | 7               |
| 3 — Fortaleza de Lava     | 160 s | 14                  | 6       | 25                | 9               |

As moedas dos blocos surpresa são adicionais às moedas distribuídas no cenário.

## Mundo 1 — Campos Verdes

O primeiro mundo apresenta as mecânicas em um cenário de campos e colinas.
Todos os seis inimigos terrestres são comuns e caem com um salto válido.
Patrulham a 56 pixels por segundo.

Os quatro canos possuem plantas sem projéteis. Aproveite esta fase para praticar
saltos de altura variável, pegar moedas em plataformas e atravessar os buracos.

- Buracos entre `x=1536–1680` e `x=2832–2976`, com 144 pixels de largura cada.
- Checkpoint 1: passe pelo trecho `x=1760–1800`; reaparecimento em `x=1740`.
- Checkpoint 2: passe pelo trecho `x=3050–3090`; reaparecimento em `x=3030`.

## Mundo 2 — Floresta dos Espinhos

A floresta altera as cores e a distribuição dos obstáculos. São quatro inimigos
comuns e seis blindados. Os blindados exigem dois saltos válidos, e as velocidades
de patrulha variam entre 70 e 94 pixels por segundo.

Há cinco plantas, ainda sem projéteis, e canos de alturas diferentes. As plantas
passam menos tempo escondidas do que no primeiro mundo. Use a pausa entre os
acertos para se reposicionar acima dos inimigos resistentes.

- Buracos entre `x=1440–1584` e `x=2784–2928`, com 144 pixels de largura cada.
- Checkpoint 1: passe pelo trecho `x=1660–1700`; reaparecimento em `x=1620`.
- Checkpoint 2: passe pelo trecho `x=3010–3050`; reaparecimento em `x=2980`.

## Mundo 3 — Fortaleza de Lava

A última fase usa chão de pedra e uma paleta quente. Há um inimigo comum, seis
blindados e sete elites. Os elites exigem três saltos válidos. As velocidades de
patrulha variam entre 84 e 114 pixels por segundo.

As seis plantas disparam fogo ao ficarem expostas, quando o jogador está a até
640 pixels na horizontal. O tiro é apontado para a posição do jogador no momento
do disparo e segue em linha reta a 190 pixels por segundo. Os buracos são mais
largos: mantenha o movimento e segure o salto para atravessá-los.

- Buracos entre `x=1392–1584` e `x=2688–2880`, com 192 pixels de largura cada.
- Checkpoint 1: passe pelo trecho `x=1660–1700`; reaparecimento em `x=1620`.
- Checkpoint 2: passe pelo trecho `x=2960–3000`; reaparecimento em `x=2920`.

Alcançar esta bandeira encerra a campanha e oferece **Jogar novamente**.

## Ciclo das plantas

Cada planta alterna entre escondida, subindo, exposta e descendo. Os valores
abaixo são os tempos configurados; a proximidade do jogador pode prolongar a
espera dentro do cano. As plantas também começam com atrasos diferentes.

| Mundo | Escondida | Subida | Exposta | Descida | Dispara fogo |
| ----- | --------- | ------ | ------- | ------- | ------------ |
| 1     | 3,0 s     | 0,7 s  | 1,6 s   | 0,7 s   | Não          |
| 2     | 2,3 s     | 0,6 s  | 2,0 s   | 0,6 s   | Não          |
| 3     | 1,8 s     | 0,5 s  | 2,3 s   | 0,5 s   | Sim          |

Uma planta escondida não emerge com o jogador junto à boca do cano. Quando está
completamente recolhida, sua colisão fica desativada. Plantas expostas causam dano
por qualquer lado e não são derrotadas por saltos.

Para alterar mapas, inimigos e tempos, veja [Desenvolvimento](Desenvolvimento.md).
