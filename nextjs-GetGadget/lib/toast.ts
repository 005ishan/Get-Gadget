import { toast } from "react-toastify";

export const AppToast = {
  success: (msg: string) => toast.success(`${msg}`),

  error: (msg: string) => toast.error(`${msg}`),

  info: (msg: string) => toast.info(`ℹ${msg}`),

  promise: async <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
  ) => {
    return toast.promise(promise, {
      pending: `${messages.loading}`,
      success: `🎉 ${messages.success}`,
      error: `${messages.error}`,
    });
  },
};
