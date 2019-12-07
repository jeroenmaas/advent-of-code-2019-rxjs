import * as fs from 'fs';
import {EMPTY, from, of, pipe} from 'rxjs';
import {expand, filter, last, map, mergeMap, take, tap} from 'rxjs/operators';

const input = fs.readFileSync('resources/day6.txt', 'utf8');

interface Orbit {
    name: string;
    parent: Orbit | null;
    childs: Orbit[];
}

function getOrbitCount(orbit: Orbit) {
    let count = 0;
    if (orbit.parent) {
        count += 1;
        count += getOrbitCount(orbit.parent);
    }

    return count;
}


const orbitsMap$ = of(input).pipe(
    map(txt => txt.split('\n').map(a => a.split(')'))),
    map(inputs => {
        let orbitsByName = new Map<string, Orbit>();

        inputs.forEach(input => {
            let origin = input[0];
            let orbit = input[1];

            let originObject: Orbit;
            if (orbitsByName.has(origin)) {
                originObject = orbitsByName.get(origin) as Orbit;
            } else {
                originObject = {
                    name: origin,
                    parent: null,
                    childs: []
                };
                orbitsByName.set(origin, originObject);
            }

            let orbitObject: Orbit;
            if (orbitsByName.has(orbit)) {
                orbitObject = orbitsByName.get(orbit) as Orbit;
            } else {
                orbitObject = {
                    name: orbit,
                    parent: null,
                    childs: []
                };
                orbitsByName.set(orbit, orbitObject);
            }

            originObject.childs.push(orbitObject);
            if (orbitObject.parent) {
                console.error("This already has a parent! ", orbitObject);
            } else {
                orbitObject.parent = originObject;
            }
        });

        return orbitsByName;
    })
);

orbitsMap$.pipe(
    map(map => {
        let count = 0;
        map.forEach(e => {
            count += getOrbitCount(e);
        });
        return count;
    })
).subscribe(orbits => console.log('part1: ' + orbits));

function lookDown(steps: number, orbit: Orbit) {
    steps += 1;
    let stepsFound = null;
    orbit.childs.forEach(child => {
        if(child.name == 'SAN') {
            stepsFound = steps;
            return;
        }

        let output = lookDown(steps, child);
        if(output) {
            stepsFound = output;
        }
    });

    if(stepsFound) {
        return stepsFound;
    }

    return null;
}

orbitsMap$.pipe(
    map(map => {
        const you = map.get('YOU');

        let hops = 0;
        let obs = you;
        while(obs = obs.parent) {
            hops += 1;
            const res = lookDown(hops, obs);
            if (res != null) {
                return res-2;
            }
        }
    }
)).subscribe(output => console.log('part2: ' + output));