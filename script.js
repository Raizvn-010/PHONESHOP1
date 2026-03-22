
(function initAdmin() {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (!users.some(u => u.role === "admin")) {
    users.push({ username:"admin", password:"admin123", role:"admin" });
    localStorage.setItem("users", JSON.stringify(users));
  }

  if (!localStorage.getItem("products")) {
    localStorage.setItem("products", JSON.stringify([
      {
        id:"iphone15", name:"iPhone 15 128GB", brand:"Apple",
        price:22990000, oldPrice:24990000,
        imageSmall:"img/iPhone 15 128GB.jpg",
        imageLarge:"img/iPhone 15 128GB.jpg",
        specs:{ screen:"6.1 inch OLED", cpu:"Apple A16 Bionic", ram:"6GB", storage:"128GB", battery:"3349 mAh" }
      },
      {
        id:"samsungs23", name:"Samsung Galaxy S23", brand:"Samsung",
        price:18500000, oldPrice:20990000,
        imageSmall:"img/Samsung Galaxy S23.jpg",
        imageLarge:"img/Samsung Galaxy S23.jpg",
        specs:{ screen:"6.1 inch AMOLED", cpu:"Snapdragon 8 Gen 2", ram:"8GB", storage:"256GB", battery:"3900 mAh" }
      }
    ]));
  }
})();


function getProducts() { return JSON.parse(localStorage.getItem("products")) || []; }
function saveProducts(products) { localStorage.setItem("products", JSON.stringify(products)); }


let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, price, image){

  const user = localStorage.getItem("currentUser");
  const role = localStorage.getItem("currentRole");

  if(!user){
    alert("Vui lòng đăng nhập!");
    window.location.href="auth.html";
    return;
  }

  if(role === "admin"){
    alert("Admin không thể mua hàng!");
    return;
  }

  const item = cart.find(i => i.name === name);

  if(item){
    item.quantity++;
  }else{
    cart.push({
      name,
      price,
      image,
      quantity: 1
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  renderCart();
}
function buyOne(index){

  const user = localStorage.getItem("currentUser");

  if(!user){
    alert("Chưa đăng nhập!");
    return;
  }

  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  const item = cart[index];

  const order = {
    user: user,
    items: [item],
    total: item.price * item.quantity,
    date: new Date().toLocaleString()
  };

  orders.push(order);

  localStorage.setItem("orders", JSON.stringify(orders));


  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));

  renderCart();

  alert("Đã mua sản phẩm!");
}
function removeFromCart(index){
  cart.splice(index, 1); 
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}
function renderCart(){

  const box = document.getElementById("cart-items");
  const count = document.getElementById("cart-count");

  if(!box || !count) return;

  box.innerHTML = "";
  count.innerText = cart.length;

  cart.forEach((item, index) => {
    box.innerHTML += `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        
        <img src="${item.image}" width="40">

        <div style="flex:1">
          <div>${item.name}</div>
          <div>${item.price.toLocaleString("vi-VN")} x ${item.quantity}</div>
        </div>

        <button onclick="buyOne(${index})"
          style="background:#0a68ff;color:white;border:none;padding:5px 8px;border-radius:5px;">
          MUA
        </button>

        <button onclick="removeFromCart(${index})"
          style="background:red;color:white;border:none;padding:5px 8px;border-radius:5px;">
          Xóa
        </button>

      </div>
    `;
  });
}
  function checkout(){

  const user = localStorage.getItem("currentUser");

  if(!user){
    alert("Chưa đăng nhập!");
    return;
  }

  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  const total = cart.reduce((sum,i)=>sum+i.price*i.quantity,0);

  orders.push({
    user,
    items: cart,
    total,
    date: new Date().toLocaleString()
  });

  localStorage.setItem("orders", JSON.stringify(orders));

  alert("Đặt hàng thành công!");

  cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));

  renderCart();
}
function clearCart(){
  cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}
document.addEventListener("DOMContentLoaded", () => {

  const cartBtn = document.querySelector(".cart");

  if(cartBtn){
    cartBtn.addEventListener("click", function(e){
      e.stopPropagation(); 
      document.getElementById("cart-dropdown")
        .classList.toggle("hidden");
    });
  }

  
  document.addEventListener("click", () => {
    document.getElementById("cart-dropdown")
      .classList.add("hidden");
  });

});

function renderProductList(list=getProducts()){
  const productList=document.getElementById("productList");
  if(!productList) return;
  productList.innerHTML="";
  list.forEach(p=>{
    const div=document.createElement("div");
    div.className="product-card";
    div.innerHTML=`
      <a href="product.html?id=${p.id}"><img src="${p.imageSmall}" alt="${p.name}"></a>
      <p class="brand">${p.brand}</p>
      <a href="product.html?id=${p.id}"><h3>${p.name}</h3></a>
      ${p.oldPrice? `<p class="old-price">${p.oldPrice.toLocaleString("vi-VN")} ₫</p>`:""}
      <p class="price">${p.price.toLocaleString("vi-VN")} ₫</p>
      <button onclick="addToCart('${p.name}',${p.price},'${p.imageSmall}')">
         Thêm giỏ hàng
      </button>
      
    `;
    productList.appendChild(div);
  });
}

function filterByBrand(brand){
  if(brand==="all") renderProductList();
  else renderProductList(getProducts().filter(p=>p.brand===brand));
}


function loadProductDetail(){
  const id=new URLSearchParams(window.location.search).get("id");
  if(!id) return;
  const product=getProducts().find(p=>p.id===id);
  if(!product) return;

  document.getElementById("product-name").innerText=product.name;
  document.getElementById("product-image").src=product.imageLarge;
  document.getElementById("product-price").innerText=product.price.toLocaleString("vi-VN")+" ₫";
  if(product.oldPrice) document.getElementById("old-price").innerText=product.oldPrice.toLocaleString("vi-VN")+" ₫";

  const specs=product.specs||{};
  document.getElementById("screen").innerText=specs.screen||product.screen||"Đang cập nhật";
  document.getElementById("chip").innerText=specs.cpu||product.chip||"Đang cập nhật";
  document.getElementById("ram").innerText=specs.ram||product.ram||"Đang cập nhật";
  document.getElementById("storage").innerText=specs.storage||product.storage||"Đang cập nhật";
  document.getElementById("battery").innerText=specs.battery||product.battery||"Đang cập nhật";

  window.buyNow=()=>addToCart(product.name,product.price);
}

function showLogin(){document.getElementById("login-form").classList.remove("hidden");document.getElementById("register-form").classList.add("hidden");}
function showRegister(){document.getElementById("register-form").classList.remove("hidden");document.getElementById("login-form").classList.add("hidden");}
function register(){
  const username=document.getElementById("reg-username").value.trim();
  const password=document.getElementById("reg-password").value;
  const confirm=document.getElementById("reg-confirm").value;
  if(!username||!password||password!==confirm){alert("Thông tin không hợp lệ");return;}
  const users=JSON.parse(localStorage.getItem("users"))||[];
  if(users.some(u=>u.username===username)){alert("Tài khoản đã tồn tại");return;}
  users.push({username,password,role:"user"});
  localStorage.setItem("users",JSON.stringify(users));
  alert("Đăng ký thành công!"); showLogin();
}
function login(){
  const username=document.getElementById("login-username").value.trim();
  const password=document.getElementById("login-password").value;
  const user=(JSON.parse(localStorage.getItem("users"))||[]).find(u=>u.username===username&&u.password===password);
  if(!user){alert("Sai tài khoản hoặc mật khẩu");return;}
  localStorage.setItem("currentUser",user.username);
  localStorage.setItem("currentRole",user.role);
  window.location.replace("index.html");
}
function logout(){localStorage.removeItem("currentUser");localStorage.removeItem("currentRole");window.location.href="index.html";}


document.addEventListener("DOMContentLoaded",()=>{
  renderProductList();
  loadProductDetail();

  const userArea=document.getElementById("user-area");
  if(!userArea) return;
  const user=localStorage.getItem("currentUser");
  const role=localStorage.getItem("currentRole");
  if(!user) userArea.innerHTML=`<a href="auth.html">Đăng nhập</a>`;
  else if(role==="admin") userArea.innerHTML=`Xin chào <b>Admin</b> | <a href="admin.html">Quản trị</a> | <a href="#" onclick="logout()">Đăng xuất</a>`;
  else userArea.innerHTML=
`Xin chào <b>${user}</b> 
| <a href="user-orders.html">Đơn hàng</a> 
| <a href="#" onclick="logout()">Đăng xuất</a>`;
});
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");

function showSlide(index) {
  slides.forEach(s => s.classList.remove("active"));
  slides[index].classList.add("active");
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
}


setInterval(nextSlide, 4000);
const backToTop=document.getElementById("backToTop");

window.addEventListener("scroll",()=>{
  if(window.scrollY>300) backToTop.style.display="block";
  else backToTop.style.display="none";
});

backToTop.addEventListener("click",()=>{
  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
});
const brands={
  phone:["Apple","Samsung","Xiaomi","OPPO"],
  laptop:["Dell","HP","Asus","Acer"],
  watch:["Apple Watch","Samsung Watch"],
  accessory:["Tai nghe","Sạc","Ốp lưng"]
};

function showBrand(type){
  const box=document.getElementById("brandBox");
  box.classList.remove("hidden");
  box.innerHTML="";

  brands[type].forEach(b=>{
    box.innerHTML+=`<div onclick="filterByBrand('${b}')">${b}</div>`;
  });
}
