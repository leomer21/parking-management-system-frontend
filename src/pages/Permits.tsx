import { ChangeEvent, useEffect, useState, FC } from "react";
import axios from "axios";
import { showToast } from "../utils";
import { useAuthorize } from "../store/store";
import PermitsTable from "../components/PermitsTable";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { LotType, PermitType } from "../types";
import { defaultAllLot } from "../config";

interface PermitsProps {
  lotId?: string;
}

const Permits: FC<PermitsProps> = ({ lotId }) => {
  const { user } = useAuthorize();
  const [permits, setPermits] = useState<PermitType[]>([]);
  const [lots, setLots] = useState<LotType[]>([]);
  const [selectedLot, setSelectedLot] = useState<LotType>(defaultAllLot);

  const [product, setProduct] = useState<PermitType>({
    name: "",
    reason: "",
    plate: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    if (!product.plate) {
      showToast("Please input plate!");
      return;
    }

    if (permits.some((p) => p.plate === product.plate)) {
      showToast("Already registered plate!");
      return;
    }

    try {
      if (selectedLot._id)
        await axios.post("/permit", { ...product, lot: selectedLot._id });
      else {
        const { lot, ...rest } = product;
        await axios.post("/permit", rest);
      }

      showToast("Permit added successfully", true);
      setProduct({ name: "", reason: "", plate: "" });
      fetchPermit();
    } catch (error) {
      showToast("Error adding permit");
    }
  };

  const handleDelete = async (id: string | undefined) => {
    try {
      await axios.delete(`/permit/${id}`);
      showToast("Permit deleted successfully", true);
      fetchPermit();
    } catch (error) {
      showToast("Error deleting permit");
    }
  };

  const fetchPermit = async () => {
    try {
      const { data } = await axios.get<PermitType[]>(
        `/permit/${lotId ? lotId : ""}`
      );
      setPermits(data);
    } catch (error) {
      showToast("Failed to fetch permits");
    }
  };

  const fetchLot = async () => {
    try {
      const { data } = await axios.get<LotType[]>(`/lot`);
      setLots([defaultAllLot, ...data]);
    } catch (error) {
      showToast("Failed to fetch lots");
    }
  };

  useEffect(() => {
    if (user?.customClaims.admin) {
      fetchPermit();
      fetchLot();
    }
  }, [user]);

  return (
    <>
      {user?.customClaims.admin && (
        <div className="card flex flex-column md:flex-row gap-3">
          <InputText
            placeholder="Name"
            onChange={handleChange}
            name="name"
            value={product.name}
            className="p-inputgroup flex-1 px-4 py-2"
          />
          <InputText
            onChange={handleChange}
            value={product.reason}
            name="reason"
            placeholder="Reason"
            className="p-inputgroup flex-1 px-4 py-2"
          />
          <InputText
            onChange={handleChange}
            value={product.plate}
            name="plate"
            placeholder="Plate"
            className="p-inputgroup flex-1 px-4 py-2"
          />
          <Dropdown
            value={selectedLot}
            onChange={(e) => setSelectedLot(e.target.value)}
            options={lots}
            disabled={!!lotId}
            optionLabel="siteCode"
            placeholder="Select a lot"
            className="p-inputgroup flex-1 w-full"
          />
          <button
            onClick={handleCreate}
            className="max-md:w-full px-8 py-1 bg-blue-500 text-white text-sm hover:opacity-80 transition-all ease-in-out rounded-md"
          >
            Add
          </button>
        </div>
      )}
      <PermitsTable permits={permits} handleDelete={handleDelete} />
    </>
  );
};

export default Permits;
