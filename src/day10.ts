import * as fs from 'fs';
import {asyncScheduler, combineLatest, EMPTY, from, Observable, of, pipe, queueScheduler, range} from 'rxjs';
import {expand, filter, last, map, max, mergeMap, scan, skip, take, tap} from 'rxjs/operators';
import _ from 'lodash';

const input = fs.readFileSync('resources/day10.txt', 'utf8');

interface Position {
    x: number;
    y: number;
}

function getLineOfSightOptions(origin: Position, destination: Position) {
    let distanceX = Math.abs(origin.x - destination.x);
    let distanceY = Math.abs(origin.y - destination.y);

    let largestType = distanceX > distanceY ? 'X' : 'Y';

    let offsets = [];
    let smallest = Math.min(distanceX, distanceY);
    let largest = Math.max(distanceX, distanceY);
    let xPos = origin.x - destination.x > 0 ? -1 : 1;
    let yPos = origin.y - destination.y > 0 ? -1 : 1;


    // console.log('s', smallest);
    // console.log('l', largest);
    // console.log('largestType', largestType);

    // 0,0 -> 0, 4 -> 0,1 0,2 0,3
    // 0,0 -> 4,4 -> 1,1 2,2 3,3
    for(var t = 1; t != largest; t++) {
        let offsetSmallest = smallest * (t / largest);
        if(Number.isInteger(offsetSmallest)) {
            // console.log('found offset: ', [t, offsetSmallest]);
            if(largestType == 'X') {
                offsets.push({
                    x: origin.x + (t*xPos),
                    y: origin.y +(offsetSmallest * yPos),
                });
            }else {
                offsets.push({
                    x: origin.x + (offsetSmallest*xPos),
                    y: origin.y + (t * yPos),
                });
            }
        }
    }
    return offsets;

    // for(var t = 1; t != smallest; t++) {
    //     console.log('t', t);
    //     let offsetLargest = largest / (smallest/t);
    //     if(Number.isInteger(offsetLargest)) {
    //         console.log('found offset: ', [t, offsetLargest]);
    //         if(largestType == 'X') {
    //             offsets.push({
    //                 x: origin.x + (offsetLargest*xPos),
    //                 y: origin.y +(t * yPos),
    //             });
    //         }else {
    //             offsets.push({
    //                 x: origin.x + (t*xPos),
    //                 y: origin.y + (offsetLargest * yPos),
    //             });
    //         }
    //     }
    // }
    // return offsets;
}

const initial$ = of(input).pipe(
    map(txt => txt.split('\n').map(line => line.split('').map(a => a == '#'))),
    map((map: boolean[][]) => {
        // console.log(map);
        const astroids: Position[] = [];
        map.forEach((line, y) => {
            line.forEach((item, x) => {
                if (item) {
                    astroids.push({
                        x: x,
                        y: y
                    });
                }
            })
        });
        return [map, astroids] as [boolean[][], Position[]];
    })
);

function getDegrees(base: Position, target: Position) {
    let xDiff = target.x - base.x; // Positions right of target
    let yDiff = base.y - target.y; // Positions top of target

    let degrees = Math.atan2(xDiff, yDiff) * 180 / Math.PI;
    if(degrees < 0) {
        return 360 - Math.abs(degrees);
    }

    return degrees;
}

function getDistance(base: Position, target: Position) {
    let xDiff = target.x - base.x; // Positions right of target
    let yDiff = base.y - target.y; // Positions top of target

    return Math.abs(xDiff) + Math.abs(yDiff);
}

// console.log(getDegrees({x: 28, y: 22}, {x: 28, y: 21})); // 0
// console.log(getDegrees({x: 28, y: 22}, {x: 29, y: 22})); // 90
// console.log(getDegrees({x: 28, y: 22}, {x: 28, y: 23})); // 180
// console.log(getDegrees({x: 28, y: 22}, {x: 27, y: 22})); // 270;
// console.log(getDegrees({x: 28, y: 22}, {x: 27, y: 23})); // 270+;
let basePosition = {x: 22, y: 28} as Position;

//  x: 13, y: 1,
//  x: 12, y: 7, (It chooses thisone as closer)


// console.log('test', getDegrees(basePosition, {x: 11, y: 12})); // 0
// console.log('test1', getDistance(basePosition, {x: 11, y: 12}));
// console.log('test1', getDistance(basePosition, {x: 11, y: 11}));

// console.log('a', getLineOfSightOptions(basePosition, {x: 13, y:0}));

interface PositionWithDegrees {
    x: number,
    y: number,
    degrees: number
}

initial$.pipe(
    map(([map, astroids]) => {
        // console.log('a', astroids.find(a => a.x == 11 && a.y == 12));


        astroids = astroids.filter(a => a.x != basePosition.x || a.y != basePosition.y);
        let astroids2 = astroids.map(a => {
            (a as PositionWithDegrees).degrees = getDegrees(basePosition, a);
            return a as PositionWithDegrees;
        });
        astroids2 = _.sortBy(astroids2, (a) => a.degrees, (a) => getDistance(basePosition, a));

        // console.log('astroid: ', astroids2.find(a => a.x == 13 && a.y == 1));
        // console.log(astroids2);
        return [map, astroids2, 0, null] as [boolean[][], PositionWithDegrees[], number, PositionWithDegrees|null];
    }),
    expand(([map, astroids, positionInDegrees, lastInLine]) => {

        let nextInLine = astroids.find((a) => {
            // console.log(a.degrees);
            if(a.degrees < positionInDegrees) {
                return false;
            }

            let options = getLineOfSightOptions(basePosition, a);
            for(var t = 0; t != options.length; t++) {
                let o = options[t];
                //console.log('o_', o);
                if(map[o.y][o.x]) {
                    return false;
                }
            }

            return true;
        });

        astroids.splice(astroids.findIndex(a => a == nextInLine), 1);
        //map[nextInLine.y][nextInLine.x] = false;
        positionInDegrees = nextInLine.degrees;
        return of([map, astroids, positionInDegrees % 360, nextInLine]);
    }),
    skip(1),
    take(200),
    last()
).subscribe(a => console.log('part2: ' + (a[3].x * 100 + a[3].y)));

initial$.pipe(
    map(([map, astroids]) => {
        let counts = JSON.parse(JSON.stringify(map));
        for(var y = 0; y != map.length; y++) {
            for(var x = 0; x != map[0].length; x++) {
                if(map[y][x]) {
                    let origin = {
                        x: x,
                        y: y
                    } as Position;
                    let visibleAstroids = astroids.filter(
                        astroid => {
                            // Cannot count ourself
                            if(astroid.x == origin.x && astroid.y == origin.y) {
                                return false;
                            }

                            let options = getLineOfSightOptions(origin, astroid);
                            for(var t = 0; t != options.length; t++) {
                                let o = options[t];
                                if(map[o.y][o.x]) {
                                    return false;
                                }
                            }

                            return true;
                        }
                    );

                    counts[y][x] = visibleAstroids.length;
                }else {
                    counts[y][x] = 0;
                }
            }
        }
        return counts;
    }),
    map((counts: number[][]) => {
        // for(var y in counts) {
        //     for(var x in counts[y]) {
        //         if(counts[y][x] == 326) {
        //             console.log(x, y);
        //         }
        //     }
        // }
        return _.max(_.flatten(counts));
    })
).subscribe(output => console.log('part1: ' + output));