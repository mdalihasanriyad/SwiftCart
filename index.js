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
                    <button onclick="productDetails(${product.id})" class="btn btn-outline btn-sm border-gray-300 hover:bg-gray-100 text-gray-700"><i class="fa-regular fa-eye"></i> Details</button>
                    <button onclick="addToCart(${product.id})" class="btn bg-indigo-600 hover:bg-indigo-700 text-white btn-sm border-none">Add</button>
                </div>
            </div>
        </div>`;
    });
}

// ================= dynamic categories =================

async function loadCategories() {
    const container = document.getElementById("categoryContainer");
    if (!container) return; // কন্টেইনার না থাকলে আগেই রিটার্ন করবে

    try {
        const res = await fetch("https://fakestoreapi.com/products/categories");
        const categories = await res.json();

        // ১. শুরুর "All" বাটনটি আগে সেট করে নিন
        container.innerHTML = `<button onclick="filterByCategory('all', this)" class="px-6 py-2 rounded-full bg-indigo-600 text-white font-medium category-btn">All</button>`;

        // ২. এখন API থেকে আসা ক্যাটাগরিগুলো লুপ করে বাটন তৈরি করুন
        categories.forEach(cat => {
            container.innerHTML += `
                <button onclick="filterByCategory(\`${cat}\`, this)" class="px-6 py-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition capitalize category-btn">
                    ${cat}
                </button>`;
        });
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

async function filterByCategory(category, btnElement) {
    // ১. Active Class Logic (isActive)
    const allBtns = document.querySelectorAll('.category-btn');
    allBtns.forEach(btn => {
        // Shob button ke ager obosthay niye jawa
        btn.classList.remove('bg-indigo-600', 'text-white');
        btn.classList.add('bg-white', 'text-gray-800');
    });

    // Jeiti click kora hoyeche sheitike active kora
    if (btnElement) {
        btnElement.classList.add('bg-indigo-600', 'text-white');
        btnElement.classList.remove('bg-white', 'text-gray-800');
    }

    // ২. Filter Logic
    let url;
    if (category === 'all') {
        url = "https://fakestoreapi.com/products";
    } else {
        url = `https://fakestoreapi.com/products/category/${encodeURIComponent(category.toLowerCase())}`;
    }
    
    try {
        const res = await fetch(url);
        const products = await res.json();
        displayProducts(products);
    } catch (error) {
        console.error("Filtering failed:", error);
    }
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

function checkout() {
    if (cart.length === 0) {
        alert("Please add to cart your products.");
        return;
    }

    // ১. Success Message (Real world e ekhane API call hoy)
    alert("Order Place Done.");

    // ২. Cart Empty kora
    cart = []; // Array faka kora
    saveCart(); // LocalStorage update kora
    
    // ৩. UI Update kora
    renderCart(); // Cart list faka kora
    toggleCart(); // Cart drawer bondho kora
}

function updateCartBadge() {
    const badges = document.querySelectorAll(".fa-cart-shopping + span, .cart-count");
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    badges.forEach(badge => {
        badge.innerText = totalItems;
        badge.style.display = totalItems > 0 ? "block" : "none";
    });
}

async function productDetails(id) {
    const modal = document.getElementById('product_modal');
    const content = document.getElementById('modalContent');
    
    // মডাল ওপেন করার আগে লোডিং দেখানো
    content.innerHTML = `<span class="loading loading-spinner loading-lg mx-auto"></span>`;
    modal.showModal();

    try {
        const res = await fetch(`https://fakestoreapi.com/products/${id}`);
        const product = await res.json();

        content.innerHTML = `
            <div class="w-full md:w-1/2 flex items-center justify-center bg-gray-50 p-4 rounded-xl">
                <img src="${product.image}" class="max-h-64 object-contain">
            </div>
            <div class="w-full md:w-1/2">
                <h2 class="text-2xl font-bold mb-2">${product.title}</h2>
                <div class="flex gap-2 mb-4">
                    <span class="badge badge-primary">${product.category}</span>
                    <span class="text-yellow-500 font-bold"><i class="fa-solid fa-star"></i> ${product.rating.rate}</span>
                </div>
                <p class="text-gray-600 text-sm mb-4">${product.description}</p>
                <p class="text-3xl font-black text-indigo-600 mb-6">$${product.price}</p>
                <button onclick="addToCart(${product.id})" class="btn bg-indigo-600 text-white w-full border-none">Add to Cart</button>
            </div>
        `;
    } catch (error) {
        content.innerHTML = "<p>Failed to load data.</p>";
    }
}


// ১. কার্ট ড্রয়ার ওপেন/ক্লোজ
function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    const body = document.getElementById('drawerBody');
    
    if (drawer.classList.contains('invisible')) {
        drawer.classList.remove('invisible');
        body.classList.remove('translate-x-full');
        renderCart(); // কার্ট ওপেন হলে আইটেমগুলো দেখাবে
    } else {
        drawer.classList.add('invisible');
        body.classList.add('translate-x-full');
    }
}

// ২. কার্টে প্রোডাক্ট অ্যাড করা
async function addToCart(id) {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += 1;
    } else {
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
    toggleCart(); // অ্যাড করার পর অটো ড্রয়ার খুলবে
}

// ৩. কোয়ান্টিটি বাড়ানো (+)
function increaseQty(id) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += 1;
        saveCart();
        renderCart();
    }
}

// ৪. কোয়ান্টিটি কমানো (-)
function decreaseQty(id) {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1;
        } else {
            cart.splice(itemIndex, 1); // ১ এর নিচে গেলে রিমুভ
        }
        saveCart();
        renderCart();
    }
}

// ৫. ড্রয়ারের ভেতর কার্ট আইটেমগুলো দেখানো
function renderCart() {
    const list = document.getElementById('cartItemsList');
    const totalDisplay = document.getElementById('cartTotal');
    list.innerHTML = "";
    
    if (cart.length === 0) {
        list.innerHTML = `<div class="text-center py-10 text-gray-400">Your cart is empty</div>`;
        totalDisplay.innerText = "$0.00";
        return;
    }

    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        list.innerHTML += `
            <div class="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <img src="${item.image}" class="w-16 h-16 object-contain bg-white p-1 rounded border">
                <div class="flex-grow">
                    <h4 class="text-sm font-bold line-clamp-1">${item.title}</h4>
                    <p class="text-indigo-600 font-bold">$${(item.price * item.quantity).toFixed(2)}</p>
                    <div class="flex items-center gap-3 mt-2">
                        <button onclick="decreaseQty(${item.id})" class="h-6 w-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300">-</button>
                        <span class="text-sm font-bold">${item.quantity}</span>
                        <button onclick="increaseQty(${item.id})" class="h-6 w-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300">+</button>
                    </div>
                </div>
                <button onclick="removeItem(${item.id})" class="text-red-400 hover:text-red-600">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
    });
    totalDisplay.innerText = `$${total.toFixed(2)}`;
}

// আইটেম পুরোপুরি রিমুভ করা
function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
}

// সেভ এবং ব্যাজ আপডেট
function saveCart() {
    localStorage.setItem("swiftCart", JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const badge = document.getElementById('cartCountBadge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (badge) {
        badge.innerText = totalItems;
        badge.classList.toggle('hidden', totalItems === 0);
    }
}