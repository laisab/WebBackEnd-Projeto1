const http = require('http'), express = require('express'), session = require('express-session'), hbs = require('hbs'), path = require('path'), app = express();
const Cliente = require('./model/Cliente'), Vendedor = require('./model/Vendedor'), Produto = require('./model/Produto');

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: false}));

hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

// Middleware que implementa a session
app.use(session({
    secret: 'segredo',
    resave: false,
    saveUninitialized: true,
    cookie: {secure : false}
}));

// Autenticação do Cliente
function authCliente(req, res, next){
    if(!req.session.cliente){
        return res.render('login-clientes', {titulo: "Faça o login para acessar a página"});
    }

    next();
}

// Rota de teste
app.get('/teste', (req, res) => {
    res.end('E-commerce funcionando!');
});

// Rotas do Cliente
app.get('/cliente/cadastro', (req, res) => {
    res.render('cadastro-clientes', {titulo: 'Cadastro de Cliente'});
});

app.post('/cliente/cadastro', async (req, res) => {
    try{
        const {nome, cpf, email, senha, endereco} = req.body;
        const cliente = new Cliente(nome, cpf, email, senha, endereco);

        cliente.validar();
        await cliente.inserirDB();
        
        res.render('login-clientes', {titulo: 'Login'});
    }catch(err){
        res.render('cadastro-clientes', {titulo: "Erro ao cadastrar o cliente"});
        Cliente.logError(err);
    }
});

app.post('/cliente/login', async (req, res) => {
    try{
        const cpf = req.body.cpf, senha = req.body.senha;
        const cliente = await Cliente.pesquisarCpf(cpf);

        if(cliente.cpf !== cpf){
            console.log('CPF incorreto');
        }

        if(cliente.senha !== senha){
            console.log('Senha incorreta');
        }

        req.session.cliente = {
            nome: cliente.nome,
            cpf: cliente.cpf,
            email: cliente.email,
            endereco: cliente.endereco
        };

        res.redirect('/cliente/minhaconta');
    }catch(err){
        res.render('login-clientes', {titulo: "Erro ao realizar login do cliente"});
        Cliente.logError(err);
    }
});

app.get('/cliente/minhaconta', authCliente, (req, res) => {
    res.render('minha-conta', {titulo: 'Minha Conta', dados: req.session.cliente});
});

app.get('/cliente/logout', authCliente, (req, res) => {
    req.session.destroy(() => {
        res.render('login-clientes', {titulo: 'Login'});
    });
});

app.listen(8000);