import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import Footer from "../components/Footer";

import { useAuthorize } from "../store/store";

const AuthLayout = () => {
  const { user } = useAuthorize();

  return (
    <>
      <Header user={user} />
      <div className="w-full h-fit flex bg-[#eee] pt-[90px]">
        <SideBar />
        <div className="w-full flex flex-col gap-4 min-h-screen px-8 py-4 transition-all ease-in-out overflow-hidden">
          <div className="flex justify-between w-full p-6 bg-[#22cbad] text-white rounded-md">
            <div>
              <p className="text-[40px]">Hello</p>
              <p className="text-[20px]">{user?.displayName}</p>
            </div>
            {user?.customClaims.admin && (
              <a
                href={`${import.meta.env.VITE_API_PUBLIC_URL}/download`}
                download
              >
                <div className="flex items-center gap-4 border-2 p-1 px-4 rounded-full hover:bg-white cursor-pointer duration-500 hover:text-black">
                  <img src="car.ico" alt="icon" className="h-[30px]" />
                  <p>LPR Software ( Windows )</p>
                  <i
                    className="pi pi-download"
                    style={{ fontSize: "1rem" }}
                  ></i>
                </div>
              </a>
            )}
          </div>
          <Outlet />
        </div>
      </div>
      <Footer />
    </>
  );
};
export default AuthLayout;
