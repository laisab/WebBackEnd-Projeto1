const conectarDB = require('../db');
const fs = require('fs');

class Cliente{
    constructor(nome, cpf, email, senha, endereco){
        this.nome = nome;
        this.cpf = cpf;
        this.email = email;
        this.senha = senha;
        this.endereco = endereco;
    }

    validar(){
        if(!this.nome){
            throw new Error("O nome do cliente é obrigatório.");
        }

        if(this.nome.trim() === ""){
            throw new Error("O nome do cliente não pode estar vazio.");
        }

        if(!this.cpf){
            throw new Error("O CPF do cliente é obrigatório.");
        }

        if(!/^[0-9X]{11}$/.test(this.cpf)){
            throw new Error("O CPF é inválido, pois possui letras ou não possui 11 caracteres.");
        }

        if(!this.email){
            throw new Error("O email do cliente é obrigatório.");
        }

        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)){
            throw new Error("Email inválido.");
        }

        if(!this.senha){
            throw new Error("A senha do cliente é obrigatória.");
        }

        if(this.senha.length < 5){
            throw new Error("A senha deve ter 5 ou mais caracteres.");
        }
    }

    static async logError(error){
        const mensagem = `[${new Date().toISOString()}] Erro ao inserir Cliente: ${error.message}\n`;
        fs.appendFileSync('error.log', mensagem);
    }

    async inserirDB(){
        try{
            const db = await conectarDB();
            const collection = db.collection("clientes");

            const result = await collection.insertOne({
                nome: this.nome,
                cpf: this.cpf,
                email: this.email,
                senha: this.senha,
                endereco: this.endereco
            });

            console.log("Cliente inserido: ID", result.insertedId);
            return await result;
        }catch(error){
            Cliente.logError(error);
        }
    }

    static async pesquisarCpf(cpf){
        try{
            const db = await conectarDB();
            const collection = db.collection("clientes");

            const result = await collection.findOne({
                cpf
            });

            if(result){
                console.log("Cliente encontrado: ", result);
            }else{
                console.log("Cliente não encontrado.");
            }

            return await result;
        }catch(error){
            Cliente.logError(error);
        }
    }

    static async deletarCpf(cpf){
        try{
            const db = await conectarDB();
            const collection = db.collection("clientes");

            const result = await collection.deleteOne({
                cpf
            });

            if(result){
                console.log("Cliente excluído com sucesso.");
            }else{
                console.log("Cliente não encontrado.");
            }
        }catch(error){
            Cliente.logError(error);
        }
    }
}

module.exports = Cliente;