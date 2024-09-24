import { FC, ReactNode, useState } from "react";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { LprSessionData } from "../../types";
import { FilterMatchMode } from "primereact/api";

interface Props {
  lprSessions: LprSessionData[];
  cameraBody: (arg1: LprSessionData) => ReactNode;
  vehicleBody: (arg1: LprSessionData) => ReactNode;
  formatTimestamp: (arg1: string) => string;
  calculateParkingTimeInHours: (arg1: string, arg2: string) => string;
}

const LprSesstionTable: FC<Props> = ({
  lprSessions,
  cameraBody,
  vehicleBody,
  formatTimestamp,
  calculateParkingTimeInHours,
}) => {
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters = { ...filters };

    // @ts-ignore
    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
      <div className="border-b-2">
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Filter by Lot, Plate, Entry, Exit"
          className="w-full px-4 py-2 mb-2 border-2"
        />
      </div>
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
      ]}
      filters={filters}
      paginator
      rows={5}
      pageLinkSize={2}
      rowsPerPageOptions={[5, 10, 25, 50]}
      value={lprSessions}
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
      className="w-full"
    >
      <Column
        field="lot.siteCode"
        header="Lot"
        headerClassName="w-[13%]"
      ></Column>
      <Column
        field="camera"
        header="Camera"
        body={cameraBody}
        headerClassName="w-[14%]"
      ></Column>
      <Column
        field="plateNumber"
        header="Plate"
        headerClassName="w-[16%]"
      ></Column>
      <Column
        field="vehicle"
        header="Vehicle & Plate"
        headerClassName="w-[16%]"
        body={vehicleBody}
      ></Column>
      <Column
        field="entryTime"
        header="Entry"
        body={(item: LprSessionData) =>
          item.entryTime && formatTimestamp(item.entryTime)
        }
        headerClassName="w-[11%]"
      ></Column>
      <Column
        field="exitTime"
        header="Exit"
        headerClassName="w-[11%]"
        body={(item: LprSessionData) =>
          item.exitTime && formatTimestamp(item.exitTime)
        }
      ></Column>
      <Column
        header="Parking"
        body={(item) =>
          item.entryTime &&
          item.exitTime &&
          calculateParkingTimeInHours(item.entryTime, item.exitTime)
        }
      ></Column>
    </DataTable>
  );
};

export default LprSesstionTable;
