import { DurationTiming } from "./DurationTiming";
import { Listable } from "./Listable";
import { StatBlock } from "./StatBlock";
import { probablyUniqueString } from "./Toolbox";

export interface CombatantState {
    Id: string;
    StatBlock: StatBlock;
    PersistentCharacterId?: string;
    MaxHP: number;
    CurrentHP: number;
    TemporaryHP: number;
    Initiative: number;
    InitiativeGroup?: string;
    Alias: string;
    IndexLabel: number;
    Tags: string[] | TagState[];
    Hidden: boolean;
    InterfaceVersion: string;
    ImageURL: string;
}

export interface TagState {
    Text: string;
    DurationRemaining: number;
    DurationTiming: DurationTiming;
    DurationCombatantId: string;
}

export interface EncounterState<T> extends Listable {
    ActiveCombatantId: string | null;
    RoundCounter?: number;
    Combatants: T[];
}

export function DefaultEncounterState(): EncounterState<CombatantState> {
    return {
        ActiveCombatantId: null,
        RoundCounter: 0,
        Combatants: [],
        Name: "DEFAULT_SAVED_ENCOUNTER",
        Id: probablyUniqueString(),
        Path: "",
        Version: process.env.VERSION || "0.0.0",
    };
}