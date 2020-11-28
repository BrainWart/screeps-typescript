import { StatusCode, StatusYield } from "./Status";

export function until(check: () => boolean): StatusYield {
    return {
        code: StatusCode.YIELD,
        *pauseGen() {
            while (!check()) {
                yield {
                    code: StatusCode.YIELD,
                };
            }
        }
    }
}

export function forTicks(ticks: number): StatusYield {
    return {
        code: StatusCode.YIELD,
        *pauseGen() {
            for (let i = 0; i < ticks; i++) {
                yield {
                    code: StatusCode.YIELD,
                };
            }
        }
    }
}

export function hasOwnProperty<X extends {}, Y extends PropertyKey>
        (obj: X, prop: Y): obj is X & Record<Y, unknown> {
    return obj.hasOwnProperty(prop)
}
