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
    const tokenSelect = document.getElementById("tokenSelect")
    if (tokenSelect) {
      // Check if the option exists before setting it
      const options = Array.from(tokenSelect.options)
      const optionExists = options.some((option) => option.value === preSelectedToken)

      if (optionExists) {
        tokenSelect.value = preSelectedToken
        updateQRCode(preSelectedToken)
      }
    }
  }

  // Token selection change handler
  const tokenSelect = document.getElementById("tokenSelect")
  if (tokenSelect) {
    tokenSelect.addEventListener("change", () => {
      const selectedToken = tokenSelect.value
      updateQRCode(selectedToken)
    })

    // Initialize with the first token
    updateQRCode(tokenSelect.value)
  }

  // Copy address button handler
  const copyAddressBtn = document.getElementById("copyAddressBtn")
  if (copyAddressBtn) {
    copyAddressBtn.addEventListener("click", () => {
      const address = document.getElementById("displayAddress").textContent

      // Create a temporary textarea element to copy text
      const textarea = document.createElement("textarea")
      textarea.value = address
      document.body.appendChild(textarea)
      textarea.select()

      try {
        // Execute copy command
        document.execCommand("copy")

        // Show success message
        const originalText = copyAddressBtn.innerHTML
        copyAddressBtn.innerHTML = `<i class="fas fa-check"></i><span>Copied!</span>`

        // Reset button text after 2 seconds
        setTimeout(() => {
          copyAddressBtn.innerHTML = originalText
        }, 2000)
      } catch (err) {
        console.error("Failed to copy address:", err)
        alert("Failed to copy address. Please try again.")
      } finally {
        // Remove the temporary textarea
        document.body.removeChild(textarea)
      }
    })
  }

  // Share address button handler
  const shareAddressBtn = document.getElementById("shareAddressBtn")
  if (shareAddressBtn) {
    shareAddressBtn.addEventListener("click", () => {
      const address = document.getElementById("displayAddress").textContent
      const tokenName = document.getElementById("selectedTokenName").textContent

      // Check if Web Share API is available
      if (navigator.share) {
        navigator
          .share({
            title: `My ${tokenName} Web3 Wallet Address`,
            text: `Here's my ${tokenName} Web3 wallet address: ${address}`,
            url: window.location.href,
          })
          .then(() => console.log("Address shared successfully"))
          .catch((error) => console.error("Error sharing address:", error))
      } else {
        // Fallback for browsers that don't support Web Share API
        alert(`My ${tokenName} Web3 wallet address: ${address}`)
      }
    })
  }

  // Function to update QR code and address display
  function updateQRCode(selectedToken) {
    const qrCodeElement = document.getElementById("qrCode")
    const displayAddressElement = document.getElementById("displayAddress")
    const selectedTokenNameElement = document.getElementById("selectedTokenName")

    if (!qrCodeElement || !displayAddressElement || !selectedTokenNameElement) return

    // Get the appropriate address based on selected token
    let address = ""
    let tokenName = selectedToken

    if (selectedToken === "MAIN") {
      address = currentUser.web3WalletAddress || "Address not available"
      tokenName = "Web3 Main Wallet"
    } else if (selectedToken === "BTC") {
      address = currentUser.web3BtcAddress || "BTC address not available"
    } else if (selectedToken === "USDT") {
      address = currentUser.web3UsdtAddress || "USDT address not available"
    }

    // Update the display address
    displayAddressElement.textContent = address

    // Update the selected token name
    selectedTokenNameElement.textContent = tokenName

    // Generate QR code if address is available
    if (
      address &&
      address !== "Address not available" &&
      address !== "BTC address not available" &&
      address !== "USDT address not available"
    ) {
      // Clear previous QR code
      qrCodeElement.innerHTML = ""

      // Generate new QR code
      const qr = qrcode(0, "L")
      qr.addData(address)
      qr.make()

      // Render QR code
      qrCodeElement.innerHTML = qr.createImgTag(5)
    } else {
      // Show placeholder if address is not available
      qrCodeElement.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #f5f5f5; color: #666;">
          <div style="text-align: center;">
            <i class="fas fa-qrcode" style="font-size: 48px; margin-bottom: 8px;"></i>
            <div>Address not available</div>
          </div>
        </div>
      `
    }
  }
})
