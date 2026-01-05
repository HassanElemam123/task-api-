let products = [];




function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function loadSmartphones() {
  cards.innerHTML = `<p class="no-results">Loading...</p>`;

  try {
    const res = await fetch("https://dummyjson.com/products/category/smartphones?limit=8");
    const data = await res.json();

    products = (data.products || []).slice(0, 8).map((p) => {
      const old_price = Math.round(p.price);
      const price_after_sale = Math.round(p.price * (1 - (p.discountPercentage || 0) / 100));

      return {
        id: p.id,
        slug: slugify(p.title),
        title: p.title,
        description: p.description,
        image: p.thumbnail,
        old_price,
        price_after_sale,
        currency: "USD",
      };
    });

    cartProducts = cartProducts.filter((id) => products.some((p) => p.id === id));
    wishedProducts = wishedProducts.filter((id) => products.some((p) => p.id === id));

    localStorage.setItem("cart", JSON.stringify(cartProducts));
    localStorage.setItem("wish", JSON.stringify(wishedProducts));

    cartIndicator.textContent = cartProducts.length;

    renderProducts(products);
  } catch (err) {
    console.error(err);
    cards.innerHTML = `<p class="no-results">Failed to load products</p>`;
  }
}


// =================================

// Rendering, Adding, Removing => cart 


const cards = document.querySelector(".cards");
const searchInput = document.querySelector(".search-inp");
const searchBtn = document.querySelector(".search-btn");

const cartIndicator = document.querySelector(".cart-indicator")


let cartProducts = JSON.parse(localStorage.getItem("cart")) || [];
cartIndicator.textContent = cartProducts.length;


const addToCart = (id) => {
  if (!cartProducts.includes(id)) cartProducts.push(id);

  localStorage.setItem("cart", JSON.stringify(cartProducts));
  cartIndicator.textContent = cartProducts.length;

  renderProducts(products);
};


const removeFromCart = (id) => {
  cartProducts = cartProducts.filter((item) => item !== id);

  localStorage.setItem("cart", JSON.stringify(cartProducts));
  cartIndicator.textContent = cartProducts.length;

  renderProducts(products);
};



function renderProducts(list) {
  cards.innerHTML = ""; 
  
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    
    cards.innerHTML += `
    <div class="card">
      <img src="${p.image}" alt="image">
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      <div class="price">
        <span class="rp">${p.price_after_sale}$</span>
        <span class="wp"><div class="line"></div> ${p.old_price}$</span>
      </div>
      <div class="action">
      ${cartProducts.includes(p.id) ? `
        <button class="removing" onclick="removeFromCart(${p.id})">
        <img src="icons/cart.svg" alt="cart">
        Remove from cart
        </button>
        ` : `
        <button class="adding" onclick="addToCart(${p.id})">
        <img src="icons/cart.svg" alt="cart">
        Add to cart
        </button>
        `}
        <button class="emotion" data-id="${p.id}">
          <img src="icons/Favorite.svg" alt="like">
        </button>

      </div>
    </div>

    `;
    }
    
    if (list.length === 0) {
      cards.innerHTML = `<p class="no-results">No products found</p>`;
    }
  };


  // renderProducts(products);



  // =======================================

  // Searshing




function searchProducts() {
    const search = searchInput.value.toLowerCase().trim();
    
    if (search === "") {
      renderProducts(products);
      return;
    }
    
    const matchedProducts = [];
    
    for (let i = 0; i < products.length; i++) {
      const slug  = products[i].slug.toLowerCase();
      const title = products[i].title.toLowerCase();
      const desc  = products[i].description.toLowerCase();
      
      if (
        slug.includes(search) || title.includes(search) || desc.includes(search)
      ) {
        matchedProducts.push(products[i]);
      }
    }
    
    renderProducts(matchedProducts);
  }
  
  searchBtn.addEventListener("click", searchProducts);
  
  
  // ====================================
  
  
  // Comparing 
  
  const minInput = document.querySelector(".min-price");
  const maxInput = document.querySelector(".max-price");
  const priceBtn = document.querySelector(".price-btn");



  

  function filterByPrice() {
    const minVal = minInput.value.trim();
    const maxVal = maxInput.value.trim();
    
    let min = +(minVal);
  let max = +(maxVal);
  
  if (minVal === "" && maxVal === "") {
    renderProducts(products);
    return;
  }
  
  if (minVal !== "" && Number.isNaN(min)) {
    alert("من فضلك اكتب رقم صحيح في حقل أقل سعر");
    return;
  }
  
  if (maxVal !== "" && Number.isNaN(max)) {
    alert("من فضلك اكتب رقم صحيح في حقل أعلى سعر");
    return;
  }
  
  if (minVal === "") {
    min = 0;
  }
  
  if (maxVal === "") {
    max = Infinity;
  }
  
  if (min > max) {
    alert("أقل سعر لا يجب ان يكون أكبر من أعلى سعر");
    return;
  }
  
  const matchedProducts = [];
  
  for (let i = 0; i < products.length; i++) {
    const price = products[i].price_after_sale;
    
    if (price >= min && price <= max) {
      matchedProducts.push(products[i]);
    }
  }

  renderProducts(matchedProducts);
}




priceBtn.addEventListener("click", filterByPrice);


// =====================================


// cart click

const cartP = document.querySelector(".cart-p") 


let showingCart = false;

cartP.addEventListener("click", () => {
  showingCart = !showingCart;

  if (showingCart) {
    const cartList = [];
    for (let i = 0; i < products.length; i++) {
      if (cartProducts.includes(products[i].id)) {
        cartList.push(products[i]);
      }
    }
    renderProducts(cartList);
  } else {
    // renderProducts(products);
  }
});




// =====================================================

// wish list



let showingWish = false;

let wishedProducts = JSON.parse(localStorage.getItem("wish")) || [];

function buildWishList() {
  const wishList = [];
  for (let i = 0; i < products.length; i++) {
    if (wishedProducts.includes(products[i].id)) wishList.push(products[i]);
  }
  return wishList;
}

const _render = renderProducts;
renderProducts = function (list) {
  _render(list);

  const hearts = document.querySelectorAll(".emotion");
  for (let i = 0; i < hearts.length; i++) {
    const btn = hearts[i];
    const id = +btn.dataset.id;

    if (wishedProducts.includes(id)) btn.classList.add("active");
    else btn.classList.remove("active");

    btn.onclick = function () {
      const idx = wishedProducts.indexOf(id);
      if (idx === -1) wishedProducts.push(id);
      else wishedProducts.splice(idx, 1);

      localStorage.setItem("wish", JSON.stringify(wishedProducts));
      btn.classList.toggle("active");

      if (showingWish) renderProducts(buildWishList());
    };
  }
};

const wishIcon = document.querySelector(".wish-list");
wishIcon.addEventListener("click", () => {
  showingWish = !showingWish;
  showingCart = false;

  if (showingWish) renderProducts(buildWishList());
  else renderProducts(products);
});

cartP.addEventListener("click", () => {
  showingWish = false;
});


// ========================================


// count down

const timeHours = document.querySelector(".th");
const timeMinutes = document.querySelector(".tm");
const timeSeconds = document.querySelector(".ts");

let countDown = (7 * 3600) + (23 * 60) + 45;

const pad = (n) => String(n).padStart(2, "0");

const timer = setInterval(() => {
  const hours = Math.floor(countDown / 3600);
  const minutes = Math.floor(countDown / 60) % 60;
  const seconds = countDown % 60;

  timeHours.textContent = pad(hours);
  timeMinutes.textContent = pad(minutes);
  timeSeconds.textContent = pad(seconds);

  if (countDown <= 0) {
    clearInterval(timer);
    return;
  }

  countDown--;
}, 1000);



window.addEventListener("DOMContentLoaded", () => {
});




// ============================================



window.addEventListener("DOMContentLoaded", () => {
  loadSmartphones();
});
