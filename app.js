const http = require('http'), express = require('express'), session = require('express-session'), hbs = require('hbs'), path = require('path'), app = express();
const Cliente = require('./model/Cliente'), Vendedor = require('./model/Vendedor'), Produto = require('./model/Produto');
const conectarDB = require('./db');

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: false}));

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

// Autenticação do Vendedor
function authVendedor(req, res, next){
    if(!req.session.vendedor){
        return res.render('login-vendedores', {titulo: "Faça o login para acessar a página"});
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

app.get('/cliente/login', (req, res) => {
    res.render('login-clientes', {titulo: 'Login'});
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
    res.render('minha-conta-cliente', {titulo: 'Minha Conta', dados: req.session.cliente});
});

app.get('/cliente/logout', authCliente, (req, res) => {
    req.session.destroy(() => {
        res.render('login-clientes', {titulo: 'Login'});
    });
});

app.post('/cliente/apagar', async (req, res) => {
    try{
        const cpf = req.body.cpf;
        await Cliente.deletarCpf(cpf);

        req.session.destroy(() => {
            res.redirect('/cliente/cadastro');
        });
    }catch(err){
        Cliente.logError(err);
    }
});

// Rotas do Vendedor
app.get('/vendedor/cadastro', (req, res) => {
    res.render('cadastro-vendedores', {titulo: 'Cadastro de Vendedor'});
});

app.post('/vendedor/cadastro', async (req, res) => {
    try{
        const {nome, cnpj, senha, endereco} = req.body;
        const vendedor = new Vendedor(nome, cnpj, senha, endereco);

        vendedor.validar();
        await vendedor.inserirDB();
        
        res.render('login-vendedores', {titulo: 'Login'});
    }catch(err){
        res.render('cadastro-vendedores', {titulo: "Erro ao cadastrar o vendedor"});
        Vendedor.logError(err);
    }
});

app.get('/vendedor/login', (req, res) => {
    res.render('login-vendedores', {titulo: 'Login'});
});

app.post('/vendedor/login', async (req, res) => {
    try{
        const cnpj = req.body.cnpj, senha = req.body.senha;
        const vendedor = await Vendedor.pesquisarCnpj(cnpj);

        if(vendedor.cnpj !== cnpj){
            console.log('CNPJ incorreto');
        }

        if(vendedor.senha !== senha){
            console.log('Senha incorreta');
        }

        req.session.vendedor = {
            nome: vendedor.nome,
            cnpj: vendedor.cnpj,
            endereco: vendedor.endereco
        };

        res.redirect('/vendedor/minhaconta');
    }catch(err){
        res.render('login-vendedores', {titulo: "Erro ao realizar login do vendedor"});
        Vendedor.logError(err);
    }
});

app.get('/vendedor/minhaconta', authVendedor, (req, res) => {
    res.render('minha-conta-vendedor', {titulo: 'Minha Conta', dados: req.session.vendedor});
});

app.get('/vendedor/logout', authVendedor, (req, res) => {
    req.session.destroy(() => {
        res.render('login-vendedores', {titulo: 'Login'});
    });
});

app.post('/vendedor/apagar', async (req, res) => {
    try{
        const cnpj = req.body.cnpj;
        await Vendedor.deletarCnpj(cnpj);

        req.session.destroy(() => {
            res.redirect('/vendedor/cadastro');
        });
    }catch(err){
        Vendedor.logError(err);
    }
});

// Rotas do Produto
app.get('/produto/cadastro', authVendedor, (req, res) => {
    res.render('cadastro-produtos', {titulo: 'Cadastro de Produto'});
});

app.post('/produto/cadastro', authVendedor, async (req, res) => {
    try{
        const {nome, descricao, preco} = req.body;
        const precoNumero = Number(preco);
        const vendedorCnpj = req.session.vendedor.cnpj;
        const produto = new Produto(nome, descricao, precoNumero, vendedorCnpj);

        produto.validar();
        await produto.inserirDB();
        
        res.redirect('/produto/lista');
    }catch(err){
        res.render('cadastro-produtos', {titulo: "Erro ao cadastrar o produto"});
        Produto.logError(err);
    }
});

app.get('/produto/lista', async (req, res) => {
    try{
        const db = await conectarDB();
        const collection = db.collection("produtos");
        const listaProdutos = await collection.find().toArray();

        res.render('produtos', {titulo: 'Lista de Produtos', produtos: listaProdutos});
    }catch(err){
        Produto.logError(err);
    }
});

app.get('/produto/busca', async (req, res) => {
    try{
        const nomeBusca = req.query.busca;
        const produto = await Produto.pesquisarNome(nomeBusca);

        res.render('produtos', {titulo: 'Produtos', produtos: produto});
    }catch(err){
        res.redirect('/produto/lista');
        Produto.logError(err);
    }
});

app.listen(8000);