import * as ko from "knockout";
import * as React from "react";

import _ = require("lodash");
import {
  HpVerbosityOption,
  PlayerViewSettings
} from "../../common/PlayerViewSettings";
import { AccountClient } from "../Account/AccountClient";
import { CombatantCommander } from "../Commands/CombatantCommander";
import { Command } from "../Commands/Command";
import { CommandSetting } from "../Commands/CommandSetting";
import { Libraries } from "../Library/Libraries";
import { Store } from "../Utility/Store";
import {
  AutoGroupInitiativeOption,
  AutoRerollInitiativeOption,
  CurrentSettings,
  Settings
} from "./Settings";
import { About } from "./components/About";
import { AccountSettings } from "./components/AccountSettings";
import { EpicInitiativeSettings } from "./components/EpicInitiativeSettings";

export class SettingsViewModel {
  public PlayerViewAllowPlayerSuggestions: KnockoutObservable<boolean>;
  public ActiveCombatantOnTop: KnockoutObservable<boolean>;
  public PlayerViewDisplayTurnTimer: KnockoutObservable<boolean>;
  public PlayerViewDisplayRoundCounter: KnockoutObservable<boolean>;
  public DisplayDifficulty: KnockoutObservable<boolean>;
  public DisplayTurnTimer: KnockoutObservable<boolean>;
  public DisplayRoundCounter: KnockoutObservable<boolean>;
  public AutoCheckConcentration: KnockoutObservable<boolean>;
  public AutoGroupInitiativeOptions: AutoGroupInitiativeOption[];
  public AutoGroupInitiative: KnockoutObservable<AutoGroupInitiativeOption>;
  public AutoRerollInitiativeOptions: AutoRerollInitiativeOption[];
  public AutoRerollInitiative: KnockoutObservable<AutoRerollInitiativeOption>;
  public AllowNegativeHP: KnockoutObservable<boolean>;
  public HideMonstersOutsideEncounter: KnockoutObservable<boolean>;
  public HpVerbosityOptions: HpVerbosityOption[];
  public MonsterHpVerbosity: KnockoutObservable<HpVerbosityOption>;
  public PlayerHpVerbosity: KnockoutObservable<HpVerbosityOption>;
  public CombatantCommands: Command[];
  public CurrentTab = ko.observable<string>("about");
  public RollHp: KnockoutObservable<boolean>;

  public epicInitiativeSettings: React.ReactElement<EpicInitiativeSettings>;
  private playerViewSettings: PlayerViewSettings;

  public SelectTab = (tabName: string) => () => this.CurrentTab(tabName);

  private getUpdatedSettings(): Settings {
    const getCommandSetting = (command: Command): CommandSetting => ({
      Name: command.Id,
      KeyBinding: command.KeyBinding,
      ShowOnActionBar: command.ShowOnActionBar()
    });

    return {
      Commands: [...this.encounterCommands, ...this.CombatantCommands].map(
        getCommandSetting
      ),
      Rules: {
        AllowNegativeHP: this.AllowNegativeHP(),
        AutoCheckConcentration: this.AutoCheckConcentration(),
        RollMonsterHp: this.RollHp(),
        AutoGroupInitiative: this.AutoGroupInitiative(),
        AutoRerollInitiative: this.AutoRerollInitiative()
      },
      TrackerView: {
        DisplayDifficulty: this.DisplayDifficulty(),
        DisplayRoundCounter: this.DisplayRoundCounter(),
        DisplayTurnTimer: this.DisplayTurnTimer()
      },
      PlayerView: {
        ...this.playerViewSettings,
        AllowPlayerSuggestions: this.PlayerViewAllowPlayerSuggestions(),
        ActiveCombatantOnTop: this.ActiveCombatantOnTop(),
        DisplayRoundCounter: this.PlayerViewDisplayRoundCounter(),
        DisplayTurnTimer: this.PlayerViewDisplayTurnTimer(),
        HideMonstersOutsideEncounter: this.HideMonstersOutsideEncounter(),
        MonsterHPVerbosity: this.MonsterHpVerbosity(),
        PlayerHPVerbosity: this.PlayerHpVerbosity()
      },
      Version: process.env.VERSION
    };
  }

  public SaveAndClose() {
    const newSettings = this.getUpdatedSettings();
    CurrentSettings(newSettings);
    Store.Save(Store.User, "Settings", newSettings);
    new AccountClient().SaveSettings(newSettings);
    this.settingsVisible(false);
  }

  constructor(
    private encounterCommands: Command[],
    combatantCommander: CombatantCommander,
    private libraries: Libraries,
    private settingsVisible: KnockoutObservable<boolean>,
    protected repeatTutorial: () => void,
    protected reviewPrivacyPolicy: () => void
  ) {
    this.CombatantCommands = combatantCommander.Commands;

    const currentSettings = CurrentSettings();

    this.RollHp = ko.observable(currentSettings.Rules.RollMonsterHp);
    this.AllowNegativeHP = ko.observable(currentSettings.Rules.AllowNegativeHP);
    this.AutoCheckConcentration = ko.observable(
      currentSettings.Rules.AutoCheckConcentration
    );

    this.AutoGroupInitiative = ko.observable(
      currentSettings.Rules.AutoGroupInitiative
    );
    this.AutoGroupInitiativeOptions = _.values<
      typeof AutoGroupInitiativeOption
    >(AutoGroupInitiativeOption);

    this.AutoRerollInitiative = ko.observable(
      currentSettings.Rules.AutoRerollInitiative
    );
    this.AutoRerollInitiativeOptions = _.values<
      typeof AutoRerollInitiativeOption
    >(AutoRerollInitiativeOption);

    this.DisplayRoundCounter = ko.observable(
      currentSettings.TrackerView.DisplayRoundCounter
    );
    this.DisplayTurnTimer = ko.observable(
      currentSettings.TrackerView.DisplayTurnTimer
    );
    this.DisplayDifficulty = ko.observable(
      currentSettings.TrackerView.DisplayDifficulty
    );

    this.MonsterHpVerbosity = ko.observable(
      currentSettings.PlayerView.MonsterHPVerbosity
    );
    this.PlayerHpVerbosity = ko.observable(
      currentSettings.PlayerView.PlayerHPVerbosity
    );
    this.HpVerbosityOptions = _.values<typeof HpVerbosityOption>(
      HpVerbosityOption
    );
    this.HideMonstersOutsideEncounter = ko.observable(
      currentSettings.PlayerView.HideMonstersOutsideEncounter
    );
    this.PlayerViewDisplayRoundCounter = ko.observable(
      currentSettings.PlayerView.DisplayRoundCounter
    );
    this.PlayerViewDisplayTurnTimer = ko.observable(
      currentSettings.PlayerView.DisplayTurnTimer
    );
    this.PlayerViewAllowPlayerSuggestions = ko.observable(
      currentSettings.PlayerView.AllowPlayerSuggestions
    );
    this.ActiveCombatantOnTop = ko.observable(
      currentSettings.PlayerView.ActiveCombatantOnTop
    );

    this.playerViewSettings = currentSettings.PlayerView;
    this.epicInitiativeSettings = (
      <EpicInitiativeSettings playerViewSettings={this.playerViewSettings} />
    );
  }

  public about = (
    <About
      repeatTutorial={this.repeatTutorial}
      reviewPrivacyPolicy={this.reviewPrivacyPolicy}
    />
  );

  public accountSettings = (
    <AccountSettings
      accountClient={new AccountClient()}
      libraries={this.libraries}
    />
  );
}
