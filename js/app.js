/* ======================================================
   Restoran Nusantara
   File: js/app.js
   Deskripsi:
   File utama aplikasi untuk:
   - Load restoran realtime
   - Load menu realtime
   - Membuat customer
   - Membuat order
   - Membuat subkoleksi orderItems
   - Menampilkan pesanan realtime
====================================================== */

import {
    db,
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "./firebase.js";

/* ======================================================
   DOM Element
====================================================== */

const restaurantSelect = document.getElementById("restaurantSelect");
const menuContainer = document.getElementById("menuContainer");
const selectedItemsContainer = document.getElementById("selectedItemsContainer");
const totalPriceText = document.getElementById("totalPriceText");
const orderForm = document.getElementById("orderForm");
const customerNameInput = document.getElementById("customerName");
const customerPhoneInput = document.getElementById("customerPhone");
const tableNumberInput = document.getElementById("tableNumber");
const ordersTableBody = document.getElementById("ordersTableBody");
const emptyOrderMessage = document.getElementById("emptyOrderMessage");
const loadingOverlay = document.getElementById("loadingOverlay");
const alertBox = document.getElementById("alertBox");

/* ======================================================
   State
====================================================== */

let restaurants = [];
let currentMenus = [];
let selectedItems = [];
let unsubscribeMenus = null;

/* ======================================================
   Helper
====================================================== */

function showLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.add("show");
    }
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.remove("show");
    }
}

function showAlert(message, type = "success") {
    if (!alertBox) {
        alert(message);
        return;
    }

    alertBox.innerHTML = `
        <div class="alert alert-${type} custom-alert alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(number || 0);
}

function getSelectedRestaurant() {
    const restaurantId = restaurantSelect.value;
    return restaurants.find((restaurant) => restaurant.id === restaurantId);
}

function calculateTotalPrice() {
    return selectedItems.reduce((total, item) => total + item.subtotal, 0);
}

function resetOrderForm() {
    orderForm.reset();

    selectedItems = [];
    renderSelectedItems();

    currentMenus = [];
    listenMenusByRestaurant("");
}

/* ======================================================
   Load Restaurants Realtime
====================================================== */

function listenRestaurants() {
    const restaurantsRef = collection(db, "restaurants");

    onSnapshot(
        restaurantsRef,
        (snapshot) => {
            restaurants = [];

            snapshot.forEach((documentSnapshot) => {
                restaurants.push({
                    id: documentSnapshot.id,
                    ...documentSnapshot.data()
                });
            });

            renderRestaurantOptions();
        },
        (error) => {
            console.error("Listen restaurants error:", error);
            showAlert("Gagal mengambil data restoran.", "danger");
        }
    );
}

function renderRestaurantOptions() {
    const selectedValue = restaurantSelect.value;

    restaurantSelect.innerHTML = `<option value="">Pilih restoran</option>`;

    restaurants.forEach((restaurant) => {
        const option = document.createElement("option");
        option.value = restaurant.id;
        option.textContent = `${restaurant.name} - ${restaurant.openHours}`;
        restaurantSelect.appendChild(option);
    });

    if (restaurants.some((restaurant) => restaurant.id === selectedValue)) {
        restaurantSelect.value = selectedValue;
    }
}

/* ======================================================
   Load Menus Realtime
====================================================== */

function listenMenusByRestaurant(restaurantId) {
    if (unsubscribeMenus) {
        unsubscribeMenus();
    }

    currentMenus = [];
    selectedItems = [];
    renderSelectedItems();

    if (!restaurantId) {
        menuContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🍽️</div>
                <p class="mb-0">Silakan pilih restoran terlebih dahulu.</p>
            </div>
        `;
        return;
    }

    const menusRef = collection(db, "restaurants", restaurantId, "menus");

    unsubscribeMenus = onSnapshot(
        menusRef,
        (snapshot) => {
            currentMenus = [];

            snapshot.forEach((documentSnapshot) => {
                currentMenus.push({
                    id: documentSnapshot.id,
                    ...documentSnapshot.data()
                });
            });

            renderMenus();
        },
        (error) => {
            console.error("Listen menus error:", error);
            showAlert("Gagal mengambil data menu.", "danger");
        }
    );
}

function renderMenus() {
    const availableMenus = currentMenus.filter((menu) => menu.available === true);

    if (availableMenus.length === 0) {
        menuContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🍽️</div>
                <p class="mb-0">Menu belum tersedia.</p>
            </div>
        `;
        return;
    }

    const menuHtml = availableMenus
        .map((menu) => {
            return `
                <div class="menu-card">
                    <img 
                        src="${menu.imageUrl}" 
                        alt="${menu.name}" 
                        onerror="this.src='https://placehold.co/600x400/198754/ffffff?text=Menu'"
                    >

                    <div class="menu-card-body">
                        <div class="menu-name">${menu.name}</div>
                        <div class="menu-category">${menu.category}</div>
                        <div class="menu-price">${formatRupiah(menu.price)}</div>

                        <div class="menu-action">
                            <input 
                                type="number" 
                                min="1" 
                                value="1" 
                                class="form-control form-control-sm"
                                id="qty-${menu.id}"
                            >

                            <button 
                                type="button" 
                                class="btn btn-sm btn-success"
                                data-menu-id="${menu.id}"
                            >
                                Tambah
                            </button>
                        </div>
                    </div>
                </div>
            `;
        })
        .join("");

    menuContainer.innerHTML = `<div class="menu-grid">${menuHtml}</div>`;
}

/* ======================================================
   Selected Items
====================================================== */

function addMenuToOrder(menuId) {
    const menu = currentMenus.find((item) => item.id === menuId);

    if (!menu) {
        showAlert("Menu tidak ditemukan.", "danger");
        return;
    }

    const qtyInput = document.getElementById(`qty-${menuId}`);
    const qty = Number(qtyInput.value);

    if (!qty || qty < 1) {
        showAlert("Jumlah menu minimal 1.", "warning");
        return;
    }

    const existingItem = selectedItems.find((item) => item.menuId === menuId);

    if (existingItem) {
        existingItem.qty += qty;
        existingItem.subtotal = existingItem.qty * existingItem.unitPrice;
    } else {
        selectedItems.push({
            menuId: menu.id,
            menuName: menu.name,
            qty: qty,
            unitPrice: menu.price,
            subtotal: qty * menu.price
        });
    }

    renderSelectedItems();
}

function removeSelectedItem(menuId) {
    selectedItems = selectedItems.filter((item) => item.menuId !== menuId);
    renderSelectedItems();
}

function renderSelectedItems() {
    if (selectedItems.length === 0) {
        selectedItemsContainer.innerHTML = `
            <div class="empty-state p-3">
                <p class="mb-0">Belum ada menu dipilih.</p>
            </div>
        `;

        totalPriceText.textContent = formatRupiah(0);
        return;
    }

    selectedItemsContainer.innerHTML = selectedItems
        .map((item) => {
            return `
                <div class="selected-item">
                    <div>
                        <div class="selected-item-name">${item.menuName}</div>
                        <div class="selected-item-meta">
                            ${item.qty} x ${formatRupiah(item.unitPrice)}
                        </div>
                    </div>

                    <div class="text-end">
                        <div class="fw-bold">${formatRupiah(item.subtotal)}</div>
                        <button 
                            type="button" 
                            class="btn btn-sm btn-outline-danger mt-1"
                            data-remove-menu-id="${item.menuId}"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            `;
        })
        .join("");

    totalPriceText.textContent = formatRupiah(calculateTotalPrice());
}

/* ======================================================
   Submit Order
====================================================== */

async function submitOrder(event) {
    event.preventDefault();

    const customerName = customerNameInput.value.trim();
    const customerPhone = customerPhoneInput.value.trim();
    const tableNumber = Number(tableNumberInput.value);
    const restaurantId = restaurantSelect.value;
    const restaurant = getSelectedRestaurant();

    if (!customerName) {
        showAlert("Nama customer wajib diisi.", "warning");
        return;
    }

    if (!customerPhone) {
        showAlert("Nomor HP wajib diisi.", "warning");
        return;
    }

    if (!tableNumber || tableNumber < 1) {
        showAlert("Nomor meja wajib diisi dan harus lebih dari 0.", "warning");
        return;
    }

    if (!restaurantId || !restaurant) {
        showAlert("Restoran wajib dipilih.", "warning");
        return;
    }

    if (selectedItems.length === 0) {
        showAlert("Pilih minimal satu menu.", "warning");
        return;
    }

    try {
        showLoading();

        const totalPrice = calculateTotalPrice();

        const customerRef = await addDoc(collection(db, "customers"), {
            name: customerName,
            phone: customerPhone,
            loyaltyPoints: 0
        });

        const orderRef = await addDoc(collection(db, "orders"), {
            customerId: customerRef.id,
            restaurantId: restaurantId,
            tableNumber: tableNumber,
            status: "pending",
            totalPrice: totalPrice,
            createdAt: serverTimestamp()
        });

        for (const item of selectedItems) {
            await addDoc(collection(db, "orders", orderRef.id, "orderItems"), {
                menuId: item.menuId,
                menuName: item.menuName,
                qty: item.qty,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal
            });
        }

        showAlert("Pesanan berhasil disimpan.", "success");
        resetOrderForm();

    } catch (error) {
        console.error("Submit order error:", error);
        showAlert("Gagal menyimpan pesanan. Periksa koneksi dan Firestore Rules.", "danger");
    } finally {
        hideLoading();
    }
}

/* ======================================================
   Orders Realtime
====================================================== */

function listenOrders() {
    const ordersRef = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
    );

    onSnapshot(
        ordersRef,
        async (snapshot) => {
            const orders = [];

            for (const documentSnapshot of snapshot.docs) {
                const orderData = {
                    id: documentSnapshot.id,
                    ...documentSnapshot.data()
                };

                const customerData = await getCustomerData(orderData.customerId);
                const restaurantData = await getRestaurantData(orderData.restaurantId);
                const orderItems = await getOrderItems(orderData.id);

                orders.push({
                    ...orderData,
                    customer: customerData,
                    restaurant: restaurantData,
                    items: orderItems
                });
            }

            renderOrders(orders);
        },
        (error) => {
            console.error("Listen orders error:", error);
            showAlert("Gagal mengambil data pesanan realtime.", "danger");
        }
    );
}

async function getCustomerData(customerId) {
    try {
        if (!customerId) {
            return null;
        }

        const customerRef = doc(db, "customers", customerId);
        const customerSnapshot = await getDoc(customerRef);

        if (!customerSnapshot.exists()) {
            return null;
        }

        return customerSnapshot.data();
    } catch (error) {
        console.error("Get customer error:", error);
        return null;
    }
}

async function getRestaurantData(restaurantId) {
    try {
        if (!restaurantId) {
            return null;
        }

        const restaurantRef = doc(db, "restaurants", restaurantId);
        const restaurantSnapshot = await getDoc(restaurantRef);

        if (!restaurantSnapshot.exists()) {
            return null;
        }

        return restaurantSnapshot.data();
    } catch (error) {
        console.error("Get restaurant error:", error);
        return null;
    }
}

async function getOrderItems(orderId) {
    try {
        const itemsSnapshot = await getDocs(
            collection(db, "orders", orderId, "orderItems")
        );

        const items = [];

        itemsSnapshot.forEach((documentSnapshot) => {
            items.push({
                id: documentSnapshot.id,
                ...documentSnapshot.data()
            });
        });

        return items;
    } catch (error) {
        console.error("Get order items error:", error);
        return [];
    }
}

function renderOrders(orders) {
    if (orders.length === 0) {
        ordersTableBody.innerHTML = "";
        emptyOrderMessage.classList.remove("d-none");
        return;
    }

    emptyOrderMessage.classList.add("d-none");

    ordersTableBody.innerHTML = orders
        .map((order, index) => {
            const createdAt = order.createdAt?.toDate
                ? order.createdAt.toDate().toLocaleString("id-ID")
                : "-";

            const itemNames = order.items
                .map((item) => `${item.menuName} (${item.qty})`)
                .join(", ");

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <div class="fw-bold">${order.customer?.name || "-"}</div>
                        <div class="small-muted">${order.customer?.phone || "-"}</div>
                    </td>
                    <td>${order.restaurant?.name || "-"}</td>
                    <td>${order.tableNumber || "-"}</td>
                    <td>${itemNames || "-"}</td>
                    <td>${formatRupiah(order.totalPrice)}</td>
                    <td>${createdAt}</td>
                    <td>${renderStatusBadge(order.status)}</td>
                </tr>
            `;
        })
        .join("");
}

function renderStatusBadge(status) {
    const safeStatus = status || "pending";

    return `
        <span class="badge-status badge-${safeStatus}">
            ${safeStatus}
        </span>
    `;
}

/* ======================================================
   Event Listener
====================================================== */

restaurantSelect.addEventListener("change", (event) => {
    listenMenusByRestaurant(event.target.value);
});

menuContainer.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-menu-id]");

    if (!button) {
        return;
    }

    const menuId = button.dataset.menuId;
    addMenuToOrder(menuId);
});

selectedItemsContainer.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-remove-menu-id]");

    if (!button) {
        return;
    }

    const menuId = button.dataset.removeMenuId;
    removeSelectedItem(menuId);
});

orderForm.addEventListener("submit", submitOrder);

/* ======================================================
   Init App
====================================================== */

document.addEventListener("DOMContentLoaded", () => {
    console.log("Restoran Nusantara siap dijalankan.");

    listenRestaurants();
    listenOrders();
    listenMenusByRestaurant("");
});