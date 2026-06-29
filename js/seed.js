/* ======================================================
   Restoran Nusantara
   File: js/seed.js
   Deskripsi:
   Membuat data awal Firestore secara otomatis.

   Struktur yang dibuat:
   restaurants
      restaurant_1
         menus
            menu_1 sampai menu_5

      restaurant_2
         menus
            menu_1 sampai menu_5
====================================================== */

import {
    db,
    collection,
    doc,
    setDoc,
    getDocs
} from "./firebase.js";

/* ======================================================
   Data Awal Restoran dan Menu
====================================================== */

const restaurantSeedData = [
    {
        id: "restaurant_1",
        name: "Warung Nusantara Jombang",
        address: "Jl. Ahmad Yani No.5 Jombang",
        openHours: "08:00 - 21:00",
        menus: [
            {
                id: "menu_1",
                name: "Nasi Rawon",
                price: 25000,
                category: "Makanan Utama",
                available: true,
                imageUrl: "https://placehold.co/600x400/198754/ffffff?text=Nasi+Rawon"
            },
            {
                id: "menu_2",
                name: "Soto Ayam",
                price: 20000,
                category: "Makanan Utama",
                available: true,
                imageUrl: "https://placehold.co/600x400/198754/ffffff?text=Soto+Ayam"
            },
            {
                id: "menu_3",
                name: "Ayam Geprek",
                price: 22000,
                category: "Makanan Utama",
                available: true,
                imageUrl: "https://placehold.co/600x400/198754/ffffff?text=Ayam+Geprek"
            },
            {
                id: "menu_4",
                name: "Es Teh",
                price: 5000,
                category: "Minuman",
                available: true,
                imageUrl: "https://placehold.co/600x400/198754/ffffff?text=Es+Teh"
            },
            {
                id: "menu_5",
                name: "Jus Alpukat",
                price: 12000,
                category: "Minuman",
                available: true,
                imageUrl: "https://placehold.co/600x400/198754/ffffff?text=Jus+Alpukat"
            }
        ]
    },
    {
        id: "restaurant_2",
        name: "Warung Nusantara Kediri",
        address: "Jl. Dhoho No.20 Kediri",
        openHours: "09:00 - 22:00",
        menus: [
            {
                id: "menu_1",
                name: "Nasi Pecel",
                price: 18000,
                category: "Makanan Utama",
                available: true,
                imageUrl: "https://placehold.co/600x400/198754/ffffff?text=Nasi+Pecel"
            },
            {
                id: "menu_2",
                name: "Bakso Malang",
                price: 20000,
                category: "Makanan Utama",
                available: true,
                imageUrl: "https://placehold.co/600x400/198754/ffffff?text=Bakso+Malang"
            },
            {
                id: "menu_3",
                name: "Mie Goreng Jawa",
                price: 23000,
                category: "Makanan Utama",
                available: true,
                imageUrl: "https://placehold.co/600x400/198754/ffffff?text=Mie+Goreng+Jawa"
            },
            {
                id: "menu_4",
                name: "Es Jeruk",
                price: 7000,
                category: "Minuman",
                available: true,
                imageUrl: "https://placehold.co/600x400/198754/ffffff?text=Es+Jeruk"
            },
            {
                id: "menu_5",
                name: "Pisang Goreng",
                price: 10000,
                category: "Camilan",
                available: true,
                imageUrl: "https://placehold.co/600x400/198754/ffffff?text=Pisang+Goreng"
            }
        ]
    }
];

/* ======================================================
   Fungsi Initialize Database
====================================================== */

async function initializeDatabase() {
    try {
        const restaurantsRef = collection(db, "restaurants");
        const restaurantsSnapshot = await getDocs(restaurantsRef);

        if (!restaurantsSnapshot.empty) {
            return {
                success: false,
                message: "Database sudah diinisialisasi."
            };
        }

        for (const restaurant of restaurantSeedData) {
            const restaurantRef = doc(db, "restaurants", restaurant.id);

            await setDoc(restaurantRef, {
                name: restaurant.name,
                address: restaurant.address,
                openHours: restaurant.openHours
            });

            for (const menu of restaurant.menus) {
                const menuRef = doc(
                    db,
                    "restaurants",
                    restaurant.id,
                    "menus",
                    menu.id
                );

                await setDoc(menuRef, {
                    name: menu.name,
                    price: menu.price,
                    category: menu.category,
                    available: menu.available,
                    imageUrl: menu.imageUrl
                });
            }
        }

        return {
            success: true,
            message: "Database berhasil dibuat."
        };

    } catch (error) {
        console.error("Gagal initialize database:", error);

        return {
            success: false,
            message: "Gagal membuat database. Periksa Firebase Config dan Firestore Rules."
        };
    }
}

/* ======================================================
   Export
====================================================== */

export { initializeDatabase };