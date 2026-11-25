# Barbearia Santa Rosa — Node.js + MySQL

## O que este projeto faz
- Cria a tabela `clientes` no MySQL (arquivo `database.sql`).
- Recebe o cadastro pela rota `POST /signup`.
- Confere os campos, confirma as senhas, exige aceite dos termos e impede e-mail duplicado.
- Armazena a senha com hash bcrypt (a senha original não é gravada).
- Recebe o login pela rota `POST /login` e compara a senha com bcrypt.
- Cria uma sessão após o login e oferece a rota `GET /logout`.

## 1. Requisitos
- Node.js instalado.
- MySQL 8.0+ em execução.

## 2. Criar o banco
Abra o MySQL Workbench ou phpMyAdmin e execute todo o conteúdo de `database.sql`.

## 3. Configurar o projeto
No terminal, dentro desta pasta:

```bash
npm install
```

Copie `.env.example` para `.env` e ajuste os dados de conexão com seu MySQL.
Troque `SESSION_SECRET` por uma chave longa e aleatória. Não compartilhe o `.env`.

## 4. Iniciar
```bash
npm start
```
Depois acesse `http://localhost:3000/PaginaInstitucional.html`.

## 5. Compatibilidade com os formulários enviados
- `CadastroCliente.html`: envia `nome`, `phone`, `email`, `senha`, `confirmar_senha` e `termos` para `/signup`.
- `LoginCliente.html`: envia `email` e `senha` para `/login`.
- A página institucional é servida como arquivo estático.

Os nomes de campos e rotas correspondem aos HTMLs fornecidos. O campo `confirmar_senha` é usado apenas para validar e não é armazenado.

## Observações
- O projeto assume que `styles/style.css` e `images/logo.jpg` sejam colocados em `public/styles/` e `public/images/`, respectivamente, caso queira manter o mesmo visual. Esses arquivos não estavam entre os três HTMLs recebidos.
- Para publicar na internet, configure HTTPS, armazenamento de sessão apropriado para produção, proteção CSRF e limites de tentativas de login. O armazenamento padrão de sessão do Express é adequado apenas para desenvolvimento/testes.
- O sistema não implementa recuperação de senha nem uma área restrita; essas funções exigem rotas e telas adicionais.
