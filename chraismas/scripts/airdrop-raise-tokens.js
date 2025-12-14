const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Airdrop RAISE tokens to specified recipients
 * Reads from airdrop-recipients.json file
 */
async function main() {
  console.log("🎁 Starting RAISE Token Airdrop...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Executing airdrop with account:", deployer.address);
  
  // Get RAISE Token address
  const raiseTokenAddress = process.env.RAISE_TOKEN_ADDRESS;
  
  if (!raiseTokenAddress) {
    console.error("❌ Error: RAISE_TOKEN_ADDRESS environment variable not set");
    console.log("Please deploy RAISE Token first and set the address:");
    console.log("export RAISE_TOKEN_ADDRESS=<address>");
    throw new Error("RAISE_TOKEN_ADDRESS not set");
  }
  
  console.log("Using RAISE Token at:", raiseTokenAddress);
  
  // Load recipients from JSON file
  const recipientsPath = path.join(__dirname, "airdrop-recipients.json");
  
  if (!fs.existsSync(recipientsPath)) {
    console.error("❌ Error: airdrop-recipients.json not found");
    console.log("Please create airdrop-recipients.json with the following format:");
    console.log(JSON.stringify({
      recipients: [
        { address: "0x...", amount: "1000", reason: "Early supporter" }
      ]
    }, null, 2));
    throw new Error("airdrop-recipients.json not found");
  }
  
  const recipientsData = JSON.parse(fs.readFileSync(recipientsPath, "utf8"));
  const recipients = recipientsData.recipients;
  
  if (!recipients || recipients.length === 0) {
    console.error("❌ Error: No recipients found in airdrop-recipients.json");
    throw new Error("No recipients found");
  }
  
  console.log(`📋 Found ${recipients.length} recipients`);
  
  // Get contract instance
  const RAISEToken = await hre.ethers.getContractFactory("RAISEToken");
  const raiseToken = RAISEToken.attach(raiseTokenAddress);
  
  // Check deployer balance
  const deployerBalance = await raiseToken.balanceOf(deployer.address);
  console.log("💰 Deployer balance:", hre.ethers.formatEther(deployerBalance), "RAISE");
  
  // Execute airdrop
  let successCount = 0;
  let totalAirdropped = 0n;
  
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const amount = hre.ethers.parseEther(recipient.amount.toString());
    
    try {
      console.log(`\n[${i + 1}/${recipients.length}] Sending ${recipient.amount} RAISE to ${recipient.address}`);
      console.log(`   Reason: ${recipient.reason || "N/A"}`);
      
      const tx = await raiseToken.transfer(recipient.address, amount);
      await tx.wait();
      
      console.log(`   ✅ Success! Tx: ${tx.hash}`);
      successCount++;
      totalAirdropped += amount;
      
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
    }
  }
  
  console.log("\n📊 Airdrop Summary:");
  console.log(`   - Successful: ${successCount}/${recipients.length}`);
  console.log(`   - Total Airdropped: ${hre.ethers.formatEther(totalAirdropped)} RAISE`);
  console.log(`   - Remaining Balance: ${hre.ethers.formatEther(await raiseToken.balanceOf(deployer.address))} RAISE`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
