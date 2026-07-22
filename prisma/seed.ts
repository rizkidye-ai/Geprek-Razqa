import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ---------- Settings ----------
  await prisma.settings.deleteMany();
  await prisma.settings.create({
    data: {
      name: "Warung Makan Geprek Rzqa",
      address: "Jl. Merdeka No. 45, Bandung",
      phone: "0812-3456-7890",
      footer: "Terima kasih sudah makan di Geprek Rzqa. Sampai jumpa lagi!",
    },
  });

  // ---------- Users ----------
  await prisma.stockMovement.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuIngredient.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.restaurantTable.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = "geprek123";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || defaultPassword;
  const kasirPassword = process.env.SEED_KASIR_PASSWORD || defaultPassword;
  const dapurPassword = process.env.SEED_DAPUR_PASSWORD || defaultPassword;

  if (
    process.env.NODE_ENV === "production" &&
    (adminPassword === defaultPassword ||
      kasirPassword === defaultPassword ||
      dapurPassword === defaultPassword)
  ) {
    console.warn(
      "\n!!! PERINGATAN: Anda sedang seed di production tanpa mengatur SEED_ADMIN_PASSWORD / SEED_KASIR_PASSWORD / SEED_DAPUR_PASSWORD.\n" +
        "Password default 'geprek123' akan dipakai. WAJIB ganti password ini lewat menu Pegawai setelah login pertama kali.\n"
    );
  }

  const admin = await prisma.user.create({
    data: {
      name: "Rzqa (Pemilik)",
      username: "admin",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
  });

  const kasir = await prisma.user.create({
    data: {
      name: "Siti Kasir",
      username: "kasir",
      passwordHash: await bcrypt.hash(kasirPassword, 10),
      role: "KASIR",
    },
  });

  const dapur = await prisma.user.create({
    data: {
      name: "Budi Dapur",
      username: "dapur",
      passwordHash: await bcrypt.hash(dapurPassword, 10),
      role: "DAPUR",
    },
  });

  // ---------- Kategori ----------
  const [katAyam, katLauk, , katMinuman, katNasi] = await Promise.all([
    prisma.category.create({ data: { name: "Ayam Geprek" } }),
    prisma.category.create({ data: { name: "Lauk Tambahan" } }),
    prisma.category.create({ data: { name: "Level Sambal" } }),
    prisma.category.create({ data: { name: "Minuman" } }),
    prisma.category.create({ data: { name: "Nasi & Karbo" } }),
  ]);

  // ---------- Bahan Baku ----------
  const ingredientData = [
    { name: "Ayam Fillet", unit: "gram", stock: 15000, minStock: 3000 },
    { name: "Tepung Kremes", unit: "gram", stock: 8000, minStock: 2000 },
    { name: "Cabai Rawit", unit: "gram", stock: 5000, minStock: 1000 },
    { name: "Bawang Putih", unit: "gram", stock: 3000, minStock: 500 },
    { name: "Minyak Goreng", unit: "ml", stock: 10000, minStock: 2000 },
    { name: "Beras", unit: "gram", stock: 25000, minStock: 5000 },
    { name: "Tahu", unit: "potong", stock: 100, minStock: 20 },
    { name: "Tempe", unit: "potong", stock: 100, minStock: 20 },
    { name: "Telur", unit: "butir", stock: 80, minStock: 15 },
    { name: "Terong", unit: "buah", stock: 40, minStock: 10 },
    { name: "Es Batu", unit: "gram", stock: 20000, minStock: 3000 },
    { name: "Teh Celup", unit: "kantong", stock: 100, minStock: 15 },
    { name: "Jeruk Nipis", unit: "buah", stock: 50, minStock: 10 },
    { name: "Gula Pasir", unit: "gram", stock: 5000, minStock: 1000 },
  ];
  const ing: Record<string, string> = {};
  for (const i of ingredientData) {
    const created = await prisma.ingredient.create({ data: i });
    ing[i.name] = created.id;
  }

  // ---------- Menu ----------
  const menuData: {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    recipe: { name: string; qty: number }[];
  }[] = [
    {
      name: "Ayam Geprek Original",
      description: "Ayam fillet crispy digeprek dengan sambal bawang khas Rzqa",
      price: 15000,
      categoryId: katAyam.id,
      recipe: [
        { name: "Ayam Fillet", qty: 150 },
        { name: "Tepung Kremes", qty: 60 },
        { name: "Cabai Rawit", qty: 30 },
        { name: "Bawang Putih", qty: 10 },
        { name: "Minyak Goreng", qty: 100 },
      ],
    },
    {
      name: "Ayam Geprek Keju",
      description: "Ayam geprek original ditaburi lelehan keju mozzarella",
      price: 20000,
      categoryId: katAyam.id,
      recipe: [
        { name: "Ayam Fillet", qty: 150 },
        { name: "Tepung Kremes", qty: 60 },
        { name: "Cabai Rawit", qty: 25 },
        { name: "Bawang Putih", qty: 10 },
        { name: "Minyak Goreng", qty: 100 },
      ],
    },
    {
      name: "Ayam Geprek Double",
      description: "Dua potong ayam fillet geprek untuk yang lapar berat",
      price: 27000,
      categoryId: katAyam.id,
      recipe: [
        { name: "Ayam Fillet", qty: 300 },
        { name: "Tepung Kremes", qty: 120 },
        { name: "Cabai Rawit", qty: 45 },
        { name: "Bawang Putih", qty: 15 },
        { name: "Minyak Goreng", qty: 180 },
      ],
    },
    {
      name: "Nasi Putih",
      description: "Nasi putih hangat porsi standar",
      price: 5000,
      categoryId: katNasi.id,
      recipe: [{ name: "Beras", qty: 150 }],
    },
    {
      name: "Tahu Crispy",
      description: "Tahu crispy goreng garing, cocok jadi teman geprek",
      price: 5000,
      categoryId: katLauk.id,
      recipe: [
        { name: "Tahu", qty: 2 },
        { name: "Tepung Kremes", qty: 20 },
        { name: "Minyak Goreng", qty: 40 },
      ],
    },
    {
      name: "Tempe Crispy",
      description: "Tempe crispy goreng garing",
      price: 5000,
      categoryId: katLauk.id,
      recipe: [
        { name: "Tempe", qty: 2 },
        { name: "Tepung Kremes", qty: 20 },
        { name: "Minyak Goreng", qty: 40 },
      ],
    },
    {
      name: "Telur Ceplok",
      description: "Telur ceplok goreng matang sesuai selera",
      price: 5000,
      categoryId: katLauk.id,
      recipe: [
        { name: "Telur", qty: 1 },
        { name: "Minyak Goreng", qty: 20 },
      ],
    },
    {
      name: "Terong Balado",
      description: "Terong goreng disiram sambal balado pedas manis",
      price: 6000,
      categoryId: katLauk.id,
      recipe: [
        { name: "Terong", qty: 1 },
        { name: "Cabai Rawit", qty: 15 },
        { name: "Minyak Goreng", qty: 30 },
      ],
    },
    {
      name: "Es Teh Manis",
      description: "Teh manis dingin segar",
      price: 4000,
      categoryId: katMinuman.id,
      recipe: [
        { name: "Teh Celup", qty: 1 },
        { name: "Gula Pasir", qty: 20 },
        { name: "Es Batu", qty: 150 },
      ],
    },
    {
      name: "Es Jeruk",
      description: "Es jeruk peras segar",
      price: 6000,
      categoryId: katMinuman.id,
      recipe: [
        { name: "Jeruk Nipis", qty: 2 },
        { name: "Gula Pasir", qty: 25 },
        { name: "Es Batu", qty: 150 },
      ],
    },
    {
      name: "Teh Hangat",
      description: "Teh manis hangat",
      price: 3000,
      categoryId: katMinuman.id,
      recipe: [
        { name: "Teh Celup", qty: 1 },
        { name: "Gula Pasir", qty: 20 },
      ],
    },
  ];

  for (const m of menuData) {
    await prisma.menuItem.create({
      data: {
        name: m.name,
        description: m.description,
        price: m.price,
        categoryId: m.categoryId,
        ingredients: {
          create: m.recipe.map((r) => ({
            ingredientId: ing[r.name],
            qtyPerPortion: r.qty,
          })),
        },
      },
    });
  }

  // ---------- Level Sambal (as free menu items, price 0, informational) ----------
  // Represented as note options in POS UI rather than DB rows.

  // ---------- Meja ----------
  for (let i = 1; i <= 8; i++) {
    await prisma.restaurantTable.create({
      data: {
        number: `Meja ${i}`,
        capacity: i % 3 === 0 ? 6 : 4,
        status: "KOSONG",
      },
    });
  }

  console.log("Seeding selesai!");
  console.log(`Login admin: admin / ${adminPassword}`);
  console.log(`Login kasir: kasir / ${kasirPassword}`);
  console.log(`Login dapur: dapur / ${dapurPassword}`);
  console.log("Segera ganti password ini lewat menu Pegawai setelah login pertama kali.");

  void kasir;
  void dapur;
  void admin;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
