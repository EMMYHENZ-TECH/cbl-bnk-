const express = require("express")
const bodyParser = require("body-parser")
const fs = require("fs")
const path = require("path")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { v4: uuidv4 } = require("uuid")

const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = "your-secret-key" // In production, use environment variables

// Middleware
app.use(bodyParser.json())
app.use(express.static("."))

// Helper functions
function readJSONFile(filename) {
  const filePath = path.join(__dirname, "..", "data", filename)
  const data = fs.readFileSync(filePath, "utf8")
  return JSON.parse(data)
}

function writeJSONFile(filename, data) {
  const filePath = path.join(__dirname, "..", "data", filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8")
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ success: false, message: "Access token is required" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid or expired token" })
    }
    req.user = user
    next()
  })
}

function generateWalletAddress() {
  return "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
}

function generateBitcoinAddress() {
  return "bc1" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
}

function generateTronAddress() {
  return "T" + Array.from({ length: 33 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
}

// User Routes
app.post("/api/users/register", (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" })
    }

    const users = readJSONFile("users.json")

    // Check if user already exists
    const existingUser = users.find((user) => user.email === email || user.username === username)
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" })
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(password, salt)

    // Generate wallet addresses
    const walletAddress = generateWalletAddress()
    const btcAddress = generateBitcoinAddress()
    const trxAddress = generateTronAddress()
    const usdtAddress = generateWalletAddress()
    const usdcAddress = generateWalletAddress()
    const bnbAddress = generateWalletAddress()
    const solAddress = generateWalletAddress()
    const ethAddress = generateWalletAddress()
    const polAddress = generateWalletAddress()

    // Generate Web3 wallet addresses
    const web3WalletAddress = generateWalletAddress()
    const web3BtcAddress = generateBitcoinAddress()
    const web3UsdtAddress = generateWalletAddress()

    // Create new user
    const newUser = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      walletAddress,
      btcAddress,
      trxAddress,
      usdtAddress,
      usdcAddress,
      bnbAddress,
      solAddress,
      ethAddress,
      polAddress,
      web3WalletAddress,
      web3BtcAddress,
      web3UsdtAddress,
      balance: 0,
      trxBalance: 0,
      usdtBalance: 0,
      usdcBalance: 0,
      bnbBalance: 0,
      solBalance: 0,
      ethBalance: 0,
      btcBalance: 0,
      polBalance: 0,
      web3Balance: 0,
      web3BtcBalance: 0,
      web3UsdtBalance: 0,
      createdAt: new Date().toISOString(),
      isAdmin: false,
    }

    // Save user
    users.push(newUser)
    writeJSONFile("users.json", users)

    // Create wallet entries
    const wallets = readJSONFile("wallets.json")
    const newWallet = {
      id: uuidv4(),
      userId: newUser.id,
      address: walletAddress,
      balance: 0,
      createdAt: new Date().toISOString(),
    }
    wallets.push(newWallet)
    writeJSONFile("wallets.json", wallets)

    // Create crypto wallets
    const cryptoWallets = readJSONFile("crypto-wallets.json")
    const tokens = ["BTC", "TRX", "USDT", "USDC", "BNB", "SOL", "ETH", "POL"]
    const addresses = {
      BTC: btcAddress,
      TRX: trxAddress,
      USDT: usdtAddress,
      USDC: usdcAddress,
      BNB: bnbAddress,
      SOL: solAddress,
      ETH: ethAddress,
      POL: polAddress,
    }

    tokens.forEach((token) => {
      const newCryptoWallet = {
        id: uuidv4(),
        userId: newUser.id,
        token,
        address: addresses[token],
        balance: 0,
        createdAt: new Date().toISOString(),
      }
      cryptoWallets.push(newCryptoWallet)
    })
    writeJSONFile("crypto-wallets.json", cryptoWallets)

    // Create Web3 crypto wallets
    const web3Tokens = ["BTC", "USDT"]
    const web3Addresses = {
      BTC: web3BtcAddress,
      USDT: web3UsdtAddress,
    }

    web3Tokens.forEach((token) => {
      const newWeb3CryptoWallet = {
        id: uuidv4(),
        userId: newUser.id,
        token,
        address: web3Addresses[token],
        isWeb3: true,
        balance: 0,
        createdAt: new Date().toISOString(),
      }
      cryptoWallets.push(newWeb3CryptoWallet)
    })
    writeJSONFile("crypto-wallets.json", cryptoWallets)

    // Return success without password
    const { password: _, ...userWithoutPassword } = newUser
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
})

app.post("/api/users/login", (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" })
    }

    const users = readJSONFile("users.json")

    // Find user
    const user = users.find((user) => user.email === email)
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" })
    }

    // Check password
    const isPasswordValid = bcrypt.compareSync(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid credentials" })
    }

    // Generate token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "24h" })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
})

app.get("/api/users/profile", authenticateToken, (req, res) => {
  try {
    const users = readJSONFile("users.json")
    const user = users.find((user) => user.id === req.user.id)

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user
    return res.status(200).json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Profile error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
})

app.put("/api/users/profile", authenticateToken, (req, res) => {
  try {
    const { username, email } = req.body
    const users = readJSONFile("users.json")
    const userIndex = users.findIndex((user) => user.id === req.user.id)

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Update user
    if (username) users[userIndex].username = username
    if (email) users[userIndex].email = email

    writeJSONFile("users.json", users)

    // Return updated user without password
    const { password, ...userWithoutPassword } = users[userIndex]
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
})

// Wallet Routes
app.get("/api/wallets", authenticateToken, (req, res) => {
  try {
    const wallets = readJSONFile("wallets.json")
    const userWallets = wallets.filter((wallet) => wallet.userId === req.user.id)

    return res.status(200).json({
      success: true,
      wallets: userWallets,
    })
  } catch (error) {
    console.error("Wallets error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
})

app.get("/api/crypto-wallets", authenticateToken, (req, res) => {
  try {
    const cryptoWallets = readJSONFile("crypto-wallets.json")
    const userCryptoWallets = cryptoWallets.filter((wallet) => wallet.userId === req.user.id)

    return res.status(200).json({
      success: true,
      wallets: userCryptoWallets,
    })
  } catch (error) {
    console.error("Crypto wallets error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
})

// Transaction Routes
app.get("/api/transactions", authenticateToken, (req, res) => {
  try {
    const transactions = readJSONFile("transactions.json")
    const userTransactions = transactions.filter(
      (transaction) => transaction.userId === req.user.id || transaction.recipientId === req.user.id,
    )

    // Sort by date (newest first)
    userTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))

    return res.status(200).json({
      success: true,
      transactions: userTransactions,
    })
  } catch (error) {
    console.error("Transactions error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
})

app.post("/api/transactions/send", authenticateToken, (req, res) => {
  try {
    const { recipientAddress, amount, note } = req.body

    if (!recipientAddress || !amount) {
      return res.status(400).json({ success: false, message: "Recipient address and amount are required" })
    }

    const users = readJSONFile("users.json")
    const sender = users.find((user) => user.id === req.user.id)

    if (!sender) {
      return res.status(404).json({ success: false, message: "Sender not found" })
    }

    if (sender.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" })
    }

    const recipient = users.find((user) => user.walletAddress === recipientAddress)

    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient not found" })
    }

    // Update balances
    sender.balance -= Number.parseFloat(amount)
    recipient.balance += Number.parseFloat(amount)

    // Save updated users
    writeJSONFile("users.json", users)

    // Create transaction record
    const transactions = readJSONFile("transactions.json")
    const newTransaction = {
      id: uuidv4(),
      type: "sent",
      userId: sender.id,
      recipientId: recipient.id,
      recipientAddress,
      amount: Number.parseFloat(amount),
      token: "MAIN",
      note: note || "",
      date: new Date().toISOString(),
    }
    transactions.push(newTransaction)

    // Create corresponding received transaction
    const receivedTransaction = {
      id: uuidv4(),
      type: "received",
      userId: recipient.id,
      senderId: sender.id,
      senderAddress: sender.walletAddress,
      amount: Number.parseFloat(amount),
      token: "MAIN",
      note: note || "",
      date: new Date().toISOString(),
    }
    transactions.push(receivedTransaction)

    writeJSONFile("transactions.json", transactions)

    return res.status(200).json({
      success: true,
      message: "Transaction successful",
      transaction: newTransaction,
    })
  } catch (error) {
    console.error("Send transaction error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
})

app.post("/api/transactions/send-token", authenticateToken, (req, res) => {
  try {
    const { tokenType, recipientAddress, amount, note } = req.body

    if (!tokenType || !recipientAddress || !amount) {
      return res.status(400).json({ success: false, message: "Token type, recipient address, and amount are required" })
    }

    const users = readJSONFile("users.json")
    const sender = users.find((user) => user.id === req.user.id)

    if (!sender) {
      return res.status(404).json({ success: false, message: "Sender not found" })
    }

    const balanceKey = `${tokenType.toLowerCase()}Balance`
    if (sender[balanceKey] < amount) {
      return res.status(400).json({ success: false, message: `Insufficient ${tokenType} balance` })
    }

    // Find recipient by token address
    const addressKey = `${tokenType.toLowerCase()}Address`
    const recipient = users.find((user) => user[addressKey] === recipientAddress)

    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient not found" })
    }

    // Update balances
    sender[balanceKey] -= Number.parseFloat(amount)
    recipient[balanceKey] += Number.parseFloat(amount)

    // Save updated users
    writeJSONFile("users.json", users)

    // Create transaction record
    const transactions = readJSONFile("transactions.json")
    const newTransaction = {
      id: uuidv4(),
      type: "sent",
      userId: sender.id,
      recipientId: recipient.id,
      recipientAddress,
      amount: Number.parseFloat(amount),
      token: tokenType,
      note: note || "",
      date: new Date().toISOString(),
    }
    transactions.push(newTransaction)

    // Create corresponding received transaction
    const receivedTransaction = {
      id: uuidv4(),
      type: "received",
      userId: recipient.id,
      senderId: sender.id,
      senderAddress: sender[addressKey],
      amount: Number.parseFloat(amount),
      token: tokenType,
      note: note || "",
      date: new Date().toISOString(),
    }
    transactions.push(receivedTransaction)

    writeJSONFile("transactions.json", transactions)

    return res.status(200).json({
      success: true,
      message: "Transaction successful",
      transaction: newTransaction,
    })
  } catch (error) {
    console.error("Send token transaction error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
})

app.post("/api/transactions/fund-token", authenticateToken, (req, res) => {
  try {
    const { tokenType, amount } = req.body

    if (!tokenType || !amount) {
      return res.status(400).json({ success: false, message: "Token type and amount are required" })
    }

    const users = readJSONFile("users.json")
    const user = users.find((user) => user.id === req.user.id)

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance in main wallet" })
    }

    // Update balances
    user.balance -= Number.parseFloat(amount)
    const balanceKey = `${tokenType.toLowerCase()}Balance`
    user[balanceKey] = (user[balanceKey] || 0) + Number.parseFloat(amount)

    // Save updated user
    writeJSONFile("users.json", users)

    // Create transaction record
    const transactions = readJSONFile("transactions.json")
    const newTransaction = {
      id: uuidv4(),
      type: "main-to-token",
      userId: user.id,
      amount: Number.parseFloat(amount),
      token: tokenType,
      date: new Date().toISOString(),
    }
    transactions.push(newTransaction)
    writeJSONFile("transactions.json", transactions)

    return res.status(200).json({
      success: true,
      message: "Token funded successfully",
      transaction: newTransaction,
    })
  } catch (error) {
    console.error("Fund token error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
})

// Web3 Transaction Routes
app.post("/api/transactions/send-web3-token", authenticateToken, (req, res) => {
  try {
    const { tokenType, recipientAddress, amount, note } = req.body

    if (!tokenType || !recipientAddress || !amount) {
      return res.status(400).json({ success: false, message: "Token type, recipient address, and amount are required" })
    }

    const users = readJSONFile("users.json")
    const sender = users.find((user) => user.id === req.user.id)

    if (!sender) {
      return res.status(404).json({ success: false, message: "Sender not found" })
    }

    const balanceKey = `web3${tokenType.toLowerCase()}Balance`
    if (sender[balanceKey] < amount) {
      return res.status(400).json({ success: false, message: `Insufficient Web3 ${tokenType} balance` })
    }

    // Find recipient by token address
    const addressKey = `web3${tokenType.toLowerCase()}Address`
    const recipient = users.find((user) => user[addressKey] === recipientAddress)

    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient not found" })
    }

    // Update balances
    sender[balanceKey] -= Number.parseFloat(amount)
    recipient[balanceKey] += Number.parseFloat(amount)

    // Save updated users
    writeJSONFile("users.json", users)

    // Create transaction record
    const transactions = readJSONFile("transactions.json")
    const newTransaction = {
      id: uuidv4(),
      type: "sent",
      userId: sender.id,
      recipientId: recipient.id,
      recipientAddress,
      amount: Number.parseFloat(amount),
      token: tokenType,
      isWeb3: true,
      note: note || "",
      date: new Date().toISOString(),
    }
    transactions.push(newTransaction)

    // Create corresponding received transaction
    const receivedTransaction = {
      id: uuidv4(),
      type: "received",
      userId: recipient.id,
      senderId: sender.id,
      senderAddress: sender[addressKey],
      amount: Number.parseFloat(amount),
      token: tokenType,
      isWeb3: true,
      note: note || "",
      date: new Date().toISOString(),
    }
    transactions.push(receivedTransaction)

    writeJSONFile("transactions.json", transactions)

    return res.status(200).json({
      success: true,
      message: "Transaction successful",
      transaction: newTransaction,
    })
  } catch (error) {
    console.error("Send Web3 token transaction error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
})

app.post("/api/transactions/send-web3-main", authenticateToken, (req, res) => {
  try {
    const { recipientAddress, amount, note } = req.body

    if (!recipientAddress || !amount) {
      return res.status(400).json({ success: false, message: "Recipient address and amount are required" })
    }

    const users = readJSONFile("users.json")
    const sender = users.find((user) => user.id === req.user.id)

    if (!sender) {
      return res.status(404).json({ success: false, message: "Sender not found" })
    }

    if (sender.web3Balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient Web3 balance" })
    }

    const recipient = users.find((user) => user.web3WalletAddress === recipientAddress)

    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient not found" })
    }

    // Update balances
    sender.web3Balance -= Number.parseFloat(amount)
    recipient.web3Balance += Number.parseFloat(amount)

    // Save updated users
    writeJSONFile("users.json", users)

    // Create transaction record
    const transactions = readJSONFile("transactions.json")
    const newTransaction = {
      id: uuidv4(),
      type: "sent",
      userId: sender.id,
      recipientId: recipient.id,
      recipientAddress,
      amount: Number.parseFloat(amount),
      token: "MAIN",
      isWeb3: true,
      note: note || "",
      date: new Date().toISOString(),
    }
    transactions.push(newTransaction)

    // Create corresponding received transaction
    const receivedTransaction = {
      id: uuidv4(),
      type: "received",
      userId: recipient.id,
      senderId: sender.id,
      senderAddress: sender.web3WalletAddress,
      amount: Number.parseFloat(amount),
      token: "MAIN",
      isWeb3: true,
      note: note || "",
      date: new Date().toISOString(),
    }
    transactions.push(receivedTransaction)

    writeJSONFile("transactions.json", transactions)

    return res.status(200).json({
      success: true,
      message: "Transaction successful",
      transaction: newTransaction,
    })
  } catch (error) {
    console.error("Send Web3 main transaction error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
})

app.post("/api/transactions/fund-web3-token", authenticateToken, (req, res) => {
  try {
    const { tokenType, amount } = req.body

    if (!tokenType || !amount) {
      return res.status(400).json({ success: false, message: "Token type and amount are required" })
    }

    const users = readJSONFile("users.json")
    const user = users.find((user) => user.id === req.user.id)

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    if (user.web3Balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance in Web3 main wallet" })
    }

    // Update balances
    user.web3Balance -= Number.parseFloat(amount)
    const balanceKey = `web3${tokenType.toLowerCase()}Balance`
    user[balanceKey] = (user[balanceKey] || 0) + Number.parseFloat(amount)

    // Save updated user
    writeJSONFile("users.json", users)

    // Create transaction record
    const transactions = readJSONFile("transactions.json")
    const newTransaction = {
      id: uuidv4(),
      type: "web3-main-to-token",
      userId: user.id,
      amount: Number.parseFloat(amount),
      token: tokenType,
      isWeb3: true,
      date: new Date().toISOString(),
    }
    transactions.push(newTransaction)
    writeJSONFile("transactions.json", transactions)

    return res.status(200).json({
      success: true,
      message: "Web3 token funded successfully",
      transaction: newTransaction,
    })
  } catch (error) {
    console.error("Fund Web3 token error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
})

// Admin Routes
app.get("/api/admin/users", authenticateToken, (req, res) => {
  try {
    const users = readJSONFile("users.json")
    const currentUser = users.find((user) => user.id === req.user.id)

    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized" })
    }

    // Return users without passwords
    const usersWithoutPasswords = users.map((user) => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    return res.status(200).json({
      success: true,
      users: usersWithoutPasswords,
    })
  } catch (error) {
    console.error("Admin users error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
})

app.post("/api/admin/fund-user", authenticateToken, (req, res) => {
  try {
    const { userId, amount } = req.body
    const users = readJSONFile("users.json")
    const currentUser = users.find((user) => user.id === req.user.id)

    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized" })
    }

    if (!userId || !amount) {
      return res.status(400).json({ success: false, message: "User ID and amount are required" })
    }

    const targetUser = users.find((user) => user.id === userId)
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Update user balance
    targetUser.balance += Number.parseFloat(amount)

    // Save updated users
    writeJSONFile("users.json", users)

    // Create transaction record
    const transactions = readJSONFile("transactions.json")
    const newTransaction = {
      id: uuidv4(),
      type: "admin-fund",
      userId: targetUser.id,
      adminId: currentUser.id,
      amount: Number.parseFloat(amount),
      token: "MAIN",
      date: new Date().toISOString(),
    }
    transactions.push(newTransaction)
    writeJSONFile("transactions.json", transactions)

    return res.status(200).json({
      success: true,
      message: "User funded successfully",
      transaction: newTransaction,
    })
  } catch (error) {
    console.error("Admin fund user error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
})

app.post("/api/admin/fund-web3-user", authenticateToken, (req, res) => {
  try {
    const { userId, amount } = req.body
    const users = readJSONFile("users.json")
    const currentUser = users.find((user) => user.id === req.user.id)

    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized" })
    }

    if (!userId || !amount) {
      return res.status(400).json({ success: false, message: "User ID and amount are required" })
    }

    const targetUser = users.find((user) => user.id === userId)
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Update user Web3 balance
    targetUser.web3Balance = (targetUser.web3Balance || 0) + Number.parseFloat(amount)

    // Save updated users
    writeJSONFile("users.json", users)

    // Create transaction record
    const transactions = readJSONFile("transactions.json")
    const newTransaction = {
      id: uuidv4(),
      type: "admin-fund-web3",
      userId: targetUser.id,
      adminId: currentUser.id,
      amount: Number.parseFloat(amount),
      token: "MAIN",
      isWeb3: true,
      date: new Date().toISOString(),
    }
    transactions.push(newTransaction)
    writeJSONFile("transactions.json", transactions)

    return res.status(200).json({
      success: true,
      message: "User Web3 wallet funded successfully",
      transaction: newTransaction,
    })
  } catch (error) {
    console.error("Admin fund Web3 user error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
