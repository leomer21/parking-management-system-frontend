import { useAuthorize } from "../store/store";
import { LprSessionData, MonthlyPortalType } from "../types";

const MonthlyPortal: React.FC<MonthlyPortalType> = ({
  item,
  selectedItem,
  setSelectedItem,
  lprSessions,
  nonVolatoions,
  violations,
}) => {
  const { user } = useAuthorize();

  const countSessions = (items: LprSessionData[]): number => {
    return items.filter((ps: LprSessionData) => {
      const entryTime = new Date(ps.entryTime || "");
      return item.period[0] <= entryTime && entryTime <= item.period[1];
    }).length;
  };

  return (
    <div
      className={`flex flex-col w-full min-w-[200px] gap-2 p-4 rounded-md cursor-pointer hover:bg-[#c4c4c4] ${
        selectedItem.name === item.name ? "bg-[#c4c4c4]" : "bg-white"
      }`}
      onClick={() => setSelectedItem(item)}
    >
      <div className="flex items-center gap-6">
        <div className="flex justify-center items-center w-10 h-10 rounded-full bg-[#22cbad]">
          <svg className="w-4 h-4 fill-white">
            <use href="#svg-calendar" />
          </svg>
        </div>
        <span className="font-bold">{item.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 fill-[#222]">
          <use href="#svg-car" />
        </svg>
        <span className="text-xs">
          Parking Sessions:{" "}
          <strong>
            {countSessions(
              user?.customClaims.admin ? lprSessions : nonVolatoions
            )}
          </strong>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 p-[2px] fill-[#222]">
          <use href="#svg-exclamation" />
        </svg>
        <span className="text-xs">
          Violation: <strong>{countSessions(violations)}</strong>
        </span>
      </div>
    </div>
  );
};

export default MonthlyPortal;
