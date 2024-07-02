import { ethers } from "./ethers.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
// const ethAmount = document.getElementById("ethAmount")
const balanceButton = document.getElementById("getBalance")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== undefined) {
        try {
            await window.ethereum.request({
                method: "eth_requestAccounts",
            })
        } catch (error) {
            console.error(error)
        }
        connectButton.innerHTML = "Connected!"
    } else {
        connectButton.innerHTML = "Not Connected!"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== undefined) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.formatEther(balance))
    }
}

// fund

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== undefined) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        console.log(signer)
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.parseEther(ethAmount),
            })
            await listenForTransactionMined(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMined(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            // console.log(transactionReceipt)
            console.log(
                `Completed with ${transactionReceipt.confirmations()} confirmations`
            )
            resolve()
        })
    })
}

//withdraw

async function withdraw() {
    if (typeof window.ethereum !== undefined) {
        console.log("Withdrawing....")
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        // console.log(signer)
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMined(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
