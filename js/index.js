let PRODUCTS = {
  loading: Boolean,
  music: [],
  merch: [],
  total: [],
  product: {},
};
let CART = {
  KEY: "VERSION_1_CARTITEMS",
  cartItems: [],
  cartTotal: 0,
  cartInit() {
    console.log("cart running");
    //check localStorage and initialize the cartItems of CART.cartItems
    let _cartItems = localStorage.getItem(CART.KEY);

    CART.cartItems = JSON.parse(_cartItems) ?? [];
    CART.loadLocalStorageItemCount();
    CART.cartSync();
  },

  async cartSync() {
    let _cart = JSON.stringify(CART.cartItems);
    localStorage.setItem(CART.KEY, _cart);
    CART.loadLocalStorageItemCount();
  },
  loadLocalStorageItemCount() {
    let cartItems = localStorage.getItem(CART.KEY);
    if (cartItems !== null) {
      cartItems = JSON.parse(cartItems);
      document.getElementById("cart__count").innerText = cartItems.length;
    }
  },
  changeQty(id, qty) {
    //increase the quantity of an item in the cart
    CART.cartItems = CART.cartItems.map((item) => {
      if (item.id === id) {
        item.count = qty;
      }
      return item;
    });
    //update localStorage
    displayCart();
    CART.cartSync();
  },
  increase(id, qty = 1) {
    //increase the quantity of an item in the cart
    CART.cartItems = CART.cartItems.map((item) => {
      if (item.id === id) {
        item.count += qty;
      }
      return item;
    });
    //update localStorage
    displayCart();
    CART.cartSync();
  },
  reduce(id, qty) {
    //reduce the quantity of an item in the cart
    CART.cartItems = CART.cartItems.map((item) => {
      if (item.id === id) item.qty = item.qty -= qty;
      return item;
    });
    CART.cartItems.forEach(async (item) => {
      if (item.id === id && item.qty === 0) CART.remove(id);
    });
    //update localStorage
    CART.cartSync();
  },
  remove(id) {
    //remove an item entirely from CART.contents based on its id
    CART.cartItems = CART.cartItems.filter((item) => {
      if (item.id !== id) return true;
    });
    //update localStorage
    CART.cartSync();
  },
  empty() {
    //empty whole cart
    CART.cartItems = [];
    //update localStorage
    displayCart();
    CART.cartSync();
  },
};

//UPDATE STATES ON LOAD
document.addEventListener("DOMContentLoaded", () => {
  //when the page is ready
  getProducts();
  //then get the cart items from localStorage
  CART.cartInit();
  //buttons +
  loadAllInputElements();

  //finally load the cart items
  displayCart();
});

async function getProducts() {
  CART.loading = true;
  try {
    const response = await fetch("../data.json", {
      method: "GET",
      mode: "cors",
    });
    const result = await response.json();
    displayProducts(result);
    CART.loading = false;
    //reRendering(result);
  } catch (error) {
    handleError(error);
  }
}

function reRendering(products) {
  let outerArray = Object.values(products);
  for (innerArray of outerArray) {
    for (obj of innerArray) {
      PRODUCTS.total.push(obj);
    }
  }
}
async function displayProducts(products) {
  // get array of the diffect sections
  PRODUCTS.music = await products.music;
  PRODUCTS.merch = await products.merch;

  // merge the arrays of he diffent product keys
  reRendering(products);
  // let outerArray = Object.values(products);
  // for (innerArray of outerArray) {
  //   for (obj of innerArray) {
  //     PRODUCTS.total.push(obj);
  //   }
  // }

  // MUSIC PRODUCTs SECTION
  let musicProductsContainer = document.getElementById("shop__items__music");

  let musicOutput = "";
  let musicProducts = PRODUCTS?.total?.filter(
    (product) => product.type === "music"
  );
  musicProducts?.map((p) => {
    return (musicOutput += `
    <div class="shop__item">
      <span class="shop__item__title">${p.name}</span>
      <img class="shop__item__image" src="${p.image}"
      onclick="getProduct('${p.id}')"
      />
      <div class="shop__item__details">
        <span class="shop__item__price">€${p.count * p.price}</span>
        <button class="btn-primary shop__item__button" type="button"
        onclick="addToCart('${p.id}')">
      ${inCart(p.id) ? "item in cart" : "add to cart"}
        </button>
      </div>
    </div>
      `);
  });
  if (musicOutput && musicProductsContainer) {
    musicProductsContainer.innerHTML = musicOutput;
  }

  // MERCH PRODUCTS SECTION
  let merchProductsContainer = document.getElementById("shop__items__merch");
  let merchOutput = "";
  let merchProducts = PRODUCTS?.total?.filter(
    (product) => product.type === "merch"
  );
  merchProducts &&
    merchProducts.map((p) => {
      return (merchOutput += `
    <div class="shop__item">
      <span class="shop__item__title">${p.name}</span>
      <img class="shop__item__image" src="${p.image}"
      onclick="getProduct('${p.id}')"
      />
      <div class="shop__item__details">
        <span class="shop__item__price">€${p.price}</span>
        <button
        id='${p.id}'
        class="btn-primary shop__item__button"
        onclick="addToCart('${p.id}')"
        >
        ${inCart(p.id) ? "item in cart" : "add to cart"}
        </button>
      </div>
    </div>
      `);
    });

  if (merchOutput && merchProductsContainer) {
    merchProductsContainer.innerHTML = merchOutput;
  }
}
// CART DISPLAY SECTION
async function displayCart() {
  let ProductsContainer = document.querySelector(".container");
  let cartContainer = document.getElementById("cart__items");
  let cartTotalContainer = document.getElementById("cart__total");

  let cartOutput = "";

  CART?.cartItems?.map((item) => {
    return (cartOutput += `
    <div class="cart__row">
    <div class="cart__item cart__column">
        <span class="cart__item__title">${item.name}</span>
    </div>
    <span class="cart__price cart__column">${item.price}</span>
    <div class="cart__quantity cart__column">
      <span class="cart__item__count">${item.count}</span>
        <select id ="cart__item__change"
        onchange="handleQuantityChange(this.value,'${item.id}')">
        <option ></option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        </select>
      <button class="btn-danger cart__item__remove"
      onclick="removeFromCart('${item.id}')">REMOVE</button>
    </div>
    </div>

    `);
  });

  if (CART.cartItems && cartContainer && ProductsContainer) {
    updateCartTotal();
    cartContainer.innerHTML = cartOutput;
    cartTotalContainer.innerText = `€${CART.cartTotal}`;
  }
}

// ELEMENTS LOADED ON PAGE LOAD
function loadAllInputElements() {
  // add to cart
  const addToCartBtns = document.getElementsByClassName("shop__item__button");
  for (let i = 0; i < addToCartBtns.length; i++) {
    var button = addToCartBtns[i];
    button.addEventListener("click", () => {
      console.log(button.innerText);
      button.innerText = "yellow";
    });
  }
}

// MUTATIONS
// ADD ITEM TO CART
async function addToCart(id) {
  let existProduct = await CART.cartItems.find((prod) => prod.id === id);

  // find cproduct with id
  let tempProducts = PRODUCTS.total;
  let product = await tempProducts.find((prod) => prod.id === id);

  if (existProduct) {
    existProduct.count += 1;

    displayCart();
    CART.cartSync();
  } else {
    CART.cartItems.push(product);
    product.inCart = true;
    PRODUCTS.total = tempProducts;

    displayCart();
    CART.cartSync();
  }
}
// REMOVE ITEM FROM CART
async function removeFromCart(id) {
  CART.cartItems = CART.cartItems.filter((prod) => prod.id !== id);
  CART.cartSync();
  displayCart();
}
// INCREASE CART ITEM QUANTITY BY 1
// Not implemented
function increaseCartItem(id) {
  CART.increase(id, 1);
  updateCartTotal();
  displayCart();
}

// DECREASE CART ITEM QUANTITY BY 1
// Not implemented
function reduceCartItem(id) {
  CART.reduce(id, 1);
  // update cart total
  updateCartTotal();
  displayCart();
}
// CHANGE ITEM QUANTITY BY SELECTED VALUE
function handleQuantityChange(e, id) {
  // parse e/value to integer
  let newCount = parseInt(e);
  CART.changeQty(id, newCount);
  // update cart total
  updateCartTotal();
  displayCart();
}
function handleClearCart() {
  CART.empty();
}
function handleError(error) {
  console.log(error.message);
}
// CALCULATE CURRENT CART TOTAL PRICE
function updateCartTotal() {
  let cart = CART.cartItems;
  try {
    let total = cart?.reduce(
      (acc, curVal) => (acc += curVal.price * curVal.count),
      0
    );
    CART.cartTotal = +total.toFixed(2);
    CART.cartSync();
  } catch (error) {
    handleError(error);
  }
}
// CHECK IF ITEM IS IN CART
function inCart(id) {
  let itemCart = CART.cartItems.some((item) => item.id === id);
  CART.total = CART.total;
  CART.cartSync();
  return itemCart;
}

// MAKE PAYMENT
function handleItemPurchase() {
  if (CART.cartItems.length < 1) {
    return false;
  } else {
    CART.empty();

    setTimeout(() => {
      gotoSuccess();
    }, 500);
  }
}
async function delay(duration) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), duration);
  });
}

function gotoHome() {
  window.location.href = "index.html";
}
function gotoSuccess() {
  window.location.href = "/success.html";
}
function gotoCart() {
  window.location.href = "/cart.html";
}

// PRODUCT DETAILS
async function getProduct(id) {
  let tempProducts = PRODUCTS.total;
  let product = await tempProducts.find((prod) => prod.id === id);
  PRODUCTS.product = product;
  localStorage.setItem("p", JSON.stringify(product));
  document.getElementById("product__detail");
  window.location = "product.html";
}
