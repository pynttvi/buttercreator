import {expect, test} from "vitest";
import {sortByMaxAndName} from "@/app/filters/utils";
import {mockCreatorData, renderWrapper} from "../../../vitestSetup";
import {FullGuild, MainGuild, SubGuild} from "@/app/service/guildService";
import {waitFor} from "@testing-library/react";
import {Buttercreator} from "@/app/components/mainContent";
import {LoggingConfig} from "@/app/config/loggingConfig";
import {doFilter} from "@/app/filters/creatorDataFilters";
import {ReincAbility, ReincContextType} from "@/app/contexts/reincContext";
import {Ability} from "@/app/parsers/abilityCostParser";

test('filters AbilitiesByGuild with max values', async () => {
    LoggingConfig().configure()

    const {creatorDataContext, reinc, component} = await mockCreatorData();
    const {rerender} = component
    let wrapper = renderWrapper(reinc, creatorDataContext)
    let newReinc: ReincContextType = {
        ...wrapper.reinc as ReincContextType,
        level: 45
    }
    wrapper = renderWrapper(newReinc, creatorDataContext)
    rerender(wrapper.component)
    newReinc = wrapper.reinc as ReincContextType

    const ranger = reinc.allGuilds.find((g) => g.name === "ranger") as MainGuild

    newReinc = {
        ...newReinc,
        guilds: [...reinc.allGuilds.filter(g => g.name !== "ranger"), {...ranger, trained: 45} as FullGuild],
    }

    if (!newReinc || !newReinc.filterData) {
        throw new Error("Test error")
    }

    await waitFor(() => {
        expect(component).toBeTruthy()
    })

    let fd = doFilter(creatorDataContext, newReinc)
    if (!fd) {
        throw new Error("Test error")
    }
    expect(fd?.skills.find(s => s.name === "attack")).toMatchObject(
        {name: "attack", max: 100, enabled: true},
    )

    const attack = {...fd.skills.find((rs) => rs.name === "attack"), trained: 100} as ReincAbility
    newReinc = {
        ...newReinc,
        guilds: [...reinc.allGuilds.filter(g => g.name !== "ranger"), {...ranger, trained: 45} as FullGuild],
        skills: [...fd.skills.filter(s => s.name !== "attack"), attack]
    }

    fd = doFilter(creatorDataContext, newReinc)
    if (!fd) {
        throw new Error("Test error")
    }
    expect(fd?.skills.find(s => s.name === "attack")).toMatchObject(
        {name: "attack", max: 100, trained: 100, enabled: true},
    )

    expect(fd?.skills.length).toEqual(43)

    const animalLore = {...fd.skills.find((rs) => rs.name === "animal lore"), trained: 100} as ReincAbility

    const loremasters = ranger?.subGuilds.find(sg => sg.name === "ranger loremasters") as SubGuild
    ranger.subGuilds = [...ranger?.subGuilds.filter(sg => sg.name !== "ranger loremasters") || [], {...loremasters, trained: 5}]
    newReinc = {
        ...newReinc,
        guilds: [...reinc.allGuilds.filter(g => g.name !== "ranger"),
            {
                ...ranger,
                trained: 45
            } as FullGuild],
        skills: [...fd.skills.filter(s => s.name !== "animal lore"), animalLore]
    }

    fd = doFilter(creatorDataContext, newReinc)
    console.debug("ANIMAL LORE", animalLore)
    console.debug("SUBS", newReinc.guilds.find(g => g.name === "ranger")?.subGuilds)
    console.log("FDA", fd?.skills)


    expect(fd?.skills.find(s => s.name === "animal lore")).toMatchObject(
        {name: "animal lore", max: 100, trained: 100, enabled: true},
    )
})