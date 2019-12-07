import * as fs from 'fs';
import {combineLatest, EMPTY, from, Observable, of, pipe, range} from 'rxjs';
import {expand, filter, last, map, max, mergeMap, scan, take, tap} from 'rxjs/operators';

const input = fs.readFileSync('resources/day7.txt', 'utf8');

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
    }
];

interface Argument {
    memoryValue: number;
    mode: 0 | 1;
}

function getRealValue(array: number[], arg: Argument) {
    if (arg.mode == 1) {
        return arg.memoryValue;
    } else if(arg.mode == 0) {
        return array[arg.memoryValue];
    }else {
        throw "Unkown mode: " + arg.mode;
    }
}

function reverseString(str: string) {
    return str.split("").reverse().join("");
}

enum HaltType{
    WAITING_FOR_INPUT = 'waiting_for_input',
    END = 'end'
};

const convertArrayToOutput = (inputs: number[], position: number = 0) => pipe(
    mergeMap((array: number[]) => {
        let haltType: HaltType = HaltType.END;
        return of([array, position, []] as [number[], number, number[]]).pipe(
            expand(([array, position, outputs]) => {
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
                    if (modeInfo == '1') {
                        args.push({memoryValue: memoryValue, mode: 1});
                    } else if (modeInfo == '0') {
                        args.push({memoryValue: memoryValue, mode: 0});
                    } else {
                        throw "Unknown mode";
                    }
                }

                let nextPosition = position + (1 + instruction.arguments);
                if (opcode == 1) {
                    array[array[position + 3]] = getRealValue(array, args[0]) + getRealValue(array, args[1]);
                } else if (opcode == 2) {
                    array[array[position + 3]] = getRealValue(array, args[0]) * getRealValue(array, args[1]);
                } else if (opcode == 3) {
                    //console.log('INPUT!');
                    if(inputs.length == 0) {
                        haltType = HaltType.WAITING_FOR_INPUT;
                        return EMPTY;
                    }

                    array[array[position + 1]] = inputs.shift() as number;
                } else if (opcode == 4) {
                    //console.log('OUTPUT!', getRealValue(array, args[0]));
                    outputs.push(getRealValue(array, args[0]))
                } else if (opcode == 5) {
                    const value = getRealValue(array, args[0]);
                    if (value != 0) {
                        nextPosition = getRealValue(array, args[1]);
                    }
                } else if (opcode == 6) {
                    const value = getRealValue(array, args[0]);
                    if (value == 0) {
                        nextPosition = getRealValue(array, args[1]);
                    }
                } else if (opcode == 7) {
                    const value1 = getRealValue(array, args[0]);
                    const value2 = getRealValue(array, args[1]);
                    if (value1 < value2) {
                        array[array[position + 3]] = 1;
                    } else {
                        array[array[position + 3]] = 0;
                    }
                } else if (opcode == 8) {
                    const value1 = getRealValue(array, args[0]);
                    const value2 = getRealValue(array, args[1]);
                    if (value1 == value2) {
                        array[array[position + 3]] = 1;
                    } else {
                        array[array[position + 3]] = 0;
                    }
                }else {
                    throw "Unknown opcode!";
                }
                return of([array, nextPosition, outputs]);
            }),
            last(),
            map(results => {
                // console.log(haltType);
                // console.log('halt position: ' + results[1]);
                return {
                    'memory': results[0] as number[],
                    'position': results[1] as number,
                    'outputs': results[2] as number[],
                    'haltType': haltType
                };
            })
        )
    })
    )
;

let uniqueFaseCombinations$1 = of([]).pipe(
    mergeMap(value => {
        return range(0, 5).pipe(
            map(number => [...value, number])
        )
    }),
    mergeMap(value => {
        return range(0, 5).pipe(
            map(number => [...value, number])
        )
    }),
    mergeMap(value => {
        return range(0, 5).pipe(
            map(number => [...value, number])
        )
    }),
    mergeMap(value => {
        return range(0, 5).pipe(
            map(number => [...value, number])
        )
    }),
    mergeMap(value => {
        return range(0, 5).pipe(
            map(number => [...value, number])
        )
    }),
    filter(values => (new Set(values)).size == 5)
) as Observable<number[]>;

let uniqueFaseCombinations$2 = of([]).pipe(
    mergeMap(value => {
        return range(5, 5).pipe(
            map(number => [...value, number])
        )
    }),
    mergeMap(value => {
        return range(5, 5).pipe(
            map(number => [...value, number])
        )
    }),
    mergeMap(value => {
        return range(5, 5).pipe(
            map(number => [...value, number])
        )
    }),
    mergeMap(value => {
        return range(5, 5).pipe(
            map(number => [...value, number])
        )
    }),
    mergeMap(value => {
        return range(5, 5).pipe(
            map(number => [...value, number])
        )
    }),
    filter(values => (new Set(values)).size == 5)
) as Observable<number[]>;


uniqueFaseCombinations$1.pipe(
    mergeMap(faseCombination => {
          return of([faseCombination, 0]).pipe(
              expand(([combinationsLeft, value]) => {
                  if(combinationsLeft.length == 0) {
                      return EMPTY;
                  }
                  let memory = JSON.parse(JSON.stringify(originalInput));
                  return of(memory).pipe(
                      convertArrayToOutput([combinationsLeft.shift(),value]),
                      map(output => [combinationsLeft, output['outputs'].slice(-1)[0]]),
                  );
              }),
              last(),
              map(output => output[1])
          )
    }),
    max()
).subscribe(output => console.log('part1: ' + output));

uniqueFaseCombinations$2.pipe(
    mergeMap(faseCombination => {
        const amplifyCount = 5;
        const memory = [] as number[][];
        const inputsForAmplify = [] as number[][];
        const positions = [] as number[];
        let halts = 0;
        for(var i = 0; i != amplifyCount; i++) {
            memory[i] = JSON.parse(JSON.stringify(originalInput));
            inputsForAmplify[i] = [faseCombination[i]];
            positions[i] = 0;
        }
        inputsForAmplify[0].push(0);

        return of([0, 0]).pipe(
            expand(([value, pos]) => {
                let amplifyIndex = pos % 5;
                let amplifyMemory = memory[amplifyIndex];
                // console.log('fase: ', faseCombination[amplifyIndex]);
                // console.log('value: ', value);

                if(halts == 5) {
                    return EMPTY;
                }

                // console.log('inputs: ', inputsForAmplify[amplifyIndex]);
                // console.log('position: ', positions[amplifyIndex]);
                return of(amplifyMemory).pipe(
                    // tap(memory => console.log(memory.reduce((a,b) => a + b, 0))),
                    convertArrayToOutput(inputsForAmplify[amplifyIndex], positions[amplifyIndex]),
                    // tap(test => console.log(test['outputs'])),
                    tap(output => {
                        inputsForAmplify[(pos+1) % 5] = inputsForAmplify[(pos+1) % 5].concat(output['outputs']);
                        positions[amplifyIndex] = output['position'];
                        if(output['haltType'] == HaltType.END) {
                            halts++;
                        }
                    }),
                    map(output => [output['outputs'], pos+1])
                );
            }),
            last(),
            // map(output => output[1])
        )
    }),
    map(output => output[0]),
    max()
).subscribe(output => console.log('part2: ' + output));

// input$.pipe(
//     convertArrayToOutput(5),
//     map(output => output[2].slice(-1)[0])
// ).subscribe(output => console.log('part2: ' + output));