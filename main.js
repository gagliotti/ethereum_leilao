const Web3 = require('web3')
const web3_1 = new Web3()
let contract = ""

const addressRopsten = '0xeDc301c89A052Ab1C851c043cD0374e86617883C'
const addressRinkeby = '0x8594db30117E5B64477957aE5A91743618A8C72f'
let address = ''
let network = ''
const abi = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "lotName",
				"type": "string"
			}
		],
		"name": "newBid",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "lotName",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_bid",
				"type": "uint256"
			}
		],
		"name": "newBidInvertedLot",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "blocks",
				"type": "uint256"
			}
		],
		"name": "newLot",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "blocks",
				"type": "uint256"
			}
		],
		"name": "newLotInverted",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "lotName",
				"type": "string"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getActivesLots",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "lotName",
				"type": "string"
			}
		],
		"name": "getLotData",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getPendentLots",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "lotName",
				"type": "string"
			}
		],
		"name": "getUserAdress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

//const buttonMetamask = document.querySelector('.buttonMetamask')
const buttonNewLot = document.querySelector('.buttonNewLot')
const buttonBid = document.querySelector('.buttonBid')
const buttonWithdraw = document.querySelector('.buttonWithdraw')
const refreshLots = document.querySelector('.buttonRefreshLots')
const refreshLots2 = document.querySelector('.buttonRefreshLots2')
const dropboxLotBit = document.getElementById('inputLotName2')
const dropboxLotBit2 = document.getElementById('inputLotName3')
const checkInvert = document.getElementById('checkInvert')
const labelInitialBid = document.getElementById('labelInitialBid')
const inputInitialBid = document.getElementById('inputInitialBid')

let accounts = []

window.addEventListener('load', function() {
	// Check if Web3 has been injected by the browser:
	if (typeof web3 !== 'undefined') {
		if (window.web3) {
			window.web3 = new Web3(window.web3.currentProvider)
			//window.ethereum.enable()
			window.web3.eth.net.getNetworkType().then((receipt) => {
				network = receipt
				if (receipt == 'ropsten') {
					address = addressRopsten
				} else if (receipt == 'rinkeby') {
					address = addressRinkeby
				} else {
					console.log('Rede não suportada.')
				}
				contract = new window.web3.eth.Contract(abi, address)
			})
			getAccount()
		}
		setInterval(function(){
			refreshLot()
		}, 5000)
	}
})

//==================================================================

//Sending new lot to an address
buttonNewLot.addEventListener('click', () => {
	let lotName = document.getElementById('inputLotName').value
	let blocks = document.getElementById('inputBlocks').value
	let inverted = checkInvert.checked
	let _value = 0
	let _data = ""
	if (inverted) {
		_value = web3_1.utils.toHex(web3_1.utils.toWei(inputInitialBid.value, 'ether'))
		_data = contract.methods.newLotInverted(lotName, blocks).encodeABI()
	} else {
		_data = contract.methods.newLot(lotName, blocks).encodeABI()
	}
  ethereum.sendAsync(
    {
      method: 'eth_sendTransaction',
      params: [
        {
          from: accounts[0],
          to: address,
          gasLimit: web3_1.utils.toHex(200000), // Raise the gas limit to a much higher amount
					gasPrice: web3_1.utils.toHex(web3_1.utils.toWei('10', 'gwei')),
					value: _value,
					data: _data
        },
      ],
    },
    (err, result) => {
      if (err) {
				console.error(err)
			} else {
				document.getElementById('linkNewLot').href = "https://"+network+".etherscan.io/tx/" + result.result
				document.getElementById('labelTxNewLot').innerText = 'Link para a transação no Etherscan:'
				document.getElementById('linkNewLot').innerText = result.result
			}
    }
	)
	document.getElementById('inputLotName').value = ''
	document.getElementById('inputBlocks').value = '5'
})

//Sending new bid to lot
buttonBid.addEventListener('click', () => {
	let lotName = document.getElementById('inputLotName2').value
	let bidValue = document.getElementById('inputBitValue').value
	let inverted = document.getElementById('labelInverted').innerText
	let _value = 0
	let _data = ""
	if (inverted == 'Sim') {
		_data = contract.methods.newBidInvertedLot(lotName, parseInt(bidValue*1000)).encodeABI()
	} else {
		_value = web3_1.utils.toHex(web3_1.utils.toWei(bidValue, 'ether'))
		_data = contract.methods.newBid(lotName).encodeABI()
	}
  ethereum.sendAsync(
    {
      method: 'eth_sendTransaction',
      params: [
        {
          from: accounts[0],
          to: address,
          gasLimit: web3_1.utils.toHex(200000), // Raise the gas limit to a much higher amount
					gasPrice: web3_1.utils.toHex(web3_1.utils.toWei('10', 'gwei')),
					value: _value,
					data: _data
        },
      ],
    },
    (err, result) => {
      if (err) {
				console.error(err)
			} else {
				document.getElementById('linkNewBid').href = "https://"+network+".etherscan.io/tx/" + result.result
				document.getElementById('labelTxNewBid').innerText = 'Link para a transação no Etherscan:'
				document.getElementById('linkNewBid').innerText = result.result
			}
    }
	)
	document.getElementById('inputBitValue').value = '0'
})

// Request withdraw
buttonWithdraw.addEventListener('click', () => {
	let lotName = document.getElementById('inputLotName3').value
  ethereum.sendAsync(
    {
      method: 'eth_sendTransaction',
      params: [
        {
          from: accounts[0],
          to: address,
          gasLimit: web3_1.utils.toHex(200000), // Raise the gas limit to a much higher amount
					gasPrice: web3_1.utils.toHex(web3_1.utils.toWei('10', 'gwei')),
					data: contract.methods.withdraw(lotName).encodeABI()
        },
      ],
    },
    (err, result) => {
      if (err) {
				console.error(err)
			} else {
				document.getElementById('linkWithdraw').href = "https://"+network+".etherscan.io/tx/" + result.result
				document.getElementById('labelTxWithdraw').innerText = 'Link para a transação no Etherscan:'
				document.getElementById('linkWithdraw').innerText = result.result
			}
    }
	)
	document.getElementById('inputLotName3').value = ''
})

// Enable connection event 
//buttonMetamask.addEventListener('click', () => {
//  getAccount()
//})

// Get account from Metamask
async function getAccount() {
	accounts = await ethereum.enable()
	document.getElementById('labelMetamaskConnection').innerText = "Ativo com endereço: " + accounts[0]
}

// Refresh lot bid
function refreshLot() {
	let lotName = document.getElementById('inputLotName2').value
	if (lotName != "") {
		contract.methods.getLotData(lotName).call().then((receipt)=>{
			document.getElementById('labelBid').innerText = receipt[1]/1000 + ' ether'
			document.getElementById('labelBlocks').innerText = receipt[0]
			if (receipt[2]) {
				document.getElementById('labelInverted').innerText = 'Sim'
			} else {
				document.getElementById('labelInverted').innerText = 'Não'
			}
			document.getElementById('labelBy').innerText = receipt[3]
		})
		.catch(console.error)
	}
}

// Refresh lot event
dropboxLotBit.addEventListener('click', () => {
	refreshLot()
})

// Refresh lots list
refreshLots.addEventListener('click', () => {
	contract.methods.getActivesLots().call().then((receipt) => {
		let dropboxLen = dropboxLotBit.options.length
		for (let i = dropboxLen-1; i >= 0; i--)
			dropboxLotBit.remove(i)
		for (let i = receipt.length-1; i >= 0; i--) {
			let option = document.createElement('option')
			option.text = receipt[i]
			option.id = receipt[i]
			dropboxLotBit.add(option)
		}
		refreshLot()
	})
	.catch(console.log)
})

// Refresh lots withdraw
refreshLots2.addEventListener('click', () => {
	contract.methods.getPendentLots().call({from: accounts[0]}).then((receipt) => {
		let dropboxLen = dropboxLotBit2.options.length
		for (let i = dropboxLen-1; i >= 0; i--)
			dropboxLotBit2.remove(i)
		for (let i = receipt.length-1; i >= 0; i--) {
			let option = document.createElement('option')
			option.text = receipt[i]
			option.id = receipt[i]
			dropboxLotBit2.add(option)
		}
		refreshLot()
	})
	.catch(console.log)
})

// Check Button Invert Event
checkInvert.addEventListener('click', () => {
	if (checkInvert.checked == true) {
		labelInitialBid.style.visibility = 'visible'
		inputInitialBid.style.visibility = 'visible'
	} else {
		labelInitialBid.style.visibility = 'hidden'
		inputInitialBid.style.visibility = 'hidden'
	}
})