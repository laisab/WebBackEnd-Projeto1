# E-commerce

## Projeto 2 - Programação Web Back-End

Este projeto foi desenvolvido como parte da disciplina de Programação Web Back-End, com o objetivo de implementar um sistema de e-commerce utilizando Node.js, MongoDB, Express.js e Handlebars.

### Funcionalidades
O sistema gerencia três entidades principais: **Vendedor**, **Produto** e **Cliente**.

* **Cadastro**: inserção de dados com validação e verificação de campos.
* **Busca**: leitura dos dados inseridos por meio de campos como CNPJ (Vendedor), Nome (Produto) e CPF (Cliente).
* **Deleção**: exclusão dos dados inseridos por meio de campos como CNPJ (Vendedor), Nome (Produto) e CPF (Cliente).
* **Persistência:** Uso de MongoDB com conexão centralizada.
* **Log de Erros:** Captura e armazenamento automático de exceções em um arquivo `error.log`.

### Como Executar

1. Clone o repositório:

   ```bash
   https://github.com/laisab/WebBackEnd-Projeto2.git
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure a URI do seu banco de dados no arquivo `db.js`.

4. Execute o sistema:

   ```bash
   node app.js
   ```

5. Abra o navegador e acesse:


   ```bash
   localhost:8000/[NOME DA ROTA DESEJADA]
   ```

### Estrutura do Projeto

```text
├── node_modules/
├── model/
│   ├── Cliente.js      # Classe de modelo do Cliente       
│   ├── Produto.js      # Classe de modelo do Produto
│   └── Vendedor.js     # Classe de modelo do Vendedor
├── views/
│   ├── cadastro-clientes.hbs       
│   ├── cadastro-produtos.hbs
│   ├── cadastro-vendedores.hbs
│   ├── login-clientes.hbs
│   ├── login-vendedores.hbs
│   ├── minha-conta-cliente.hbs
│   ├── minha-conta-vendedor.hbs
│   └── produtos.js
├── app.js          # Arquivo principal
├── db.js           # Configuração da conexão com MongoDB
├── error.log       # Arquivo de log gerado automaticamente
└── package.json    # Dependências do projeto