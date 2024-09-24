import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { Button } from "@tremor/react";
import UploadImage from "./UploadImage";
import { showToast } from "../utils";
import { useAuthorize } from "../store/store";
import ProgressLinearWithValueLabel from "./ProgressBar";
import LotCard from "./LotCard";
import { defaultZone, payingApps } from "../config";
import { LotType, PayingApp, UserType, ZoneType } from "../types";
import axios from "axios";

const LotComponent = () => {
  const { user } = useAuthorize();
  const [endUsers, setEndUsers] = useState<UserType[]>([]);
  const [lots, setLots] = useState<LotType[]>([]);
  const [zones, setZones] = useState<ZoneType[]>([]);
  const [file, setFile] = useState<File>();
  const [pApps, setPApps] = useState<PayingApp[]>([]);
  const [url, setUrl] = useState("");
  const [percentage, setPercentage] = useState<number[]>([50, 50]);
  const [hourlyRate, setHourlyRate] = useState<number>(5);
  const [fine, setFine] = useState<number>(45);
  const [fee, setFee] = useState<number>(1.5);
  const [payTime, setPayTime] = useState<number>(15);
  const [siteCode, setSiteCode] = useState("");
  const [zone, setZone] = useState<ZoneType>(defaultZone);
  const [address, setAddress] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [visible, setVisible] = useState<boolean>(false);
  const [lotOwners, setLotOwners] = useState<UserType[]>();

  const fetchLot = async () => {
    const { data } = await axios.get(`/lot`);
    setLots(data);
  };

  const handleCreate = async () => {
    if (pApps.length === 0) {
      showToast("Please select Paying Apps!");
      return;
    }
    // if (payingApp.name === "Flowbird" && zone.Name.length === 0) {
    //   showToast("Please select enforcement zone!");
    //   return;
    // }
    if (siteCode.length === 0) {
      showToast("Please input site code!");
      return;
    }
    if (!url.trim().startsWith("http")) {
      showToast("Please input url correctly!");
      return;
    }
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
    if (!file) {
      showToast("Select cover image!");
      return;
    }
    if (lots.filter((l) => l.siteCode.trim() === siteCode.trim()).length > 0) {
      showToast("Already registered siteCode!");
      return;
    }

    const formData = new FormData();

    formData.append("zone", zone.Name[0]);
    formData.append("siteCode", siteCode);
    formData.append("url", url);
    formData.append("address", address);
    formData.append("hourlyRate", hourlyRate.toString());
    formData.append("payTime", payTime.toString());
    formData.append("fine", fine.toString());
    formData.append("fee", fee.toString());
    formData.append("percentage", percentage[0].toString());
    lotOwners.forEach((w) => {
      formData.append("owners[]", w.email);
    });
    pApps.forEach((p) => {
      formData.append("pApps[]", p.name);
    });
    formData.append("cover", file);

    setUploadProgress(0);

    try {
      await axios.post(`/lot`, formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded /
              (progressEvent.total ? progressEvent.total : 10000000000)) *
              100
          );
          setUploadProgress(progress);
        },
      });

      showToast("Created a lot successfully", true);

      await fetchLot();

      setVisible(false);
    } catch (error) {
      showToast("Server error");
    }
  };

  const setDefaultValues = () => {
    setPApps([]);
    setZone(defaultZone);
    setSiteCode("");
    setUrl("");
    setAddress("");
    setHourlyRate(5);
    setPayTime(15);
    setFine(45);
    setFee(1.5);
    setPercentage([50, 50]);
    setFile(undefined);
    setUploadProgress(0);
    setLotOwners(undefined);
  };

  useEffect(() => {
    fetchZone();
    fetchLot();
    user?.customClaims.admin && fetchEndUsers();
  }, []);

  const fetchEndUsers = async () => {
    const { data } = await axios.get(`/user/end-users`);
    setEndUsers(data);
  };

  const fetchZone = async () => {
    const { data } = await axios("/zone");
    if ("ArrayOfEnforcementZone" in data)
      setZones(data.ArrayOfEnforcementZone.EnforcementZone);
  };

  return (
    <>
      {user?.customClaims.admin && (
        <Button
          variant="primary"
          onClick={() => {
            setDefaultValues();
            setVisible(true);
          }}
        >
          Create a new lot
        </Button>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {lots.map((lot, i) => (
          <LotCard
            key={i}
            lot={lot}
            fetchLot={fetchLot}
            endUsers={endUsers}
            zones={zones}
          />
        ))}
      </div>
      <Dialog
        pt={{
          root: {
            className: "w-full md:w-[80vw]",
            style: { width: "", maxHeight: "80vh" },
          },
        }}
        header="Create new lot"
        visible={visible}
        style={{ width: "50vw", maxHeight: "80vh" }}
        onHide={() => setVisible(false)}
      >
        <div className="flex flex-col gap-2 w-full max-md:p-1 p-4">
          <div className="flex items-center max-lg:flex-col max-lg:items-start">
            <span className="w-40">Paying App</span>
            <MultiSelect
              value={pApps}
              options={payingApps}
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
            <span className="w-40">Zone</span>
            <Dropdown
              value={zone} // Update selected value
              options={zones} // Update options
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
            <span className="w-40">Site Code</span>
            <input
              onChange={(e) => setSiteCode(e.target.value)}
              value={siteCode}
              className="w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
              placeholder="FL 101"
            />
          </div>
          <div className="flex items-center max-lg:flex-col max-lg:items-start">
            <span className="w-40 mb-2">URL for UI</span>
            <input
              onChange={(e) => setUrl(e.target.value)}
              value={url}
              className="w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
              placeholder="https://..."
            />
          </div>
          <div className="flex items-center max-lg:flex-col max-lg:items-start">
            <span className="w-40">Address</span>
            <input
              onChange={(e) => setAddress(e.target.value)}
              value={address}
              className="w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
              placeholder="1300 DUVAL ST, KEY WEST"
            />
          </div>
          <div className="flex items-center max-lg:flex-col max-lg:items-start">
            <span className="w-40">Hourly rate ( $ )</span>
            <input
              onChange={(e) => setHourlyRate(parseInt(e.target.value, 10))}
              value={hourlyRate}
              min={0}
              type="number"
              className="w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
              placeholder="Charge ammount per hour"
            />
          </div>
          <div className="flex items-center max-lg:flex-col max-lg:items-start">
            <span className="w-40">Pay time ( m )</span>
            <input
              onChange={(e) => setPayTime(parseInt(e.target.value, 10))}
              value={payTime}
              min={0}
              type="number"
              className="w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
              placeholder="Time for payment"
            />
          </div>
          <div className="flex items-center max-lg:flex-col max-lg:items-start">
            <span className="w-40">Fine ( $ )</span>
            <input
              onChange={(e) => setFine(parseInt(e.target.value, 10))}
              value={fine}
              min={0}
              type="number"
              className="w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
              placeholder="Time for payment"
            />
          </div>
          <div className="flex items-center max-lg:flex-col max-lg:items-start">
            <span className="w-40">Fee ( $ )</span>
            <input
              onChange={(e) => setFee(parseFloat(e.target.value))}
              value={fee}
              min={0}
              type="number"
              className="w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
              placeholder="Time for payment"
            />
          </div>
          <div className="flex items-center max-lg:flex-col max-lg:items-start">
            <span className="w-40">Percentage</span>
            <div className="flex justify-between w-full py-1 gap-10">
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
                  value={percentage[0]}
                  className="w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                  placeholder="Super admin percentage for this lot"
                />
              </div>
              <div className="text-center">
                <span className="w-40 mb-2">End User ( % )</span>
                <input
                  type="number"
                  onChange={(e) =>
                    +e.target.value <= 100 &&
                    +e.target.value >= 0 &&
                    setPercentage([
                      100 - parseInt(e.target.value, 10),
                      parseInt(e.target.value, 10),
                    ])
                  }
                  value={percentage[1]}
                  className="w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                  placeholder="End user percentage for this lot"
                />
              </div>
            </div>
          </div>
          <div>
            <span className="w-40">Lot owner</span>
            <MultiSelect
              value={lotOwners}
              options={endUsers}
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
                        `${import.meta.env.VITE_API_PUBLIC_URL}/user.png`
                      }
                      alt="User"
                    />
                    <div>{option.email}</div>
                  </div>
                );
              }}
              className="w-full md:w-20rem"
              display="chip"
            />
          </div>

          <UploadImage setFile={setFile} />

          <div className="col-start-2 col-span-2">
            {uploadProgress > 0 && (
              <ProgressLinearWithValueLabel setVar={{ uploadProgress }} />
            )}
          </div>

          <Button onClick={handleCreate} className="w-full">
            Create
          </Button>
        </div>
      </Dialog>
    </>
  );
};

export default LotComponent;
