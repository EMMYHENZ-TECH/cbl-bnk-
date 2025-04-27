document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const web3User = JSON.parse(localStorage.getItem("web3User"))
  const token = localStorage.getItem("token")

  if (!currentUser || !token) {
    // Redirect to login if not logged in
    window.location.href = "index.html"
    return
  }

  // Function to generate a dummy wallet address
  function generateWalletAddress(type) {
    const prefix = type === "web3" ? "0x" : type === "web3Btc" ? "1" : "0x"
    const randomChars = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    return prefix + randomChars
  }

  if (!web3User) {
    // Create Web3 account data if it doesn't exist
    const web3User = {
      ...currentUser,
      web3WalletAddress: generateWalletAddress("web3"),
      web3BtcWalletAddress: generateWalletAddress("web3Btc"),
      web3UsdtWalletAddress: generateWalletAddress("web3Usdt"),
      web3Balance: 0,
      web3BtcBalance: 0,
      web3UsdtBalance: 0,
    }
    localStorage.setItem("web3User", JSON.stringify(web3User))
  }

  // Update time in status bar
  updateTime()
  setInterval(updateTime, 60000) // Update every minute

  // Set user initial in avatar
  const userInitial = document.getElementById("userInitial")
  if (userInitial && currentUser.name) {
    userInitial.textContent = currentUser.name.charAt(0).toUpperCase()
  }

  // Load user data and balances
  loadUserData()

  // Exchange/WEB3 tab switching
  const exchangeTab = document.getElementById("exchangeTab")
  const web3Tab = document.getElementById("web3Tab")

  if (exchangeTab) {
    exchangeTab.addEventListener("click", () => {
      exchangeTab.classList.add("active")
      web3Tab.classList.remove("active")
      // Redirect to regular dashboard
      window.location.href = "dashboard.html"
    })
  }

  if (web3Tab) {
    web3Tab.addEventListener("click", () => {
      web3Tab.classList.add("active")
      exchangeTab.classList.remove("active")
      // Stay on current page
    })
  }

  // Toggle balance visibility
  const toggleBalanceBtn = document.getElementById("toggleBalanceBtn")
  const balanceValue = document.getElementById("balanceValue")
  const btcEquivalent = document.getElementById("btcEquivalent")
  let isBalanceHidden = false

  if (toggleBalanceBtn && balanceValue) {
    toggleBalanceBtn.addEventListener("click", () => {
      isBalanceHidden = !isBalanceHidden
      if (isBalanceHidden) {
        balanceValue.textContent = "****"
        btcEquivalent.textContent = "********"
        toggleBalanceBtn.innerHTML = '<i class="fas fa-eye-slash"></i>'
      } else {
        balanceValue.textContent = formatNumber(web3User.web3Balance || 0)
        btcEquivalent.textContent = formatBtcEquivalent(web3User.web3Balance || 0)
        toggleBalanceBtn.innerHTML = '<i class="fas fa-eye"></i>'
      }
    })
  }

  // Deposit button click handler
  const depositBtn = document.getElementById("depositBtn")
  const depositModal = document.getElementById("depositModal")
  const closeDepositModal = document.getElementById("closeDepositModal")

  if (depositBtn && depositModal) {
    depositBtn.addEventListener("click", () => {
      depositModal.classList.add("active")
    })
  }

  if (closeDepositModal && depositModal) {
    closeDepositModal.addEventListener("click", () => {
      depositModal.classList.remove("active")
    })
  }

  // Token selection in deposit modal
  const tokenItems = document.querySelectorAll(".token-item")
  tokenItems.forEach((item) => {
    item.addEventListener("click", function () {
      const tokenType = this.getAttribute("data-token")
      depositModal.classList.remove("active")
      window.location.href = `web3-receive.html?token=${tokenType}`
    })
  })

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === depositModal) {
      depositModal.classList.remove("active")
    }
  })

  // Helper functions
  function loadUserData() {
    // Update balance display
    if (balanceValue) {
      balanceValue.textContent = formatNumber(web3User.web3Balance || 0)
    }

    // Update BTC equivalent
    if (btcEquivalent) {
      btcEquivalent.textContent = formatBtcEquivalent(web3User.web3Balance || 0)
    }
  }

  function formatNumber(num) {
    if (num === undefined || num === null) return "0.00"
    return Number.parseFloat(num).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  function formatBtcEquivalent(usdAmount) {
    // Assuming 1 BTC = $95,195.60 as shown in the design
    const btcPrice = 95195.6
    const btcAmount = usdAmount / btcPrice
    return btcAmount.toFixed(8)
  }

  // Helper function to update time in status bar
  function updateTime() {
    const timeElement = document.querySelector(".time")
    if (timeElement) {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
    }
  }
})
