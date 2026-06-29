/* ======================================================
   Warung Nusantara Jombang
   File: js/seed.js

   Struktur Firestore:

   restaurants
   └── warung_nusantara_jombang
       ├── name
       ├── address
       ├── openHours
       └── branches
           ├── branch_1
           │   └── menus
           └── branch_2
               └── menus

   customers
   └── customer_1 sampai customer_21
====================================================== */

import {
    db,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs
} from "./firebase.js";

const RESTAURANT_ID = "warung_nusantara_jombang";

/* ======================================================
   Data Restoran, Cabang, dan Menu
====================================================== */

const restaurantSeedData = {
    id: RESTAURANT_ID,
    name: "Warung Nusantara Jombang",
    address: "Jl. Ahmad Yani No.5 Jombang",
    openHours: "08:00 - 21:00",
    branches: [
        {
            id: "branch_1",
            name: "Cabang Ahmad Yani",
            address: "Jl. Ahmad Yani No.5 Jombang",
            openHours: "08:00 - 21:00",
            menus: [
                {
                    id: "menu_1",
                    name: "Nasi Rawon",
                    price: 25000,
                    category: "Makanan Utama",
                    available: true,
                    imageUrl: "images/rawon.jpg"
                },
                {
                    id: "menu_2",
                    name: "Soto Ayam",
                    price: 20000,
                    category: "Makanan Utama",
                    available: true,
                    imageUrl: "images/soto.jpg"
                },
                {
                    id: "menu_3",
                    name: "Ayam Geprek",
                    price: 22000,
                    category: "Makanan Utama",
                    available: true,
                    imageUrl: "images/geprek.jpg"
                },
                {
                    id: "menu_4",
                    name: "Es Teh",
                    price: 5000,
                    category: "Minuman",
                    available: true,
                    imageUrl: "images/es teh.jpg"
                },
                {
                    id: "menu_5",
                    name: "Jus Alpukat",
                    price: 12000,
                    category: "Minuman",
                    available: true,
                    imageUrl: "images/jus alpukat.jpg"
                }
            ]
        },
        {
            id: "branch_2",
            name: "Cabang Mojoagung",
            address: "Jl. Raya Mojoagung No.12 Jombang",
            openHours: "09:00 - 22:00",
            menus: [
                {
                    id: "menu_1",
                    name: "Nasi Pecel",
                    price: 18000,
                    category: "Makanan Utama",
                    available: true,
                    imageUrl: "images/pecel.jpg"
                },
                {
                    id: "menu_2",
                    name: "Bakso Malang",
                    price: 20000,
                    category: "Makanan Utama",
                    available: true,
                    imageUrl: "images/bakso malang.jpg"
                },
                {
                    id: "menu_3",
                    name: "Mie Goreng Jawa",
                    price: 23000,
                    category: "Makanan Utama",
                    available: true,
                    imageUrl: "images/mie goreng jawa.jpg"
                },
                {
                    id: "menu_4",
                    name: "Es Jeruk",
                    price: 7000,
                    category: "Minuman",
                    available: true,
                    imageUrl: "images/es jeruk.jpg"
                },
                {
                    id: "menu_5",
                    name: "Pisang Goreng",
                    price: 10000,
                    category: "Camilan",
                    available: true,
                    imageUrl: "images/jus alpukat.jpg"
                }
            ]
        }
    ]
};

/* ======================================================
   Data Customer Kelas B
====================================================== */

const customerSeedData = [
    {
        id: "customer_1",
        name: "ADAM ANDIKA SUKMA",
        phone: "+62 857-4950-3756",
        loyaltyPoints: 0
    },
    {
        id: "customer_2",
        name: "ANDIKA DWI SANTOSO",
        phone: "+62 858-1181-8398",
        loyaltyPoints: 0
    },
    {
        id: "customer_3",
        name: "LAILATUL NUR AIFA RAHMA",
        phone: "+62 857-0774-4517",
        loyaltyPoints: 0
    },
    {
        id: "customer_4",
        name: "MUHAMMAD YOGI ANTORO",
        phone: "+62 881-9823-491",
        loyaltyPoints: 0
    },
    {
        id: "customer_5",
        name: "NELA ULIVATUL ZAHRO MAUL",
        phone: "+62 821-4164-4491",
        loyaltyPoints: 0
    },
    {
        id: "customer_6",
        name: "SITI MASITO",
        phone: "+62 878-7467-0928",
        loyaltyPoints: 0
    },
    {
        id: "customer_7",
        name: "UHTI AMELIA",
        phone: "+62 823-3387-8623",
        loyaltyPoints: 0
    },
    {
        id: "customer_8",
        name: "YAZKAA ZAHAA DZAKIYAH",
        phone: "+62 823-3511-7737",
        loyaltyPoints: 0
    },
    {
        id: "customer_9",
        name: "DARA PUTRI NATA SUKMA",
        phone: "+62 857-6680-6932",
        loyaltyPoints: 0
    },
    {
        id: "customer_10",
        name: "JOENED SASTRA",
        phone: "+62 813-4546-9594",
        loyaltyPoints: 0
    },
    {
        id: "customer_11",
        name: "MUHAMMAD AMRULLOH",
        phone: "+62 853-3594-4931",
        loyaltyPoints: 0
    },
    {
        id: "customer_12",
        name: "ALDIYOFANI AZZAHWA",
        phone: "+62 895-2283-2909",
        loyaltyPoints: 0
    },
    {
        id: "customer_13",
        name: "ALFIN NUR HIDAYATULLOH",
        phone: "+62 856-0881-5962",
        loyaltyPoints: 0
    },
    {
        id: "customer_14",
        name: "AUREL PRAYOGA",
        phone: "+62 821-4094-6412",
        loyaltyPoints: 0
    },
    {
        id: "customer_15",
        name: "CANDRA ARDIANSYAH",
        phone: "+62 895-3264-30641",
        loyaltyPoints: 0
    },
    {
        id: "customer_16",
        name: "DENIS MAWAR SANIA",
        phone: "+62 821-3152-3263",
        loyaltyPoints: 0
    },
    {
        id: "customer_17",
        name: "HARDIANSYAH",
        phone: "+62 817-7980-8202",
        loyaltyPoints: 0
    },
    {
        id: "customer_18",
        name: "MIRZA FAHMI",
        phone: "+62 856-0729-7040",
        loyaltyPoints: 0
    },
    {
        id: "customer_19",
        name: "MUHAMMAD VALLENTINO AKBAR",
        phone: "+62 895-3217-63093",
        loyaltyPoints: 0
    },
    {
        id: "customer_20",
        name: "MUHAMMAD TEDDY RAMADHAN",
        phone: "+62 857-3605-4934",
        loyaltyPoints: 0
    },
    {
        id: "customer_21",
        name: "ASYKARIL KAFIFULLOH",
        phone: "+62 853-3111-3647",
        loyaltyPoints: 0
    }
];

/* ======================================================
   Seed Customer
====================================================== */

async function seedCustomers() {
    for (const customer of customerSeedData) {
        const customerRef = doc(db, "customers", customer.id);

        await setDoc(
            customerRef,
            {
                name: customer.name,
                phone: customer.phone,
                loyaltyPoints: customer.loyaltyPoints
            },
            { merge: true }
        );
    }
}

/* ======================================================
   Initialize Database
====================================================== */

async function initializeDatabase() {
    try {
        const restaurantRef = doc(db, "restaurants", restaurantSeedData.id);
        const restaurantSnapshot = await getDoc(restaurantRef);

        const branchesRef = collection(
            db,
            "restaurants",
            restaurantSeedData.id,
            "branches"
        );

        const branchesSnapshot = await getDocs(branchesRef);

        const alreadyExists = restaurantSnapshot.exists() && !branchesSnapshot.empty;

        await setDoc(
            restaurantRef,
            {
                name: restaurantSeedData.name,
                address: restaurantSeedData.address,
                openHours: restaurantSeedData.openHours
            },
            { merge: true }
        );

        for (const branch of restaurantSeedData.branches) {
            const branchRef = doc(
                db,
                "restaurants",
                restaurantSeedData.id,
                "branches",
                branch.id
            );

            await setDoc(
                branchRef,
                {
                    name: branch.name,
                    address: branch.address,
                    openHours: branch.openHours
                },
                { merge: true }
            );

            for (const menu of branch.menus) {
                const menuRef = doc(
                    db,
                    "restaurants",
                    restaurantSeedData.id,
                    "branches",
                    branch.id,
                    "menus",
                    menu.id
                );

                await setDoc(
                    menuRef,
                    {
                        name: menu.name,
                        price: menu.price,
                        category: menu.category,
                        available: menu.available,
                        imageUrl: menu.imageUrl
                    },
                    { merge: true }
                );
            }
        }

        await seedCustomers();

        if (alreadyExists) {
            return {
                success: true,
                status: "exists",
                message: "Data Warung Nusantara Jombang sudah tersedia."
            };
        }

        return {
            success: true,
            status: "created",
            message: "Data Warung Nusantara Jombang berhasil dibuat."
        };

    } catch (error) {
        console.error("Gagal initialize database:", error);

        return {
            success: false,
            status: "error",
            message: "Gagal membuat data awal. Periksa Firebase Config dan Firestore Rules."
        };
    }
}

export {
    RESTAURANT_ID,
    initializeDatabase
};