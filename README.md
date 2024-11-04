# Sistema de Reservas de Filmes

O Movie Reservation System é uma aplicação para gerenciar reservas de assentos para sessões de filmes. Este projeto utiliza TypeScript, Express, Prisma e PostgreSQL, e está configurado para ser executado com Docker.

## Índice

- [Instalação](#instalação)
- [Configuração](#configuração)
- [Subindo o ambiente com Docker](#subindo-o-ambiente-com-docker)
- [Modelos do Prisma](#modelos-do-prisma)
- [Operações Disponíveis](#operações-disponíveis)
- [Ferramentas e Tecnologias](#ferramentas-e-tecnologias)
- [Licença](#licença)

## Instalação

Clone o repositório:

```bash
git clone git@github.com:chrystian14/movie-reservation-system.git
cd movie-reservation-system
```

## Configuração

Copie o arquivo `.env.example` para `.env` e configure as variáveis de ambiente:

```bash
cp .env.example .env
```

| Nome da Variável | Descrição                                     | Obrigatoriedade                               |
| ---------------- | --------------------------------------------- | --------------------------------------------- |
| DATABASE_URL     | Credenciais do banco de dados utilizado       | obrigatório somente para rodar fora do docker |
| JWT_SECRET_KEY   | Chave secreta utilizada pela autenticação JWT | obrigatório                                   |
| JWT_EXPIRES_IN   | Chave secreta utilizada pela autenticação JWT | obrigatório                                   |

## Subindo o ambiente com Docker

Execute o comando para subir o container dev:

```bash
docker-compose up dev -d
```

Acesse a aplicação em http://localhost:3000.

## Modelos do Prisma

O projeto utiliza Prisma para gerenciar a comunicação com o banco de dados. Os modelos definidos incluem User, Movie, Genre, Room, Seat, Showtime e Reservation.

## Operações Disponíveis

A documentação completa do projeto está disponível em http://localhost:3000/api/docs.

### Usuários (Users)

| Ação                 | Permissão       |
| -------------------- | --------------- |
| Criar user nao admin | nao autenticado |

### Gêneros (Genres)

| Ação          | Permissão |
| ------------- | --------- |
| Criar genre   | admin     |
| Deletar genre | admin     |

### Filmes (Movies)

| Ação            | Permissão       |
| --------------- | --------------- |
| Criar movie     | admin           |
| Atualizar movie | admin           |
| Deletar movie   | admin           |
| Listar movies   | não autenticado |

### Salas (Rooms)

| Ação       | Permissão |
| ---------- | --------- |
| Criar room | admin     |

### Assentos (Seats)

| Ação       | Permissão |
| ---------- | --------- |
| Criar seat | admin     |

### Sessões de Exibição (Showtimes)

| Ação                                       | Permissão       |
| ------------------------------------------ | --------------- |
| Criar showtime                             | admin           |
| Listar showtimes                           | não autenticado |
| Listar assentos dispoíveis para o showtime | não autenticado |

### Reservas (Reservations)

| Ação                         | Permissão                             |
| ---------------------------- | ------------------------------------- |
| Criar reservation            | autenticado                           |
| Listar próprias reservations | autenticado                           |
| Listar todas as reservations | admin                                 |
| Cancelar reservation         | autenticado (somente dono da reserva) |

## Ferramentas e Tecnologias

- Node.js
- TypeScript
- Prisma
- Docker
- Express
- Jest
- Swagger
- ESLint
- Winston
- Zod

## Licença

Este projeto está sob a licença MIT.
