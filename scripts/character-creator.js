export class CharacterCreator extends FormApplication 
{
    constructor(character_sheet, owner_id) 
    {
      const template_file = "modules/handy-hints/assets/myFormApplication.html";

      console.log("try load the compendium content to get ancestries, background, and classes")
      let ancestries = []
      let ancestry_feats = []
      let heritages = []
      const ancestry_compendium = game.packs.get("pf2e.ancestries")
      const heritages_compendium = game.packs.get("pf2e.heritages")
      const feats_compendium = game.packs.get("pf2e.feats-srd")
      for( const feat_entry of feats_compendium.index )
      {
        console.log(feat_entry)
        let feat = game.packs.get("pf2e.feats-srd").getDocument(feat_entry._id)
      }

      loadTemplates([
        "modules/handy-hints/assets/settings.html", 
        "modules/handy-hints/assets/ancestry.html", 
        "modules/handy-hints/assets/background.html", 
        "modules/handy-hints/assets/class.html"]);
      const template_data = { title: "Handlebars header text.",
                              tabs: [
                                      { 
                                        label: "ancestry",
                                        title: "Ancestry",
                                        ancestry: true,
                                        ancestries: ancestry_compendium.index,
                                        ancesty_feats: feats_compendium.index,
                                        heritages: heritages_compendium.index
                                      },
                                      { 
                                        label: "background",
                                        title: "Background",
                                        content: "<em>Fancy tab3 content.</em>",
                                        background: true
                                      },
                                      { 
                                        label: "class",
                                        title: "Class",
                                        content: "<em>Fancy tab4 content.</em>",
                                        class: true
                                      }]
                            };
        super( 
          template_data, 
          {
            template: template_file,
            tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "tab1"}],
            resizable: true,
          }
        );
        this.character_sheet = character_sheet;
        this.owner_id = owner_id;
      }
    
      static get defaultOptions() {
        return super.defaultOptions
      }
    
      getData(options = {}) {
        return super.getData().object; // the object from the constructor is where we are storing the data
      }
      
      activateListeners(html) {
        super.activateListeners(html);

        html.find('.ancestry-selected').click( async ev => {
          console.log("something was clicked!!!")
          console.log(ev)
          let my_ancestry_id = ev.currentTarget.attributes[2].value
          console.log("ancestry: " + my_ancestry_id)
          let ancestry_sheet = await game.packs.get("pf2e.ancestries").getDocument(my_ancestry_id)
          console.log(ancestry_sheet)
          console.log(ancestry_sheet.sheet)
          ancestry_sheet.sheet.render(true)
        });
      }
    
      async _updateObject(event, formData) {
        // console.log(formData.exampleInput);
        // this.character_sheet.name = formData.exampleInput
        // this.character_sheet.object.update({
        //   name: formData.exampleInput
        // })
    }
}