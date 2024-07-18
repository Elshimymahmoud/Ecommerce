document.addEventListener("DOMContentLoaded", function () {
  const paginationLinks = document.querySelectorAll(".pagination a.page-link");
  const searchInput = document.getElementById("search-input");
  const minPriceInput = document.getElementById("min-price");
  const maxPriceInput = document.getElementById("max-price");
  const applyFilterBtn = document.getElementById("apply-filter-btn");
  const allProductContainer = document.querySelector(".allcard");
  const categoryDropdown = document.getElementById("categoryDropdown");
  const categoryItems = document.querySelectorAll(
    ".dropdown-item[data-category]"
  );

  let products = [];
  const productsPerPage = 10;
  let currentPage = 1;

  async function getData() {
    try {
      const response = await fetch("https://fakestoreapi.com/products");
      if (!response.ok) {
        throw new Error("Couldn't load data");
      }
      const data = await response.json();
      data.forEach((product) => {
        const productElement = document.createElement("div");
        productElement.className = "product";
        productElement.innerHTML = `
          <img class="img-product" src="${product.image}" alt="${product.title}">
          <h1 class="title-product">${product.title}</h1>
          <h1 class="price">$${product.price}</h1>
          <button class="addCard">Add to cart</button>
        `;
        allProductContainer.appendChild(productElement);
        product.element = productElement; // Link product data to its DOM element
        products.push(product);
      });
      filterProducts();
    } catch (err) {
      console.error(err);
    }
  }

  function filterProducts() {
    const searchValue = searchInput.value.toLowerCase();
    const minPrice = parseFloat(minPriceInput.value) || 0;
    const maxPrice = parseFloat(maxPriceInput.value) || Infinity;
    const selectedCategories = categoryDropdown.dataset.selectedCategories
      ? categoryDropdown.dataset.selectedCategories.split(",")
      : [];

    const filteredProducts = products.filter((product) => {
      return (
        product.title.toLowerCase().includes(searchValue) &&
        product.price >= minPrice &&
        product.price <= maxPrice &&
        (selectedCategories.length === 0 ||
          selectedCategories.includes(product.category))
      );
    });

    displayProducts(filteredProducts);
  }

  function displayProducts(filteredProducts) {
    allProductContainer.innerHTML = "";
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = filteredProducts.slice(start, end);

    paginatedProducts.forEach((product) => {
      allProductContainer.appendChild(product.element);
    });

    updatePaginationLinks(filteredProducts.length);
  }

  function updatePaginationLinks(totalProducts) {
    const paginationContainer = document.querySelector(".pagination");
    paginationContainer.innerHTML = `
      <a href="#" class="prev">&laquo;</a>
    `;

    const totalPages = Math.ceil(totalProducts / productsPerPage);
    for (let i = 1; i <= totalPages; i++) {
      paginationContainer.innerHTML += `<a href="#" class="page-link ${
        i === currentPage ? "active" : ""
      }">${i}</a>`;
    }

    paginationContainer.innerHTML += `
      <a href="#" class="next">&raquo;</a>
    `;

    attachPaginationEventListeners();
  }

  function attachPaginationEventListeners() {
    const paginationLinks = document.querySelectorAll(
      ".pagination a.page-link"
    );

    paginationLinks.forEach((link) => {
      link.addEventListener("click", function (event) {
        event.preventDefault();

        // Remove active class from all links
        paginationLinks.forEach((link) => link.classList.remove("active"));

        // Add active class to the clicked link
        this.classList.add("active");

        // Load the corresponding page content
        currentPage = parseInt(this.textContent);
        filterProducts();
      });
    });

    const prevButton = document.querySelector(".pagination .prev");
    const nextButton = document.querySelector(".pagination .next");

    prevButton.addEventListener("click", function (event) {
      event.preventDefault();
      if (currentPage > 1) {
        currentPage--;
        filterProducts();
      }
    });

    nextButton.addEventListener("click", function (event) {
      event.preventDefault();
      const totalPages = Math.ceil(products.length / productsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        filterProducts();
      }
    });
  }

  searchInput.addEventListener("input", filterProducts);
  applyFilterBtn.addEventListener("click", filterProducts);
  categoryItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      const categories = e.target.dataset.category;
      categoryDropdown.textContent = e.target.textContent;
      categoryDropdown.dataset.selectedCategories = categories;
      filterProducts();
    });
  });

  getData();
});
