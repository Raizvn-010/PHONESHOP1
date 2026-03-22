
if (localStorage.getItem("currentRole") !== "admin") {
  alert("Bạn không có quyền truy cập!");
  window.location.href = "index.html";
}


function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}


let editingId = null;


function toggleForm(show) {
  const form = document.getElementById("productForm");
  if (!form) return;
  form.classList.toggle("hidden", !show);
}


function renderTable() {
  const table = document.getElementById("productTable");
  table.innerHTML = "";

  getProducts().forEach(p => {

    const sold = getSoldCount(p.name); 

    table.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.brand || ""}</td>
        <td>${p.price.toLocaleString("vi-VN")} ₫</td>
        <td>${sold}</td>
        <td>
          <img src="${p.imageSmall}" style="width:50px;border-radius:6px">
        </td>
        <td>
          <button class="edit" onclick="editProduct('${p.id}')">Sửa</button>
          <button class="delete" onclick="deleteProduct('${p.id}')">Xóa</button>
        </td>
      </tr>
    `;
  });
}


function saveProduct() {
  let products = getProducts();

  const id = document.getElementById("id").value.trim();
  const name = document.getElementById("name").value.trim();
  const brand = document.getElementById("brand").value.trim();
  const priceRaw = document.getElementById("price").value;
  const oldPriceRaw = document.getElementById("oldPrice").value;
  const imageInput = document.getElementById("image");

  const specs = {
    screen: document.getElementById("screen").value.trim(),
    cpu: document.getElementById("cpu").value.trim(),
    ram: document.getElementById("ram").value.trim(),
    storage: document.getElementById("storage").value.trim(),
    battery: document.getElementById("battery").value.trim()
  };

  if (!id || !name || !brand || !priceRaw) {
    alert("Vui lòng nhập đầy đủ thông tin");
    return;
  }

  const price = Number(priceRaw.replace(/\D/g, ""));
  const oldPrice = Number(oldPriceRaw.replace(/\D/g, "")) || price;

  
  if (editingId && imageInput.files.length === 0) {
    const index = products.findIndex(p => p.id === editingId);
    products[index] = {
      ...products[index],
      id, name, brand, price, oldPrice, specs
    };

    saveProducts(products);
    clearForm();
    renderTable();
    toggleForm(false); 
    return;
  }

  
  if (imageInput.files.length === 0) {
    alert("Vui lòng chọn ảnh sản phẩm");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const product = {
      id, name, brand, price, oldPrice,
      imageSmall: reader.result,
      imageLarge: reader.result,
      specs
    };

    if (editingId) {
      const index = products.findIndex(p => p.id === editingId);
      products[index] = product;
      editingId = null;
    } else {
      if (products.some(p => p.id === id)) {
        alert("ID sản phẩm đã tồn tại");
        return;
      }
      products.push(product);
    }

    saveProducts(products);
    clearForm();
    renderTable();
    toggleForm(false); 
  };

  reader.readAsDataURL(imageInput.files[0]);
}


function editProduct(id) {
  const p = getProducts().find(p => p.id === id);
  if (!p) return;

  document.getElementById("id").value = p.id;
  document.getElementById("name").value = p.name;
  document.getElementById("brand").value = p.brand || "";
  document.getElementById("price").value = p.price;
  document.getElementById("oldPrice").value = p.oldPrice || "";

  const specs = p.specs || {};
  document.getElementById("screen").value = specs.screen || "";
  document.getElementById("cpu").value = specs.cpu || "";
  document.getElementById("ram").value = specs.ram || "";
  document.getElementById("storage").value = specs.storage || "";
  document.getElementById("battery").value = specs.battery || "";

  editingId = id;
  document.getElementById("form-title").innerText = "Sửa sản phẩm";
  toggleForm(true); 
}


function deleteProduct(id) {
  if (!confirm("Xóa sản phẩm này?")) return;
  saveProducts(getProducts().filter(p => p.id !== id));
  renderTable();
}

function clearForm() {
  [
    "id","name","brand","price","oldPrice",
    "image","screen","cpu","ram","storage","battery"
  ].forEach(i => document.getElementById(i).value = "");

  editingId = null;
  document.getElementById("form-title").innerText = "Thêm sản phẩm";
}

toggleForm(false); 
renderTable();
function getSoldCount(productName){

  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  let total = 0;

  orders.forEach(order=>{
    order.items.forEach(item=>{
      if(item.name === productName){
        total++;
      }
    });
  });

  return total;
}

///Quản lý user
const orders = JSON.parse(localStorage.getItem("orders")) || [];

const userMap = {};

// gom đơn theo user
orders.forEach(o => {

  if(!userMap[o.user]){
    userMap[o.user] = {
      total: 0,
      count: 0,
      orders: []
    };
  }

  userMap[o.user].count++;
  userMap[o.user].total += o.total;
  userMap[o.user].orders.push(o);

});

const table = document.getElementById("userTable");

// hiển thị
for(let user in userMap){

  table.innerHTML += `
    <tr>
      <td>${user}</td>
      <td>${userMap[user].count}</td>
      <td>${userMap[user].total.toLocaleString("vi-VN")} ₫</td>
      <td>
        <button onclick="viewUser('${user}')">Xem</button>
      </td>
    </tr>
  `;
}
function viewUser(username){

  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  const userOrders = orders.filter(o => o.user === username);

  document.getElementById("modalTitle").innerText = "Đơn hàng của " + username;

  let html = "";

  userOrders.forEach((o, index) => {
    html += `
      <div style="border:1px solid #ddd; margin:10px 0; padding:10px; border-radius:6px">
        <p><b>Ngày:</b> ${o.date}</p>
        <p><b>Sản phẩm:</b> ${o.items.map(i=>i.name).join(", ")}</p>
        <p><b>Tổng tiền:</b> ${o.total.toLocaleString("vi-VN")} ₫</p>

        <button onclick="deleteOrder(${index}, '${username}')">
          ❌ Xóa đơn
        </button>
      </div>
    `;
  });

  document.getElementById("modalBody").innerHTML = html;

  document.getElementById("orderModal").classList.remove("hidden");
}
function closeModal(){
  document.getElementById("orderModal").classList.add("hidden");
}

 function deleteOrder(index, user){

  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  const userOrders = orders.filter(o => o.user === user);
  const orderToDelete = userOrders[index];

  orders = orders.filter(o => o !== orderToDelete);

  localStorage.setItem("orders", JSON.stringify(orders));

  alert("Đã xóa!");

  closeModal();
  location.reload();
}
function showPage(page){

  document.getElementById("productPage").style.display = "none";
  document.getElementById("userPage").style.display = "none";

  if(page === "product"){
    document.getElementById("productPage").style.display = "block";
    document.getElementById("form-title").innerText = "Quản lý sản phẩm";
  }else{
    document.getElementById("userPage").style.display = "block";
    document.getElementById("form-title").innerText = "Quản lý người dùng";
  }

}

