import * as fs from 'fs';
import {EMPTY, from, of, pipe} from 'rxjs';
import {expand, filter, last, map, mergeMap, take} from 'rxjs/operators';

const input = fs.readFileSync('resources/day2.txt', 'utf8');

const input$ = of(input).pipe(
    map(txt => txt.split(',').map(a => Number(a))),
);

const convertArrayToOutput = () => pipe(
    mergeMap((array: number[]) => {
        return of( [array, 0] as [number[], number]).pipe(
            expand(([array, position]) => {
                const opcode = array[position];
                if (opcode == 99) {
                    return EMPTY;
                }

                const val1 = array[array[position + 1]];
                const val2 = array[array[position + 2]];
                let output;
                if (opcode == 1) {
                    output = val1 + val2;
                } else {
                    output = val1 * val2;
                }
                array[array[position + 3]] = output;

                return of([array, position + 4]);
            }),
            last()
        )
    }),
    map((result: any) => result[0])
);

input$.pipe(
    map(array => {
        array[1] = 12;
        array[2] = 2;
        return array;
    }),
    convertArrayToOutput(),
    map(output => output[0])
).subscribe(output => console.log('part1: ' + output));

input$.pipe(
    mergeMap(array => {
        const arrays = [];
        for(var i = 0; i != 99; i++) {
            for(var y = 0; y != 99; y++) {
                const newArray = JSON.parse(JSON.stringify(array));
                newArray[1] = i;
                newArray[2] = y;
                arrays.push(newArray);
            }
        }
        return from(arrays);
    }),
    convertArrayToOutput(),
    filter(array => array[0] == 19690720),
    map(array => 100 * array[1] + array[2]),
    take(1),
).subscribe(output => console.log('part2: ' + output));