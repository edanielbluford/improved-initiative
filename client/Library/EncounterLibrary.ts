import { ServerListing } from "../../common/Listable";
import { AccountClient } from "../Account/AccountClient";
import { SavedCombatant, SavedEncounter } from "../Encounter/SavedEncounter";
import { UpdateLegacySavedEncounter } from "../Encounter/UpdateLegacySavedEncounter";
import { Store } from "../Utility/Store";
import { Listing, ListingOrigin } from "./Listing";

export class EncounterLibrary {
    public Encounters = ko.observableArray<Listing<SavedEncounter<SavedCombatant>>>([]);

    constructor() {
        const listings = Store.List(Store.SavedEncounters).map(e => {
            const encounter = UpdateLegacySavedEncounter(Store.Load<SavedEncounter<SavedCombatant>>(Store.SavedEncounters, e));
            return listingFrom(encounter, e);
        });
        ko.utils.arrayPushAll(this.Encounters, listings);
    }

    public AddListings(listings: ServerListing[], source: ListingOrigin) {
        ko.utils.arrayPushAll<Listing<SavedEncounter<SavedCombatant>>>(
            this.Encounters,
            listings.map(l => new Listing(l.Id, l.Name, l.Path, l.SearchHint, l.Link, source))
        );
    }

    public Save = (savedEncounter: SavedEncounter<SavedCombatant>) => {
        const listing = listingFrom(savedEncounter, savedEncounter.Id);

        if (this.Encounters().indexOf(listing) === -1) {
            this.Encounters.push(listing);
        }
        Store.Save(Store.SavedEncounters, listing.Id, savedEncounter);

        new AccountClient().SaveEncounter(savedEncounter)
            .then(r => {
                if (!r) {
                    return;
                }
                const accountListing = listingFrom(savedEncounter, listing.Id);
                accountListing.Origin = "account";
                accountListing.Link = `/my/encounters/${accountListing.Id}`;
                this.Encounters.push(accountListing);
            });

    }

    public Delete = (listing: Listing<SavedEncounter<SavedCombatant>>) => {
        this.Encounters.remove(l => l.Id == listing.Id);
        new AccountClient().DeleteEncounter(listing.Id);
        Store.Delete(Store.SavedEncounters, listing.Id);
    }
}

function listingFrom(savedEncounter: SavedEncounter<SavedCombatant>, encounterId: string) {
    const listingId = encounterId;
    const combatantNames = savedEncounter.Combatants.map(c => c.Alias).join(" ");
    return new Listing<SavedEncounter<SavedCombatant>>(
        listingId,
        savedEncounter.Name,
        savedEncounter.Path,
        combatantNames,
        Store.SavedEncounters,
        "localStorage",);
}
