"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { createOrderAction, type CartItem } from "@/app/(app)/kasir/actions";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  categoryName: string;
};

type TableOption = {
  id: string;
  number: string;
  status: string;
};

export function KasirClient({
  menuItems,
  tables,
}: {
  menuItems: MenuItem[];
  tables: TableOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cart, setCart] = useState<Record<string, { qty: number; note: string }>>({});
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY">("DINE_IN");
  const [tableId, setTableId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"TUNAI" | "QRIS" | "TRANSFER">("TUNAI");
  const [cashReceived, setCashReceived] = useState("");
  const [payLater, setPayLater] = useState(false);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    menuItems.forEach((m) => map.set(m.categoryId, m.categoryName));
    return Array.from(map.entries());
  }, [menuItems]);

  const filteredMenu = menuItems.filter((m) => {
    const matchesCategory = activeCategory === "all" || m.categoryId === activeCategory;
    const matchesSearch = m.name.toLowerCase().includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (id: string) => {
    setCart((prev) => ({
      ...prev,
      [id]: { qty: (prev[id]?.qty ?? 0) + 1, note: prev[id]?.note ?? "" },
    }));
  };

  const changeQty = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const nextQty = current.qty + delta;
      if (nextQty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { ...current, qty: nextQty } };
    });
  };

  const setNote = (id: string, note: string) => {
    setCart((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], note } } : prev));
  };

  const cartEntries = Object.entries(cart);
  const menuMap = useMemo(() => new Map(menuItems.map((m) => [m.id, m])), [menuItems]);

  const total = cartEntries.reduce((sum, [id, item]) => {
    const menu = menuMap.get(id);
    return sum + (menu ? menu.price * item.qty : 0);
  }, 0);

  const cashReceivedNum = parseInt(cashReceived || "0", 10);
  const change = cashReceivedNum - total;

  const quickCashOptions = useMemo(() => {
    if (total <= 0) return [];
    const denominations = [5000, 10000, 20000, 50000, 100000];
    const options = new Set<number>([total]);
    for (const d of denominations) {
      const rounded = Math.ceil(total / d) * d;
      if (rounded > total) options.add(rounded);
    }
    return Array.from(options)
      .sort((a, b) => a - b)
      .slice(0, 5);
  }, [total]);

  const handleSubmit = () => {
    setError("");
    if (cartEntries.length === 0) {
      setError("Keranjang masih kosong.");
      return;
    }
    if (orderType === "DINE_IN" && !tableId) {
      setError("Pilih meja terlebih dahulu.");
      return;
    }
    const willPayNow = !(orderType === "DINE_IN" && payLater);
    if (willPayNow && paymentMethod === "TUNAI" && (Number.isNaN(cashReceivedNum) || cashReceivedNum < total)) {
      setError("Uang tunai kurang dari total belanja.");
      return;
    }

    const items: CartItem[] = cartEntries.map(([menuItemId, item]) => ({
      menuItemId,
      qty: item.qty,
      note: item.note || undefined,
    }));

    startTransition(async () => {
      try {
        const result = await createOrderAction({
          orderType,
          tableId: orderType === "DINE_IN" ? tableId : undefined,
          customerName: customerName || undefined,
          items,
          paymentMethod: willPayNow ? paymentMethod : undefined,
          cashReceived: willPayNow && paymentMethod === "TUNAI" ? cashReceivedNum : undefined,
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        router.push(`/struk/${result.orderId}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal membuat pesanan.");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari menu... (mis. geprek, es teh)"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              activeCategory === "all" ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            Semua
          </button>
          {categories.map(([id, name]) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                activeCategory === id
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filteredMenu.map((m) => (
            <button
              key={m.id}
              onClick={() => addToCart(m.id)}
              className="rounded-2xl bg-white p-3 text-left shadow-sm ring-1 ring-gray-100 hover:shadow-md hover:ring-2 hover:ring-orange-300 transition"
            >
              <p className="text-sm font-semibold text-gray-900">{m.name}</p>
              <p className="mt-1 text-xs text-gray-500">{formatRupiah(m.price)}</p>
              {cart[m.id] && (
                <span className="mt-2 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                  {cart[m.id].qty} di keranjang
                </span>
              )}
            </button>
          ))}
          {filteredMenu.length === 0 && (
            <p className="col-span-full text-sm text-gray-400">Tidak ada menu aktif di kategori ini.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 h-fit lg:sticky lg:top-20">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <ShoppingCart size={16} /> Keranjang
        </h2>

        <div className="mb-3 flex gap-2">
          <button
            onClick={() => setOrderType("DINE_IN")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium ${
              orderType === "DINE_IN" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Makan di Tempat
          </button>
          <button
            onClick={() => {
              setOrderType("TAKEAWAY");
              setPayLater(false);
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium ${
              orderType === "TAKEAWAY" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Bawa Pulang
          </button>
        </div>

        {orderType === "DINE_IN" && (
          <>
            <select
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Pilih meja</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.number} {t.status === "TERISI" ? "(terisi)" : ""}
                </option>
              ))}
            </select>

            <div className="mb-3 flex gap-2">
              <button
                onClick={() => setPayLater(false)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium ${
                  !payLater ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                Bayar Sekarang
              </button>
              <button
                onClick={() => setPayLater(true)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium ${
                  payLater ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                Bayar Saat Pulang
              </button>
            </div>
          </>
        )}

        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Nama pelanggan (opsional)"
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />

        <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
          {cartEntries.length === 0 && (
            <p className="text-sm text-gray-400">Belum ada item dipilih.</p>
          )}
          {cartEntries.map(([id, item]) => {
            const menu = menuMap.get(id);
            if (!menu) return null;
            return (
              <div key={id} className="rounded-lg border border-gray-100 p-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">{menu.name}</p>
                  <button onClick={() => setCart((prev) => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                  })} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeQty(id, -1)}
                      className="rounded-full bg-gray-100 p-1 text-gray-600 hover:bg-gray-200"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-sm">{item.qty}</span>
                    <button
                      onClick={() => changeQty(id, 1)}
                      className="rounded-full bg-gray-100 p-1 text-gray-600 hover:bg-gray-200"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {formatRupiah(menu.price * item.qty)}
                  </p>
                </div>
                <input
                  value={item.note}
                  onChange={(e) => setNote(id, e.target.value)}
                  placeholder="Catatan (mis. level 5, tanpa nasi)"
                  className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-xs"
                />
              </div>
            );
          })}
        </div>

        <div className="mb-3 flex items-center justify-between border-t border-gray-100 pt-3 text-sm font-semibold text-gray-900">
          <span>Total</span>
          <span>{formatRupiah(total)}</span>
        </div>

        {payLater ? (
          <div className="mb-3 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700">
            Pesanan akan dikirim ke dapur tanpa pembayaran. Kasir memproses pembayaran nanti di
            halaman <span className="font-medium">Pesanan &amp; Dapur</span> saat pelanggan pulang.
          </div>
        ) : (
          <>
            <div className="mb-3 grid grid-cols-3 gap-2">
              {(["TUNAI", "QRIS", "TRANSFER"] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-lg py-1.5 text-xs font-medium ${
                    paymentMethod === method ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {paymentMethod === "TUNAI" && (
              <div className="mb-3 space-y-2">
                <input
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  type="number"
                  min="0"
                  placeholder="Uang diterima"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                {quickCashOptions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {quickCashOptions.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setCashReceived(String(amount))}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                          cashReceivedNum === amount
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {amount === total ? "Uang Pas" : formatRupiah(amount)}
                      </button>
                    ))}
                  </div>
                )}
                {cashReceived && (
                  <p className={`text-xs ${change < 0 ? "text-red-500" : "text-gray-500"}`}>
                    Kembalian: {formatRupiah(Math.max(change, 0))}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {error && (
          <div className="mb-3 flex items-start justify-between rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            <span>{error}</span>
            <button onClick={() => setError("")}>
              <X size={14} />
            </button>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-900/20 transition hover:shadow-orange-900/30 disabled:opacity-60"
        >
          {isPending ? "Memproses..." : payLater ? "Kirim Pesanan (Bayar Nanti)" : "Buat Pesanan & Bayar"}
        </button>
      </div>
    </div>
  );
}
