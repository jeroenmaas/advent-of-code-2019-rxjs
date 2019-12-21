import * as fs from 'fs';
import {
    asapScheduler,
    asyncScheduler,
    combineLatest,
    EMPTY,
    from,
    Observable,
    of,
    pipe,
    queueScheduler,
    range
} from 'rxjs';
import {expand, filter, find, last, map, max, mergeMap, scan, skip, take, tap} from 'rxjs/operators';
import _ from 'lodash';

const input = fs.readFileSync('resources/day12.txt', 'utf8');

interface Moon {
    positions: [number, number, number];
    velocities: [number, number, number];
}

const moons$ = of(input).pipe(
    map(input => {
        const lines = input.split('\n');
        let elements: Moon[] = [];
        lines.forEach(line => {
            var regex = /=(-*\d*)/gm;

            let positions = [];
            var myArray;
            while ((myArray = regex.exec(line)) != null)
            {
                positions.push(Number(myArray[1]));
            }
            elements.push({
                positions: positions as [number, number, number],
                velocities: [0,0,0]
            })
        });
        return elements;
    })
);

function getPositionsFromMoons(moons: Moon[], index: 0|1|2) {
    let xPositions: number[] = [];
    moons.forEach(m => xPositions.push(m.positions[index]));
    return xPositions;
}

function gcd2(a: number, b: number) {
    // Greatest common divisor of 2 integers
    if(!b) return b===0 ? a : NaN;
    return gcd2(b, a%b);
}
function gcd(array: number[]) {
    // Greatest common divisor of a list of integers
    var n = 0;
    for(var i=0; i<array.length; ++i)
        n = gcd2(array[i], n);
    return n;
}
function lcm2(a: number, b: number) {
    // Least common multiple of 2 integers
    return a*b / gcd2(a, b);
}
function lcm(array: number) {
    // Least common multiple of a list of integers
    var n = 1;
    for(var i=0; i<array.length; ++i)
        n = lcm2(array[i], n);
    return n;
}

let iterations$ = moons$.pipe(
    mergeMap(moons => {
        let originalPositions = [
            getPositionsFromMoons(moons, 0),
            getPositionsFromMoons(moons, 1),
            getPositionsFromMoons(moons, 2)
        ];

        return of(moons).pipe(
            map(moons => [moons, 0, [0, 0, 0]] as [Moon[], number, number[]]),
            expand(([moons, index, repeats]) => {

                for(var i = 0; i != moons.length; i++) {
                    let moon = moons[i];
                    for(var y = 0; y != moons.length; y++) {
                        if(y == i) {
                            continue;
                        }
                        let testMoon = moons[y];
                        for(var z = 0; z != 3; z++) {
                            if(moon.positions[z] < testMoon.positions[z]) {
                                moon.velocities[z] += 1;
                            }else if(moon.positions[z] > testMoon.positions[z]) {
                                moon.velocities[z] -= 1;
                            }
                        }
                    }
                }

                for(var i = 0; i != moons.length; i++) {
                    let moon = moons[i];
                    for(var z = 0; z != 3; z++) {
                        moon.positions[z] += moon.velocities[z];
                    }
                }

                for(var z = 0; z != 3; z++) {
                    let repeat = repeats[z];
                    if(repeat != 0) {
                        continue;
                    }
                    let positions = getPositionsFromMoons(moons, z as any);
                    if(JSON.stringify(positions) == JSON.stringify(originalPositions[z])) {
                        repeats[z] = index + 2;
                    }
                }


                return of([moons, index+1, repeats]);
            }, 10000000, queueScheduler)
        );
    })
);

iterations$.pipe(
    find(([a, b, c]) => {
        const min = Math.min(...c);
        if(min > 0) {
            return true;
        }
        return false;
    }),
    take(1),
    map(values => lcm(values[2])),
).subscribe(output => console.log('part2: ' + output));

iterations$.pipe(
    skip(1),
    take(1000),
    last(),
    map(([moons, a, b]) => {
        let energies: number[] = [];
        moons.forEach(moon => {
            let positionSum = _.sumBy(moon.positions, (s) => Math.abs(s));
            let velocitySum = _.sumBy(moon.velocities, (s) => Math.abs(s));
            energies.push(velocitySum*positionSum);
        });
        return _.sum(energies);
    })
).subscribe(test => console.log('part1: ' + test));