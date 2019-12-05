import * as fs from 'fs';
import {EMPTY, from, of, pipe, range} from 'rxjs';
import {count, expand, filter, last, map, mergeMap, min, share, shareReplay, take, tap, toArray} from 'rxjs/operators';
import groupBy from 'lodash/groupBy'
import intersectionWith from 'lodash/intersectionWith'
import _ from 'lodash';

const input = fs.readFileSync('resources/day4.txt', 'utf8');

of(input).pipe(
    map(input => input.split('-').map(v => Number(v))),
    mergeMap(input => range(input[0], input[1] - input[0])),
    // tap(test => console.log(test)),
    filter(numberToTest => {
        // console.log(numberToTest);
        const test = String(numberToTest);
        let previous = 0;
        let matches = 0;
        for (var i = 0; i != test.length; i++) {
            var char = Number(test[i]);
            if (char == previous && i != 0) {
                matches++;
            }
            if (previous > char) {
                return false;
            }
            previous = char;
        }
        if (matches == 0) {
            return false;
        }

        return true;
    }),
    count()
).subscribe(matches => console.log('part1: ' + matches));

of(input).pipe(
    map(input => input.split('-').map(v => Number(v))),
    mergeMap(input => range(input[0], input[1] - input[0])),
    // tap(test => console.log(test)),
    filter(numberToTest => {
        // console.log(numberToTest);
        const test = String(numberToTest);
        let previousOfPrevious = 0;
        let previous = 0;
        let matches = 0;
        for (var i = 0; i != test.length; i++) {
            var char = Number(test[i]);
            if (char == previous && i != 0) {
                matches++;
            }
            if (previous > char) {
                return false;
            }
            previousOfPrevious = previous;
            previous = char;
        }

        if (matches == 0) {
            return false;
        }

        const matchesByNumber = _.groupBy(test, i => i);
        const result = Object.values(matchesByNumber).find(t => t.length == 2);
        if(typeof result == 'undefined') {
            return false;
        }

        return true;
    }),
    count()
).subscribe(matches => console.log('part2: ' + matches));