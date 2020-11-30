export enum StatusCode { COMPLETE, YIELD, ERROR }

export interface StatusComplete {
    code: StatusCode.COMPLETE,
};

export interface StatusYield {
    code: StatusCode.YIELD,
    pauseGen?: (() => IterableIterator<Status>),
};

export interface StatusError {
    code: StatusCode.ERROR,
    errorMessage: string
};

export type Status = StatusComplete | StatusYield | StatusError;
