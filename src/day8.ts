import * as fs from 'fs';
import {combineLatest, EMPTY, from, Observable, of, pipe, range} from 'rxjs';
import {expand, filter, last, map, max, mergeMap, scan, take, tap, toArray} from 'rxjs/operators';
import _ from 'lodash';

const input = fs.readFileSync('resources/day8.txt', 'utf8');

const wide = 25;
const tall = 6;

function getCount(a: any, type: string) {
    if(a[type]) {
        return a[type].length;
    }
    return 0;
}

const layers$ = of(input).pipe(
    map(txt => _.chunk(txt, 1).map(a => Number(a))),
    mergeMap(input => {
        const layerSize = wide*tall;
        const layers = _.chunk(input, layerSize);
        return from(layers);
    })
);

layers$.pipe(
    map(layer => {
        return _.groupBy(layer, (a) => a);
    }),
    max((a: any, b: any) => getCount(a, '0') > getCount(b, '0') ? -1 : 1),
    map(layer => {
        return getCount(layer, '1') * getCount(layer, '2')
    })
).subscribe(output => console.log('part1: ' + output));

// part 2
layers$.pipe(
    toArray(),
    map(layers => {
        let pixels = [];
        for(var i = 0; i != layers[0].length; i++) {
            for(var y = 0; y !== layers.length; y++) {
                if(layers[y][i] != 2) {
                    pixels.push(layers[y][i]);
                    break;
                }
            }
        }
        return pixels
    }),
    mergeMap(pixels => from(_.chunk(pixels, wide))),
).subscribe(output => console.log(output));