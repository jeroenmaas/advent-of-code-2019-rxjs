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

const convertArrayToOutput = () => pipe(
    mergeMap((array: number[]) => {
        return of([array, 0, []] as [number[], number, number[]]).pipe(
            expand(([array, position, outputs]) => {
                const opcodeInfo = String(array[position]);
                const opcode = Number(opcodeInfo.slice(-2));
                if (opcode == 99) {
                    console.log('reached opcode 99');
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
                if (opcode == 1) {
                    array[array[position + 3]] = getRealValue(array, args[0]) + getRealValue(array, args[1]);
                } else if (opcode == 2) {
                    array[array[position + 3]] = getRealValue(array, args[0]) * getRealValue(array, args[1]);
                } else if (opcode == 3) {
                    array[array[position + 1]] = 1;
                }else if (opcode == 4) {
                    outputs.push(getRealValue(array, args[0]))
                }
                return of([array, position + (1 + instruction.arguments), outputs]);
            }),
            last()
        )
    })
    )
;

input$.pipe(
    convertArrayToOutput(),
    map(output => output[2].slice(-1)[0])
).subscribe(output => console.log('part1: ' + output));