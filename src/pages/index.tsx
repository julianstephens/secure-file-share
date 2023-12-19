import { DecryptionForm } from "@/components/DecryptionForm";
import { EncryptionForm } from "@/components/EncryptionForm";
import { Layout } from "@/utils/layout";
import { Loader } from "@/utils/loader";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { useState } from "react";

dayjs.extend(LocalizedFormat);

export default function Home() {
  const [isLoading] = useState(false);

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <DecryptionForm />
          <EncryptionForm />
        </>
      )}
    </Layout>
  );
}
