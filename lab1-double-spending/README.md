# Exploiting Double-Spending in GameFi

## Overview

This lab demonstrates how missing transaction locks can lead to double-spending exploits in GameFi dApps. This vulnerability occurs when a backend system processes multiple withdrawal requests without proper synchronization mechanisms.

## The Vulnerability Explained

In Web2 systems, transaction locks prevent duplicate or conflicting operations. When transitioning to Web3, developers sometimes focus on blockchain's inherent transaction ordering but neglect proper locking in their off-chain components.

This vulnerability allows users to:

1. Submit multiple withdrawal requests almost simultaneously
2. Have each request processed independently before the blockchain transaction confirms
3. Withdraw more funds than they actually own

## Demo Implementation

This lab includes:

1. A simple game backend that manages user balances
2. A withdrawal process that's vulnerable to race conditions
3. Examples of how proper locking mechanisms can prevent the attack

## Preventing This Attack

To protect your GameFi applications:

- Use mutex locks for critical operations
- Implement optimistic locking with version numbers
- Use database transactions for balance updates
- Apply the Check-Effects-Interactions pattern
- Maintain a transaction queue for sequential processing
- Add transaction IDs to prevent duplicate processing

## Lab Files

- `vulnerable-game.js` - A GameFi backend implementation with the vulnerability
- `fixed-game.js` - The same implementation with proper locking mechanisms

## Usage

1. Review the vulnerable implementation in `vulnerable-game.js`
2. Understand how the race condition can be exploited
3. Study the secure implementation in `fixed-game.js`
4. Apply similar fixes to your own applications
