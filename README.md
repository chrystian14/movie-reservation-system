# Sistema de Reservas de Filmes

Aplicação para gerenciar reservas de assentos para sessões de filmes, desenvolvida com:

- Desenvolvimento com TypeScript
- API REST comExpress
- Validação com Zod
- ORM Prisma
- Banco de dados PostgreSQL
- Containerização com Docker
- Testes com Jest / ts-jest
- Logging com Winston e Morgan
- Documentação com Swagger
- Linting com Eslint
- Formatação com Prettier

## Índice

- [Instalação](#instalação)
- [Configuração](#configuração)
- [Subindo o ambiente com Docker](#subindo-o-ambiente-com-docker)
  - [Seeding](#seeding)
  - [Testes](#testes)
- [Modelos do Prisma](#modelos-do-prisma)
  - [Operações Disponíveis](#operações-disponíveis)
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
| JWT_EXPIRES_IN   | Tempo de expiração do token                   | obrigatório                                   |

## Subindo o ambiente com Docker

Execute o comando para subir o container dev:

```bash
docker-compose up dev -d
```

Acesse a aplicação em http://localhost:3000.

### Seeding

Caso deseje fazer seeding de dados, execute o comando abaixo:

```bash
docker-compose exec dev npx db seed
```

Um usuário administrador com credenciais de email `admin@admin.com` e senha `admin123456` será criado ao executar o seeding.

### Testes

Para executar os testes, execute o comando abaixo:

```bash
docker-compose up test -d
```

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

## Licença

Este projeto está sob a licença MIT.
