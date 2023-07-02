import { api } from "@/utils/api";
import { Layout } from "@/utils/layout";
import { Loader } from "@/utils/loader";
import React, { useEffect, useState } from "react";

const Retrieve = () => {
  const [link, setLink] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [decrypted, setDecrypted] = useState<string | null>(null);
  const ctx = api.useContext();

  const handleLink = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLink(e.currentTarget.value);
  };

  const getData = async () => {
    const { data } = await ctx.secrets.retrieve.fetch({ link });
    if (data) setDecrypted(data.content);
  };

  useEffect(() => {
    getData().catch(console.error);
  }, [link]);

  return (
    <Layout>
      {isLoading ? <Loader /> : <input type="text" onChange={handleLink} />}
      {decrypted && <p>{decrypted}</p>}
    </Layout>
  );
};
export default Retrieve;
