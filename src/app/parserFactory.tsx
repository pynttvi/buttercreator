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

export type GuildNames = "guild_abjurer" | "guild_actors" | "guild_advanced_elementalists" | "guild_advanced_undeads" | "guild_artists_of_samurai" | "guild_assassins" | "guild_bard" | "guild_blademasters" | "guild_brawlers" | "guild_cantadorian_guard" | "guild_cleric" | "guild_costs.txt" | "guild_dark_adepts" | "guild_death_knight" | "guild_dojo_of_bushido" | "guild_dojo_of_ninjutsu" | "guild_dread_reaper" | "guild_druid" | "guild_dryad" | "guild_elemental_champions" | "guild_elementalists" | "guild_faction_of_balance" | "guild_faction_of_chaos" | "guild_faction_of_order" | "guild_fighter" | "guild_filidh" | "guild_followers_of_asmodeus" | "guild_followers_of_mortos" | "guild_gallants" | "guild_goblin_cabal" | "guild_grand_medics" | "guild_grave_warden" | "guild_harmonizers" | "guild_healer" | "guild_herbalists" | "guild_knights_hospitalar" | "guild_knights_inquisitor" | "guild_knights_templar" | "guild_levelcosts" | "guild_literalists" | "guild_mage" | "guild_magus_artiste" | "guild_master_magicians" | "guild_master_of_martial_arts" | "guild_master_thieves" | "guild_masters_of_death" | "guild_masters_of_defence" | "guild_masters_of_magic" | "guild_masters_of_melee" | "guild_masters_of_the_body" | "guild_masters_of_the_elements" | "guild_masters_of_the_mind" | "guild_minstrels" | "guild_mist_walkers" | "guild_monk" | "guild_muggers" | "guild_myrmidons" | "guild_navigators" | "guild_necromancer" | "guild_nightweaver" | "guild_order_of_light" | "guild_order_of_shadow" | "guild_paladin" | "guild_psionicist" | "guild_psychokinetics" | "guild_psychometabolics" | "guild_ranger" | "guild_ranger_loremasters" | "guild_rangers_of_the_deep_forest" | "guild_rangers_of_the_forgotten_desert" | "guild_rangers_of_the_high_mountains" | "guild_samurai" | "guild_samurai_shogunate" | "guild_scathach" | "guild_sorcerers" | "guild_spell_weavers" | "guild_spellblade" | "guild_telepathics" | "guild_terran_knights" | "guild_the_golden_company" | "guild_the_royal_warders" | "guild_thief" | "guild_traders" | "guild_troubadours" | "guild_tur_loc-maethor" | "guild_unholy_protectors" | "guild_warlock"

export type ParserProcess = {
  run: () => Promise<Ability[]> | Promise<GuildLevels[]> | Promise<Race[]> |Promise<Guild> | Promise<RaceHelp[]> | Promise<SkillHelp[]> | Promise<SpellHelp[]> | Promise<LevelCost> | Promise<QpCost> | Promise<StatCost> | Promise<WishCost>
  key: keyof CreatorDataType | GuildNames
}

export type CreatorDataType = {
  skills: Ability[]
  spells: Ability[]
  guilds: Guild[]
  races: Race[]
  helpRace: RaceHelp[]
  helpSkills: SkillHelp[]
  helpSpells: SpellHelp[]
  levelCosts: LevelCost[]
  qpCost: QpCost[]
  statCost: StatCost[]
  wishCost: WishCost[]
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
        return AblitiyCostsParser(data, 'spells')
      } else if (data.name === 'skills.chr') {
        return AblitiyCostsParser(data, 'skills')
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

