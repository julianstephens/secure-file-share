import { api } from "@/utils/api";
import { Layout } from "@/utils/layout";
import { Loader } from "@/utils/loader";
import React, { useState } from "react";
import { toast } from "react-toastify";

const Retrieve = () => {
  const [isLoading, setLoading] = useState(false);
  const [decrypted, setDecrypted] = useState<
    string | Record<string, string | number | boolean> | null
  >(null);
  const ctx = api.useContext();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const inputs = document.getElementsByName("link");
    const input = inputs[0];
    if (!input) {
      toast.error("no passphrase provided");
      setLoading(false);
      return;
    }

    getData((input as HTMLInputElement).value).catch((err) => {
      toast.error("unable to retrieve data");
      console.error(err);
      setLoading(false);
      return;
    });
    setLoading(false);
  };

  const getData = async (link: string) => {
    const { data } = await ctx.secrets.retrieve.fetch({ link });
    if (data?.content) setDecrypted(data.content);
  };

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            onSubmit(e);
          }}
        >
          <label>
            Link
            <input name="link" type="text" />
          </label>
          <button type="submit">Submit</button>
        </form>
      )}
      {decrypted && <p>{JSON.stringify(decrypted)}</p>}
    </Layout>
  );
};
export default Retrieve;
