# Lab 3: Insecure Logging in Web3 App

## Overview

This lab demonstrates how insecure logging practices can expose sensitive data in Web3 applications. Inspired by the Slope Wallet private key leak, it shows how careless logging can compromise user security.

## The Vulnerability Explained

Logging is an essential part of application monitoring and debugging, but when sensitive information is logged, it creates serious security risks:

1. Private keys and seed phrases accidentally logged to console or files
2. Logs sent to external services without proper redaction
3. Debug information exposed in production environments
4. Log files accessible by unauthorized parties

## Demo Implementation

This lab includes:

1. A simple wallet application that demonstrates insecure logging
2. Examples of how sensitive data can be exposed through logs
3. A secure implementation that properly redacts sensitive information

## Preventing This Attack

To protect your Web3 applications:

- Never log private keys, seed phrases, or secrets
- Use specialized secure logging libraries with redaction features
- Create explicit policies about what data can be logged
- Implement different logging levels for development and production
- Encrypt and protect access to log files
- Audit all logging statements before deploying code

## Lab Files

- `insecure-wallet.js` - A wallet implementation with vulnerable logging practices
- `secure-wallet.js` - The same implementation with proper log redaction

## Usage

1. Review the insecure implementation in `insecure-wallet.js`
2. Understand how sensitive data is exposed through logging
3. Study the secure implementation in `secure-wallet.js`
4. Apply similar security practices to your own applications
