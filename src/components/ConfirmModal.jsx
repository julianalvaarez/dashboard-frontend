import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import axios from "axios";

export function ConfirmModal({ open, setOpen, setTransactions }) {
  const deleteTransaction = async (id) => {
      try {
        await axios.delete(`https://dashboard-backend-kmpv.onrender.com/transactions/${id}`);
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      } catch (error) {
        console.error("Error eliminando transacción:", error);
      } finally {
        setOpen({ isOpen: false, transactionId: null });
      }
  };
    return (
    <AlertDialog open={open.isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro de que deseas eliminar esta transacción?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteTransaction(open.transactionId)} >Eliminar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
