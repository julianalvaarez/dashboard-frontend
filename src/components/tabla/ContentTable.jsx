import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { flexRender } from "@tanstack/react-table"

export const ContentTable = ({table, columns, sumAmounts, transactions}) => {
    

const totalUsd = transactions.reduce((acc, transaction) => {
    return transaction.type === "expense" ? acc - (transaction.amount / transaction.usd_rate) : acc + (transaction.amount / transaction.usd_rate);
  }, 0)

  return (
    <>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={`${cell.row.original.amount < 0 ? 'text-red-700' : 'text-green-700'}`}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow> 
              ))  
                                  
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex justify-end items-center bg-gray-100 p-4 text-lg font-semibold">
          Total: <span className={`${sumAmounts < 0 ? 'text-red-700' : 'text-green-700'} pl-2`}>${sumAmounts.toLocaleString("de-DE")}</span>
          <p className="text-sm text-muted-foreground pl-2">
            USD {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalUsd)}
          </p>
        </div>

      </div>        
    </>
  )
}
