const conectarDB = require('../db');
const fs = require('fs');

class Produto {
    constructor(nome, descricao, preco, cnpjVendedor) {
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.cnpjVendedor = cnpjVendedor;
    }

    validar(){
        if(!this.nome){
            throw new Error("O nome do produto é obrigatório.");
        }

        if(this.nome.trim() === ""){
            throw new Error("O nome do produto não pode estar vazio.");
        }

        if(typeof this.preco !== "number"){
            throw new Error("O preço deve ser um número.");
        }

        if(this.preco <= 0){
            throw new Error("O preço deve ser um número maior que 0.");
        }

        if(!this.cnpjVendedor){
            throw new Error("O CNPJ do vendedor é obrigatório.");
        }

        if(this.cnpjVendedor.trim() === ""){
            throw new Error("O CNPJ do vendedor não pode estar vazio.");
        }

        if(this.cnpjVendedor){
            const cnpjLimpo = this.cnpjVendedor.replace(/\D/g, "");

            if(cnpjLimpo.length !== 14){
                throw new Error("O CNPJ é inválido, pois não possui 14 caracteres.");
            }
            this.cnpjVendedor = cnpjLimpo;
        }
    }

    static async logError(error){
        const mensagem = `[${new Date().toISOString()}] Erro ao inserir Produto: ${error.message}\n`;
        fs.appendFileSync('error.log', mensagem);
    }

    async inserirDB(){
        try{
            const db = await conectarDB();
            const collection = db.collection("produtos");

            const vendedor = await db.collection("vendedores").findOne({
                cnpj:this.cnpjVendedor
            });
            
            if(!vendedor){
                throw new Error("Não foi possível vincular o produto ao vendedor especificado.");
            }

            const result = await collection.insertOne({
                nome: this.nome,
                descricao: this.descricao,
                preco: this.preco,
                cnpjVendedor: this.cnpjVendedor
            });

            console.log("Produto inserido: ID", result.insertedId);
            return await result;
        }catch(error){
            Produto.logError(error);
        }
    }

    static async pesquisarNome(nome){
        try{
            const db = await conectarDB();
            const collection = db.collection("produtos");

            const result = await collection.findOne({
                nome
            });

            if(result){
                console.log("Produto encontrado: ", result);
            }else{
                console.log("Produto não encontrado.");
            }

            return await result;
        }catch(error){
            Produto.logError(error);
        }
    }

    static async deletarNome(nome){
        try{
            const db = await conectarDB();
            const collection = db.collection("produtos");

            const result = await collection.deleteOne({
                nome
            });

            if(result){
                console.log("Produto excluído com sucesso.");
            }else{
                console.log("Produto não encontrado.");
            }
        }catch(error){
            Produto.logError(error);
        }
    }

}

module.exports = Produto;