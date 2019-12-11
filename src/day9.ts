import * as fs from 'fs';
import {asyncScheduler, combineLatest, EMPTY, from, Observable, of, pipe, queueScheduler, range} from 'rxjs';
import {expand, filter, last, map, max, mergeMap, scan, take, tap} from 'rxjs/operators';

const inputText = '1102,34463338,34463338,63,1007,63,34463338,63,1005,63,53,1101,0,3,1000,109,988,209,12,9,1000,209,6,209,3,203,0,1008,1000,1,63,1005,63,65,1008,1000,2,63,1005,63,904,1008,1000,0,63,1005,63,58,4,25,104,0,99,4,0,104,0,99,4,17,104,0,99,0,0,1101,29,0,1010,1102,1,1,1021,1101,0,36,1002,1101,573,0,1026,1101,0,33,1012,1102,1,25,1004,1102,1,38,1000,1102,31,1,1003,1102,23,1,1006,1102,777,1,1028,1102,20,1,1011,1101,0,566,1027,1101,0,27,1009,1101,26,0,1005,1101,0,0,1020,1102,1,37,1014,1101,32,0,1001,1101,0,24,1007,1101,0,35,1018,1101,30,0,1017,1101,0,22,1008,1102,460,1,1023,1101,0,768,1029,1102,1,487,1024,1102,1,34,1013,1102,1,28,1015,1101,0,39,1019,1101,478,0,1025,1101,0,463,1022,1101,21,0,1016,109,9,1208,0,30,63,1005,63,201,1001,64,1,64,1105,1,203,4,187,1002,64,2,64,109,3,1201,-8,0,63,1008,63,24,63,1005,63,227,1001,64,1,64,1106,0,229,4,209,1002,64,2,64,109,-1,2108,32,-8,63,1005,63,245,1106,0,251,4,235,1001,64,1,64,1002,64,2,64,109,-11,2101,0,2,63,1008,63,35,63,1005,63,275,1001,64,1,64,1105,1,277,4,257,1002,64,2,64,109,3,2101,0,-1,63,1008,63,36,63,1005,63,303,4,283,1001,64,1,64,1106,0,303,1002,64,2,64,109,16,21108,40,40,-6,1005,1013,325,4,309,1001,64,1,64,1106,0,325,1002,64,2,64,109,-4,21102,41,1,-4,1008,1011,41,63,1005,63,351,4,331,1001,64,1,64,1105,1,351,1002,64,2,64,109,-15,2102,1,4,63,1008,63,24,63,1005,63,375,1001,64,1,64,1106,0,377,4,357,1002,64,2,64,109,6,1201,-2,0,63,1008,63,25,63,1005,63,403,4,383,1001,64,1,64,1106,0,403,1002,64,2,64,109,8,2102,1,-6,63,1008,63,22,63,1005,63,425,4,409,1106,0,429,1001,64,1,64,1002,64,2,64,109,-1,2108,27,-4,63,1005,63,447,4,435,1106,0,451,1001,64,1,64,1002,64,2,64,109,8,2105,1,2,1105,1,469,4,457,1001,64,1,64,1002,64,2,64,109,5,2105,1,-2,4,475,1001,64,1,64,1106,0,487,1002,64,2,64,109,-33,1202,7,1,63,1008,63,37,63,1005,63,507,1105,1,513,4,493,1001,64,1,64,1002,64,2,64,109,2,2107,25,10,63,1005,63,535,4,519,1001,64,1,64,1106,0,535,1002,64,2,64,109,30,21107,42,41,-9,1005,1016,551,1106,0,557,4,541,1001,64,1,64,1002,64,2,64,109,2,2106,0,0,1001,64,1,64,1105,1,575,4,563,1002,64,2,64,109,-19,1202,-7,1,63,1008,63,32,63,1005,63,601,4,581,1001,64,1,64,1105,1,601,1002,64,2,64,109,-2,1207,-1,27,63,1005,63,619,4,607,1106,0,623,1001,64,1,64,1002,64,2,64,109,2,21101,43,0,6,1008,1014,45,63,1005,63,647,1001,64,1,64,1106,0,649,4,629,1002,64,2,64,109,17,1205,-4,663,4,655,1106,0,667,1001,64,1,64,1002,64,2,64,109,4,1205,-9,683,1001,64,1,64,1106,0,685,4,673,1002,64,2,64,109,-17,21101,44,0,-2,1008,1010,44,63,1005,63,711,4,691,1001,64,1,64,1105,1,711,1002,64,2,64,109,1,21102,45,1,3,1008,1016,42,63,1005,63,735,1001,64,1,64,1105,1,737,4,717,1002,64,2,64,109,-9,1207,1,25,63,1005,63,753,1105,1,759,4,743,1001,64,1,64,1002,64,2,64,109,23,2106,0,1,4,765,1001,64,1,64,1106,0,777,1002,64,2,64,109,-3,1206,-3,789,1105,1,795,4,783,1001,64,1,64,1002,64,2,64,109,-13,2107,25,-4,63,1005,63,815,1001,64,1,64,1105,1,817,4,801,1002,64,2,64,109,-9,21108,46,44,10,1005,1012,833,1105,1,839,4,823,1001,64,1,64,1002,64,2,64,109,-4,1208,10,22,63,1005,63,857,4,845,1105,1,861,1001,64,1,64,1002,64,2,64,109,28,1206,-6,879,4,867,1001,64,1,64,1105,1,879,1002,64,2,64,109,-4,21107,47,48,-3,1005,1019,897,4,885,1105,1,901,1001,64,1,64,4,64,99,21102,27,1,1,21101,915,0,0,1106,0,922,21201,1,14615,1,204,1,99,109,3,1207,-2,3,63,1005,63,964,21201,-2,-1,1,21102,1,942,0,1106,0,922,22101,0,1,-1,21201,-2,-3,1,21101,957,0,0,1105,1,922,22201,1,-1,-2,1106,0,968,22101,0,-2,-2,109,-3,2105,1,0';

const input = inputText; //fs.readFileSync('resources/day9.txt', 'utf8');

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
    if([0, 1, 2].indexOf(arg.mode) === -1 ) {
        throw "Unknown mode: " + arg.mode;
    }

    let output;
    if (arg.mode == 0) {
        output = array[arg.memoryValue];
    } else if(arg.mode == 1) {
        output = arg.memoryValue;
    } else if(arg.mode == 2) {
        output = array[relativePosition + arg.memoryValue];
    }
    if(typeof output == 'undefined') {
        output = 0;
    }
    return output;
}

function getDest(arg: Argument, relativeBase: number): number {
    let dest = 0;
    if(arg.mode == 0) {
        dest = arg.memoryValue;
    }else if(arg.mode == 2) {
        dest = relativeBase + arg.memoryValue;
    }else {
        throw "Unknown output mode: "  + arg.mode;
    }
    if(typeof dest == 'undefined') {
        dest = 0;
    }

    return dest;
}

function reverseString(str: string) {
    return str.split("").reverse().join("");
}

enum HaltType{
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

                    if(['0', '1', '2'].indexOf(modeInfo) === -1 ) {
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
            }, Number.POSITIVE_INFINITY, queueScheduler),
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

of(originalInput).pipe(
    convertArrayToOutput([1], 0)
).subscribe(output => console.log('part1: ' + output.outputs[0]));

of(originalInput).pipe(
    convertArrayToOutput([2], 0)
).subscribe(output => console.log('part2: ' + output.outputs[0]),
        test => console.log(test));

// input$.pipe(
//     convertArrayToOutput(5),
//     map(output => output[2].slice(-1)[0])
// ).subscribe(output => console.log('part2: ' + output));