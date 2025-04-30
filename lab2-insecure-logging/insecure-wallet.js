/**
 * Insecure Wallet Implementation
 * This example demonstrates dangerous logging practices that expose sensitive information
 */

// Simulated external logging service
const loggingService = {
  log(level, message, metadata) {
    console.log(`[${level.toUpperCase()}] ${message}`);
    if (metadata) {
      console.log('Metadata:', JSON.stringify(metadata, null, 2));
    }
    
    // In a real application, this would send data to an external logging service
    // This is where data leakage would occur
  }
};

class InsecureWallet {
  constructor(name) {
    this.name = name;
    this.privateKey = null;
    this.seedPhrase = null;
    this.address = null;
    
    // Log wallet creation
    loggingService.log('info', `New wallet created: ${name}`);
  }
  
  /**
   * VULNERABILITY: Logging the entire wallet configuration including private key and seed phrase
   */
  initializeWallet(privateKey, seedPhrase) {
    this.privateKey = privateKey;
    this.seedPhrase = seedPhrase;
    
    // Derive address from private key (simplified for demo)
    this.address = '0x' + privateKey.slice(-40);
    
    // VULNERABILITY: Logging sensitive information
    loggingService.log('debug', 'Wallet initialized with configuration', {
      name: this.name,
      privateKey: this.privateKey, // NEVER log private keys
      seedPhrase: this.seedPhrase,  // NEVER log seed phrases
      address: this.address
    });
    
    return this.address;
  }
  
  /**
   * VULNERABILITY: Logging transaction details with private key for debugging
   */
  async sendTransaction(to, amount) {
    // VULNERABILITY: Logging transaction with private key
    loggingService.log('info', `Preparing transaction to ${to}`, {
      from: this.address,
      to: to,
      amount: amount,
      privateKey: this.privateKey // NEVER include private key in logs
    });
    
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const txHash = '0x' + Math.random().toString(16).substr(2, 64);
    
    // Log successful transaction
    loggingService.log('info', `Transaction completed: ${txHash}`);
    
    return {
      from: this.address,
      to: to,
      amount: amount,
      txHash: txHash
    };
  }
  
  /**
   * VULNERABILITY: Writing sensitive information to error logs
   */
  recoverWallet(seedPhrase) {
    try {
      if (!seedPhrase) {
        throw new Error('Seed phrase is required');
      }
      
      if (seedPhrase !== this.seedPhrase) {
        // VULNERABILITY: Including the actual seed phrase in error logs
        loggingService.log('error', 'Invalid seed phrase provided', {
          providedPhrase: seedPhrase,
          expectedPhrase: this.seedPhrase, // NEVER log the correct seed phrase
          wallet: this.name
        });
        throw new Error('Invalid seed phrase');
      }
      
      // VULNERABILITY: Logging successful recovery with private key
      loggingService.log('info', 'Wallet recovered successfully', {
        wallet: this.name,
        address: this.address,
        privateKey: this.privateKey // NEVER log private keys
      });
      
      return {
        address: this.address,
        success: true
      };
    } catch (error) {
      // Re-throw the error
      throw error;
    }
  }
  
  /**
   * VULNERABILITY: Logging entire user objects with sensitive information
   */
  exportWalletData() {
    const walletData = {
      name: this.name,
      address: this.address,
      privateKey: this.privateKey,
      seedPhrase: this.seedPhrase
    };
    
    // VULNERABILITY: Logging the entire wallet data
    loggingService.log('debug', 'Wallet data exported', walletData);
    
    return walletData;
  }
}

// Function to demonstrate the vulnerability
function demonstrateVulnerability() {
  console.log('=== INSECURE WALLET DEMONSTRATION ===');
  console.log('Notice how sensitive information is exposed in logs\n');
  
  // Create new wallet
  const wallet = new InsecureWallet('MyWallet');
  
  // Initialize with sensitive data
  const privateKey = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
  const seedPhrase = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
  
  wallet.initializeWallet(privateKey, seedPhrase);
  
  // Perform operations that log sensitive data
  wallet.sendTransaction('0xRecipientAddress', '1.5');
  
  try {
    // Try with wrong seed phrase to trigger error logging
    wallet.recoverWallet('wrong seed phrase');
  } catch (error) {
    console.log(`Recovery error: ${error.message}`);
  }
  
  // Export wallet data
  wallet.exportWalletData();
  
  console.log('\n=== VULNERABILITY EXPLANATION ===');
  console.log('This demo shows several critical logging vulnerabilities:');
  console.log('1. Private keys and seed phrases logged in plaintext');
  console.log('2. Sensitive data included in error logs');
  console.log('3. Complete wallet configuration exposed in debug logs');
  console.log('4. Transaction details logged with private keys\n');
  console.log('These logs could be captured by:');
  console.log('- External logging services');
  console.log('- Server logs accessible by unauthorized personnel');
  console.log('- Browser console logs visible to anyone with access to the device');
  console.log('- Log files stored insecurely on disk');
}

// Export the wallet class
module.exports = {
  InsecureWallet,
  demonstrateVulnerability
};

// If this file is run directly, demonstrate the vulnerability
if (require.main === module) {
  demonstrateVulnerability();
} 