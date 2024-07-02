import GuildParser, { Guild } from "./parsers/guildParser"
import GuildsFileParser, { GuildLevels } from "./parsers/guildsFileParser"
import HelpRacesParser, { RaceHelp } from "./parsers/helpRacesParser"
import HelpSkillsParser, { SkillHelp } from "./parsers/helpSkillsParser"
import HelpSpellsParser, { SpellHelp } from "./parsers/helpSpellsParser"
import LevelCostParser, { LevelCost } from "./parsers/levelCostParser"
import { FileObject } from "./page"
import StatCostParser, { StatCost } from "./parsers/statCostParser"
import QpCostParser, { QpCost } from "./parsers/qpCostParser"
import AblitiyCostsParser, { Ability } from "./parsers/abilityCostParser"
import WishCostParser, { WishCost } from "./parsers/wishCostParser"
import RacesFileParser, { Race } from "./parsers/raceParser"

export const NON_GUILD_FILES = [
  'guilds.chr',
  'help_races.chr',
  'help_spell.chr',
  'help_skill.chr',
  'levelcost.chr',
  'questpoints.chr',
  'races.chr',
  'spells.chr',
  'skills.chr',
  'statcost.chr',
  'wishcost.chr',
]

export type ParserProcess = {
  run: () => Promise<Ability[]> | Promise<GuildLevels[]> | Promise<Race[]> |Promise<Guild> | Promise<RaceHelp[]> | Promise<SkillHelp[]> | Promise<SpellHelp[]> | Promise<LevelCost> | Promise<QpCost> | Promise<StatCost> | Promise<WishCost>
  key: "skillCost" | "spellCost" | "guilds" | "races" | "helpRace" | "helpSkills" | "helpSpells" | "levelCosts" | "qpCosts" | "statCosts" | "wishCosts" | string
}


export default function ParserFactory() {

  return {
    createProcessForFile: (data: FileObject): Promise<ParserProcess> => {
      if (!NON_GUILD_FILES.includes(data.name)) {
        return GuildParser(data)
      } else if (data.name === 'races.chr') {
        return RacesFileParser(data)
      }
      else if (data.name === 'guilds.chr') {
        return GuildsFileParser(data)
      } else if (data.name === 'help_races.chr') {
        return HelpRacesParser(data)
      } else if (data.name === 'help_spell.chr') {
        return HelpSpellsParser(data)
      } else if (data.name === 'help_skill.chr') {
        return HelpSkillsParser(data)
      } else if (data.name === 'levelcosts.chr') {
        return LevelCostParser(data)
      } else if (data.name === 'questpoints.chr') {
        return QpCostParser(data)
      } else if (data.name === 'spells.chr') {
        return AblitiyCostsParser(data, 'skills')
      } else if (data.name === 'skills.chr') {
        return AblitiyCostsParser(data, 'spells')
      } else if (data.name === 'statcost.chr') {
        return StatCostParser(data)
      } else if (data.name === 'wishcost.chr') {
        return WishCostParser(data)
      } else {
        throw new Error(`Unknown file: ${data.name}`)
      }

    }
  }

}

