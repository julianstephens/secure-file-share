import React, { createContext, useContext, useState } from "react";

type Status = "PENDING" | "READY";

type SuccessContext = {
  password: string | null;
  expiration: string | null;
  data: string | null;
  status: Status;
  updatePassword: (password: string) => void;
  updateExpiration: (expiration: string) => void;
  updateData: (data: string) => void;
  updateStatus: (status: Status) => void;
  clear: VoidFunction;
};

const context = createContext<SuccessContext>({} as SuccessContext);

export const SuccessProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [password, setPassword] = useState<string | null>(null);
  const [expiration, setExpiration] = useState<string | null>(null);
  const [data, setData] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("PENDING");

  const updatePassword = (newPassword: string) => {
    setPassword(newPassword);
  };

  const updateExpiration = (newExpiration: string) => {
    setExpiration(newExpiration);
  };

  const updateData = (newData: string) => {
    setData(newData);
  };

  const updateStatus = (newStatus: Status) => {
    setStatus(newStatus);
  };

  const clear = () => {
    setPassword(null);
    setExpiration(null);
    setData(null);
    setStatus("PENDING");
  };

  return (
    <context.Provider
      value={{
        password,
        expiration,
        data,
        status,
        updatePassword,
        updateExpiration,
        updateData,
        updateStatus,
        clear,
      }}
    >
      {children}
    </context.Provider>
  );
};
export const useSuccess = () => {
  const {
    password,
    expiration,
    data,
    status,
    updatePassword,
    updateExpiration,
    updateData,
    updateStatus,
    clear,
  } = useContext(context);

  return {
    password,
    expiration,
    data,
    status,
    updatePassword,
    updateExpiration,
    updateData,
    updateStatus,
    clear,
  };
};
