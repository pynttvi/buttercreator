import {expect, test} from "vitest";
import {Ability} from "@/app/parsers/abilityCostParser";
import {onlyUniqueNameWithHighestMax, sortByMaxAndName} from "@/app/utils/utils";

test('sortByMaxAndName sorts bigger first', async () => {
    const abilities = [
        {name: "Atest", max: 50},
        {name: "Btest", max: 0},
        {name: "Btest", max: 50},
        {name: "Ctest", max: 100},
    ]
    expect(sortByMaxAndName(abilities)).toMatchObject([
        {name: "Atest", max: 50},
        {name: "Btest", max: 50},
        {name: "Btest", max: 0},
        {name: "Ctest", max: 100},])
})

test('onlyUniqueNameWithHighestMax filters higest max value', async () => {
    const abilities = [
        {name: "Atest", max: 50},
        {name: "Btest", max: 0},
        {name: "Btest", max: 50},
        {name: "Ctest", max: 100},
    ] as unknown as Ability[]
    expect(onlyUniqueNameWithHighestMax(abilities)).toMatchObject([
        {name: "Atest", max: 50},
        {name: "Btest", max: 50},
        {name: "Ctest", max: 100},])
})