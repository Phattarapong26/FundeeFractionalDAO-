
// Deployment script for the FractionalDAO contract

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Deploy the FractionalDAO contract
  const FractionalDAO = await ethers.getContractFactory("FractionalDAO");
  
  // For constructor, pass initialOwner address 
  // The contract constructor now takes an initialOwner parameter
  const fractionalDAO = await FractionalDAO.deploy(deployer.address);
  
  await fractionalDAO.deployed();
  
  console.log("FractionalDAO deployed to:", fractionalDAO.address);
  
  // Get the platform token address
  const platformTokenAddress = await fractionalDAO.platformToken();
  console.log("PlatformToken deployed to:", platformTokenAddress);
  
  // Save addresses for frontend configuration
  console.log("\nAdd these addresses to your frontend config:");
  console.log("CONTRACT_ADDRESS =", `"${fractionalDAO.address}"`);
  console.log("PLATFORM_TOKEN_ADDRESS =", `"${platformTokenAddress}"`);
  
  // Log info about token supply
  console.log("\nPlatform Token Info:");
  console.log("Initial token supply: 1,000,000,000 FDT");
  console.log("Token exchange rate: 1 ETH = 1,000 FDT");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
