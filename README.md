# Restoran Nusantara

Restoran Nusantara adalah aplikasi sederhana untuk sistem pemesanan restoran berbasis HTML, CSS, JavaScript, Firebase SDK, dan Cloud Firestore.

Project ini dibuat untuk Ujian Akhir Semester Kelas B-20252.

## Fitur Aplikasi

- Menampilkan data restoran dari Firestore
- Menampilkan menu restoran secara real-time
- Membuat data awal database otomatis
- Menyimpan data customer
- Menyimpan data pesanan
- Menyimpan detail pesanan pada subkoleksi orderItems
- Menampilkan daftar pesanan secara real-time
- Mengubah status pesanan menjadi pending, cooking, ready, atau done

## Teknologi

- HTML5
- CSS3
- Bootstrap 5
- Vanilla JavaScript
- Firebase SDK Modular
- Cloud Firestore
- Vercel

## Struktur Database Firestore

```text
restaurants/{restaurant_id}
├── name
├── address
├── openHours
└── menus/{menu_id}
    ├── name
    ├── price
    ├── category
    ├── available
    └── imageUrl

customers/{customer_id}
├── name
├── phone
└── loyaltyPoints

orders/{order_id}
├── customerId
├── restaurantId
├── tableNumber
├── status
├── totalPrice
├── createdAt
└── orderItems/{item_id}
    ├── menuId
    ├── menuName
    ├── qty
    ├── unitPrice
    └── subtotal