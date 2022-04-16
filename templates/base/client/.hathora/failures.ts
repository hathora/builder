export enum ConnectionFailureType {
  STATE_NOT_FOUND = "STATE_NOT_FOUND",
  NO_AVAILABLE_STORES = "NO_AVAILABLE_STORES",
  INVALID_USER_DATA = "INVALID_USER_DATA",
  INVALID_STATE_ID = "INVALID_STATE_ID",
  GENERIC_FAILURE = "GENERIC_FAILURE",
}

export interface ConnectionFailure {
  type: ConnectionFailureType,
  message: string;
}

export const transformCoordinatorFailure = (e: {code: number, reason: string}): ConnectionFailure  => {
  return {
    message: e.reason,
    type: (function(code) {
      switch (code) {
        case 4000:
          return ConnectionFailureType.STATE_NOT_FOUND;
        case 4001:
          return ConnectionFailureType.NO_AVAILABLE_STORES;
        case 4002:
          return ConnectionFailureType.INVALID_USER_DATA;
        case 4003:
          return ConnectionFailureType.INVALID_STATE_ID;
        default:
          return ConnectionFailureType.GENERIC_FAILURE;
      }
    })(e.code)
  };
}
