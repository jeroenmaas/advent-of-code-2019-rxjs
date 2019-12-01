import * as fs from 'fs';
import {EMPTY, from, of} from 'rxjs';
import {expand, map, mergeMap, skip} from 'rxjs/operators';
import {sum} from './shared';

const input = fs.readFileSync('resources/day1.txt', 'utf8');

const modules$ = of(input).pipe(
    mergeMap(input => from(input.split('\n'))),
    map(value => Number(value))
);

function calculateRequiredFuel(value: number): number {
    const fuelRequired = Math.floor(value / 3) - 2;
    return fuelRequired > 0 ? fuelRequired : 0;
}

modules$.pipe(
    map(value => calculateRequiredFuel(value)),
    sum()
).subscribe(result => console.log('part1: ' + result));

modules$.pipe(
    mergeMap(value => {
        return of(value).pipe(
            expand((value) => {
                return value > 0 ? of(calculateRequiredFuel(value)) : EMPTY;
            }),
            skip(1) // Ignore first value because we first have the calculate the fuel for the module
        );
    }),
    sum(),
).subscribe(result => console.log('part2: ' + result));