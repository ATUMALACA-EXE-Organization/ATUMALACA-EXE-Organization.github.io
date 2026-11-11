require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

if (!process.env.SESSION_SECRET) {
  console.error('Defina SESSION_SECRET no arquivo .env antes de iniciar.');
  process.exit(1);
}

app.use(express.urlencoded({ extended: false }));
app.use(session({
  name: 'barbearia.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 2
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

function responderErro(res, mensagem, voltar) {
  return res.status(400).send(`
    <!doctype html>
    <html lang="pt-br">
    <meta charset="utf-8">
    <title>Barbearia Santa Rosa</title>
    <body style="font-family:Arial,sans-serif;max-width:600px;margin:50px auto;padding:20px">
      <h2>Não foi possível concluir a operação</h2>
      <p>${mensagem}</p>
      <a href="${voltar}">Voltar</a>
    </body>
    </html>
  `);
}

app.post('/signup', async (req, res) => {
  try {
    const nome = (req.body.nome || '').trim();
    const telefone = (req.body.phone || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const senha = req.body.senha || '';
    const confirmarSenha = req.body.confirmar_senha || '';
    const aceitouTermos = req.body.termos === 'on';

    if (!nome || !telefone || !email || !senha || !confirmarSenha) {
      return responderErro(res, 'Preencha todos os campos.', '/CadastroCliente.html');
    }
    if (senha !== confirmarSenha) {
      return responderErro(res, 'As senhas não coincidem.', '/CadastroCliente.html');
    }
    if (senha.length < 8) {
      return responderErro(res, 'A senha deve ter pelo menos 8 caracteres.', '/CadastroCliente.html');
    }
    if (!aceitouTermos) {
      return responderErro(res, 'É necessário aceitar os termos de uso.', '/CadastroCliente.html');
    }

    const [existentes] = await db.execute(
      'SELECT id FROM clientes WHERE email = ? LIMIT 1',
      [email]
    );

    if (existentes.length > 0) {
      return responderErro(res, 'Este e-mail já está cadastrado.', '/CadastroCliente.html');
    }

    const senhaHash = await bcrypt.hash(senha, 12);
    await db.execute(
      `INSERT INTO clientes (nome, telefone, email, senha_hash, aceitou_termos)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, telefone, email, senhaHash, true]
    );

    return res.redirect('/LoginCliente.html');
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return res.status(500).send('Erro interno ao realizar o cadastro.');
  }
});

app.post('/login', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const senha = req.body.senha || '';

    if (!email || !senha) {
      return responderErro(res, 'Informe o e-mail e a senha.', '/LoginCliente.html');
    }

    const [clientes] = await db.execute(
      'SELECT id, nome, email, senha_hash FROM clientes WHERE email = ? LIMIT 1',
      [email]
    );

    if (clientes.length === 0) {
      return responderErro(res, 'E-mail ou senha incorretos.', '/LoginCliente.html');
    }

    const cliente = clientes[0];
    const senhaValida = await bcrypt.compare(senha, cliente.senha_hash);

    if (!senhaValida) {
      return responderErro(res, 'E-mail ou senha incorretos.', '/LoginCliente.html');
    }

    req.session.cliente = {
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email
    };

    return res.send(`
      <!doctype html>
      <html lang="pt-br">
      <meta charset="utf-8">
      <title>Login realizado</title>
      <body style="font-family:Arial,sans-serif;max-width:600px;margin:50px auto;padding:20px">
        <h2>Login realizado com sucesso!</h2>
        <p>Bem-vindo(a), ${String(cliente.nome).replace(/[&<>"']/g, c => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[c])}.</p>
        <a href="/PaginaInstitucional.html">Ir para a página inicial</a>
        <p><a href="/logout">Sair</a></p>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).send('Erro interno ao realizar o login.');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/LoginCliente.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor da Barbearia Santa Rosa em http://localhost:${PORT}`);
});
