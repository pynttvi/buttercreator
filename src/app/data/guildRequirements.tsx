import {FullGuild} from "@/app/utils/guildUtils";
import {Race} from "@/app/parsers/raceParser";

export type GuildRequirement = {
    name: string,
    required?: { name: "any" | string, levels: number }
    blockedBy?: { name: string }[]
}

export const guildRequirements: GuildRequirement[] = [
    {name: "Artists Of Samurai", required: {name: "Dojo Of Bushido", levels: 10}},
    {name: "Dojo Of Ninjutsu", required: {name: "Dojo Of Bushido", levels: 10}},


    {
        name: "druid", blockedBy: [
            {name: "necromancer"},
            {name: "death knight"},
            {name: "warlock"},
        ]
    },
    {
        name: "death knight", blockedBy: [
            {name: "druid"},
            {name: "healer"},
            {name: "paladin"},
        ]
    },
    {name: "Faction Of Chaos", required: {name: "Faction Of Balance", levels: 5}},
    {name: "Faction Of Order", required: {name: "Faction Of Balance", levels: 5}},
    {
        name: "healer", blockedBy: [
            {name: "death knight"},
        ]
    },
    {name: "Masters Of The Body", required: {name: "Master Of Martial Arts", levels: 10}},
    {name: "Masters Of The Body", required: {name: "Master Of Martial Arts", levels: 10}},
    {name: "Masters Of The Mind", required: {name: "Master Of Martial Arts", levels: 10}},
    {name: "Masters Of Melee", required: {name: "any", levels: 45}},
    {
        name: "necromancer", blockedBy: [
            {name: "druid"},
        ]
    },
    {
        name: "paladin", blockedBy: [
            {name: "death knight"},
            {name: "sorcerers"},
            {name: "warlock"},
        ]
    },
    {name: "spellblade", required: {name: "any", levels: 45}},

    {name: "Samurai Shogunate", required: {name: "Dojo Of Bushido", levels: 10}},
    {
        name: "sorcerers", blockedBy: [
            {name: "paladin"},
        ]
    },
    {name: "traders", required: {name: "any", levels: 45}},
    {name: "The Golden Company", required: {name: "any", levels: 45}},


    {
        name: "warlock", blockedBy: [
            {name: "druid"},
            {name: "paladin"},
        ]
    },

    //{required: {name: "", levels: 0}},
    //  {name: "", blockedBy: [{name: "", type: "race"}]},
]


export function guildMeetsRequirements(guild: FullGuild, flatGuilds: FullGuild[], level: number, race?: Race | null | undefined) {
    let enabled = true
    const req = guildRequirements.find(g => g.name.toLowerCase() === guild.name.toLowerCase())

    if (!req) return enabled

    if (req.required) {
        if (req.required.name === "any") {
            if (level < req.required.levels) enabled = false
        } else {
            const rq = flatGuilds.find(fg => fg.name.toLowerCase() === req.required?.name?.toLowerCase())

            if (!rq) enabled = false

            if ((rq?.trained || 0) < req.required.levels) enabled = false
        }

        if (!enabled) return enabled
    }

    if (req.blockedBy) {
        req.blockedBy.forEach((bb) => {
            const bq = flatGuilds.find(fg => fg.name.toLowerCase() === bb.name.toLowerCase())
            if (bq) enabled = false

            if (race) {
                if (race.name.toLowerCase() === bb.name.toLowerCase()) enabled = false
            }
            if (!enabled) return enabled
        })

        if (!enabled) return enabled
    }


    return enabled
}
