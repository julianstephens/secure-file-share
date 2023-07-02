import type { Options, SingleValue } from "react-select";
import Select from "react-select";

export type Option = {
  value: string;
  label: string;
};

type Props = {
  id: string;
  options: Options<Option>;
  handler: (o: SingleValue<Option>) => void;
};

export const AppSelect = ({ id, options, handler }: Props) => {
  return (
    <Select
      instanceId={id}
      classNames={{
        container: () => "text-black mt-2",
      }}
      options={options}
      onChange={handler}
    />
  );
};
