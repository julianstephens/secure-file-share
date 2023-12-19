import { SuccessProvider } from "@/components/SuccessContext";
import "@/styles/globals.css";
import { api } from "@/utils/api";
import { type AppType } from "next/app";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <SuccessProvider>
        <Component {...pageProps} />
      </SuccessProvider>
      <ToastContainer closeOnClick={false} />
    </>
  );
};

export default api.withTRPC(MyApp);
