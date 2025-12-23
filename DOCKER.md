# Docker Setup - Wealth Wise

Este documento explica como executar o projeto Wealth Wise em um container Docker.

## Pré-requisitos

- Docker instalado (versão 20.10 ou superior)
- Docker Compose instalado (opcional, mas recomendado)

## Variáveis de Ambiente

Antes de executar o container, você precisa configurar as variáveis de ambiente do Supabase. Crie um arquivo `.env` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

## Opção 1: Usando Docker Compose (Recomendado)

1. Configure as variáveis de ambiente no arquivo `docker-compose.yml` ou crie um arquivo `.env`

2. Construa e execute o container:
```bash
docker-compose up --build
```

3. Para executar em background:
```bash
docker-compose up -d --build
```

4. Para parar o container:
```bash
docker-compose down
```

5. Para ver os logs:
```bash
docker-compose logs -f
```

## Opção 2: Usando Docker diretamente

1. Construa a imagem:
```bash
docker build -t wealth-wise .
```

2. Execute o container:
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase \
  wealth-wise
```

Ou usando um arquivo `.env`:
```bash
docker run -p 3000:3000 --env-file .env wealth-wise
```

## Acessando a aplicação

Após iniciar o container, a aplicação estará disponível em:
- http://localhost:3000

## Comandos úteis

### Ver logs do container
```bash
docker-compose logs -f wealth-wise
```

### Entrar no container
```bash
docker-compose exec wealth-wise sh
```

### Reconstruir após mudanças
```bash
docker-compose up --build
```

### Limpar tudo (containers, imagens, volumes)
```bash
docker-compose down -v --rmi all
```

## Troubleshooting

### Porta 3000 já está em uso
Altere a porta no `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Usa porta 3001 no host
```

### Erro de permissão
Se encontrar erros de permissão, verifique se o usuário `nextjs` tem as permissões corretas. O Dockerfile já configura isso automaticamente.

### Variáveis de ambiente não estão sendo lidas
Certifique-se de que as variáveis estão definidas no `docker-compose.yml` ou no arquivo `.env` que você está usando.

