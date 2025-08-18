import { ethers } from 'ethers';
import tokenABI from './FoodWasteTokenABI.json';

// Contract address from your deployed contract
const CONTRACT_ADDRESS = "0x34F4EB3Cce74e851E389E6a9Ad0Ad61f647F1B0c";

export class FoodWasteTokenService {
  private provider: any;
  private contract: any = null;
  private signer: any = null;

  constructor() {
    // Initialize provider when in browser environment with MetaMask
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }
  }

  /**
   * Connect to user's wallet and set up contract
   */
  async connect(): Promise<string | null> {
    if (!this.provider || !window.ethereum) {
      console.error("Provider or ethereum not available");
      return null;
    }
    
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get signer
      this.signer = await this.provider.getSigner();
      
      // Create contract instance
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        tokenABI,
        this.signer
      );
      
      // Return connected address
      return await this.signer.getAddress();
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      return null;
    }
  }

  /**
   * Log waste reduction activity and earn tokens
   */
  async logWasteReduction(wasteAmount: number, actionType: string): Promise<boolean> {
    if (!this.contract || !this.signer) {
      console.error("Contract or signer not initialized");
      return false;
    }

    try {
      // Convert grams to a value the contract can use
      const amount = BigInt(wasteAmount);
      
      // Send transaction
      const tx = await this.contract.logWasteReduction(amount, actionType);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error("Error logging waste reduction:", error);
      return false;
    }
  }

  /**
   * Get token balance for connected address
   */
  async getTokenBalance(): Promise<string> {
    if (!this.contract || !this.signer) {
      return "0";
    }

    try {
      const address = await this.signer.getAddress();
      const balance = await this.contract.balanceOf(address);
      
      // Format balance with correct decimals
      return ethers.formatUnits(balance, 18);
    } catch (error) {
      console.error("Error getting token balance:", error);
      return "0";
    }
  }
}