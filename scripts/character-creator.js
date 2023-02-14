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
        let feat = game.packs.get("pf2e.feats-srd").getDocument(feat_entry._id)
      }

      loadTemplates([
        "modules/handy-hints/assets/sidebar.html", 
        "modules/handy-hints/assets/ancestry.html", 
        "modules/handy-hints/assets/background.html", 
        "modules/handy-hints/assets/class.html"]);
      const template_data = { title: "Handlebars header text.",
                              chosen_ancestry: "drag choice here",
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
        let title_name = "Character Builder: " + character_sheet.object.name
        super( 
          template_data, 
          {
            title: title_name,
            template: template_file,
            tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "tab1"}],
            resizable: true,
          }
        );
        this.character_sheet = character_sheet;
        this.owner_id = owner_id;
      }
    
      _onDragStart( event ) {
        if(!event.currentTarget.classList.contains("ancestry-row"))
        {
          super._onDragStart(event);
        }

        const dragData =
        {
          type: "Ancestry",
          id: event.currentTarget.dataset.documentId,
        }
        event.dataTransfer.setData('text/plain', JSON.stringify(dragData))
      }

      async _onDrop(event) {
        let data;
        try {
          data = JSON.parse(event.dataTransfer.getData('text/plain'))
        } catch (err)
        {
          console.log(err)
          return false;
        }
        // TODO if ancestry
        this._updateObject(event, data)
      }

      static get defaultOptions() {
        const options = super.defaultOptions;
        options.dragDrop.push({ dragSelector: ".ancestry-row", dropSelector: null});
        return options
      }
    
      getData(options = {}) {
        return super.getData().object; // the object from the constructor is where we are storing the data
      }
      
      activateListeners(html) {
        super.activateListeners(html);

        html.find('.ancestry-selected').click( async ev => {
          let my_ancestry_id = ev.currentTarget.attributes[2].value
          let ancestry_sheet = await game.packs.get("pf2e.ancestries").getDocument(my_ancestry_id)
          ancestry_sheet.sheet.render(true)
        });
      }
    
      async _updateObject(event, formData) {
        //  TODO filter for ancestry/heritage/class/etc.
        let data = super.getData().object
        data.chosen_ancestry = formData.id
        this.render( true ) // sets value but render fails
      }
}