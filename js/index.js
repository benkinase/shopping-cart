let PRODUCTS = {
  music: [],
  merch: [],
  total: [],
};
let CART = {
  KEY: "VERSION_1_CARTITEMS",
  cartItems: [],
  cartTotal: 0,
  cartInit() {
    console.log("cart running");
    //check localStorage and initialize the cartItems of CART.cartItems
    let _cartItems = localStorage.getItem(CART.KEY);
    if (_cartItems) {
      CART.cartItems = JSON.parse(_cartItems);
      CART.loadLocalStorageItemCount();
    } else {
      CART.cartItems = [];
      CART.cartSync();
    }
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
      if (item.id === id && item.qty === 0) await CART.remove(id);
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
  try {
    const response = await fetch("http://localhost:5501/data.json", {
      method: "GET",
      mode: "cors",
    });
    const result = await response.json();
    return displayProducts(result);
  } catch (error) {
    handleError(error);
  }
}

async function displayProducts(products) {
  // get array of the diffect sections
  PRODUCTS.music = await products.music;
  PRODUCTS.merch = await products.merch;

  // merge the arrays of he diffent product keys
  let outerArray = Object.values(products);
  for (innerArray of outerArray) {
    for (obj of innerArray) {
      PRODUCTS.total.push(obj);
    }
  }

  // MUSIC PRODUCTs SECTION
  let musicProductsContainer = document.getElementById("shop__items__music");

  let musicOutput = "";
  let musicProducts = PRODUCTS?.total?.filter(
    (product) => product.type === "music"
  );
  musicProducts?.map((p) => {
    return (musicOutput += `
    <div class="shop__item">
      <span class="shop-item-title">${p.name}</span>
      <img class="shop-item-image" src="${p.image}" />
      <div class="shop-item-details">
        <span class="shop-item-price">€${p.count * p.price}</span>
        <button class="btn btn-primary shop-item-button" type="button"
        onclick="addToCart(this.innerText,'${p.id}')">
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
      <span class="shop-item-title">${p.name}</span>
      <img class="shop-item-image" src="${p.image}" />
      <div class="shop-item-details">
        <span class="shop-item-price">€${p.price}</span>
        <button
        id='${p.id}'
        class="btn btn-primary shop-item-button"
        onclick="addToCart(this.id,'${p.id}')"
        >
      add to cart
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
  let cartTotalContainer = document.getElementById("cart-total");

  let cartOutput = "";

  CART?.cartItems?.map((item) => {
    return (cartOutput += `
    <div class="cart-row">
    <div class="cart-item cart-column">
        <img class="cart-item-image"
        src="${item.image}" width="100" height="100">
        <span class="cart-item-title">${item.name}</span>
    </div>
    <span class="cart-price cart-column">${item.price}</span>
    <div class="cart-quantity cart-column">
      <span class="cart_item__count">${item.count}</span>
        <select id ="cart_item_change"
        onchange="handleQuantityChange(this.value,'${item.id}')">
        <option ></option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        </select>
      <button class="btn btn-danger"
      onclick="removeFromCart('${item.id}')">REMOVE</button>
    </div>
    </div>

    `);
  });

  if (CART.cartItems && cartContainer && ProductsContainer) {
    // hide some cart section elements, if cart empty
    //handleCartSectionVisibility();
    //cartContainer.innerHTML = "";
    updateCartTotal();
    cartContainer.innerHTML = cartOutput;
    cartTotalContainer.innerText = `$${CART.cartTotal}`;
  }
}

// ELEMENTS LOADED ON PAGE LOAD
function loadAllInputElements() {
  // const quantityInputs = document.getElementsByClassName("cart-quantity-input");
  // for (let i = 0; i < quantityInputs.length; i++) {
  //   var input = quantityInputs[i];
  //   input.addEventListener("change", handleQuantityChange);
  // }
  // add to cart
  const addToCartBtns = document.getElementsByClassName("shop-item-button");
  for (let i = 0; i < addToCartBtns.length; i++) {
    var button = addToCartBtns[i];
    button.addEventListener("click", () => {
      console.log(button.innerText);
      button.innerText = "yellow";
    });
  }
  //handleCartSectionVisibility();
}

// functionChangeBg(data-id){

//   let value = el.getAttribute("data-id");

// handle cart section element show
function handleCartSectionVisibility() {
  var cartItems = document.getElementById("cart__items");
  var cartContainer = document.getElementById("cart__pay_clear_buttons");

  if (!CART.cartItems.length && cartContainer) {
    document.getElementById("cart-row").style.background = "red";
    document.getElementById("cart__pay_clear_buttons").style.visibility =
      "hidden";
  } else {
    cartContainer.style.display = "block";
    document.getElementById("cart__pay_clear_buttons").className =
      "cart__pay_clear_buttons";
    document.getElementById("cart__count").innerText =
      cartItems.childNodes.length;
  }
}

// MUTATIONS
// ADD ITEM TO CART
async function addToCart(text, id) {
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
    //replaceButtonText()

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
// INCREASE CART ITEM QUANTITY
function increaseCartItem(id) {
  CART.cartItems = CART.cartItems.filter((prod) => prod.id !== id);
  CART.cartSync();
  displayCart();
}

// DECREASE CART ITEM QUANTITY
function reduceCartItem(id) {
  let newCount = parseInt(e);
  CART.reduce(id, 1);
  // update cart total
  updateCartTotal();
  displayCart();
}
// CHANGE ITEM QUANTITY BY OPTION SELECT
function handleQuantityChange(e, id) {
  // parse value to integer
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
    console.log(error.message);
  }
}
// CHECK IF ITEM IS IN CART
function inCart(id) {
  let itemCart = CART.cartItems.some((item) => item.id === id);
  CART.total = CART.total;
  CART.cartSync();
  return itemCart;
}
async function inCart2(id) {
  let itemCart = CART.cartItems.some((item) => item.id === id);
  //let itemCart2 = PRODUCTS.total.some((item) => item.id === id);
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
      window.location.href = "/success.html";
    }, 2000);
  }
}
function replaceButtonText(buttonId, text) {
  if (document.getElementById) {
    var button = document.getElementById(buttonId);
    if (button) {
      if (button.childNodes[0]) {
        button.childNodes[0].nodeValue = text;
      } else if (button.value) {
        button.value = text;
      } //if (button.innerHTML)
      else {
        button.innerHTML = text;
      }
    }
  }
}
