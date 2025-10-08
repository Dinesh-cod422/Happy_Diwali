document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById("product-list");
  const cartSummary = document.getElementById("cart-summary");
  const popup = document.getElementById("image-popup");
  const popupImg = document.getElementById("popup-img");
  const closeBtn = document.querySelector(".close");
  const downloadBtn = document.getElementById("view-cart");

  // Fetch products
  fetch("../products.json")
    .then(res => res.json())
    .then(data => {
      let html = "";
      data.forEach(item => {
        html += `
          <tr data-id="${item.id}" class="product-row">
            <td><img src="https://www.marvelcrackers.com/${item.image_url}" alt="${item.name}" class="prod-img"></td>
            <td>${item.name}</td>
            <td>${item.content}</td>
            <td><s>₹${item.actual_price}</s></td>
            <td>₹${item.price}</td>
            <td><input type="number" min="0" value="0" class="qty-input"></td>
            <td class="total">₹0</td>
          </tr>`;
      });
      productList.innerHTML = html;

      // Quantity change
      document.querySelectorAll(".qty-input").forEach(input => {
        input.addEventListener("input", e => {
          const row = e.target.closest("tr");
          const price = parseFloat(row.children[4].textContent.replace("₹", ""));
          const qty = parseInt(e.target.value) || 0;
          row.querySelector(".total").textContent = `₹${(price * qty).toFixed(2)}`;
          updateCart();
        });
      });

      // Image popup
      document.querySelectorAll(".prod-img").forEach(img => {
        img.addEventListener("click", e => {
          e.stopPropagation();
          popup.style.display = "block";
          popupImg.src = img.src;
        });
      });

      closeBtn.addEventListener("click", () => (popup.style.display = "none"));
      window.addEventListener("click", e => {
        if (e.target === popup) popup.style.display = "none";
      });
    });

  function updateCart() {
    let totalItems = 0,
      totalAmount = 0;
    document.querySelectorAll("#product-list tr").forEach(row => {
      const qty = parseInt(row.querySelector(".qty-input").value) || 0;
      const price = parseFloat(row.children[4].textContent.replace("₹", ""));
      totalItems += qty;
      totalAmount += qty * price;
    });
    cartSummary.textContent = `${totalItems} items. ₹${totalAmount.toFixed(2)}`;
  }

  // Download PDF
  downloadBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const selectedProducts = [];
    document.querySelectorAll("#product-list tr").forEach(row => {
      const qty = parseInt(row.querySelector(".qty-input").value) || 0;
      if (qty > 0) {
        selectedProducts.push({
          Image: row.querySelector(".prod-img").src,
          Name: row.children[1].textContent,
          Content: row.children[2].textContent,
          ActualPrice: row.children[3].textContent,
          Price: row.children[4].textContent,
          Quantity: qty,
          Total: row.querySelector(".total").textContent
        });
      }
    });

    if (selectedProducts.length === 0) {
      alert("Please select at least 1 product.");
      return;
    }

    // Add title
    doc.setFontSize(18);
    doc.text("Selected Products", 14, 20);

    // Table headers and data
    const tableColumn = ["Name", "Content", "Actual Price", "Price", "Qty", "Total"];
    const tableRows = [];

    selectedProducts.forEach(prod => {
      const rowData = [
        prod.Name,
        prod.Content,
        prod.ActualPrice,
        prod.Price,
        prod.Quantity,
        prod.Total
      ];
      tableRows.push(rowData);
    });

    // Generate table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [106, 27, 154], textColor: 255 },
      alternateRowStyles: { fillColor: [255, 235, 59] }
    });

    doc.save("selected-products.pdf");
  });
});
