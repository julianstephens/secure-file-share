import { api } from "@/utils/api";
import type { Option } from "@/utils/app-select";
import { AppSelect } from "@/utils/app-select";
import { Layout } from "@/utils/layout";
import { Loader } from "@/utils/loader";
import { Modal } from "@/utils/modal";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { Options, SingleValue } from "react-select";
import { toast } from "react-toastify";

dayjs.extend(LocalizedFormat);

type KV = {
  key: string;
  value: string;
};

type FormData = {
  files?: FileList;
  kvPairs?: KV[];
  text?: string;
};

export default function Home() {
  const TYPES = {
    KV: "Key/Value",
    T: "Text",
  } as const;
  const DATES = [
    "1 hour",
    "2 hours",
    "4 hours",
    "6 hours",
    "8 hours",
    "1 day",
  ] as const;
  const acceptedFileTypes = ".txt";

  const [secretTypes] = useState<Options<Option>>(() =>
    Object.entries(TYPES).map(([k, v]) => ({ label: v, value: k }))
  );
  const [dateOpts] = useState<Options<Option>>(() =>
    Object.entries(DATES).map(([k, v]) => ({ label: v, value: k }))
  );
  const [isLoading, setLoading] = useState(false);
  const [dateSelection, setDateSelection] =
    useState<SingleValue<Option> | null>(null);
  const [typeSelection, setTypeSelection] =
    useState<SingleValue<Option> | null>(null);

  const [shareLink, setShareLink] = useState<string>("");
  const [expiration, setExpiration] = useState<string>("");

  const { register, handleSubmit, watch, setValue, getValues, reset } =
    useForm<FormData>({
      defaultValues: {
        kvPairs: [{ key: "", value: "" }],
      },
    });
  const commitMutation = api.secrets.commit.useMutation();

  const handleTypeSelect = (o: SingleValue<Option>) => {
    setTypeSelection(o);
  };

  const handleDateSelect = (o: SingleValue<Option>) => {
    setDateSelection(o);
  };

  const insertKV = () => {
    const prev = getValues("kvPairs");
    if (!prev) return;
    setValue("kvPairs", [...prev, { key: "", value: "" }]);
  };

  const removeKV = (idx: number) => {
    const prev = getValues("kvPairs");
    if (!prev) return;
    const filtered = prev.filter((_, i) => i !== idx);
    if (filtered.length > 0) {
      setValue("kvPairs", filtered);
    } else {
      setValue("kvPairs", [{ key: "", value: "" }]);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (formData) => {
    setLoading(true);
    const split = dateSelection?.label?.split(" ");
    let time: number;
    let unit: string;
    if (!dateSelection || !split) {
      toast("Please select an expiration period");
      return;
    } else {
      time = Number.parseInt(split[0] ?? "1");
      unit = split[1] ?? "h";
    }

    let contents = "";
    if (formData.files && formData.files.length > 0) {
      contents = (await formData.files[0]?.text()) ?? "";
    } else if (
      formData.kvPairs &&
      formData.kvPairs.length > 0 &&
      formData.kvPairs[0]?.key &&
      formData.kvPairs[0].value
    ) {
      contents = formData.kvPairs.reduce(
        (acc: string, curr: KV) => (acc += `\n${curr.key}=${curr.value}`),
        ""
      );
    } else if (formData.text) {
      contents = formData.text;
    }

    try {
      const {
        data: { link, expiresAt },
      } = await commitMutation.mutateAsync({
        contents: contents.trim(),
        expiration: dayjs()
          .add(time, unit as dayjs.ManipulateType)
          .toISOString(),
      });

      setShareLink(link);
      setExpiration(dayjs(expiresAt).format("LLLL"));
      document.getElementById("modalCtrl")?.click();
    } catch (err: unknown) {
      console.error(err);
    }
    reset();
    setLoading(false);
  };

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <form className="w-4/5" onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-20 flex flex-col gap-4">
            <h3>Expires In</h3>
            <AppSelect
              options={dateOpts}
              id="expiresSelector"
              handler={handleDateSelect}
            />
          </div>
          <div className="mt-20 flex flex-col gap-4">
            <h3>Upload file</h3>
            <input
              type="file"
              multiple={false}
              accept={acceptedFileTypes}
              {...register("files")}
            />
          </div>
          <h2 className="my-10 text-center">OR</h2>
          <div className="flex flex-col gap-4">
            <h3>Add secret(s)</h3>
            <label>
              Secret Type
              <AppSelect
                id="typeSelector"
                options={secretTypes}
                handler={handleTypeSelect}
              />
            </label>
            {typeSelection ? (
              typeSelection?.label === TYPES.KV ? (
                <>
                  <div className="flex w-full flex-col gap-4">
                    {watch("kvPairs")?.map((_, idx) => (
                      <div
                        className="flex w-full items-center justify-center gap-3"
                        key={idx}
                      >
                        <label className="w-2/4">
                          Key
                          <input
                            type="text"
                            {...register(`kvPairs.${idx}.key`)}
                          />
                        </label>
                        <label className="w-2/4">
                          Value
                          <input
                            {...register(`kvPairs.${idx}.value`)}
                            type="text"
                          />
                        </label>
                        <button
                          type="button"
                          className="ml-2 mt-6 h-fit w-fit text-xl hover:text-red-500"
                          onClick={() => removeKV(idx)}
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex w-full justify-center">
                    <button
                      className="ml-auto mt-6 text-lg transition-all duration-200 hover:font-bold"
                      type="button"
                      onClick={insertKV}
                    >
                      &#43; Add key/value pair
                    </button>
                  </div>
                </>
              ) : (
                <textarea
                  rows={10}
                  className="min-w-full p-3"
                  placeholder="Your super secret text..."
                  {...register("text")}
                />
              )
            ) : (
              <></>
            )}
          </div>
          <button
            className="mx-auto mt-12 flex items-center justify-center rounded-md bg-white px-10 py-2 text-[#2e026d] transition-all duration-200 hover:font-bold hover:shadow-md hover:shadow-white"
            type="submit"
          >
            Generate Shareable Link
          </button>
        </form>
      )}
      <Modal>
        <h2>{shareLink}</h2>
        <p>Expires: {expiration}</p>
      </Modal>
    </Layout>
  );
}
