pragma solidity ^0.6.9;
pragma experimental ABIEncoderV2;

contract  ethereum_auction {
    
    mapping (string => lot) auctions; // Define um mapa de lotes
    string [] lots; // Define um vetor com a lista de lotes
    
    
    // Define a estrutura dos lotes
    struct lot {
        uint256 lastBid;         // Valor (em ether) do último lance
        address payable userBid; // Usuário que deu o último lance (comprador)
        uint finalBlock;         // Bloco que encerrará o leilão do lote
        address payable userLot;         // Usuário que lançou o lote (vendedor)
        bool inverted;           // Define se é um leilão de maior lance ou menor lance (inverted)
        uint initialBid;         // Lance inicial
    }
    
    // Verifica as restrições para dar um lance
    modifier bidRestrictions(string memory lotName) {
        require (auctions[lotName].finalBlock > block.number); // Verifica se o lote esta aberto
        require (auctions[lotName].inverted == false);         // Verifica se o lote não é invertido
        require (auctions[lotName].lastBid < msg.value/1000000000000000);       // Verifica se o lance é maior que o anterior
        _;
    }
    
    // Verifica as restrições para dar um lance em um lote invertido
    modifier bidInvertedRestrictions(string memory lotName, uint _bid) {
        require (auctions[lotName].finalBlock > block.number); // Verifica se o lote esta aberto
        require (auctions[lotName].inverted == true);          // Verifica se o lote não é invertido
        require (auctions[lotName].lastBid > _bid || (auctions[lotName].userLot == address(0x0) && auctions[lotName].lastBid == _bid)); // Verifica se o lance é menor que o anterior
        _;
    }
    
    // Verifica as restrições para criar um novo lote
    modifier newLotRestrictions(string memory name, uint blocks) {
        require (auctions[name].userLot == address(0x0)); // Verifica se já existe algum lote com o nome
        require (blocks > 0);                  // Verifica se a duração em blocos é maior que zero
        _;
    }
    
    // Verifica se o usuario que esta tentando sacar é o vendedor do lote
    modifier withdrawRestriction(string memory lotName) {
        if (auctions[lotName].inverted == false) {
            require (auctions[lotName].userLot == msg.sender);
        } else {
            require (auctions[lotName].userLot == msg.sender || auctions[lotName].userBid == msg.sender);
        }
        _;
    }
    
    // Função para iniciar novo lote, verificando as restrições 
    function newLot(string memory name, uint blocks) public newLotRestrictions(name, blocks) {
        auctions[name] = lot({lastBid: 0, userBid: address(0x0), finalBlock: block.number + blocks, userLot: msg.sender, inverted: false, initialBid: 0});
        lots.push(name);
    }
    
    // Função para iniciar novo lote invertido, verificando as restrições 
    function newLotInverted(string memory name, uint blocks) public payable newLotRestrictions(name, blocks) {
        auctions[name] = lot({lastBid: msg.value/1000000000000000, userBid: address(0x0), finalBlock: block.number + blocks, userLot: msg.sender, inverted: true, initialBid: msg.value/1000000000000000}); // Conversão para 0.001 ether
        lots.push(name);
    }
    
    // Retorna o número de blocos restantes para o fim do leilão e valor último lance
    function getLotData(string memory lotName) public view returns(uint, uint256, bool, address) {
        if (auctions[lotName].finalBlock < block.number) {
            return (0, auctions[lotName].lastBid, auctions[lotName].inverted, auctions[lotName].userBid);
        } else {
            return (auctions[lotName].finalBlock - block.number, auctions[lotName].lastBid, auctions[lotName].inverted, auctions[lotName].userBid);
        }
    }
    
    // Retorna o usuário que deu o último lance, quem arrematou no caso de o lote estar encerrado
    function getUserAdress (string memory lotName) public view returns(address) {
        return auctions[lotName].userBid;
    }
    
    // Inclui novo lance no lote, se estiver aberto
    function newBid (string memory lotName) public payable bidRestrictions(lotName) {
        // Restitui o lance do usuário anterior
        if (auctions[lotName].lastBid != 0) // Verifica se o lance atual não é o lance inicial
            auctions[lotName].userBid.transfer(auctions[lotName].lastBid*1000000000000000); // Conversão para 0.001 ether
        // Atribui último lance ao novo usuário
        auctions[lotName].lastBid = msg.value/1000000000000000; // Conversão para 0.001 ether
        auctions[lotName].userBid = msg.sender;
        // Se faltar menos de 5 blocos para o final, aumenta para 5 blocos
        if (block.number + 5 > auctions[lotName].finalBlock)
            auctions[lotName].finalBlock = block.number + 5;
    }
    
    // Inclui novo lance no lote, se estiver aberto
    function newBidInvertedLot (string memory lotName, uint _bid) public bidInvertedRestrictions(lotName, _bid) {
        // Atribui último lance ao novo usuário
        auctions[lotName].lastBid = _bid; // 1 ether -> 1000
        auctions[lotName].userBid = msg.sender;
        // Se faltar menos de 5 blocos para o final, aumenta para 5 blocos
        if (block.number + 5 > auctions[lotName].finalBlock)
            auctions[lotName].finalBlock = block.number + 5;
    }
    
    // Função para sacar o valor após o final do leilão
    function withdraw (string memory lotName) public withdrawRestriction(lotName) {
        if (auctions[lotName].inverted == false) {
            msg.sender.transfer(auctions[lotName].lastBid*1000000000000000); // Conversão para 0.001 ether
        } else {
            if (auctions[lotName].userBid == address(0x0)) {
                auctions[lotName].userLot.transfer(auctions[lotName].initialBid*1000000000000000); // Conversão para 0.001 ether
            } else {
                auctions[lotName].userBid.transfer(auctions[lotName].lastBid*1000000000000000); // Conversão para 0.001 ether
                auctions[lotName].userLot.transfer(auctions[lotName].initialBid*1000000000000000 - auctions[lotName].lastBid*1000000000000000); // Conversão para 0.001 ether
            }
        }
        for (uint i = 0; i < lots.length; i++) {
            if (keccak256(bytes(lots[i])) == keccak256(bytes(lotName))) {
                delete lots[i];
            }
        }
    }
    
    // Funções para listar os lotes ativos
    function getActivesLots () public view returns(string[] memory) {
        uint k = 0;
        for (uint i = 0; i < lots.length; i++) {
            if (auctions[lots[i]].finalBlock > block.number) {
                k++;
            }
        }
        string[] memory ret = new string[](k);
        k = 0;
        for (uint i = 0; i < lots.length; i++) {
            if (auctions[lots[i]].finalBlock > block.number) {
                ret[k] = lots[i];
                k++;
            }
        }
        return ret;
    }
    
    // Funções para listar os lotes com saque pendente
    function getPendentLots () public view returns(string[] memory) {
        uint k = 0;
        for (uint i = 0; i < lots.length; i++) {
            if ((auctions[lots[i]].userLot == msg.sender || (auctions[lots[i]].inverted == true && auctions[lots[i]].userBid == msg.sender)) && auctions[lots[i]].finalBlock <= block.number && auctions[lots[i]].lastBid > 0) {
                k++;
            }
        }
        string[] memory ret = new string[](k);
        k = 0;
        for (uint i = 0; i < lots.length; i++) {
            if ((auctions[lots[i]].userLot == msg.sender || (auctions[lots[i]].inverted == true && auctions[lots[i]].userBid == msg.sender)) && auctions[lots[i]].finalBlock <= block.number && auctions[lots[i]].lastBid > 0) {
                ret[k] = lots[i];
                k++;
            }
        }
        return ret;
    }
    
    // Permite ver a quantia depositada no contrato 
    function getBalance () public view returns(uint){
        return address(this).balance;
    }
}