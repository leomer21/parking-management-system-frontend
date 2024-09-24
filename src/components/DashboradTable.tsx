import { FC, useState } from "react";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { LprSessionData } from "../types";
import HtmlTooltip from "./HtmlToolTip";
import { calculateParkingTimeInHours, formatTimestamp } from "../utils";

interface Props {
  lprSessions: LprSessionData[];
}

const LprSesstionTable: FC<Props> = ({ lprSessions }) => {
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

  const cameraBody = (product: LprSessionData) => (
    <HtmlTooltip
      title={
        <div>
          <p>Entrance : {product.camera1 || "No Enterance"}</p>
          <p>Exit : {product.camera2 || "Currently Parking..."}</p>
        </div>
      }
    >
      <span className={`underline text-blue-500 cursor-pointer`}>
        Camera URL
      </span>
    </HtmlTooltip>
  );

  const vehicleBody = (product: LprSessionData) => (
    <HtmlTooltip
      title={
        <div className="flex gap-4">
          <div className="w-[50%]">
            <span className="text-xl text-black">(Entrance)</span>
            {product.vehicle1 ? (
              <div className="flex flex-col gap-2 justify-center items-center">
                <img
                  src={`${import.meta.env.VITE_API_PUBLIC_URL}/${
                    product.vehicle1
                  }`}
                />
                <img
                  src={`${import.meta.env.VITE_API_PUBLIC_URL}/${
                    product.plate1
                  }`}
                />
              </div>
            ) : (
              <p>No Enterance</p>
            )}
          </div>
          <div className="w-[50%]">
            <span className="text-xl text-black">(Exit)</span>
            {product.vehicle2 ? (
              <div className="flex flex-col gap-2 justify-center items-center">
                <img
                  src={`${import.meta.env.VITE_API_PUBLIC_URL}/${
                    product.vehicle2
                  }`}
                />
                <img
                  src={`${import.meta.env.VITE_API_PUBLIC_URL}/${
                    product.plate2
                  }`}
                />
              </div>
            ) : (
              <p>Currently Parking...</p>
            )}
          </div>
        </div>
      }
    >
      <span className={`underline text-blue-500 cursor-pointer`}>
        (Entrance Exit)
      </span>
    </HtmlTooltip>
  );

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
