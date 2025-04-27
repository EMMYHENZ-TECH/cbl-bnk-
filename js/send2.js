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

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const preSelectedToken = urlParams.get("token")

  // Set pre-selected token if provided in URL
  if (preSelectedToken) {
    const tokenTypeSelect = document.getElementById("tokenType")
    if (tokenTypeSelect) {
      // Check if the option exists before setting it
      const options = Array.from(tokenTypeSelect.options)
      const optionExists = options.some((option) => option.value === preSelectedToken)

      if (optionExists) {
        tokenTypeSelect.value = preSelectedToken
      }
    }
  }

  // Tab switching
  const sendTabs = document.querySelectorAll(".send-tab")
  sendTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs
      sendTabs.forEach((t) => t.classList.remove("active"))

      // Add active class to clicked tab
      tab.classList.add("active")

      // Hide all forms
      document.querySelectorAll(".send-form").forEach((form) => {
        form.classList.remove("active")
      })

      // Show the selected form
      const formId = tab.getAttribute("data-form")
      document.getElementById(formId).classList.add("active")
    })
  })

  // Token Form Submission
  const tokenForm = document.getElementById("tokenForm")
  if (tokenForm) {
    tokenForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const tokenType = document.getElementById("tokenType").value
      const recipientAddress = document.getElementById("recipientAddress").value
      const amount = document.getElementById("tokenAmount").value
      const note = document.getElementById("tokenNote").value
      const errorElement = document.getElementById("sendTokenError")

      // Clear previous errors
      errorElement.textContent = ""

      // Validate amount
      if (Number.parseFloat(amount) <= 0) {
        errorElement.textContent = "Amount must be greater than 0"
        return
      }

      // Check if user has enough balance
      const userBalance = currentUser[`web3${tokenType.toLowerCase()}Balance`] || 0
      if (Number.parseFloat(amount) > userBalance) {
        errorElement.textContent = `Insufficient ${tokenType} balance`
        return
      }

      // Make API request to send token
      fetch("/api/transactions/send-web3-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tokenType,
          recipientAddress,
          amount: Number.parseFloat(amount),
          note,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Update the UI immediately
            const updatedUser = JSON.parse(localStorage.getItem("currentUser"))
            updatedUser[`web3${tokenType.toLowerCase()}Balance`] =
              (updatedUser[`web3${tokenType.toLowerCase()}Balance`] || 0) - Number.parseFloat(amount)
            localStorage.setItem("currentUser", JSON.stringify(updatedUser))

            // Show success message and redirect
            alert(`Successfully sent ${amount} ${tokenType} to ${recipientAddress}`)
            window.location.href = "defi-wallet2.html"
          } else {
            errorElement.textContent = data.message || "Failed to send token"
          }
        })
        .catch((error) => {
          errorElement.textContent = "An error occurred. Please try again."
          console.error("Send token error:", error)
        })
    })
  }

  // Main Wallet Form Submission
  const mainWalletForm = document.getElementById("mainWalletForm")
  if (mainWalletForm) {
    mainWalletForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const recipientAddress = document.getElementById("mainRecipientAddress").value
      const amount = document.getElementById("mainAmount").value
      const note = document.getElementById("mainNote").value
      const errorElement = document.getElementById("mainSendError")

      // Clear previous errors
      errorElement.textContent = ""

      // Validate amount
      if (Number.parseFloat(amount) <= 0) {
        errorElement.textContent = "Amount must be greater than 0"
        return
      }

      // Check if user has enough balance
      const userBalance = currentUser.web3Balance || 0
      if (Number.parseFloat(amount) > userBalance) {
        errorElement.textContent = "Insufficient balance in Web3 main wallet"
        return
      }

      // Make API request to send from main wallet
      fetch("/api/transactions/send-web3-main", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientAddress,
          amount: Number.parseFloat(amount),
          note,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Update the UI immediately
            const updatedUser = JSON.parse(localStorage.getItem("currentUser"))
            updatedUser.web3Balance = (updatedUser.web3Balance || 0) - Number.parseFloat(amount)
            localStorage.setItem("currentUser", JSON.stringify(updatedUser))

            // Show success message and redirect
            alert(`Successfully sent ${amount} from Web3 main wallet to ${recipientAddress}`)
            window.location.href = "defi-wallet2.html"
          } else {
            errorElement.textContent = data.message || "Failed to send from main wallet"
          }
        })
        .catch((error) => {
          errorElement.textContent = "An error occurred. Please try again."
          console.error("Send main wallet error:", error)
        })
    })
  }

  // Fund Token Form Submission
  const fundTokenForm = document.getElementById("fundTokenForm")
  if (fundTokenForm) {
    fundTokenForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const tokenType = document.getElementById("fundTokenType").value
      const amount = document.getElementById("fundAmount").value
      const note = document.getElementById("fundNote").value
      const errorElement = document.getElementById("fundTokenError")

      // Clear previous errors
      errorElement.textContent = ""

      // Validate amount
      if (Number.parseFloat(amount) <= 0) {
        errorElement.textContent = "Amount must be greater than 0"
        return
      }

      // Check if user has enough balance in main wallet
      const userBalance = currentUser.web3Balance || 0
      if (Number.parseFloat(amount) > userBalance) {
        errorElement.textContent = "Insufficient balance in Web3 main wallet"
        return
      }

      // Make API request to fund token wallet
      fetch("/api/transactions/fund-web3-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tokenType,
          amount: Number.parseFloat(amount),
          note,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Update the UI immediately
            const updatedUser = JSON.parse(localStorage.getItem("currentUser"))
            updatedUser.web3Balance = (updatedUser.web3Balance || 0) - Number.parseFloat(amount)
            updatedUser[`web3${tokenType.toLowerCase()}Balance`] =
              (updatedUser[`web3${tokenType.toLowerCase()}Balance`] || 0) + Number.parseFloat(amount)
            localStorage.setItem("currentUser", JSON.stringify(updatedUser))

            // Show success message and redirect
            alert(`Successfully funded ${amount} to Web3 ${tokenType} wallet`)
            window.location.href = "defi-wallet2.html"
          } else {
            errorElement.textContent = data.message || "Failed to fund token wallet"
          }
        })
        .catch((error) => {
          errorElement.textContent = "An error occurred. Please try again."
          console.error("Fund token error:", error)
        })
    })
  }
})
