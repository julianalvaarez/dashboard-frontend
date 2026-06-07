import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from "axios";
export const FiltersTable = ({ table, setTransactions }) => {

  // 🔹 Función para eliminar seleccionados
  const handleDeleteSelected = async () => {
    const confirmed = window.confirm("¿Estás seguro de que deseas eliminar las transacciones seleccionadas?");
    if (!confirmed) return;

    const selectedIds = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id);

    try {
      const { data } = await axios.delete("https://dashboard-backend-kmpv.onrender.com/transactions", {
        data: { ids: selectedIds }, // 👈 mandamos array en el body
      });

      // actualizar estado en frontend
      setTransactions((prev) => prev.filter((t) => !selectedIds.includes(t.id)));
      table.resetRowSelection();

      console.log(data.message);
    } catch (error) {
      console.error("Error eliminando transacciones:", error);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filtrar por descripción..."
          value={table.getColumn("description")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("description")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Button
            variant="destructive"
            onClick={handleDeleteSelected}
            className="ml-4"
          >
            Eliminar seleccionados
          </Button>
        )}
      </div>
    </>
  )
}
