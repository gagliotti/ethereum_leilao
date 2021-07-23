# Ethereum Decentralized Auctions

Aplicação que interage com a blockchain do Ethereum. O código roda no navegador e conecta na blockchain através do Metamask.

A implementação da lógica da aplicação está em 'main.js'. Utiliza-se o browserify (https://browserify.org/) para gerar o código 'bundle.js' que é carregado na página web. 

## Dependencias

Instalar o browserify
```
npm install -g browserify'
```
## Execução

Instalar o pacote Web3
```
npm install
```
Criar o arquivo bundle.js
```
browserify main.js -o bundle.js
```
Hospedar a página localmente
```
python -m http.server
```
