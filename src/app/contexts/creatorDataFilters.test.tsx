import {expect, test} from "vitest";
import {sortByMaxAndName} from "@/app/filters/utils";
import {mockCreatorData, renderWrapper} from "../../../vitestSetup";
import {FullGuild} from "@/app/service/guildService";
import {waitFor} from "@testing-library/react";
import {Buttercreator} from "@/app/components/mainContent";
import {LoggingConfig} from "@/app/config/loggingConfig";

test('filters AbilitiesByGuild with max values', async () => {
    LoggingConfig().configure()

    const {creatorDataContext, reinc, component} = await mockCreatorData();

    const ranger = reinc.guildService.getMainGuilds().find((g) => g.name === "ranger")

    const {rerender} = component
    await waitFor(() => {
        reinc.addOrUpdateGuild('main', ranger as FullGuild, 45)
    })

    let wrapper = renderWrapper(reinc, creatorDataContext)
    let newReinc = {...wrapper.reinc, guilds:[ranger]}
    if(!newReinc) return
    rerender(wrapper.component)

    await waitFor(() => {
        expect(component).toBeTruthy()
    })

    console.log("REINC GUILDS", newReinc.guilds)

    expect(sortByMaxAndName([])).toMatchObject([
        {name: "Atest", max: 50},
        {name: "Btest", max: 50},
        {name: "Btest", max: 0},
        {name: "Ctest", max: 100},])
})