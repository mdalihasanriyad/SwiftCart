// ================= global variables =================
let cart = JSON.parse(localStorage.getItem("swiftCart")) || [];

// ================= initialization =================
document.addEventListener("DOMContentLoaded", () => {
    // ১. চেক করবে কোন পেজে আছে (Home নাকি Products)
    const productContainer = document.getElementById("productContainer");
    const categoryContainer = document.getElementById("categoryContainer");

    if (categoryContainer) {
        // যদি products.html এ থাকে
        loadCategories();
        loadAllProducts(); // সব প্রোডাক্ট দেখাবে
    } else if (productContainer) {
        // যদি index.html এ থাকে (Trending Now সেকশন)
        loadTrendingProducts();
    }

    updateCartBadge();
});

// ================= product loading logic =================

// হোমপেজের জন্য মাত্র ৩টি প্রোডাক্ট
async function loadTrendingProducts() {
    try {
        const res = await fetch("https://fakestoreapi.com/products?limit=4");
        const products = await res.json();
        displayProducts(products);
    } catch (error) {
        console.error("Error loading trending products:", error);
    }
}

// প্রোডাক্টস পেজের জন্য সব প্রোডাক্ট
async function loadAllProducts() {
    try {
        const res = await fetch("https://fakestoreapi.com/products");
        const products = await res.json();
        displayProducts(products);
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

// প্রোডাক্ট ডিসপ্লে করার কমন ফাংশন
function displayProducts(products) {
    const container = document.getElementById("productContainer");
    if (!container) return;
    
    container.innerHTML = "";
    products.forEach((product) => {
        container.innerHTML += `
        <div class="card bg-white shadow-md hover:shadow-xl transition-shadow border border-gray-100">
            <figure class="p-6 bg-gray-50">
                <img src="${product.image}" alt="${product.title}" class="h-40 object-contain mx-auto"/>
            </figure>
            <div class="card-body p-5">
                <div class="flex justify-between items-start mb-2">
                    <span class="badge badge-sm bg-indigo-100 text-indigo-600 border-none capitalize">${product.category}</span>
                    <span class="text-sm text-yellow-500 font-bold"><i class="fa-solid fa-star"></i> ${product.rating?.rate || '4.0'}</span>
                </div>
                <h2 class="card-title text-base font-semibold h-12 overflow-hidden mb-2">
                    ${product.title.slice(0, 40)}...
                </h2>
                <p class="text-xl font-bold text-gray-800 mb-4">$${product.price}</p>
                <div class="card-actions grid grid-cols-2 gap-2">
                    <button onclick="productDetails(${product.id})" class="btn btn-outline btn-sm border-gray-300 hover:bg-gray-100 text-gray-700">Details</button>
                    <button onclick="addToCart(${product.id})" class="btn bg-indigo-600 hover:bg-indigo-700 text-white btn-sm border-none">Add</button>
                </div>
            </div>
        </div>`;
    });
}

// ================= dynamic categories =================

async function loadCategories() {
    const container = document.getElementById("categoryContainer");
    if (!container) return;

    try {
        const res = await fetch("https://fakestoreapi.com/products/categories");
        const categories = await res.json();

        // শুরুর "All" বাটন
        container.innerHTML = `<button onclick="filterByCategory('all')" class="px-6 py-2 rounded-full bg-indigo-600 text-white font-medium filter-btn">All</button>`;

        categories.forEach(cat => {
            container.innerHTML += `
                <button onclick="filterByCategory('${cat}')" class="px-6 py-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition capitalize filter-btn">
                    ${cat}
                </button>`;
        });
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

async function filterByCategory(category) {
    // বাটনের কালার চেঞ্জ করার লজিক (ঐচ্ছিক)
    const url = category === 'all' 
        ? "https://fakestoreapi.com/products" 
        : `https://fakestoreapi.com/products/category/${category}`;
    
    const res = await fetch(url);
    const products = await res.json();
    displayProducts(products);
}

// ================= cart system (A to Z) =================

async function addToCart(id) {
    const itemIndex = cart.findIndex(item => item.id === id);

    if (itemIndex > -1) {
        // যদি কার্টে আগে থেকেই থাকে তবে কোয়ান্টিটি বাড়বে
        cart[itemIndex].quantity += 1;
    } else {
        // নতুন হলে API থেকে ডাটা এনে কার্টে ঢুকাবে
        const res = await fetch(`https://fakestoreapi.com/products/${id}`);
        const product = await res.json();
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart();
    alert("Product added to cart!");
}

// কোয়ান্টিটি বাড়ানোর জন্য
function increaseQty(id) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += 1;
        saveCart();
        // renderCartUI(); // যদি কার্ট পেজ থাকে তবে এটি কল করবেন
    }
}

// কোয়ান্টিটি কমানোর জন্য
function decreaseQty(id) {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1;
        } else {
            // ১ এর নিচে গেলে লিস্ট থেকে মুছে যাবে
            cart.splice(itemIndex, 1);
        }
        saveCart();
        // renderCartUI();
    }
}

// কার্ট লোকাল স্টোরেজে সেভ করা এবং ব্যাজ আপডেট করা
function saveCart() {
    localStorage.setItem("swiftCart", JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const badges = document.querySelectorAll(".fa-cart-shopping + span, .cart-count");
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    badges.forEach(badge => {
        badge.innerText = totalItems;
        badge.style.display = totalItems > 0 ? "block" : "none";
    });
}

function productDetails(id) {
    // ডিটেইলস পেজ থাকলে সেখানে পাঠাবে
    window.location.href = `product-details.html?id=${id}`;
}