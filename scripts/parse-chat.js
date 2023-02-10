import { Action, Strike, Spell, Ability } from './actions.js';

export class ChatParser
{
    constructor(pf2eChatMessage)
    {
        let pf2eParent = pf2eChatMessage["flags"]["pf2e"]
        if(!pf2eParent?.["origin"])
        {
            return
        }

        if(pf2eParent["origin"]["type"] == "feat")
        {
            let ability = new Ability( pf2eChatMessage )
            this.action_class = ability
        }

        let context = pf2eParent["context"]
        if(pf2eParent?.["casting"])
        {
            this.action_class = new Spell(pf2eChatMessage)
        }
        else if(pf2eParent?.["strike"])
        {
            this.action_class = new Strike( pf2eChatMessage )
        }
    }

    get action()
    {
        return this.action_class
    }
}