import { AsyncLocalStorage } from "async_hooks";

type RequestStore = {
  requestId?: string;
};

const storage = new AsyncLocalStorage<RequestStore>();

export const RequestContext = {
  run<T>(store: RequestStore, fn: () => T) {
    return storage.run(store, fn);
  },
  getRequestId() {
    return storage.getStore()?.requestId ?? null;
  }
};
