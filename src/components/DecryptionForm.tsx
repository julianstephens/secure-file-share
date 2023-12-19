import { api } from "@/utils/api";
import { Loader } from "@/utils/loader";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSuccess } from "./SuccessContext";

export const DecryptionForm = () => {
  const [isLoading, setLoading] = useState(false);
  const [passcode, setPasscode] = useState("enter your secret code here");
  const [decrypted, setDecrypted] = useState<
    string | Record<string, string | number | boolean> | null
  >(null);
  const success = useSuccess();
  const ctx = api.useContext();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (passcode === "enter your secret code here") {
      toast.error("no passphrase provided");
      setLoading(false);
      return;
    }

    getData(passcode).catch((err) => {
      toast.error("unable to retrieve data");
      console.error(err);
      setLoading(false);
      return;
    });
    setLoading(false);
  };

  const getData = async (code: string) => {
    const { data } = await ctx.secrets.retrieve.fetch({ link: code });
    if (data?.content) setDecrypted(data.content);
  };

  const updatePasscode = (code: string) => {
    setPasscode(code);
  };

  useEffect(() => {
    if (success.password) updatePasscode(success.password);
  }, [success.password]);

  return (
    <div className="flex h-[20rem] w-full flex-col items-center justify-between bg-gray-100 py-20">
      <h1>Decrypt Message</h1>
      {isLoading ? (
        <Loader />
      ) : (
        <form
          className="flex w-3/4 flex-col items-center "
          onSubmit={(e) => {
            onSubmit(e);
          }}
        >
          <label className="flex h-10 w-full flex-row items-center rounded-md bg-zinc-800 px-4 text-xl font-bold text-white">
            <span className="w-fit shrink-0">http://localhost:3000/open/</span>
            <input
              name="link"
              type="text"
              className="my-0 w-full bg-transparent py-0 text-center text-purple-500"
              value={passcode}
              onChange={(e) => {
                updatePasscode(e.currentTarget.value);
              }}
            />
          </label>
          <button className="button" type="submit">
            Unlock!
          </button>
        </form>
      )}
    </div>
  );
};
