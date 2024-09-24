import { FC, ReactNode, useState } from "react";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { LprSessionData } from "../../types";
import { FilterMatchMode } from "primereact/api";

interface Props {
  violations: LprSessionData[];
  reasonBody: (arg1: LprSessionData) => ReactNode;
  handleVisible: (arg1: LprSessionData) => void;
  formatTimestamp: (arg1: string) => string;
}

const ViolationTable: FC<Props> = ({
  violations,
  reasonBody,
  handleVisible,
  formatTimestamp,
}) => {
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters.global = { ..._filters.global, value };

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
      <div className="border-b-2">
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Filter by Lot, Plate, Entry, Exit, Notice"
          className="w-full px-4 py-2 mb-2 border-2"
        />
      </div>
    );
  };

  const statusBodyTemplate = (rowData: LprSessionData) => {
    return rowData.violationLogs.length ? (
      <p className="text-lime-400">✔</p>
    ) : (
      "❌"
    );
  };

  return (
    <DataTable
      header={renderHeader()}
      globalFilterFields={[
        "lot.siteCode",
        "plateNumber",
        "entryTime",
        "exitTime",
        "noticeNumber",
      ]}
      filters={filters}
      paginator
      rows={5}
      pageLinkSize={2}
      rowsPerPageOptions={[5, 10, 25, 50]}
      value={violations}
      tableStyle={{ minWidth: "50rem" }}
      pt={{
        thead: { className: "text-[14px]" },
        paginator: {
          pageButton: ({ context }: { context: any }) => ({
            className: context.active
              ? "bg-blue-500 text-white text-[12px]"
              : undefined,
          }),
        },
      }}
    >
      <Column field="lot.siteCode" header="Lot"></Column>
      <Column field="plateNumber" header="Plate"></Column>
      <Column
        field="entryTime"
        header="Entry"
        body={(item: LprSessionData) =>
          item.entryTime && formatTimestamp(item.entryTime)
        }
        style={{ width: "11%" }}
      ></Column>
      <Column
        field="exitTime"
        header="Exit"
        body={(item: LprSessionData) =>
          item.exitTime && formatTimestamp(item.exitTime)
        }
        style={{ width: "11%" }}
      ></Column>
      <Column field="reason" header="Reason" body={reasonBody}></Column>
      <Column field="noticeNumber" header="Notice"></Column>
      <Column
        header="Fine"
        body={(item: LprSessionData) => <p>${item.fine || item.lot.fine}</p>}
      ></Column>
      <Column field="status" header="Status" body={statusBodyTemplate}></Column>
      <Column
        header="Ticket"
        body={(item: LprSessionData) => (
          <div className="flex gap-1">
            <button
              className="temp_pdf temp_edit"
              onClick={() => handleVisible(item)}
            >
              Print
            </button>
            {item.ticketCheck && (
              <span className="flex gap-1">
                (<p className="text-lime-400">✔</p>)
              </span>
            )}
          </div>
        )}
      ></Column>
    </DataTable>
  );
};

export default ViolationTable;
