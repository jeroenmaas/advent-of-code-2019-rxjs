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
import {expand, filter, last, map, max, mergeMap, scan, take, tap} from 'rxjs/operators';
import _ from 'lodash';

const input = fs.readFileSync('resources/day11.txt', 'utf8');

let originalInput = input.split(',').map(a => Number(a));
// const input$ = of(input).pipe(
//     map(txt => txt.split(',').map(a => Number(a))),
//     tap(input => originalInput = JSON.parse(JSON.stringify(input))),
// ).subscribe();

interface Instruction {
    opcode: number;
    arguments: number;
}

const instructions: Instruction[] = [
    {
        opcode: 1,
        arguments: 3,
    },
    {
        opcode: 2,
        arguments: 3
    },
    {
        opcode: 3,
        arguments: 1,
    },
    {
        opcode: 4,
        arguments: 1
    },
    {
        opcode: 5,
        arguments: 2
    },
    {
        opcode: 6,
        arguments: 2
    },
    {
        opcode: 7,
        arguments: 3
    },
    {
        opcode: 8,
        arguments: 3
    },
    {
        opcode: 9,
        arguments: 1
    }
];

interface Argument {
    memoryValue: number;
    mode: 0 | 1 | 2;
}

function getRealValue(array: number[], arg: Argument, relativePosition: number) {
    if ([0, 1, 2].indexOf(arg.mode) === -1) {
        throw "Unknown mode: " + arg.mode;
    }

    let output;
    if (arg.mode == 0) {
        output = array[arg.memoryValue];
    } else if (arg.mode == 1) {
        output = arg.memoryValue;
    } else if (arg.mode == 2) {
        output = array[relativePosition + arg.memoryValue];
    }
    if (typeof output == 'undefined') {
        output = 0;
    }
    return output;
}

function getDest(arg: Argument, relativeBase: number): number {
    let dest = 0;
    if (arg.mode == 0) {
        dest = arg.memoryValue;
    } else if (arg.mode == 2) {
        dest = relativeBase + arg.memoryValue;
    } else {
        throw "Unknown output mode: " + arg.mode;
    }
    if (typeof dest == 'undefined') {
        dest = 0;
    }

    return dest;
}

function reverseString(str: string) {
    return str.split("").reverse().join("");
}

enum HaltType {
    WAITING_FOR_INPUT = 'waiting_for_input',
    END = 'end'
};

const convertArrayToOutput = (inputs: number[], position: number = 0, relativeBase: number = 0) => pipe(
    mergeMap((array: number[]) => {
        let haltType: HaltType = HaltType.END;
        return of([array, position, relativeBase, []] as [number[], number, number, number[]]).pipe(
            expand(([array, position, rb, outputs]) => {
                const opcodeInfo = String(array[position]);
                const opcode = Number(opcodeInfo.slice(-2));
                if (opcode == 99) {
                    //console.log('reached opcode 99');
                    return EMPTY;
                }
                const instruction = instructions.find(s => s.opcode == opcode);
                if (instruction == null) {
                    throw "Unknown opcode!"
                }

                const modeInfos = reverseString(opcodeInfo.slice(0, -2).padStart(instruction.arguments, '0'));
                const args: Argument[] = [];
                for (var i = 0; i != instruction.arguments; i++) {
                    const modeInfo = modeInfos.charAt(i);
                    const memoryValue = array[position + (i + 1)];

                    if (['0', '1', '2'].indexOf(modeInfo) === -1) {
                        throw "Unknown mode: " + modeInfo;
                    }
                    args.push({memoryValue: memoryValue, mode: Number(modeInfo) as any});
                }

                let nextPosition = position + (1 + instruction.arguments);
                if (opcode == 1) {
                    array[getDest(args[2], rb)] = getRealValue(array, args[0], rb) + getRealValue(array, args[1], rb);
                } else if (opcode == 2) {
                    array[getDest(args[2], rb)] = getRealValue(array, args[0], rb) * getRealValue(array, args[1], rb);
                } else if (opcode == 3) {
                    if (inputs.length == 0) {
                        haltType = HaltType.WAITING_FOR_INPUT;
                        return EMPTY;
                    }

                    array[getDest(args[0], rb)] = inputs.shift() as number;
                } else if (opcode == 4) {
                    //console.log('OUTPUT!', getRealValue(array, args[0], rb));
                    outputs.push(getRealValue(array, args[0], rb))
                } else if (opcode == 5) {
                    const value = getRealValue(array, args[0], rb);
                    if (value != 0) {
                        nextPosition = getRealValue(array, args[1], rb);
                    }
                } else if (opcode == 6) {
                    const value = getRealValue(array, args[0], rb);
                    if (value == 0) {
                        nextPosition = getRealValue(array, args[1], rb);
                    }
                } else if (opcode == 7) {
                    const value1 = getRealValue(array, args[0], rb);
                    const value2 = getRealValue(array, args[1], rb);
                    if (value1 < value2) {
                        array[getDest(args[2], rb)] = 1;
                    } else {
                        array[getDest(args[2], rb)] = 0;
                    }
                } else if (opcode == 8) {
                    const value1 = getRealValue(array, args[0], rb);
                    const value2 = getRealValue(array, args[1], rb);
                    if (value1 == value2) {
                        array[getDest(args[2], rb)] = 1;
                    } else {
                        array[getDest(args[2], rb)] = 0;
                    }
                } else if (opcode == 9) {
                    rb += getRealValue(array, args[0], rb);
                } else {
                    throw "Unknown opcode!";
                }
                return of([array, nextPosition, rb, outputs]);
            }, Number.POSITIVE_INFINITY),
            last(),
            map(results => {
                return {
                    'memory': results[0] as number[],
                    'position': results[1] as number,
                    'relativeBase': results[2] as number,
                    'outputs': results[3] as number[],
                    'haltType': haltType
                };
            })
        )
    })
);

interface Action {
    color: number;
    direction: number;
}

interface Robot {
    x: number;
    y: number;
    r: 0 | 1 | 2 | 3; // 0 up / 1 == right / 2 == down / 3 == left
}

interface PaintedPosition {
    x: number,
    y: number,
    color: number
    index: number
}

of(originalInput).pipe(
    mergeMap(memory => {
        return of([memory, {x: 0, y: 0, r: 0}, [], 0, 0] as [number[], Robot, PaintedPosition[], number, number]).pipe(
            expand(([memory, robot, paintedPositions, lastPosition, relativeBase]) => {
                let paintOfCurrentPosition = 0;
                for (let i = paintedPositions.length - 1; i >= 0; i--) {
                    let testPos = paintedPositions[i];
                    if (testPos.x == robot.x && testPos.y == robot.y) {
                        paintOfCurrentPosition = testPos.color;
                        break;
                    }
                }
                if(paintedPositions.length == 0) {
                    paintOfCurrentPosition = 1;
                }

                return of(memory).pipe(
                    convertArrayToOutput([paintOfCurrentPosition], lastPosition, relativeBase),
                    filter(output => output.haltType !== 'end'),
                    map(results => {
                        //console.log(results.relativeBase);
                        //console.log(results.haltType);
                        paintedPositions.push({x: robot.x, y: robot.y, color: results.outputs[0], index: paintedPositions.length});
                        let diff = results.outputs[1] == 1 ? 1 : -1;
                        robot.r = ((robot.r + diff) % 4) as -1 | 0 | 1 | 2 | 3;
                        if (robot.r == -1) {
                            robot.r = 3;
                        }
                        if (robot.r == 0) {
                            robot.y -= 1;
                        } else if (robot.r == 1) {
                            robot.x += 1;
                        } else if (robot.r == 2) {
                            robot.y += 1;
                        } else if (robot.r == 3) {
                            robot.x -= 1;
                        } else {
                            console.log(diff);
                            console.log(robot.r);
                            throw "This shouldnt happen"
                        }

                        return [memory, robot, paintedPositions, results.position, results.relativeBase];
                    })
                )
            }, 10000000, queueScheduler)
        );
    }),
    last(),
    map(outputs => {
        let paints = outputs[2] as PaintedPosition[];
        let xmin = 1000000;
        let xmax = -10000000;
        let ymin = 10000000;
        let ymax = -100000000;
        paints.forEach(paint => {
            if(paint.x < xmin) {
                xmin = paint.x;
            }
            if(paint.x > xmax) {
                xmax = paint.x;
            }
            if(paint.y > ymax) {
                ymax = paint.y;
            }
            if(paint.y < ymin) {
                ymin = paint.y;
            }
        });

        const screen: number[][] = [];
        for(var y = 0; y!= (ymax-ymin) + 1; y++) {
            const row: number[] = [];
            for(let x = 0; x != (xmax-xmin) + 1; x++) {
                row[x] = 0;
            }
            screen[y] = row;
        }

        //-10 => 0, -9 => 1 -8 => 2 -7 => 3 -6 => 4 55 4 6
        paints.forEach(paint => {
            // console.log(paint.y + Math.abs(ymin));
            screen[paint.y + Math.abs(ymin)][paint.x + Math.abs(xmin)] = paint.color;
        });

        console.log('part2:');
        screen.forEach(
            row => {
                let output = '';
                row.forEach(a => {
                    if(a == 1){
                        output += '#';
                    }else {
                        output += '.';
                    }
                });
                console.log(output);
            }
        );

        return [];
    })
).subscribe();

of(originalInput).pipe(
    mergeMap(memory => {
        return of([memory, {x: 0, y: 0, r: 0}, [], 0] as [number[], Robot, PaintedPosition[], number]).pipe(
            expand(([memory, robot, paintedPositions, lastPosition]) => {
                let paintOfCurrentPosition = 0;
                for (let i = paintedPositions.length - 1; i >= 0; i--) {
                    let testPos = paintedPositions[i];
                    if (testPos.x == robot.x && testPos.y == robot.y) {
                        paintOfCurrentPosition = testPos.color;
                        break;
                    }
                }

                return of(memory).pipe(
                    convertArrayToOutput([paintOfCurrentPosition], lastPosition),
                    filter(output => output.haltType !== 'end'),
                    map(results => {
                        //console.log(results.haltType);
                        paintedPositions.push({x: robot.x, y: robot.y, color: results.outputs[0]});
                        let diff = results.outputs[1] == 1 ? 1 : -1;
                        robot.r = ((robot.r + diff) % 4) as -1 | 0 | 1 | 2 | 3;
                        if (robot.r == -1) {
                            robot.r = 3;
                        }
                        if (robot.r == 0) {
                            robot.y -= 1;
                        } else if (robot.r == 1) {
                            robot.x += 1;
                        } else if (robot.r == 2) {
                            robot.y += 1;
                        } else if (robot.r == 3) {
                            robot.x -= 1;
                        } else {
                            console.log(diff);
                            console.log(robot.r);
                            throw "This shouldnt happen"
                        }

                        return [memory, robot, paintedPositions, results.position];
                    })
                )
            }, 10000000, queueScheduler)
        );
    }),
    last(),
    map(outputs => {
        let uniqueCount = _.uniqBy(outputs[2], (value) => JSON.stringify([value.x, value.y])).length;
        let counts = outputs[2].length;
        return uniqueCount;
    })
).subscribe(output => console.log('part1: ', output));