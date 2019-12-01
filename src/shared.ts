import {reduce} from 'rxjs/operators';

export function sum() {
    return reduce((acc: number, val: number) => acc + val);
}