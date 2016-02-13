define(["layout/masthead","utils/utils","libs/toastr","mvc/library/library-model","mvc/ui/ui-select"],function(a,b,c,d,e){var f=Backbone.View.extend({el:"#center",events:{"click #toolbtn_create_folder":"createFolderFromModal","click #toolbtn_bulk_import":"modalBulkImport","click #include_deleted_datasets_chk":"checkIncludeDeleted","click .toolbtn-show-locinfo":"showLocInfo","click #toolbtn_bulk_delete":"deleteSelectedDatasets","click #page_size_prompt":"showPageSizePrompt"},defaults:{can_add_library_item:!1,contains_file_or_folder:!1,chain_call_control:{total_number:0,failed_number:0},disabled_jstree_element:"folders"},modal:null,jstree:null,histories:null,select_genome:null,select_extension:null,list_extensions:[],auto:{id:"auto",text:"Auto-detect",description:"This system will try to detect the file type automatically. If your file is not detected properly as one of the known formats, it most likely means that it has some format problems (e.g., different number of columns on different rows). You can still coerce the system to set your data to the format you think it should be. You can also upload compressed files, which will automatically be decompressed."},list_genomes:[],initialize:function(a){this.options=_.defaults(a||{},this.defaults),this.fetchExtAndGenomes(),this.render()},render:function(a){this.options=_.extend(this.options,a);var b=this.templateToolBar(),c={id:this.options.id,is_admin:!1,is_anonym:!0,mutiple_add_dataset_options:!1};Galaxy.user&&(c.is_admin=Galaxy.user.isAdmin(),c.is_anonym=Galaxy.user.isAnonymous(),(null!==Galaxy.config.user_library_import_dir||Galaxy.config.allow_library_path_paste!==!1||null!==Galaxy.config.library_import_dir)&&(c.mutiple_add_dataset_options=!0)),this.$el.html(b(c))},renderPaginator:function(a){this.options=_.extend(this.options,a);var b=this.templatePaginator();this.$el.find("#folder_paginator").html(b({id:this.options.id,show_page:parseInt(this.options.show_page),page_count:parseInt(this.options.page_count),total_items_count:this.options.total_items_count,items_shown:this.options.items_shown}))},configureElements:function(a){this.options=_.extend(this.options,a),this.options.can_add_library_item===!0?$(".add-library-items").show():$(".add-library-items").hide(),this.options.contains_file_or_folder===!0&&Galaxy.user?Galaxy.user.isAnonymous()?($(".dataset-manipulation").show(),$(".logged-dataset-manipulation").hide()):($(".logged-dataset-manipulation").show(),$(".dataset-manipulation").show()):($(".logged-dataset-manipulation").hide(),$(".dataset-manipulation").hide()),this.$el.find("[data-toggle]").tooltip()},createFolderFromModal:function(a){a.preventDefault(),a.stopPropagation();var b=this,c=this.templateNewFolderInModal();this.modal=Galaxy.modal,this.modal.show({closing_events:!0,title:"Create New Folder",body:c(),buttons:{Create:function(){b.create_new_folder_event()},Close:function(){Galaxy.modal.hide()}}})},create_new_folder_event:function(){var a=this.serialize_new_folder();if(this.validate_new_folder(a)){var b=new d.FolderAsModel;url_items=Backbone.history.fragment.split("/"),current_folder_id=url_items[url_items.length-1],b.url=b.urlRoot+current_folder_id,b.save(a,{success:function(a){Galaxy.modal.hide(),c.success("Folder created."),a.set({type:"folder"}),Galaxy.libraries.folderListView.collection.add(a)},error:function(a,b){Galaxy.modal.hide(),c.error("undefined"!=typeof b.responseJSON?b.responseJSON.err_msg:"An error ocurred.")}})}else c.error("Folder's name is missing.");return!1},serialize_new_folder:function(){return{name:$("input[name='Name']").val(),description:$("input[name='Description']").val()}},validate_new_folder:function(a){return""!==a.name},modalBulkImport:function(){var a=$("#folder_table").find(":checked");0===a.length?c.info("You must select some datasets first."):this.refreshUserHistoriesList(function(a){var b=a.templateBulkImportInModal();a.modal=Galaxy.modal,a.modal.show({closing_events:!0,title:"Import into History",body:b({histories:a.histories.models}),buttons:{Import:function(){a.importAllIntoHistory()},Close:function(){Galaxy.modal.hide()}}})})},refreshUserHistoriesList:function(a){var b=this;this.histories=new d.GalaxyHistories,this.histories.fetch({success:function(){a(b)},error:function(a,b){c.error("undefined"!=typeof b.responseJSON?b.responseJSON.err_msg:"An error ocurred.")}})},importAllIntoHistory:function(){this.modal.disableButton("Import");var a=$("select[name=dataset_import_bulk] option:selected").val(),b=$("select[name=dataset_import_bulk] option:selected").text();this.options.last_used_history_id=a;var c=[],e=[];$("#folder_table").find(":checked").each(function(){""!==this.parentElement.parentElement.id&&this.parentElement.parentElement.classList.contains("dataset_row")?c.push(this.parentElement.parentElement.id):""!==this.parentElement.parentElement.id&&this.parentElement.parentElement.classList.contains("folder_row")&&e.push(this.parentElement.parentElement.id)});for(var f=[],g=c.length-1;g>=0;g--){var h=c[g],i=new d.HistoryItem;i.url=i.urlRoot+a+"/contents",i.content=h,i.source="library",f.push(i)}for(var g=e.length-1;g>=0;g--){var j=e[g],i=new d.HistoryItem;i.url=i.urlRoot+a+"/contents",i.content=j,i.source="library_folder",f.push(i)}this.initChainCallControl({length:f.length,action:"to_history",history_name:b}),jQuery.getJSON(Galaxy.root+"history/set_as_current?id="+a),this.chainCallImportingIntoHistory(f,b)},updateProgress:function(){this.progress+=this.progressStep,$(".progress-bar-import").width(Math.round(this.progress)+"%"),txt_representation=Math.round(this.progress)+"% Complete",$(".completion_span").text(txt_representation)},download:function(a,b){var c=[],d=[];$("#folder_table").find(":checked").each(function(){""!==this.parentElement.parentElement.id&&this.parentElement.parentElement.classList.contains("dataset_row")?c.push(this.parentElement.parentElement.id):""!==this.parentElement.parentElement.id&&this.parentElement.parentElement.classList.contains("folder_row")&&d.push(this.parentElement.parentElement.id)});var e=Galaxy.root+"api/libraries/datasets/download/"+b,f={ld_ids:c,folder_ids:d};this.processDownload(e,f,"get")},processDownload:function(a,b,d){if(a&&b){b="string"==typeof b?b:$.param(b);var e="";$.each(b.split("&"),function(){var a=this.split("=");e+='<input type="hidden" name="'+a[0]+'" value="'+a[1]+'" />'}),$('<form action="'+a+'" method="'+(d||"post")+'">'+e+"</form>").appendTo("body").submit().remove(),c.info("Your download will begin soon.")}else c.error("An error occurred.")},addFilesFromHistoryModal:function(){this.refreshUserHistoriesList(function(a){a.modal=Galaxy.modal;var b=a.templateAddFilesFromHistory(),d=a.options.full_path[a.options.full_path.length-1][1];a.modal.show({closing_events:!0,title:"Adding datasets from your history to folder "+d,body:b({histories:a.histories.models}),buttons:{Add:function(){a.addAllDatasetsFromHistory()},Close:function(){Galaxy.modal.hide()}},closing_callback:function(){Galaxy.libraries.library_router.back()}}),a.histories.models.length>0?(a.fetchAndDisplayHistoryContents(a.histories.models[0].id),$("#dataset_add_bulk").change(function(b){a.fetchAndDisplayHistoryContents(b.target.value)})):c.error("An error ocurred.")})},importFilesFromPathModal:function(){var a=this;this.modal=Galaxy.modal;var b=this.templateImportPathModal();this.modal.show({closing_events:!0,title:"Please enter paths to import",body:b({}),buttons:{Import:function(){a.importFromPathsClicked(a)},Close:function(){Galaxy.modal.hide()}},closing_callback:function(){Galaxy.libraries.library_router.navigate("folders/"+a.id,{trigger:!0})}}),this.renderSelectBoxes()},fetchExtAndGenomes:function(){var a=this;b.get({url:Galaxy.root+"api/datatypes?extension_only=False",success:function(b){for(key in b)a.list_extensions.push({id:b[key].extension,text:b[key].extension,description:b[key].description,description_url:b[key].description_url});a.list_extensions.sort(function(a,b){return a.id>b.id?1:a.id<b.id?-1:0}),a.list_extensions.unshift(a.auto)}}),b.get({url:Galaxy.root+"api/genomes",success:function(b){for(key in b)a.list_genomes.push({id:b[key][1],text:b[key][0]});a.list_genomes.sort(function(a,b){return a.id>b.id?1:a.id<b.id?-1:0})}})},renderSelectBoxes:function(){var a=this;this.select_genome=new e.View({css:"library-genome-select",data:a.list_genomes,container:Galaxy.modal.$el.find("#library_genome_select"),value:"?"}),this.select_extension=new e.View({css:"library-extension-select",data:a.list_extensions,container:Galaxy.modal.$el.find("#library_extension_select"),value:"auto"})},importFilesFromGalaxyFolderModal:function(a){var b=this,c=this.templateBrowserModal();this.modal=Galaxy.modal,this.modal.show({closing_events:!0,title:"Please select folders or files",body:c({}),buttons:{Import:function(){b.importFromJstreePath(b,a)},Close:function(){Galaxy.modal.hide()}},closing_callback:function(){Galaxy.libraries.library_router.navigate("folders/"+b.id,{trigger:!0})}}),this.renderSelectBoxes(),a.disabled_jstree_element="folders",this.renderJstree(a),$("input[type=radio]").change(function(c){"jstree-disable-folders"===c.target.value?(a.disabled_jstree_element="folders",b.renderJstree(a),$(".jstree-folders-message").hide(),$(".jstree-preserve-structure").hide(),$(".jstree-link-files").hide(),$(".jstree-files-message").show()):"jstree-disable-files"===c.target.value&&($(".jstree-files-message").hide(),$(".jstree-folders-message").show(),$(".jstree-link-files").show(),$(".jstree-preserve-structure").show(),a.disabled_jstree_element="files",b.renderJstree(a))})},renderJstree:function(a){this.options=_.extend(this.options,a);var b=a.source||"userdir",e=this.options.disabled_jstree_element;this.jstree=new d.Jstree,this.jstree.url=this.jstree.urlRoot+"?target="+b+"&format=jstree&disable="+e,this.jstree.fetch({success:function(a){define("jquery",function(){return jQuery}),require(["libs/jquery/jstree"],function(){$("#jstree_browser").jstree("destroy"),$("#jstree_browser").jstree({core:{data:a},plugins:["types","checkbox"],types:{folder:{icon:"jstree-folder"},file:{icon:"jstree-file"}},checkbox:{three_state:!1}})})},error:function(a,b){"undefined"!=typeof b.responseJSON?404001===b.responseJSON.err_code?c.warning(b.responseJSON.err_msg):c.error(b.responseJSON.err_msg):c.error("An error ocurred.")}})},importFromPathsClicked:function(){var a=this.modal.$el.find(".preserve-checkbox").is(":checked"),b=this.modal.$el.find(".link-checkbox").is(":checked"),d=this.select_extension.value(),e=this.select_genome.value(),f=$("textarea#import_paths").val(),g=[];if(f){this.modal.disableButton("Import"),f=f.split("\n");for(var h=f.length-1;h>=0;h--)trimmed=f[h].trim(),0!==trimmed.length&&g.push(trimmed);this.initChainCallControl({length:g.length,action:"adding_datasets"}),this.chainCallImportingFolders({paths:g,preserve_dirs:a,link_data:b,source:"admin_path",file_type:d,dbkey:e})}else c.info("Please enter a path relative to Galaxy root.")},initChainCallControl:function(a){var b;switch(a.action){case"adding_datasets":b=this.templateAddingDatasetsProgressBar(),this.modal.$el.find(".modal-body").html(b({folder_name:this.options.folder_name}));break;case"deleting_datasets":b=this.templateDeletingDatasetsProgressBar(),this.modal.$el.find(".modal-body").html(b());break;case"to_history":b=this.templateImportIntoHistoryProgressBar(),this.modal.$el.find(".modal-body").html(b({history_name:a.history_name}));break;default:console.error("Wrong action specified.")}this.progress=0,this.progressStep=100/a.length,this.options.chain_call_control.total_number=a.length,this.options.chain_call_control.failed_number=0},importFromJstreePath:function(a,b){var d=$("#jstree_browser").jstree().get_selected(!0),e=this.modal.$el.find(".preserve-checkbox").is(":checked"),f=this.modal.$el.find(".link-checkbox").is(":checked"),g=this.select_extension.value(),h=this.select_genome.value(),i=d[0].type,j=[];if(d.length<1)c.info("Please select some items first.");else{this.modal.disableButton("Import");for(var k=d.length-1;k>=0;k--)void 0!==d[k].li_attr.full_path&&j.push(d[k].li_attr.full_path);if(this.initChainCallControl({length:j.length,action:"adding_datasets"}),"folder"===i){var l=b.source+"_folder";this.chainCallImportingFolders({paths:j,preserve_dirs:e,link_data:f,source:l,file_type:g,dbkey:h})}else if("file"===i){var l=b.source+"_file";this.chainCallImportingUserdirFiles({paths:j,file_type:g,dbkey:h,source:l})}}},fetchAndDisplayHistoryContents:function(a){var b=new d.HistoryContents({id:a}),e=this;b.fetch({success:function(b){var c=e.templateHistoryContents();e.histories.get(a).set({contents:b}),e.modal.$el.find("#selected_history_content").html(c({history_contents:b.models.reverse()}))},error:function(a,b){c.error("undefined"!=typeof b.responseJSON?b.responseJSON.err_msg:"An error ocurred.")}})},addAllDatasetsFromHistory:function(){var a=this.modal.$el.find("#selected_history_content").find(":checked"),b=[],e=[];if(a.length<1)c.info("You must select some datasets first.");else{this.modal.disableButton("Add"),a.each(function(){var a=$(this.parentElement).data("id");a&&b.push(a)});for(var f=b.length-1;f>=0;f--){history_dataset_id=b[f];var g=new d.Item;g.url=Galaxy.root+"api/folders/"+this.options.id+"/contents",g.set({from_hda_id:history_dataset_id}),e.push(g)}this.initChainCallControl({length:e.length,action:"adding_datasets"}),this.chainCallAddingHdas(e)}},chainCallImportingIntoHistory:function(a,b){var d=this,e=a.pop();if("undefined"==typeof e)return 0===this.options.chain_call_control.failed_number?c.success("Selected datasets imported into history. Click this to start analysing it.","",{onclick:function(){window.location="/"}}):this.options.chain_call_control.failed_number===this.options.chain_call_control.total_number?c.error("There was an error and no datasets were imported into history."):this.options.chain_call_control.failed_number<this.options.chain_call_control.total_number&&c.warning("Some of the datasets could not be imported into history. Click this to see what was imported.","",{onclick:function(){window.location="/"}}),Galaxy.modal.hide(),!0;var f=$.when(e.save({content:e.content,source:e.source}));f.done(function(){d.updateProgress(),d.chainCallImportingIntoHistory(a,b)}).fail(function(){d.options.chain_call_control.failed_number+=1,d.updateProgress(),d.chainCallImportingIntoHistory(a,b)})},chainCallImportingUserdirFiles:function(a){var b=this,d=a.paths.pop();if("undefined"==typeof d)return 0===this.options.chain_call_control.failed_number?(c.success("Selected files imported into the current folder"),Galaxy.modal.hide()):c.error("An error occured."),!0;var e=$.when($.post(Galaxy.root+"api/libraries/datasets?encoded_folder_id="+b.id+"&source="+a.source+"&path="+d+"&file_type="+a.file_type+"&dbkey="+a.dbkey));e.done(function(){b.updateProgress(),b.chainCallImportingUserdirFiles(a)}).fail(function(){b.options.chain_call_control.failed_number+=1,b.updateProgress(),b.chainCallImportingUserdirFiles(a)})},chainCallImportingFolders:function(a){var b=this,d=a.paths.pop();if("undefined"==typeof d)return 0===this.options.chain_call_control.failed_number?(c.success("Selected folders and their contents imported into the current folder."),Galaxy.modal.hide()):c.error("An error occured."),!0;var e=$.when($.post(Galaxy.root+"api/libraries/datasets?encoded_folder_id="+b.id+"&source="+a.source+"&path="+d+"&preserve_dirs="+a.preserve_dirs+"&link_data="+a.link_data+"&file_type="+a.file_type+"&dbkey="+a.dbkey));e.done(function(){b.updateProgress(),b.chainCallImportingFolders(a)}).fail(function(){b.options.chain_call_control.failed_number+=1,b.updateProgress(),b.chainCallImportingFolders(a)})},chainCallAddingHdas:function(a){var b=this;this.added_hdas=new d.Folder;var e=a.pop();if("undefined"==typeof e)return 0===this.options.chain_call_control.failed_number?c.success("Selected datasets from history added to the folder"):this.options.chain_call_control.failed_number===this.options.chain_call_control.total_number?c.error("There was an error and no datasets were added to the folder."):this.options.chain_call_control.failed_number<this.options.chain_call_control.total_number&&c.warning("Some of the datasets could not be added to the folder"),Galaxy.modal.hide(),this.added_hdas;var f=$.when(e.save({from_hda_id:e.get("from_hda_id")}));f.done(function(c){Galaxy.libraries.folderListView.collection.add(c),b.updateProgress(),b.chainCallAddingHdas(a)}).fail(function(){b.options.chain_call_control.failed_number+=1,b.updateProgress(),b.chainCallAddingHdas(a)})},chainCallDeletingItems:function(a){var b=this;this.deleted_items=new d.Folder;var e=a.pop();if("undefined"==typeof e)return 0===this.options.chain_call_control.failed_number?c.success("Selected items were deleted."):this.options.chain_call_control.failed_number===this.options.chain_call_control.total_number?c.error("There was an error and no items were deleted. Please make sure you have sufficient permissions."):this.options.chain_call_control.failed_number<this.options.chain_call_control.total_number&&c.warning("Some of the items could not be deleted. Please make sure you have sufficient permissions."),Galaxy.modal.hide(),this.deleted_items;var f=$.when(e.destroy());f.done(function(c){if(Galaxy.libraries.folderListView.collection.remove(e.id),b.updateProgress(),Galaxy.libraries.folderListView.options.include_deleted){var f=null;"folder"===c.type||"LibraryFolder"===c.model_class?f=new d.FolderAsModel(c):"file"===c.type||"LibraryDataset"===c.model_class?f=new d.Item(c):(console.error("Unknown library item type found."),console.error(c.type||c.model_class)),Galaxy.libraries.folderListView.collection.add(f)}b.chainCallDeletingItems(a)}).fail(function(){b.options.chain_call_control.failed_number+=1,b.updateProgress(),b.chainCallDeletingItems(a)})},checkIncludeDeleted:function(a){Galaxy.libraries.folderListView.fetchFolder(a.target.checked?{include_deleted:!0}:{include_deleted:!1})},deleteSelectedDatasets:function(){var a=$("#folder_table").find(":checked");if(0===a.length)c.info("You must select at least one dataset for deletion.");else{var b=this.templateDeletingDatasetsProgressBar();this.modal=Galaxy.modal,this.modal.show({closing_events:!0,title:"Deleting selected datasets",body:b({}),buttons:{Close:function(){Galaxy.modal.hide()}}}),this.options.chain_call_control.total_number=0,this.options.chain_call_control.failed_number=0;var e=[],f=[];a.each(function(){""!==this.parentElement.parentElement.id&&("F"==this.parentElement.parentElement.id.substring(0,1)?f.push(this.parentElement.parentElement.id):e.push(this.parentElement.parentElement.id))});var g=e.length+f.length;this.progressStep=100/g,this.progress=0;for(var h=[],i=e.length-1;i>=0;i--){var j=new d.Item({id:e[i]});h.push(j)}for(var i=f.length-1;i>=0;i--){var k=new d.FolderAsModel({id:f[i]});h.push(k)}this.options.chain_call_control.total_number=g.length,this.chainCallDeletingItems(h)}},showLocInfo:function(){var a=null,b=this;null!==Galaxy.libraries.libraryListView?(a=Galaxy.libraries.libraryListView.collection.get(this.options.parent_library_id),this.showLocInfoModal(a)):(a=new d.Library({id:this.options.parent_library_id}),a.fetch({success:function(){b.showLocInfoModal(a)},error:function(a,b){c.error("undefined"!=typeof b.responseJSON?b.responseJSON.err_msg:"An error ocurred.")}}))},showLocInfoModal:function(a){var b=this,c=this.templateLocInfoInModal();this.modal=Galaxy.modal,this.modal.show({closing_events:!0,title:"Location Information",body:c({library:a,options:b.options}),buttons:{Close:function(){Galaxy.modal.hide()}}})},showImportModal:function(a){switch(a.source){case"history":this.addFilesFromHistoryModal();break;case"importdir":this.importFilesFromGalaxyFolderModal({source:"importdir"});break;case"path":this.importFilesFromPathModal();break;case"userdir":this.importFilesFromGalaxyFolderModal({source:"userdir"});break;default:Galaxy.libraries.library_router.back(),c.error("Invalid import source.")}},showPageSizePrompt:function(){var a=prompt("How many items per page do you want to see?",Galaxy.libraries.preferences.get("folder_page_size"));null!=a&&a==parseInt(a)&&(Galaxy.libraries.preferences.set({folder_page_size:parseInt(a)}),Galaxy.libraries.folderListView.render({id:this.options.id,show_page:1}))},templateToolBar:function(){return tmpl_array=[],tmpl_array.push('<div class="library_style_container">'),tmpl_array.push(' <div id="library_toolbar">'),tmpl_array.push('<form class="form-inline" role="form">'),tmpl_array.push("   <span><strong>DATA LIBRARIES</strong></span>"),tmpl_array.push('          <span id="folder_paginator" class="library-paginator">'),tmpl_array.push("          </span>"),tmpl_array.push('<div class="checkbox toolbar-item logged-dataset-manipulation" style="height: 20px; display:none;">'),tmpl_array.push("<label>"),tmpl_array.push('<input id="include_deleted_datasets_chk" type="checkbox"> include deleted </input>'),tmpl_array.push("</label>"),tmpl_array.push("</div>"),tmpl_array.push('   <button style="display:none;" data-toggle="tooltip" data-placement="top" title="Create New Folder" id="toolbtn_create_folder" class="btn btn-default primary-button add-library-items" type="button"><span class="fa fa-plus"></span> <span class="fa fa-folder"></span></button>'),tmpl_array.push("<% if(mutiple_add_dataset_options) { %>"),tmpl_array.push('   <div class="btn-group add-library-items" style="display:none;">'),tmpl_array.push('     <button title="Add Datasets to Current Folder" id="" type="button" class="primary-button dropdown-toggle" data-toggle="dropdown">'),tmpl_array.push('     <span class="fa fa-plus"></span> <span class="fa fa-file"></span> <span class="caret"></span>'),tmpl_array.push("     </button>"),tmpl_array.push('     <ul class="dropdown-menu" role="menu">'),tmpl_array.push('        <li><a href="#folders/<%= id %>/import/history"> from History</a></li>'),tmpl_array.push("<% if(Galaxy.config.user_library_import_dir !== null) { %>"),tmpl_array.push('        <li><a href="#folders/<%= id %>/import/userdir"> from User Directory</a></li>'),tmpl_array.push("<% } %>"),tmpl_array.push("<% if(Galaxy.config.allow_library_path_paste) { %>"),tmpl_array.push('   <li class="divider"></li>'),tmpl_array.push('   <li class="dropdown-header">Admins only</li>'),tmpl_array.push("<% if(Galaxy.config.library_import_dir !== null) { %>"),tmpl_array.push('   <li><a href="#folders/<%= id %>/import/importdir">from Import Directory</a></li>'),tmpl_array.push("<% } %>"),tmpl_array.push("<% if(Galaxy.config.allow_library_path_paste) { %>"),tmpl_array.push('        <li><a href="#folders/<%= id %>/import/path">from Path</a></li>'),tmpl_array.push("<% } %>"),tmpl_array.push("<% } %>"),tmpl_array.push("     </ul>"),tmpl_array.push("   </div>"),tmpl_array.push("<% } else { %>"),tmpl_array.push(' <a  data-placement="top" title="Add Datasets to Current Folder" style="display:none;" class="btn btn-default add-library-items" href="#folders/<%= id %>/import/history" role="button"><span class="fa fa-plus"></span> <span class="fa fa-file"></span></span></a>'),tmpl_array.push("<% } %>"),tmpl_array.push('  <button data-toggle="tooltip" data-placement="top" title="Import selected datasets into history" id="toolbtn_bulk_import" class="primary-button dataset-manipulation" style="margin-left: 0.5em; display:none;" type="button"><span class="fa fa-book"></span> to History</button>'),tmpl_array.push('   <div id="toolbtn_dl" class="btn-group dataset-manipulation" style="margin-left: 0.5em; display:none; ">'),tmpl_array.push('     <button title="Download selected datasets as archive" id="drop_toggle" type="button" class="primary-button dropdown-toggle" data-toggle="dropdown">'),tmpl_array.push('     <span class="fa fa-download"></span> Download <span class="caret"></span>'),tmpl_array.push("     </button>"),tmpl_array.push('     <ul class="dropdown-menu" role="menu">'),tmpl_array.push('        <li><a href="#/folders/<%= id %>/download/tgz">.tar.gz</a></li>'),tmpl_array.push('        <li><a href="#/folders/<%= id %>/download/tbz">.tar.bz</a></li>'),tmpl_array.push('        <li><a href="#/folders/<%= id %>/download/zip">.zip</a></li>'),tmpl_array.push("     </ul>"),tmpl_array.push("   </div>"),tmpl_array.push('   <button data-toggle="tooltip" data-placement="top" title="Mark selected datasets deleted" id="toolbtn_bulk_delete" class="primary-button logged-dataset-manipulation" style="margin-left: 0.5em; display:none; " type="button"><span class="fa fa-times"></span> Delete</button>'),tmpl_array.push('   <button data-id="<%- id %>" data-toggle="tooltip" data-placement="top" title="Show location information" class="primary-button toolbtn-show-locinfo" style="margin-left: 0.5em;" type="button"><span class="fa fa-info-circle"></span> Location Info</button>'),tmpl_array.push('   <span class="help-button" data-toggle="tooltip" data-placement="top" title="Visit Libraries Wiki"><a href="https://wiki.galaxyproject.org/DataLibraries/screen/FolderContents" target="_blank"><button class="primary-button" type="button"><span class="fa fa-question-circle"></span> Help</button></a></span>'),tmpl_array.push(" </div>"),tmpl_array.push("</form>"),tmpl_array.push(' <div id="folder_items_element">'),tmpl_array.push(" </div>"),tmpl_array.push("</div>"),_.template(tmpl_array.join(""))},templateLocInfoInModal:function(){return _.template(["<div>",'<table class="grid table table-condensed">',"<thead>",'<th style="width: 25%;">library</th>',"<th></th>","</thead>","<tbody>","<tr>","<td>name</td>",'<td><%- library.get("name") %></td>',"</tr>",'<% if(library.get("description") !== "") { %>',"<tr>","<td>description</td>",'<td><%- library.get("description") %></td>',"</tr>","<% } %>",'<% if(library.get("synopsis") !== "") { %>',"<tr>","<td>synopsis</td>",'<td><%- library.get("synopsis") %></td>',"</tr>","<% } %>",'<% if(library.get("create_time_pretty") !== "") { %>',"<tr>","<td>created</td>",'<td><span title="<%- library.get("create_time") %>"><%- library.get("create_time_pretty") %></span></td>',"</tr>","<% } %>","<tr>","<td>id</td>",'<td><%- library.get("id") %></td>',"</tr>","</tbody>","</table>",'<table class="grid table table-condensed">',"<thead>",'<th style="width: 25%;">folder</th>',"<th></th>","</thead>","<tbody>","<tr>","<td>name</td>","<td><%- options.folder_name %></td>","</tr>",'<% if(options.folder_description !== "") { %>',"<tr>","<td>description</td>","<td><%- options.folder_description %></td>","</tr>","<% } %>","<tr>","<td>id</td>","<td><%- options.id %></td>","</tr>","</tbody>","</table>","</div>"].join(""))},templateNewFolderInModal:function(){return tmpl_array=[],tmpl_array.push('<div id="new_folder_modal">'),tmpl_array.push("<form>"),tmpl_array.push('<input type="text" name="Name" value="" placeholder="Name">'),tmpl_array.push('<input type="text" name="Description" value="" placeholder="Description">'),tmpl_array.push("</form>"),tmpl_array.push("</div>"),_.template(tmpl_array.join(""))},templateBulkImportInModal:function(){var a=[];return a.push('<span id="history_modal_combo_bulk" style="width:90%; margin-left: 1em; margin-right: 1em; ">'),a.push("Select history: "),a.push('<select id="dataset_import_bulk" name="dataset_import_bulk" style="width:50%; margin-bottom: 1em; "> '),a.push("   <% _.each(histories, function(history) { %>"),a.push('       <option value="<%= _.escape(history.get("id")) %>"><%= _.escape(history.get("name")) %></option>'),a.push("   <% }); %>"),a.push("</select>"),a.push("</span>"),_.template(a.join(""))},templateImportIntoHistoryProgressBar:function(){var a=[];return a.push('<div class="import_text">'),a.push("Importing selected datasets to history <b><%= _.escape(history_name) %></b>"),a.push("</div>"),a.push('<div class="progress">'),a.push('   <div class="progress-bar progress-bar-import" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 00%;">'),a.push('       <span class="completion_span">0% Complete</span>'),a.push("   </div>"),a.push("</div>"),a.push(""),_.template(a.join(""))},templateAddingDatasetsProgressBar:function(){var a=[];return a.push('<div class="import_text">'),a.push("Adding selected datasets to library folder <b><%= _.escape(folder_name) %></b>"),a.push("</div>"),a.push('<div class="progress">'),a.push('   <div class="progress-bar progress-bar-import" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 00%;">'),a.push('       <span class="completion_span">0% Complete</span>'),a.push("   </div>"),a.push("</div>"),a.push(""),_.template(a.join(""))},templateDeletingDatasetsProgressBar:function(){var a=[];return a.push('<div class="import_text">'),a.push("</div>"),a.push('<div class="progress">'),a.push('   <div class="progress-bar progress-bar-import" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 00%;">'),a.push('       <span class="completion_span">0% Complete</span>'),a.push("   </div>"),a.push("</div>"),a.push(""),_.template(a.join(""))},templateBrowserModal:function(){var a=[];return a.push('<div id="file_browser_modal">'),a.push('<div class="alert alert-info jstree-files-message">All files you select will be imported into the current folder.</div>'),a.push('<div class="alert alert-info jstree-folders-message" style="display:none;">All files within the selected folders and their subfolders will be imported into the current folder.</div>'),a.push('<div style="margin-bottom:1em;">'),a.push('<label class="radio-inline">'),a.push('  <input title="Switch to selecting files" type="radio" name="jstree-radio" value="jstree-disable-folders" checked="checked"> Files'),a.push("</label>"),a.push('<label class="radio-inline">'),a.push('  <input title="Switch to selecting folders" type="radio" name="jstree-radio" value="jstree-disable-files"> Folders'),a.push("</label>"),a.push("</div>"),a.push('<div style="margin-bottom:1em;">'),a.push('<label class="checkbox-inline jstree-preserve-structure" style="display:none;">'),a.push('   <input class="preserve-checkbox" type="checkbox" value="preserve_directory_structure">'),a.push("Preserve directory structure"),a.push(" </label>"),a.push('<label class="checkbox-inline jstree-link-files" style="display:none;">'),a.push('   <input class="link-checkbox" type="checkbox" value="link_files">'),a.push("Link files instead of copying"),a.push(" </label>"),a.push("</div>"),a.push('<div id="jstree_browser">'),a.push("</div>"),a.push("<hr />"),a.push("<p>You can set extension type and genome for all imported datasets at once:</p>"),a.push("<div>"),a.push('Type: <span id="library_extension_select" class="library-extension-select" />'),a.push('  Genome: <span id="library_genome_select" class="library-genome-select" />'),a.push("</div>"),a.push("</div>"),_.template(a.join(""))},templateImportPathModal:function(){var a=[];return a.push('<div id="file_browser_modal">'),a.push('<div class="alert alert-info jstree-folders-message">All files within the given folders and their subfolders will be imported into the current folder.</div>'),a.push('<div style="margin-bottom: 0.5em;">'),a.push('<label class="checkbox-inline jstree-preserve-structure">'),a.push('   <input class="preserve-checkbox" type="checkbox" value="preserve_directory_structure">'),a.push("Preserve directory structure"),a.push(" </label>"),a.push('<label class="checkbox-inline jstree-link-files">'),a.push('   <input class="link-checkbox" type="checkbox" value="link_files">'),a.push("Link files instead of copying"),a.push(" </label>"),a.push("</div>"),a.push('<textarea id="import_paths" class="form-control" rows="5" placeholder="Absolute paths (or paths relative to Galaxy root) separated by newline"></textarea>'),a.push("<hr />"),a.push("<p>You can set extension type and genome for all imported datasets at once:</p>"),a.push("<div>"),a.push('Type: <span id="library_extension_select" class="library-extension-select" />'),a.push('  Genome: <span id="library_genome_select" class="library-genome-select" />'),a.push("</div>"),
a.push("</div>"),_.template(a.join(""))},templateAddFilesFromHistory:function(){var a=[];return a.push('<div id="add_files_modal">'),a.push('<div id="history_modal_combo_bulk">'),a.push("Select history:  "),a.push('<select id="dataset_add_bulk" name="dataset_add_bulk" style="width:66%; "> '),a.push("   <% _.each(histories, function(history) { %>"),a.push('       <option value="<%= _.escape(history.get("id")) %>"><%= _.escape(history.get("name")) %></option>'),a.push("   <% }); %>"),a.push("</select>"),a.push("</div>"),a.push("<br/>"),a.push('<div id="selected_history_content">'),a.push("</div>"),a.push("</div>"),_.template(a.join(""))},templateHistoryContents:function(){var a=[];return a.push("<strong>Choose the datasets to import:</strong>"),a.push("<ul>"),a.push(" <% _.each(history_contents, function(history_item) { %>"),a.push(' <li data-id="<%= _.escape(history_item.get("id")) %>">'),a.push('   <input style="margin: 0;" type="checkbox"> <%= _.escape(history_item.get("hid")) %>: <%= _.escape(history_item.get("name")) %>'),a.push(" </li>"),a.push(" <% }); %>"),a.push("</ul>"),_.template(a.join(""))},templatePaginator:function(){return tmpl_array=[],tmpl_array.push('   <ul class="pagination pagination-sm">'),tmpl_array.push("       <% if ( ( show_page - 1 ) > 0 ) { %>"),tmpl_array.push("           <% if ( ( show_page - 1 ) > page_count ) { %>"),tmpl_array.push('               <li><a href="#folders/<%= id %>/page/1"><span class="fa fa-angle-double-left"></span></a></li>'),tmpl_array.push('               <li class="disabled"><a href="#folders/<%= id %>/page/<% print( show_page ) %>"><% print( show_page - 1 ) %></a></li>'),tmpl_array.push("           <% } else { %>"),tmpl_array.push('               <li><a href="#folders/<%= id %>/page/1"><span class="fa fa-angle-double-left"></span></a></li>'),tmpl_array.push('               <li><a href="#folders/<%= id %>/page/<% print( show_page - 1 ) %>"><% print( show_page - 1 ) %></a></li>'),tmpl_array.push("           <% } %>"),tmpl_array.push("       <% } else { %>"),tmpl_array.push('           <li class="disabled"><a href="#folders/<%= id %>/page/1"><span class="fa fa-angle-double-left"></span></a></li>'),tmpl_array.push('           <li class="disabled"><a href="#folders/<%= id %>/page/<% print( show_page ) %>"><% print( show_page - 1 ) %></a></li>'),tmpl_array.push("       <% } %>"),tmpl_array.push('       <li class="active">'),tmpl_array.push('       <a href="#folders/<%= id %>/page/<% print( show_page ) %>"><% print( show_page ) %></a>'),tmpl_array.push("       </li>"),tmpl_array.push("       <% if ( ( show_page ) < page_count ) { %>"),tmpl_array.push('           <li><a href="#folders/<%= id %>/page/<% print( show_page + 1 ) %>"><% print( show_page + 1 ) %></a></li>'),tmpl_array.push('           <li><a href="#folders/<%= id %>/page/<% print( page_count ) %>"><span class="fa fa-angle-double-right"></span></a></li>'),tmpl_array.push("       <% } else { %>"),tmpl_array.push('           <li class="disabled"><a href="#folders/<%= id %>/page/<% print( show_page  ) %>"><% print( show_page + 1 ) %></a></li>'),tmpl_array.push('           <li class="disabled"><a href="#folders/<%= id %>/page/<% print( page_count ) %>"><span class="fa fa-angle-double-right"></span></a></li>'),tmpl_array.push("       <% } %>"),tmpl_array.push("   </ul>"),tmpl_array.push("   <span>"),tmpl_array.push('       showing <a data-toggle="tooltip" data-placement="top" title="Click to change the number of items on page" id="page_size_prompt"><%- items_shown %></a> of <%- total_items_count %> items'),tmpl_array.push("   </span>"),_.template(tmpl_array.join(""))}});return{FolderToolbarView:f}});
//# sourceMappingURL=../../../maps/mvc/library/library-foldertoolbar-view.js.map