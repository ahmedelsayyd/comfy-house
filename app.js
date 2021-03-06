
const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "h7en2o8369uq",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "LAYENZ4BgZ961_COIWlNiLnDCxt09orHkyk4t2-cpVY"
});


//variables-------------------------------------

const cartBtn = document.querySelector(".cart-btn");
const clearCartBtn = document.querySelector(".clear-cart");
const closeCartBtn = document.querySelector(".close-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItem = document.querySelector(".cart-item");
const cartItems = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const cartTotal = document.querySelector(".cart-total")
const productDOM = document.querySelector(".products-center");

//cart----------------------------------------------
let cart = []

let buttonsDOM = []

//getting the products------------------------------

class Products {

    async getProducts() {
        try {


            let contentful = await client.getEntries({
                content_type: "comfyhouseproducts"
            })

            console.log(contentful);
            // let result = await fetch("./products.json");
            // let data = await result.json()

            const products = contentful.items.map(i => {
                const { title, price } = i.fields;
                const { id } = i.sys;
                const image = i.fields.image.fields.file.url

                return { title, price, id, image }
            })
            return products

        } catch (error) {
            console.log(error);
        }
    }

}


//display products-------------------------------

class UI {

    displayProducts(products) {
        let result = ""
        products.forEach(product => {
            result += `
            <!-- singl product -->
            <article class="product">
              <div class="img-container">
                <img class="product-img" src=${product.image} alt="product">
      
                <button class="bag-btn" data-id=${product.id}>
                  <i class="fas fa-shopping-cart"></i>
                  Add To Cart
                </button>
      
              </div>
              <h3>${product.title}</h3>
              <h4>${product.price}</h4>
            </article>
            <!--end of singl product -->
            `
        });
        productDOM.innerHTML = result;
    }


    getButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")]
        buttonsDOM = buttons
        buttons.forEach(btn => {
            let id = btn.dataset.id

            let inCart = cart.find(item => item.id == id)

            if (inCart) {
                btn.innerText = "In Cart"
                btn.disabled = true
            }

            btn.addEventListener("click", (event) => {
                event.target.innerText = "In Cart"
                event.target.disabled = true

                //get product from products
                let cartItem = { ...Storage.getProduct(id), amount: 1 }

                //add product to cart
                cart = [...cart, cartItem]
                //save cart in local storage
                Storage.saveCart(cart)
                //update cart values
                this.setCartValues(cart)
                //display cart item
                this.addCartItem(cartItem)
                //show the cart
                this.showCart()
            })

        })
    }

    setCartValues(cart) {
        let cartTotalPrice = 0
        let itemsTotal = 0

        cart.map(item => {
            cartTotalPrice += item.price * item.amount
            itemsTotal += item.amount
        })

        cartTotal.innerText = parseFloat(cartTotalPrice.toFixed())
        cartItems.innerText = itemsTotal
    }

    addCartItem(item) {
        const div = document.createElement("div")
        div.classList.add("cart-item")
        div.innerHTML = `
            <img src=${item.image} alt="product">
            <div class="">
            <h4>${item.title}</h4>
            <h5>${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div class="">
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
        `

        cartContent.appendChild(div)
    }

    showCart() {
        cartOverlay.classList.add("transparentBcg")
        cartDOM.classList.add("showCart")
    }

    hideCart() {
        cartOverlay.classList.remove("transparentBcg")
        cartDOM.classList.remove("showCart")
    }

    setupApp() {
        cart = Storage.getCart()
        this.setCartValues(cart)
        this.populateCart(cart)

        cartBtn.addEventListener("click", this.showCart)
        closeCartBtn.addEventListener("click", this.hideCart)
    }

    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item))
    }

    cartLogic() {

        //cart clear button
        clearCartBtn.addEventListener("click", () => {
            this.clearCart()
        })

        //cart functionalty
        cartContent.addEventListener("click", event => {
            if (event.target.classList.contains("remove-item")) {

                let removeItem = event.target
                let id = removeItem.dataset.id
                cartContent.removeChild(removeItem.parentElement.parentElement)
                this.removeItem(id)
            } else if (event.target.classList.contains("fa-chevron-up")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id

                let tempItem = cart.find(item => item.id === id)
                tempItem.amount = tempItem.amount + 1

                Storage.saveCart(cart)
                this.setCartValues(cart)

                addAmount.nextElementSibling.innerText = tempItem.amount

            } else if (event.target.classList.contains("fa-chevron-down")) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id

                let tempItem = cart.find(item => item.id === id)
                tempItem.amount = tempItem.amount - 1

                if (tempItem.amount > 0) {
                    Storage.saveCart(cart)
                    this.setCartValues(cart)
                    lowerAmount.previousElementSibling.innerText = tempItem.amount

                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement)
                    this.removeItem(id)
                }

            }
        })

    }

    clearCart() {
        console.log(this);
        let cartItems = cart.map(item => item.id)
        cartItems.forEach(id => this.removeItem(id))
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }

        this.hideCart()
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id)
        this.setCartValues(cart)
        Storage.saveCart(cart)
        let button = this.getSingleButton(id)
        button.disabled = false
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>
        Add To Cart`
    }

    getSingleButton(id) {
        return buttonsDOM.find(btn => btn.dataset.id === id)
    }

}


//local storage------------------------------

class Storage {

    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products))
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"))
        return products.find(product => product.id === id)
    }

    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart))

    }

    static getCart() {
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : []
    }

}


//Event Listener-----------------------------

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI()
    const products = new Products()
    //setup APP
    ui.setupApp()

    //get all products
    products.getProducts().then(products => {
        ui.displayProducts(products)
        Storage.saveProducts(products)
    }).then(() => {
        ui.getButtons()
        ui.cartLogic()
    })


})
