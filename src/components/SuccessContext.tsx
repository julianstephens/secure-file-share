import React, { createContext, useContext, useState } from "react";

type Status = "PENDING" | "READY";

type SuccessContext = {
  password: string | null;
  expiration: string | null;
  status: Status;
  updatePassword: (password: string) => void;
  updateExpiration: (expiration: string) => void;
  updateStatus: (status: Status) => void;
};

const context = createContext<SuccessContext>({} as SuccessContext);

export const SuccessProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [password, setPassword] = useState<string | null>(null);
  const [expiration, setExpiration] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("PENDING");

  const updatePassword = (newPassword: string) => {
    setPassword(newPassword);
  };

  const updateExpiration = (newExpiration: string) => {
    setExpiration(newExpiration);
  };

  const updateStatus = (newStatus: Status) => {
    setStatus(newStatus);
  };

  return (
    <context.Provider
      value={{
        password,
        expiration,
        status,
        updatePassword,
        updateExpiration,
        updateStatus,
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
    status,
    updatePassword,
    updateExpiration,
    updateStatus,
  } = useContext(context);

  return {
    password,
    expiration,
    status,
    updatePassword,
    updateExpiration,
    updateStatus,
  };
};
