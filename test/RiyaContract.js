const { ethers } = require("hardhat");
const { assert, expect } = require("chai");

describe("This is a test for my RContract", () => {
  let owner, addr1, rContract, signer;

  before("Deploy the contract instance first", async () => {
    const RContract = await ethers.getContractFactory("RContract");
    rContract = await RContract.deploy();

    [owner, addr1] = await ethers.getSigners();
  });

  it("Should get the owner's name", async () => {
    const name = await rContract.ownerName();
    assert.equal(name, "Riya");
  });

  it("should get the owner's balance", async () => {
    const bal = await rContract.ownerBal();
    const balance = await ethers.provider.getBalance(owner);
    assert.equal(bal, balance);
  });

  it("Should tranfer ether to the owner", async () => {
    const contractConnect = rContract.connect(addr1);

    const transferTx = await contractConnect.transferOwner({
      value: ethers.parseEther("10"),
    });

    await expect(transferTx)
      .to.emit(rContract, "Transaction")
      .withArgs("Transaction successfull!!");
  });

  it("Should get an error for 0 ethers", async () => {
    const contractConnect = rContract.connect(addr1);

    await expect(
      contractConnect.transferOwner({
        value: ethers.parseEther("0"),
      })
    ).revertedWith("Amount should be more than 0");
  });
});
