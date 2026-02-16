async function loadProducts() {
  const res = await fetch("https://fakestoreapi.com/products");

  const products = await res.json();

  displayProducts(products);
}

function displayProducts(products) {
  const container = document.getElementById("productContainer");

  container.innerHTML = "";

  products.forEach((product) => {
    container.innerHTML += `


<div class="card bg-base-100 shadow">


<figure class="p-6">

<img src="${product.image}"

class="h-40 object-contain"/>

</figure>



<div class="card-body">


<span class="badge badge-primary badge-sm">

${product.category}

</span>



<h2 class="card-title text-lg">

${product.title.slice(0, 30)}

</h2>



<p class="font-bold text-primary">

$${product.price}

</p>



<div class="card-actions justify-between">


<button onclick="productDetails(${product.id})"

class="btn btn-outline btn-sm">

Details

</button>



<button onclick="addToCart(${product.id})"

class="btn btn-primary btn-sm">

Add

</button>


</div>


</div>


</div>


`;
  });
}

function productDetails(id) {
  alert("Product ID: " + id);
}

function addToCart(id) {
  alert("Added Product: " + id);
}

loadProducts();
