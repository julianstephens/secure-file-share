import { DecryptionForm } from "@/components/DecryptionForm";
import { EncryptionForm } from "@/components/EncryptionForm";
import { useSuccess } from "@/components/SuccessContext";
import { Layout } from "@/components/Layout";
import { Loader } from "@/utils/loader";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { useState } from "react";

dayjs.extend(LocalizedFormat);

export default function Home() {
  const [isLoading] = useState(false);
  const success = useSuccess();

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <DecryptionForm />
          {success.data ? (
            <div className="flex h-1/2 w-full flex-col items-center justify-between">
              <div className="flex flex-col items-center">
                <h1>Your Secret Message</h1>
                <p className="mt-10 text-lg">{success.data}</p>
              </div>
              <button
                className="button"
                onClick={() => {
                  success.clear();
                }}
              >
                Restart
              </button>
            </div>
          ) : (
            <EncryptionForm />
          )}
        </>
      )}
    </Layout>
  );
}
