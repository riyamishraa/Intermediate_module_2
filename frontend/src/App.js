import "./App.css";
import { ethers } from "ethers";
import { useEffect, useState, useCallback } from "react";
import RContract from "./contracts/RContract.sol/RContract.json";

function App() {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(undefined);
  const [contract, setContract] = useState("");
  const abi = RContract.abi;

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const connectWallet = useCallback(async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Please install the metamask extension");
        return;
      }

      const [selectedAddress] = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setSelectedAddress(selectedAddress);

      const _provider = new ethers.providers.Web3Provider(ethereum);
      // const _provider = new ethers.providers.JsonRpcProvider();
      await _provider.ready;
      const signer = _provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      setContract(contract);
    } catch (error) {
      console.error(error);
    }
  }, [abi]);

  useEffect(() => {
    connectWallet();
  }, [connectWallet]);

  useEffect(() => {
    async function fetchData() {
      if (contract) {
        const _name = await contract.ownerName();
        setName(_name);

        const _bal = await contract.ownerBal();
        setBalance(ethers.utils.formatEther(_bal.toString()));
      }
    }
    fetchData();
  }, [contract]);

  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts[0] && accounts[0] !== selectedAddress) {
      connectWallet();
    }
  });

  async function handleTransfer() {
    try {
      if (!contract) {
        alert("Please connect your wallet first");
        return;
      }

      if (!amount || amount <= 0) {
        alert("Amount should be greater than 0");
        return;
      }

      const value = ethers.utils.parseEther(amount);
      const transaction = await contract.transferOwner({
        value,
      });

      await transaction.wait();

      const _bal = await contract.ownerBal();
      setBalance(ethers.utils.formatEther(_bal.toString()));

      alert("Transaction successful!");
    } catch (error) {
      console.error(error);
      alert("Transaction failed");
    }
  }

  return (
    <main>
      <h1>Contract Owner Name: {name}</h1>
      <p>Contract Owner Balance: {balance} Ethers</p>
      <label htmlFor="transfer">Tranfer amount to Owner</label>
      <input
        type="number"
        id="transfer"
        inputMode="numeric"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
        }}
      />
      <button onClick={handleTransfer}>Transfer Owner</button>
    </main>
  );
}

export default App;
