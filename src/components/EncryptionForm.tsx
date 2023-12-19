import { api } from "@/utils/api";
import { AppSelect, type Option } from "@/utils/app-select";
import { ACCEPTED_FILE_TYPES, DATES, TYPES } from "@/utils/constants";
import type { FormData, KV } from "@/utils/types";
import dayjs from "dayjs";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import type { Options, SingleValue } from "react-select";
import { toast } from "react-toastify";
import { useSuccess } from "./SuccessContext";

export const EncryptionForm = () => {
  const success = useSuccess();
  const { register, handleSubmit, watch, setValue, getValues, reset } =
    useForm<FormData>({
      defaultValues: {
        kvPairs: [{ key: "", value: "" }],
      },
    });

  const commitMutation = api.secrets.commit.useMutation();

  const parseDateOption = (
    opt: SingleValue<Option>
  ): [number, string] | null => {
    const split = opt?.label?.split(" ");
    if (!opt || !split) {
      return null;
    } else {
      return [Number.parseInt(split[0] ?? "1"), split[1] ?? "h"];
    }
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

  const [secretTypes] = useState<Options<Option>>(() =>
    Object.entries(TYPES).map(([k, v]) => ({ label: v, value: k }))
  );
  const [dateOpts] = useState<Options<Option>>(() =>
    Object.entries(DATES).map(([k, v]) => ({ label: v, value: k }))
  );

  const [dateSelection, setDateSelection] =
    useState<SingleValue<Option> | null>(null);

  const [typeSelection, setTypeSelection] =
    useState<SingleValue<Option> | null>(null);

  const handleTypeSelect = (o: SingleValue<Option>) => {
    setTypeSelection(o);
  };

  const handleDateSelect = (o: SingleValue<Option>) => {
    setDateSelection(o);
  };

  const onSubmit: SubmitHandler<FormData> = async (formData) => {
    const dateOpt = parseDateOption(dateSelection);
    if (!dateOpt) {
      toast("Please select an expiration period");
      return;
    }

    let contents: string | Uint8Array = "";
    if (formData.files && formData.files.length > 0) {
      const stream = formData.files[0]?.stream();
      const data = (await stream?.getReader().read())?.value;
      contents = data ?? "";
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

    if (contents === "") {
      toast.error("Nothing to encrypt");
      return;
    }

    try {
      const {
        data: { link, expiresAt },
      } = await commitMutation.mutateAsync({
        contents:
          typeof contents === "string" ? contents.trim() : Array.from(contents),
        expiration: dayjs()
          .add(dateOpt[0], dateOpt[1] as dayjs.ManipulateType)
          .toISOString(),
      });

      success.updatePassword(link);
      toast.success(link);
      success.updateExpiration(dayjs(expiresAt).format("LLLL"));
      success.updateStatus("READY");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
    reset();
  };

  return (
    <>
      <h1 className="text-center">Encrypt a message</h1>
      <form
        className="h-full w-full overflow-y-scroll px-11"
        onSubmit={handleSubmit(onSubmit)}
      >
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
            accept={ACCEPTED_FILE_TYPES}
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
        <button className="button mx-auto mt-12 block" type="submit">
          Generate Shareable Code
        </button>
      </form>
    </>
  );
};
