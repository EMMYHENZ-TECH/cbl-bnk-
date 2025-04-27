document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const token = localStorage.getItem("token")

  if (!currentUser || !token) {
    // Redirect to login if not logged in
    window.location.href = "index.html"
    return
  }

  // Apply dark mode if enabled
  const isDarkMode = localStorage.getItem("darkMode") === "true"
  if (isDarkMode) {
    document.body.classList.add("dark-mode")
  }

  // Load user data and balances
  loadUserData()

  // Set up polling for balance updates - check every 10 seconds
  setInterval(() => {
    refreshBalances()
  }, 10000)

  // Helper functions
  function loadUserData() {
    // Update balance display
    const balanceValue = document.getElementById("web3BalanceAmount")
    if (balanceValue) {
      if (currentUser.web3Balance > 0) {
        balanceValue.textContent = formatNumber(currentUser.web3Balance)
      } else {
        balanceValue.textContent = "0.00"
      }
    }

    // Update token balances
    updateTokenBalance("web3BtcAmount", currentUser.web3BtcBalance || 0, 95195.6)
    updateTokenBalance("web3UsdtAmount", currentUser.web3UsdtBalance || 0, 1.0)
  }

  function updateTokenBalance(elementId, balance, price) {
    const amountElement = document.getElementById(elementId)
    const valueElementId = elementId.replace("Amount", "Value")
    const valueElement = document.getElementById(valueElementId)

    if (amountElement) {
      amountElement.textContent = balance > 0 ? balance : "0"
    }

    if (valueElement) {
      const value = balance * price
      valueElement.textContent = value > 0 ? `$${formatNumber(value)}` : "$0"
    }
  }

  // Function to refresh balances from the server
  function refreshBalances() {
    fetch("/api/users/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Update the current user data in localStorage
          const updatedUser = data.user

          // Only update if there are actual changes to avoid unnecessary re-renders
          if (JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
            localStorage.setItem("currentUser", JSON.stringify(updatedUser))

            // Update the UI with new balance
            const balanceValue = document.getElementById("web3BalanceAmount")
            if (balanceValue) {
              if (updatedUser.web3Balance > 0) {
                balanceValue.textContent = formatNumber(updatedUser.web3Balance)
              } else {
                balanceValue.textContent = "0.00"
              }
            }

            // Update token balances
            updateTokenBalance("web3BtcAmount", updatedUser.web3BtcBalance || 0, 95195.6)
            updateTokenBalance("web3UsdtAmount", updatedUser.web3UsdtBalance || 0, 1.0)
          }
        }
      })
      .catch((error) => {
        console.error("Error refreshing balances:", error)
      })
  }

  // Format number with commas
  function formatNumber(num) {
    if (num === undefined || num === null) return "0.00"
    return Number.parseFloat(num).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Update current time
  function updateTime() {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    const timeElement = document.querySelector(".status-bar .time")
    if (timeElement) {
      timeElement.textContent = `${hours}:${minutes}`
    }
  }

  // Update time initially and then every minute
  updateTime()
  setInterval(updateTime, 60000)

  // Handle tab switching
  const exchangeTab = document.querySelector(".tab-btn:not(.active)")
  if (exchangeTab) {
    exchangeTab.addEventListener("click", () => {
      window.location.href = "defi-wallet.html"
    })
  }
})
