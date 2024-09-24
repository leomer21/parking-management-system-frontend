import { Dialog } from "primereact/dialog";
import { Accordion, AccordionTab } from "primereact/accordion";
import { useEffect, useState } from "react";
import Permits from "../pages/Permits";
import copy from "copy-to-clipboard";
import { Button as PrimeButton } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { showToast } from "../utils";
import { LotType, PayingApp, UserType, ZoneType } from "../types";
import { confirmDialog } from "primereact/confirmdialog";
import ParkingSession from "./ParkingSession";
import { useAuthorize } from "../store/store";
import { MultiSelect } from "primereact/multiselect";
import MyCalendar from "./MyCalendar";

import axios from "axios";
import { defaultZone, payingApps } from "../config";

const LotCard = ({
  lot,
  fetchLot,
  endUsers,
  zones,
}: {
  lot: LotType;
  fetchLot: () => Promise<void>;
  endUsers: UserType[];
  zones: ZoneType[];
}) => {
  const { user } = useAuthorize();

  const [pApps, setPApps] = useState<PayingApp[]>([]);
  const [lotOwners, setLotOwners] = useState<UserType[]>([]);
  const [visible, setVisible] = useState(false);
  const [editable, setEditable] = useState<boolean>(false);
  const [zone, setZone] = useState<ZoneType>(defaultZone);
  const [percentage, setPercentage] = useState<number[]>([50, 50]);
  const [hourlyRate, setHourlyRate] = useState<number>(5);
  const [payTime, setPayTime] = useState<number>(15);
  const [fine, setFine] = useState<number>(45);
  const [fee, setFee] = useState<number>(1.5);
  const [address, setAddress] = useState("");

  const handleClick = async () => {
    if (editable) {
      if (pApps.length === 0) {
        showToast("Please select Paying Apps!");
        return;
      }
      // if (payingApp.name === "Flowbird" && zone.Name.length === 0) {
      //   showToast("Please select enforcement zone!");
      //   return;
      // }
      if (address.length === 0) {
        showToast("Please input lot address!");
        return;
      }
      // if (payingApp.name !== "Flowbird" && Number.isNaN(hourlyRate)) {
      //   showToast("Please input hourly rate correctly!");
      //   return;
      // }
      if (Number.isNaN(payTime)) {
        showToast("Please input payment time correctly!");
        return;
      }
      if (Number.isNaN(fine)) {
        showToast("Please input fine correctly!");
        return;
      }
      if (Number.isNaN(fee)) {
        showToast("Please input fee correctly!");
        return;
      }
      if (Number.isNaN(percentage[0])) {
        showToast("Please input percentage correctly!");
        return;
      }
      if (!lotOwners || lotOwners?.length === 0) {
        showToast("Please select lot owner!");
        return;
      }

      try {
        await axios.put(`/lot/${lot._id}`, {
          zone: zone ? zone.Name[0] : undefined,
          address,
          hourlyRate,
          payTime,
          fine,
          fee,
          percentage: percentage[0],
          pApps: pApps.map((p) => p.name),
          owners: lotOwners.map((owner) => owner.email),
        });

        showToast("Updated a lot successfully", true);
      } catch (error) {
        showToast("Server error");
      }

      await fetchLot();
    }
    setEditable(!editable);
  };

  const handleRemove = async () => {
    try {
      await axios.delete(`/lot/${lot._id}`);
      showToast("Deleted a lot successfully", true);
    } catch (error) {
      showToast("Server error");
    }

    await fetchLot();
  };

  const handleDefaultValue = () => {
    lot.owners.length > 0 &&
      setLotOwners(endUsers.filter((user) => lot.owners.includes(user.email)));
    lot.percentage && setPercentage([lot.percentage, 100 - lot.percentage]);
    lot.hourlyRate && setHourlyRate(lot.hourlyRate);
    lot.payTime && setPayTime(lot.payTime);
    lot.fine && setFine(lot.fine);
    lot.fee && setFee(lot.fee);
    lot.address && setAddress(lot.address);
    lot.zone && setZone(zones.filter((zone) => zone.Name[0] === lot.zone)[0]);
    lot.pApps &&
      setPApps(payingApps.filter((app) => lot.pApps.includes(app.name)));
    setEditable(false);
  };

  useEffect(() => {
    handleDefaultValue();
  }, [lot, endUsers, zones]);

  return (
    <>
      <div
        onClick={() => setVisible(true)}
        className="flex flex-col items-center cursor-pointer group shadow-xl overflow-hidden p-2"
      >
        <img
          className="flex-1 group-hover:scale-[1.05] transition-all ease-in-out duration-1000"
          src={`${import.meta.env.VITE_API_PUBLIC_URL}/${lot.cover}`}
        />
        <span className="font-bold">{lot.siteCode}</span>
      </div>

      {visible && (
        <Dialog
          pt={{
            root: {
              className: "w-full md:w-[80vw]",
              style: { width: "", maxHeight: "80vh" },
            },
            header: { className: "p-2" },
          }}
          header={() => (
            <div className="flex items-center gap-4">
              <img
                className="w-32 rounded-md"
                src={`${import.meta.env.VITE_API_PUBLIC_URL}/${lot.cover}`}
              />
              <span>{lot.siteCode}</span>
              {editable ? (
                <MultiSelect
                  value={lotOwners}
                  options={endUsers}
                  disabled={!editable}
                  filter
                  onChange={(e) => {
                    setLotOwners(e.value);
                  }}
                  optionLabel="email"
                  pt={{
                    root: { className: "border border-black" },
                    checkbox: { className: "border border-black" },
                  }}
                  placeholder="Select Owners"
                  itemTemplate={(option) => {
                    return (
                      <div className="flex items-center gap-1">
                        <img
                          className="rounded-full w-10 h-10 min-w-10 min-h-10 float-right"
                          src={
                            option.photoURL ||
                            `${
                              import.meta.env.VITE_API_BACKEND_URL
                            }public/user.png`
                          }
                        />
                        <div>{option.email}</div>
                      </div>
                    );
                  }}
                  className="flex-1 md:w-20rem text-xs"
                  display="chip"
                />
              ) : (
                <i className="flex-1 text-xs">
                  Owners: {lot.owners.join(", ")}
                </i>
              )}
              {user?.customClaims.admin && (
                <PrimeButton
                  className="text-center"
                  onClick={handleClick}
                  style={{ fontSize: 20, padding: "5px 20px" }}
                >
                  {editable ? "Save" : "Edit"}
                </PrimeButton>
              )}
            </div>
          )}
          visible={visible}
          style={{ width: "50vw", maxHeight: "80vh" }}
          onHide={() => {
            setVisible(false);
            handleDefaultValue();
          }}
        >
          {user?.customClaims.admin && (
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center max-lg:flex-col max-lg:items-start">
                <span className="w-40">Paying App</span>
                <MultiSelect
                  value={pApps}
                  options={payingApps}
                  disabled={!editable}
                  filter
                  onChange={(e) => {
                    setPApps(e.value);
                  }}
                  optionLabel="name"
                  pt={{
                    root: { className: "border border-black" },
                    checkbox: { className: "border border-black" },
                  }}
                  placeholder="Select Paying Apps"
                  itemTemplate={(option) => {
                    return (
                      <div className="flex items-center gap-1">
                        <img
                          className="rounded-full w-10 h-10 min-w-10 min-h-10 float-right"
                          src={option.url}
                        />
                        <div>{option.name}</div>
                      </div>
                    );
                  }}
                  className="w-full md:w-20rem"
                  display="chip"
                />
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start">
                <span className="w-40">Zone:</span>
                <Dropdown
                  value={zone} // Update selected value
                  options={zones} // Update options
                  disabled={!editable}
                  filter
                  onChange={(e) => setZone(e.value)} // Update onChange function
                  optionLabel="Name" // Update optionLabel to display the name of the zones data
                  placeholder="Select an enforcement Zone"
                  pt={{
                    root: { className: "border border-black" },
                  }}
                  itemTemplate={(option) => (
                    <div className="flex items-center gap-1">
                      <div>{option.Name[0]}</div>
                    </div>
                  )}
                  className="w-full md:w-20rem text-xs"
                />
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start">
                <span className="w-40">Lot Code:</span>
                <div className="relative w-full flex items-center border border-black rounded-md bg-black/5">
                  <button
                    onClick={() => {
                      copy(
                        `url=${import.meta.env.VITE_API_SENDER_URL}&token=${
                          lot.token
                        }`
                      );
                      showToast("Copied to clipboard!", true);
                    }}
                    className="p-2 z-10 bg-[#f0f0f0] rounded-l-md border-r border-black hover:opacity-80 active:bg-orange-100 ease-in-out transition-all"
                  >
                    <svg width={20} height={20}>
                      <use href="#svg-copy" />
                    </svg>
                  </button>
                  <div className="absolute left-0 w-full overflow-x-auto pl-[60px] text-nowrap">{`url=${
                    import.meta.env.VITE_API_SENDER_URL
                  }&token=${lot.token}`}</div>
                </div>
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start">
                <span className="w-40">URL:</span>
                <i className="w-full border border-black px-4 py-1 rounded-md min-w-[200px] overflow-x-auto block">
                  {lot.url}
                </i>
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start">
                <span className="w-40">Address:</span>
                <input
                  onChange={(e) => setAddress(e.target.value)}
                  value={address}
                  disabled={!editable}
                  className="col-span-3 w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                  placeholder="1300 DUVAL ST, KEY WEST"
                />
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start">
                <span className="w-40">Hourly rate ( $ )</span>
                <input
                  onChange={(e) => setHourlyRate(parseInt(e.target.value, 10))}
                  value={hourlyRate}
                  disabled={!editable}
                  min={0}
                  type="number"
                  className="col-span-3 w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                  placeholder="Charge ammount per hour"
                />
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start">
                <span className="w-40">Pay time ( m )</span>
                <input
                  onChange={(e) => setPayTime(parseInt(e.target.value, 10))}
                  value={payTime}
                  disabled={!editable}
                  min={0}
                  type="number"
                  className="col-span-3 w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                  placeholder="Time for payment"
                />
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start">
                <span className="w-40">Fine ( $ )</span>
                <input
                  onChange={(e) => setFine(parseInt(e.target.value, 10))}
                  value={fine}
                  min={0}
                  disabled={!editable}
                  type="number"
                  className="w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                  placeholder="Fine for violation"
                />
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start">
                <span className="w-40">Fee ( $ )</span>
                <input
                  onChange={(e) => setFee(parseFloat(e.target.value))}
                  value={fee}
                  min={0}
                  disabled={!editable}
                  type="number"
                  className="w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                  placeholder="Transaction fee"
                />
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start">
                <span className="w-40">Percentage</span>
                <div className="flex justify-between col-span-3 w-full py-1 gap-10">
                  <div className="text-center">
                    <span className="w-40 mb-2">Super Admin ( % )</span>
                    <input
                      type="number"
                      onChange={(e) =>
                        +e.target.value <= 100 &&
                        +e.target.value >= 0 &&
                        setPercentage([
                          parseInt(e.target.value, 10),
                          100 - parseInt(e.target.value, 10),
                        ])
                      }
                      disabled={!editable}
                      value={percentage[0]}
                      className="col-span-3 w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                      placeholder="Super admin percentage for this lot"
                    />
                  </div>
                  <div className="text-center">
                    <span className="w-40 mb-2">End User ( % )</span>
                    <input
                      type="number"
                      disabled={!editable}
                      onChange={(e) =>
                        +e.target.value <= 100 &&
                        +e.target.value >= 0 &&
                        setPercentage([
                          100 - parseInt(e.target.value, 10),
                          parseInt(e.target.value, 10),
                        ])
                      }
                      value={percentage[1]}
                      className="col-span-3 w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                      placeholder="End user percentage for this lot"
                    />
                  </div>
                </div>
              </div>
              <PrimeButton
                className="w-full min-w-[200px] text-center justify-center"
                onClick={() => {
                  confirmDialog({
                    message: "Do you want to delete this record?",
                    header: "Delete Confirmation",
                    icon: "pi pi-info-circle",
                    defaultFocus: "reject",
                    acceptClassName: "p-button-danger",
                    accept: handleRemove,
                    // reject
                  });
                }}
              >
                Remove this lot
              </PrimeButton>
            </div>
          )}
          <Accordion activeIndex={0} className="mt-4">
            <AccordionTab header="Parking Sessions">
              <ParkingSession lotId={lot._id} />
            </AccordionTab>
            <AccordionTab header="Permits">
              <Permits lotId={lot._id} />
            </AccordionTab>
            <AccordionTab header="Unenforcable Dates">
              <MyCalendar lotId={lot._id} />
            </AccordionTab>
          </Accordion>
        </Dialog>
      )}
    </>
  );
};

export default LotCard;
