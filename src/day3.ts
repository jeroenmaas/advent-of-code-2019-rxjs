import * as fs from 'fs';
import {EMPTY, from, of, pipe} from 'rxjs';
import {expand, filter, last, map, mergeMap, min, share, shareReplay, take, tap, toArray} from 'rxjs/operators';
var _ = require('lodash');

const input = fs.readFileSync('resources/day3.txt', 'utf8');


const matches$ = of(input).pipe(
    mergeMap(input => from(input.split('\n'))),
    map(wirepath => wirepath.split(',').map(a => [a[0] as string, Number(a.slice(1))])),
    mergeMap(wirepath => {
        return of([wirepath, [], [0, 0, 0]]).pipe(
            expand(([wirepath, positions, currentPosition]) => {
                let action = wirepath.splice(0, 1)[0];
                const type = action[0];
                const count = action[1];
                let mutation;
                if (type == 'U') {
                    mutation = [0, 1];
                } else if (type == 'R') {
                    mutation = [1, 0];
                } else if (type == 'D') {
                    mutation = [0, -1];
                } else if (type == 'L') {
                    mutation = [-1, 0];
                } else {
                    return EMPTY;
                }

                for (var i = 0; i != count; i++) {
                    const newX = currentPosition[0] + mutation[0];
                    const newY = currentPosition[1] + mutation[1];
                    const dist = currentPosition[2] + 1;
                    currentPosition = [newX, newY, dist] as [number, number, number];
                    positions.push(currentPosition as any);
                }
                if (wirepath.length == 0) {
                    return EMPTY;
                }
                return of([wirepath, positions, currentPosition]);
            }),
            last(),
            map(result => result[1])
        )
    }),
    map(wire => {
        return _.groupBy(wire, (pos => pos[0] + "_" + pos[1]));
    }),
    toArray(),
    mergeMap(wires => {
        const cableAPositions = wires[0];
        const cableBPositions = wires[1];

        const overlappingKeys = _.intersectionWith(Object.keys(cableAPositions), Object.keys(cableBPositions));

        const matches = [] as [number, number, number][];
        overlappingKeys.forEach(key => {
            cableAPositions[key].forEach(pos => {
                cableBPositions[key].forEach(testPos => {
                    matches.push([pos[0], pos[1], pos[2] + testPos[2]]);
                });
            })
        });
        return from(matches);
    })
);

matches$.pipe(
    map(match => Math.abs(match[0]) + Math.abs(match[1])),
    min(),
).subscribe(output => console.log('part1: ' + output));

matches$.pipe(
    map(match => match[2]),
    min()
).subscribe(output => console.log('part2: ' + output));