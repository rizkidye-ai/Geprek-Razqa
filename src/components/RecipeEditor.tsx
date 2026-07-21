"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type Ingredient = { id: string; name: string; unit: string };
type RecipeRow = { ingredientId: string; qtyPerPortion: number | string };

export function RecipeEditor({
  ingredients,
  initialRecipe = [],
}: {
  ingredients: Ingredient[];
  initialRecipe?: RecipeRow[];
}) {
  const [rows, setRows] = useState<RecipeRow[]>(
    initialRecipe.length > 0 ? initialRecipe : [{ ingredientId: "", qtyPerPortion: "" }]
  );

  const addRow = () => setRows([...rows, { ingredientId: "", qtyPerPortion: "" }]);
  const removeRow = (idx: number) => setRows(rows.filter((_, i) => i !== idx));
  const updateRow = (idx: number, field: keyof RecipeRow, value: string) => {
    const next = [...rows];
    next[idx] = { ...next[idx], [field]: value };
    setRows(next);
  };

  const ingredientUnit = (id: string) => ingredients.find((i) => i.id === id)?.unit ?? "";

  return (
    <div className="space-y-2">
      {rows.map((row, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <select
            name="ingredientId"
            value={row.ingredientId}
            onChange={(e) => updateRow(idx, "ingredientId", e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="">Pilih bahan...</option>
            {ingredients.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <input
            name="qtyPerPortion"
            type="number"
            step="0.01"
            min="0"
            value={row.qtyPerPortion}
            onChange={(e) => updateRow(idx, "qtyPerPortion", e.target.value)}
            placeholder="Jumlah"
            className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          />
          <span className="w-14 text-xs text-gray-400">{ingredientUnit(row.ingredientId)}</span>
          <button
            type="button"
            onClick={() => removeRow(idx)}
            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700"
      >
        <Plus size={14} /> Tambah bahan
      </button>
    </div>
  );
}
