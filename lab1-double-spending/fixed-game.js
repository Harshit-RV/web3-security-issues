/**
 * Fixed GameFi Implementation
 * This example demonstrates a backend with proper transaction locks to prevent double-spending
 */

const userBalances = {
  'user1': { coins: 1000, gems: 50 },
  'user2': { coins: 500, gems: 25 },
};

const blockchain = {
  async sendTokens(address, amount) {
    console.log(`[Blockchain] Sending ${amount} tokens to ${address}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`[Blockchain] Transaction completed for ${address}`);
    return { txHash: `0x${Math.random().toString(16).substr(2, 40)}` };
  }
};

const Mutex = function() {
  this.locked = false;
  this.waitingQueue = [];
};

Mutex.prototype.acquire = function() {
  return new Promise(resolve => {
    if (!this.locked) {
      this.locked = true;
      resolve();
    } else {
      this.waitingQueue.push(resolve);
    }
  });
};

Mutex.prototype.release = function() {
  if (this.waitingQueue.length > 0) {
    const resolve = this.waitingQueue.shift();
    resolve();
  } else {
    this.locked = false;
  }
};

const userMutexes = {};

function getUserMutex(userId) {
  if (!userMutexes[userId]) {
    userMutexes[userId] = new Mutex();
  }
  return userMutexes[userId];
}

/**
 * FIXED IMPLEMENTATION: With locking mechanism
 * 
 * This function processes a withdrawal request with proper locking,
 * ensuring only one withdrawal can happen at a time for a given user.
 */
async function processWithdrawal(userId, amount, walletAddress) {
  console.log(`[Request] Processing withdrawal of ${amount} for user ${userId}`);
  
  if (!userBalances[userId]) {
    console.log(`[Error] User ${userId} not found`);
    return { success: false, error: 'User not found' };
  }
  
  const mutex = getUserMutex(userId);
  
  // FIXED: Acquire lock before processing
  await mutex.acquire();
  
  try {
    // Within this block, we have exclusive access to the user's balance
    console.log(`[Lock] Acquired lock for user ${userId}`);
    
    if (userBalances[userId].coins < amount) {
      console.log(`[Error] Insufficient balance for user ${userId}`);
      return { success: false, error: 'Insufficient balance' };
    }
    
    // FIXED: Reduce balance BEFORE sending tokens (Check-Effects-Interactions pattern)
    // This prevents the double-spend even if the blockchain transaction fails
    userBalances[userId].coins -= amount;
    console.log(`[Balance] Reserved balance: ${userBalances[userId].coins} coins`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const tx = await blockchain.sendTokens(walletAddress, amount);
      
      console.log(`[Success] Withdrawal successful for user ${userId}`);
      console.log(`[Balance] Final balance: ${userBalances[userId].coins} coins`);
      
      return { 
        success: true, 
        txHash: tx.txHash, 
        newBalance: userBalances[userId].coins 
      };
    } catch (error) {
      // FIXED: If the blockchain transaction fails, revert the balance change
      userBalances[userId].coins += amount;
      console.log(`[Error] Transaction failed: ${error.message}`);
      console.log(`[Balance] Restored balance: ${userBalances[userId].coins} coins`);
      return { success: false, error: 'Transaction failed' };
    }
  } finally {
    // Always release the lock, even if an error occurs
    mutex.release();
    console.log(`[Lock] Released lock for user ${userId}`);
  }
}

/**
 * This function demonstrates that the double-spending exploit no longer works
 */
async function attemptDoubleSpending() {
  const userId = 'user1';
  const initialBalance = userBalances[userId].coins;
  const withdrawalAmount = 800;
  const walletAddress = '0xUserWalletAddress';
  
  console.log(`[Test] Starting double-spending prevention test`);
  console.log(`[Test] Initial balance for ${userId}: ${initialBalance} coins`);
  console.log(`[Test] Attempting to withdraw ${withdrawalAmount} coins multiple times`);
  
  // Send multiple withdrawal requests almost simultaneously
  const request1 = processWithdrawal(userId, withdrawalAmount, walletAddress);
  const request2 = processWithdrawal(userId, withdrawalAmount, walletAddress);
  
  const [result1, result2] = await Promise.all([request1, request2]);
  
  console.log('\n[Test] Results:');
  console.log(`[Test] Request 1 success: ${result1.success}`);
  console.log(`[Test] Request 2 success: ${result2.success}`);
  console.log(`[Test] Final balance for ${userId}: ${userBalances[userId].coins} coins`);
  
  const totalWithdrawn = 
    (result1.success ? withdrawalAmount : 0) + 
    (result2.success ? withdrawalAmount : 0);
  
  console.log(`[Test] Total withdrawn: ${totalWithdrawn} coins`);
  
  if (totalWithdrawn > initialBalance) {
    console.log(`[Test] SECURITY FAILURE! Double-spending still possible.`);
  } else {
    console.log(`[Test] SECURITY SUCCESS! Double-spending was prevented.`);
  }
}

module.exports = {
  processWithdrawal,
  attemptDoubleSpending,
  userBalances,
};

if (require.main === module) {
  attemptDoubleSpending().catch(console.error);
} 