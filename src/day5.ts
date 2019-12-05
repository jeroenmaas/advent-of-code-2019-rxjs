import * as fs from 'fs';
import {EMPTY, from, of, pipe} from 'rxjs';
import {expand, filter, last, map, mergeMap, take, tap} from 'rxjs/operators';

const input = fs.readFileSync('resources/day5.txt', 'utf8');

const input$ = of(input).pipe(
    map(txt => txt.split(',').map(a => Number(a))),
);

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
    }
];

interface Argument {
    memoryValue: number;
    mode: 0 | 1;
}

function getRealValue(array: number[], arg: Argument) {
    if (arg.mode == 1) {
        return arg.memoryValue;
    } else {
        return array[arg.memoryValue];
    }
}

function reverseString(str: string) {
    return str.split("").reverse().join("");
}

const convertArrayToOutput = (input: number) => pipe(
    mergeMap((array: number[]) => {
        return of([array, 0, []] as [number[], number, number[]]).pipe(
            expand(([array, position, outputs]) => {
                const opcodeInfo = String(array[position]);
                const opcode = Number(opcodeInfo.slice(-2));
                if (opcode == 99) {
                    //console.log('reached opcode 99');
                    return EMPTY;
                }
                const instruction = instructions.find(s => s.opcode == opcode);
                if (instruction == null) {
                    console.error("Unknown opcode: " + opcode);
                    return EMPTY;
                }

                const modeInfos = reverseString(opcodeInfo.slice(0, -2).padStart(instruction.arguments, '0'));
                const args: Argument[] = [];
                for (var i = 0; i != instruction.arguments; i++) {
                    const modeInfo = modeInfos.charAt(i);
                    const memoryValue = array[position + (i + 1)];
                    if (modeInfo == '1') {
                        args.push({memoryValue: memoryValue, mode: 1});
                    } else if (modeInfo == '0') {
                        args.push({memoryValue: memoryValue, mode: 0});
                    } else {
                        console.error("Unknown mode!");
                    }
                }

                let nextPosition = position + (1 + instruction.arguments);
                if (opcode == 1) {
                    array[array[position + 3]] = getRealValue(array, args[0]) + getRealValue(array, args[1]);
                } else if (opcode == 2) {
                    array[array[position + 3]] = getRealValue(array, args[0]) * getRealValue(array, args[1]);
                } else if (opcode == 3) {
                    array[array[position + 1]] = input;
                }else if (opcode == 4) {
                    outputs.push(getRealValue(array, args[0]))
                }else if (opcode == 5) {
                    const value = getRealValue(array, args[0]);
                    if(value != 0) {
                        nextPosition = getRealValue(array, args[1]);
                    }
                }else if (opcode == 6) {
                    const value = getRealValue(array, args[0]);
                    if(value == 0) {
                        nextPosition = getRealValue(array, args[1]);
                    }
                }else if (opcode == 7) {
                    const value1 = getRealValue(array, args[0]);
                    const value2 = getRealValue(array, args[1]);
                    if(value1 < value2) {
                        array[array[position + 3]] = 1;
                    }else {
                        array[array[position + 3]] = 0;
                    }
                }else if (opcode == 8) {
                    const value1 = getRealValue(array, args[0]);
                    const value2 = getRealValue(array, args[1]);
                    if(value1 == value2) {
                        array[array[position + 3]] = 1;
                    }else {
                        array[array[position + 3]] = 0;
                    }
                }
                return of([array, nextPosition, outputs]);
            }),
            last()
        )
    })
    )
;

input$.pipe(
    convertArrayToOutput(1),
    map(output => output[2].slice(-1)[0])
).subscribe(output => console.log('part1: ' + output));

input$.pipe(
    convertArrayToOutput(5),
    map(output => output[2].slice(-1)[0])
).subscribe(output => console.log('part2: ' + output));