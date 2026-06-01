const conectarDB = require('../db');
const fs = require('fs');

class Vendedor{
    constructor(nome, cnpj, senha, endereco){
        this.nome = nome;
        this.cnpj = cnpj;
        this.senha = senha;
        this.endereco = endereco;
    }

    validar(){
        if(!this.nome){
            throw new Error("O nome do vendedor é obrigatório.");
        }

        if(this.nome.trim() === ""){
            throw new Error("O nome do vendedor não pode estar vazio.");
        }

        if(!this.cnpj){
            throw new Error("O CNPJ do vendedor é obrigatório.");
        }

        if(this.cnpj.trim() === ""){
            throw new Error("O CNPJ do vendedor não pode estar vazio.");
        }

        if(this.cnpj){
            const cnpjLimpo = String(this.cnpj).replace(/\D/g, "");

            if(cnpjLimpo.length !== 14){
                throw new Error("O CNPJ é inválido, pois não possui 14 caracteres.");
            }
            this.cnpj = cnpjLimpo;
        }

        if(!this.senha){
            throw new Error("A senha do vendedor é obrigatória.");
        }

        if(this.senha.length < 5){
            throw new Error("A senha deve ter 5 ou mais caracteres.");
        }
    }

    static async logError(error){
        const mensagem = `[${new Date().toISOString()}] Erro ao inserir Vendedor: ${error.message}\n`;
        fs.appendFileSync('error.log', mensagem);
    }

    async inserirDB(){
        try{
            const db = await conectarDB();
            const collection = db.collection("vendedores");

            const result = await collection.insertOne({
                nome: this.nome,
                cnpj: this.cnpj,
                senha: this.senha,
                endereco: this.endereco
            });

            console.log("Vendedor inserido: ID", result.insertedId);
            return await result;
        }catch(error){
            Vendedor.logError(error);
        }
    }

    static async pesquisarCnpj(cnpj){
        try{
            const db = await conectarDB();
            const collection = db.collection("vendedores");

            const result = await collection.findOne({
                cnpj
            });

            if(result){
                console.log("Vendedor encontrado: ", result);
            }else{
                console.log("Vendedor não encontrado.");
            }

            return await result;
        }catch(error){
            Vendedor.logError(error);
        }
    }

    static async deletarCnpj(cnpj){
        try{
            const db = await conectarDB();
            const collection = db.collection("vendedores");

            const result = await collection.deleteOne({
                cnpj
            });

            if(result){
                console.log("Vendedor excluído com sucesso.");
            }else{
                console.log("Vendedor não encontrado.");
            }
        }catch(error){
            Vendedor.logError(error);
        }
    }

}

module.exports = Vendedor;