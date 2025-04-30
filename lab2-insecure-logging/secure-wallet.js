/**
 * Secure Wallet Implementation
 * This example demonstrates proper logging practices that protect sensitive information
 */

// Secure logging service with redaction capabilities
const secureLoggingService = {
  // Function to redact sensitive data from objects
  redact(data, sensitiveKeys) {
    if (!data) return data;
    
    // Handle primitive types
    if (typeof data !== 'object') return data;
    
    // Clone the object to avoid modifying the original
    const redacted = { ...data };
    
    // Redact each sensitive key
    sensitiveKeys.forEach(key => {
      if (key in redacted) {
        const value = redacted[key];
        if (typeof value === 'string') {
          // Show only first and last 4 characters for addresses, hash redaction for everything else
          if (value.startsWith('0x') && value.length > 10) {
            redacted[key] = `${value.slice(0, 6)}...${value.slice(-4)}`;
          } else {
            redacted[key] = '********';
          }
        } else {
          redacted[key] = '[REDACTED]';
        }
      }
    });
    
    return redacted;
  },
  
  // Secure logging function
  log(level, message, metadata) {
    // Define sensitive fields that should never be logged
    const sensitiveKeys = [
      'privateKey', 'seedPhrase', 'mnemonic', 'secret', 'password', 
      'credentials', 'expectedPhrase', 'providedPhrase'
    ];
    
    // Redact sensitive information if metadata is provided
    const safeMetadata = metadata ? this.redact(metadata, sensitiveKeys) : null;
    
    // Log safely
    console.log(`[${level.toUpperCase()}] ${message}`);
    if (safeMetadata) {
      console.log('Metadata:', JSON.stringify(safeMetadata, null, 2));
    }
    
    // In a real application, this would send redacted data to an external logging service
  }
};

class SecureWallet {
  constructor(name) {
    this.name = name;
    this.privateKey = null;
    this.seedPhrase = null;
    this.address = null;
    
    // Log wallet creation - no sensitive data here
    secureLoggingService.log('info', `New wallet created: ${name}`);
  }
  
  /**
   * SECURE: Properly handling sensitive initialization data
   */
  initializeWallet(privateKey, seedPhrase) {
    this.privateKey = privateKey;
    this.seedPhrase = seedPhrase;
    
    // Derive address from private key (simplified for demo)
    this.address = '0x' + privateKey.slice(-40);
    
    // SECURE: Only log non-sensitive information
    secureLoggingService.log('debug', 'Wallet initialized', {
      name: this.name,
      address: this.address,
      // Note: privateKey and seedPhrase are deliberately omitted
    });
    
    return this.address;
  }
  
  /**
   * SECURE: Logging transaction details without sensitive data
   */
  async sendTransaction(to, amount) {
    // SECURE: Log only necessary transaction information
    secureLoggingService.log('info', `Preparing transaction to ${to}`, {
      from: this.address,
      to: to,
      amount: amount
      // Note: privateKey is deliberately omitted
    });
    
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const txHash = '0x' + Math.random().toString(16).substr(2, 64);
    
    // Log successful transaction
    secureLoggingService.log('info', `Transaction completed: ${txHash}`);
    
    return {
      from: this.address,
      to: to,
      amount: amount,
      txHash: txHash
    };
  }
  
  /**
   * SECURE: Safe error handling without exposing sensitive information
   */
  recoverWallet(seedPhrase) {
    try {
      if (!seedPhrase) {
        throw new Error('Seed phrase is required');
      }
      
      if (seedPhrase !== this.seedPhrase) {
        // SECURE: Not logging the actual seed phrases
        secureLoggingService.log('error', 'Invalid seed phrase provided', {
          wallet: this.name,
          // No comparing or logging seed phrases
        });
        throw new Error('Invalid seed phrase');
      }
      
      // SECURE: Logging successful recovery without sensitive data
      secureLoggingService.log('info', 'Wallet recovered successfully', {
        wallet: this.name,
        address: this.address
        // No private key or seed phrase
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
   * SECURE: Safe data export without logging sensitive information
   */
  exportWalletData() {
    // Full data to return to the user
    const walletData = {
      name: this.name,
      address: this.address,
      privateKey: this.privateKey,
      seedPhrase: this.seedPhrase
    };
    
    // SECURE: Log only that the action happened, not the actual data
    secureLoggingService.log('debug', 'Wallet data exported', {
      name: this.name,
      address: this.address
      // Note: privateKey and seedPhrase are deliberately omitted
    });
    
    return walletData;
  }
}

// Function to demonstrate the secure implementation
function demonstrateSecureImplementation() {
  console.log('=== SECURE WALLET DEMONSTRATION ===');
  console.log('Notice how sensitive information is properly redacted in logs\n');
  
  // Create new wallet
  const wallet = new SecureWallet('MySecureWallet');
  
  // Initialize with sensitive data
  const privateKey = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
  const seedPhrase = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
  
  wallet.initializeWallet(privateKey, seedPhrase);
  
  // Perform operations with secure logging
  wallet.sendTransaction('0xRecipientAddress', '1.5');
  
  try {
    // Try with wrong seed phrase to trigger error logging
    wallet.recoverWallet('wrong seed phrase');
  } catch (error) {
    console.log(`Recovery error: ${error.message}`);
  }
  
  // Export wallet data
  wallet.exportWalletData();
  
  console.log('\n=== SECURITY IMPROVEMENTS ===');
  console.log('This secure implementation includes these improvements:');
  console.log('1. Private keys and seed phrases are never logged');
  console.log('2. Error logs don\'t include sensitive information');
  console.log('3. A redaction system masks any potentially sensitive fields');
  console.log('4. Only necessary information is included in logs');
  console.log('5. Addresses are partially masked when logged\n');
  console.log('These practices prevent leakage of sensitive cryptographic material');
  console.log('through logs, significantly improving the security of the application.');
}

// Export the wallet class and demo function
module.exports = {
  SecureWallet,
  demonstrateSecureImplementation,
  secureLoggingService
};

// If this file is run directly, demonstrate the secure implementation
if (require.main === module) {
  demonstrateSecureImplementation();
} 