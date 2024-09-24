import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { PermitType } from "../types";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function PermitsTable({
  permits,
  handleDelete,
}: {
  permits: PermitType[];
  handleDelete: (id: string | undefined) => void;
}) {
  const renderDelete = (permit: PermitType) => {
    return (
      <button
        onClick={(e) =>
          confirmPopup({
            target: e.currentTarget,
            message: "Do you want to delete this record?",
            accept: () => handleDelete(permit._id),
            reject: () => {},
            defaultFocus: "reject",
            acceptClassName: "p-danger",
          })
        }
        className="max-md:w-full px-4 py-1 bg-red-500 text-white text-sm hover:opacity-80 transition-all ease-in-out rounded-md"
      >
        Delete
      </button>
    );
  };

  return (
    <div className="p-2 bg-white rounded-lg w-full">
      <ConfirmPopup />
      <DataTable
        value={permits}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: "10rem" }}
        pt={{
          thead: { className: "text-[14px]" },
          paginator: {
            pageButton: ({ context }: { context: any }) => ({
              className: context.active ? "bg-blue-500 text-white" : undefined,
            }),
          },
        }}
      >
        <Column field="name" header="Name"></Column>
        <Column field="reason" header="Reason"></Column>
        <Column field="plate" header="Plate"></Column>
        <Column
          header="Lot"
          body={(item: PermitType) => item.lot?.siteCode || "ALL LOTS"}
        ></Column>
        <Column
          field="delete"
          header="Delete"
          style={{ width: "10%" }}
          body={renderDelete}
        ></Column>
      </DataTable>
    </div>
  );
}
