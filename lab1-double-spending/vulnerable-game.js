/**
 * Vulnerable GameFi Implementation
 * This example demonstrates a backend without proper transaction locks
 */

const userBalances = {
  'user1': { coins: 1000, gems: 50 },
  'user2': { coins: 500, gems: 25 },
};

const blockchain = {
  async sendTokens(address, amount) {
    console.log(`[Blockchain] Sending ${amount} tokens to ${address}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`[Blockchain] Transaction completed for ${address}`);
    return { txHash: `0x${Math.random().toString(16).substr(2, 40)}` };
  }
};

/**
 * VULNERABLE IMPLEMENTATION: No locking mechanism
 * 
 * This function processes a withdrawal request but doesn't use any locks.
 * If multiple requests come in at nearly the same time, they can all pass
 * the balance check before any of them update the balance.
 */
async function processWithdrawal(userId, amount, walletAddress) {
  console.log(`[Request] Processing withdrawal of ${amount} for user ${userId}`);
  
  if (!userBalances[userId]) {
    console.log(`[Error] User ${userId} not found`);
    return { success: false, error: 'User not found' };
  }
  
  // VULNERABILITY: No locking here!
  if (userBalances[userId].coins < amount) {
    console.log(`[Error] Insufficient balance for user ${userId}`);
    return { success: false, error: 'Insufficient balance' };
  }
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const tx = await blockchain.sendTokens(walletAddress, amount);
    
    // VULNERABILITY: Balance is only updated after the blockchain transaction
    // By then, other requests might have already passed the balance check
    userBalances[userId].coins -= amount;
    
    console.log(`[Success] Withdrawal successful for user ${userId}`);
    console.log(`[Balance] New balance: ${userBalances[userId].coins} coins`);
    
    return { 
      success: true, 
      txHash: tx.txHash, 
      newBalance: userBalances[userId].coins 
    };
  } catch (error) {
    console.log(`[Error] Transaction failed: ${error.message}`);
    return { success: false, error: 'Transaction failed' };
  }
}

/**
 * This function demonstrates how a malicious user can exploit the vulnerability
 * by sending multiple withdrawal requests almost simultaneously.
 */
async function exploitDoubleSpending() {
  const userId = 'user1';
  const initialBalance = userBalances[userId].coins;
  const withdrawalAmount = 800;
  const walletAddress = '0xUserWalletAddress';
  
  console.log(`[Exploit] Starting double-spending exploit demo`);
  console.log(`[Exploit] Initial balance for ${userId}: ${initialBalance} coins`);
  console.log(`[Exploit] Attempting to withdraw ${withdrawalAmount} coins multiple times`);
  
  // Send multiple withdrawal requests almost simultaneously
  const request1 = processWithdrawal(userId, withdrawalAmount, walletAddress);
  const request2 = processWithdrawal(userId, withdrawalAmount, walletAddress);
  
  const [result1, result2] = await Promise.all([request1, request2]);
  
  console.log('\n[Exploit] Exploit results:');
  console.log(`[Exploit] Request 1 success: ${result1.success}`);
  console.log(`[Exploit] Request 2 success: ${result2.success}`);
  console.log(`[Exploit] Final balance for ${userId}: ${userBalances[userId].coins} coins`);
  
  const totalWithdrawn = 
    (result1.success ? withdrawalAmount : 0) + 
    (result2.success ? withdrawalAmount : 0);
  
  console.log(`[Exploit] Total withdrawn: ${totalWithdrawn} coins`);
  
  if (totalWithdrawn > initialBalance) {
    console.log(`[Exploit] EXPLOIT SUCCESSFUL! Withdrew more than the initial balance.`);
  } else {
    console.log(`[Exploit] Exploit failed or race condition didn't occur.`);
  }
}

module.exports = {
  processWithdrawal,
  exploitDoubleSpending,
  userBalances,
};

if (require.main === module) {
  exploitDoubleSpending().catch(console.error);
} 