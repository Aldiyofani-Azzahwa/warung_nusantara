/* ======================================================
   Restoran Nusantara
   File: js/app.js
   Struktur:
   restaurants/warung_nusantara_jombang/branches/{branchId}/menus
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

import {
    RESTAURANT_ID,
    initializeDatabase
} from "./seed.js";

/* ======================================================
   DOM Element
====================================================== */

const branchSelect = document.getElementById("restaurantSelect");
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

let branches = [];
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

function calculateTotalPrice() {
    return selectedItems.reduce((total, item) => total + item.subtotal, 0);
}

function getSelectedBranch() {
    const branchId = branchSelect.value;
    return branches.find((branch) => branch.id === branchId);
}

function resetOrderForm() {
    orderForm.reset();

    selectedItems = [];
    renderSelectedItems();

    currentMenus = [];
    listenMenusByBranch("");
}

/* ======================================================
   Auto Seed Database
====================================================== */

async function prepareInitialData() {
    try {
        showLoading();

        const result = await initializeDatabase();

        if (result.status === "created") {
            showAlert(result.message, "success");
        }

        if (result.status === "error") {
            showAlert(result.message, "danger");
        }

    } catch (error) {
        console.error("Prepare initial data error:", error);
        showAlert("Gagal menyiapkan data awal.", "danger");
    } finally {
        hideLoading();
    }
}

/* ======================================================
   Load Branches Realtime
====================================================== */

function listenBranches() {
    const branchesRef = collection(
        db,
        "restaurants",
        RESTAURANT_ID,
        "branches"
    );

    onSnapshot(
        branchesRef,
        (snapshot) => {
            branches = [];

            snapshot.forEach((documentSnapshot) => {
                branches.push({
                    id: documentSnapshot.id,
                    ...documentSnapshot.data()
                });
            });

            renderBranchOptions();
        },
        (error) => {
            console.error("Listen branches error:", error);
            showAlert("Gagal mengambil data cabang.", "danger");
        }
    );
}

function renderBranchOptions() {
    const selectedValue = branchSelect.value;

    branchSelect.innerHTML = `<option value="">Pilih cabang</option>`;

    branches.forEach((branch) => {
        const option = document.createElement("option");
        option.value = branch.id;
        option.textContent = `${branch.name} - ${branch.openHours}`;
        branchSelect.appendChild(option);
    });

    if (branches.some((branch) => branch.id === selectedValue)) {
        branchSelect.value = selectedValue;
    }
}

/* ======================================================
   Load Menus Realtime
====================================================== */

function listenMenusByBranch(branchId) {
    if (unsubscribeMenus) {
        unsubscribeMenus();
    }

    currentMenus = [];
    selectedItems = [];
    renderSelectedItems();

    if (!branchId) {
        menuContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🍽️</div>
                <p class="mb-0">Silakan pilih cabang terlebih dahulu.</p>
            </div>
        `;
        return;
    }

    const menusRef = collection(
        db,
        "restaurants",
        RESTAURANT_ID,
        "branches",
        branchId,
        "menus"
    );

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
    const branchId = branchSelect.value;
    const branch = getSelectedBranch();

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

    if (!branchId || !branch) {
        showAlert("Cabang wajib dipilih.", "warning");
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
            restaurantId: RESTAURANT_ID,
            branchId: branchId,
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
                const branchData = await getBranchData(orderData.branchId);
                const orderItems = await getOrderItems(orderData.id);

                orders.push({
                    ...orderData,
                    customer: customerData,
                    branch: branchData,
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

async function getBranchData(branchId) {
    try {
        if (!branchId) {
            return null;
        }

        const branchRef = doc(
            db,
            "restaurants",
            RESTAURANT_ID,
            "branches",
            branchId
        );

        const branchSnapshot = await getDoc(branchRef);

        if (!branchSnapshot.exists()) {
            return null;
        }

        return branchSnapshot.data();
    } catch (error) {
        console.error("Get branch error:", error);
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
                    <td>${order.branch?.name || "-"}</td>
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

branchSelect.addEventListener("change", (event) => {
    listenMenusByBranch(event.target.value);
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

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Warung Nusantara Jombang siap dijalankan.");

    await prepareInitialData();

    listenBranches();
    listenOrders();
    listenMenusByBranch("");
});