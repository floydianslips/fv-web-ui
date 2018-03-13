import React from 'react';
import t from 'tcomb-form';

import classNames from 'classnames';

import VirtualKeyboardFactory from 'views/components/Editor/fields/virtualKeyboard';

import WysiwygFactory from 'views/components/Editor/fields/wysiwyg';
import SelectSuggestFactory from 'views/components/Editor/fields/selectSuggest';
import SelectFactory from 'views/components/Editor/fields/select';
import MediaFactory from 'views/components/Editor/fields/media';
import BulkImportRadioOptionsFactory from 'views/components/Editor/fields/bulkImportRadioOptions';

import { FlatButton, IconButton } from 'material-ui';

const i18nExt = {
  add: '+ Add New',
  down: '▼',
  remove: 'X',
  up: '▲',
  optional: '(optional)'
}

const configExt = {
  config: {
    // for each of lg md sm xs you can specify the columns width
    horizontal: {
      md: [3, 9],
      sm: [6, 6]
    }
  }
}

const FVPortalTemplate = function template(locals) {
  return (
    <fieldset>
      <div className="col-md-12">
        {locals.inputs['fv-portal:greeting']}
      </div>
      <div className="col-md-12">
        {locals.inputs['fv-portal:about']}
      </div>
      <div className="col-md-12">
        {locals.inputs['fv-portal:news']}
      </div>
      <div className="col-md-12">
        {locals.inputs['fv-portal:featured_words']}
      </div>
      <div className="col-md-12">
        {locals.inputs['fv-portal:related_links']}
      </div>
      <div className="col-md-12">
        {locals.inputs['fv-portal:featured_audio']}
      </div>
      <div className="col-md-6">
        {locals.inputs['fv-portal:background_top_image']}
      </div>
      <div className="col-md-6">
        {locals.inputs['fv-portal:logo']}
      </div>
    </fieldset>
  )
}

const DefinitionsLayout = function (locals) {
  return (
    <div className="table-responsive">
      <table className="table">
        <tbody>
        <tr>
          <td>{locals.inputs.language}</td>
          <td>{locals.inputs.translation}</td>
        </tr>
        </tbody>
      </table>
    </div>
  );
};

const RelatedMediaLayout = function (locals) {
  return (
    <div className="row" style={{margin: '15px 0'}}>
    <fieldset>
      <legend>{locals.label} <FlatButton label={locals.add.label} onTouchTap={locals.add.click} /></legend>
        {(locals.items || []).map(function(item, i) {
          return <div key={i} className={classNames('col-xs-12','col-md-3')}>
                    {item.input}
                    <div style={{textAlign: 'center', marginTop: '-15px', backgroundColor: 'rgba(234, 234, 234, 0.6)', borderRadius: '0 0 10px 10px'}}>
                      {item.buttons.map((button, i) => {
                        
                        let icon = '';
                        let label = '';

                        switch (button.type) {
                          case 'remove':
                            icon = 'clear';
                            label = 'Remove Item';
                          break;

                          case 'move-up':
                            icon = 'arrow_back';
                            label = 'Move left (appears first)';
                          break;

                          case 'move-down':
                            icon = 'arrow_forward';
                            label = 'Move right';
                          break;
                        }

                        return <IconButton tooltip={label} iconClassName="material-icons" key={i} onClick={button.click} style={{verticalAlign: '-8px'}}>{icon}</IconButton>;
                      })}
                    </div>
                </div>;
        })}
    </fieldset>
    </div>
  );
};


const BulkImportLayout = function (locals) {
  
  let content = '';
  let renderError = false;
  let renderErrorMessage = '';
  let radioElementsName;
  let defaultValue;

  // Iterate Options to compose Radios
  if (locals.item.options) {
    let numOptions = locals.attrs.options.length;
    for(let i in locals.attrs.options) {
      console.log('Options: '+ locals.attrs.options[i].value)
      content += (<div style={{'backgroundColor':'#66ffff'}}><input type="radio" name={radioElementsName} id={locals.attrs.options[i].value} value={locals.attrs.options[i].value} /> - <label for={locals.attrs.options[i].value}>{locals.attrs.options[i].label}</label></div>);

      //content += <RadioButton value={locals.attrs.options[i].value} label={locals.attrs.options[i].label} />;

    }
  }

  return (<div className="row" style={{margin: '15px 0'}}>{content}</div>);
};


t.String.getValidationErrorMessage = (value, path, context) => {
  if (!value) {
    return 'Value in field ' + context.options.label + ' cannot be empty.';
  }
};

const options = {
  FVWord: {
    order: ['dc:title', 'fv-word:part_of_speech', 'fv-word:pronunciation', 'fv:definitions', 'fv:literal_translation', 'fv:related_audio', 'fv:related_pictures', 'fv:related_videos', 'fv-word:related_phrases', 'fv-word:categories', 'fv:cultural_note', 'fv:reference', 'fv:source', 'fv:available_in_childrens_archive','fv-word:available_in_games'],
    fields: {
      'dc:title': {
        label: 'Word',
        factory: VirtualKeyboardFactory
       },
      'fv:definitions': {
        label: 'Definitions',
        item: {
          fields: {
            translation: {
              label: 'Translation',
              factory: VirtualKeyboardFactory
            },
            language: {
              label: 'Language',
              factory: SelectFactory,
              attrs: {
                defaultValue: 'english',
                directory: 'fv_language'
              }
            }
          },
          template: DefinitionsLayout
        },
        help: <i>Describe what the word actually means.</i>
      },
      'fv:literal_translation': {
        label: 'Literal Translation',
        item: {
          fields: {
            translation: {
              label: 'Translation',
              factory: VirtualKeyboardFactory
            },
            language: {
              label: 'Language',
              factory: SelectFactory,
              attrs: {
                defaultValue: 'english',
                directory: 'fv_language'
              }
            }
          },
          template: DefinitionsLayout
        },
        help: <i>Describe what the word translates to regardless of context.</i>
      },
      'fv-word:part_of_speech' : {
        label: 'Part of Speech',
        factory: SelectFactory,
        attrs: {
          directory: 'parts_of_speech'
        }
      },
      'fv-word:pronunciation' : {
        label: 'Pronunciation',
        factory: VirtualKeyboardFactory
      },
      'fv-word:related_phrases' : {
        label: 'Related Phrases',
        item: {
          factory: SelectSuggestFactory,
          type: 'FVPhrase'
        }
      },
      'fv-word:categories' : {
        label: 'Categories',
        item: {
          factory: SelectSuggestFactory,
          type: 'FVCategory',
          attrs: {
            containerType: 'FVWord',
            page_provider: {
              name: 'category_suggestion',
              folder: 'Categories'
            },
            hideCreate: true
          }
        }
      },
      'fv:related_audio' : {
        label: 'Related Audio',
        item: {
          factory: MediaFactory,
          type: 'FVAudio'
        },
        template: RelatedMediaLayout
      },
      'fv:related_pictures' : {
        label: 'Related Pictures',
        item: {
          factory: MediaFactory,
          type: 'FVPicture'
        },
        template: RelatedMediaLayout
      },
      'fv:related_videos' : {
        label: 'Related Videos',
        item: {
          factory: MediaFactory,
          type: 'FVVideo'
        },
        template: RelatedMediaLayout
      },
      'fv:cultural_note' : {
        label: 'Cultural Note',
        item: {
          factory: VirtualKeyboardFactory,
          type: 'FVVideo'
        }
      },
      'fv:reference': {
        label: 'Reference',
        help: <i>Origin of record (person, book, etc).</i>,
        factory: VirtualKeyboardFactory
      },
      'fv:source': {
        label: 'Source',
        help: <i>Contributor(s) who helped create this record.</i>,
        item: {
          factory: SelectSuggestFactory,
          type: 'FVContributor',
          attrs: {
            allowEdit: true
          }
        }
      },
      'fv:available_in_childrens_archive': {
        label: 'Available in Children\'s Archive'
      },
      'fv-word:available_in_games': {
        label: 'Available in Games'
      }
    },
    i18n: i18nExt
  },
  FVPhrase: {
    order: ['dc:title', 'fv:definitions', 'fv-phrase:phrase_books', 'fv:related_audio', 'fv:related_pictures', 'fv:related_videos', 'fv:cultural_note', 'fv:reference', 'fv:source', 'fv:available_in_childrens_archive'],
    fields: {
      'dc:title': {
        label: 'Phrase'
       },
      'fv:definitions': {
        label: 'Definitions',
        item: {
          fields: {
            translation: {
              label: 'Translation'
            },
            language: {
              label: 'Language',
              factory: SelectFactory,
              attrs: {
                defaultValue: 'english',
                directory: 'fv_language'
              }
            }
          },
          template: DefinitionsLayout
        },
        help: <i>Describe what the word actually means.</i>
      },
      'fv-phrase:phrase_books' : {
        label: 'Phrase Books',
        item: {
          factory: SelectSuggestFactory,
          type: 'FVCategory',
          attrs: {
            containerType: 'FVPhrase',
            allowEdit: true,
            page_provider: {
              name: 'phrasebook_suggestion',
              folder: 'Phrase Books'
            }
          }
        }
      },
      'fv:related_audio' : {
        label: 'Related Audio',
        item: {
          factory: MediaFactory,
          type: 'FVAudio'
        },
        template: RelatedMediaLayout
      },
      'fv:related_pictures' : {
        label: 'Related Pictures',
        item: {
          factory: MediaFactory,
          type: 'FVPicture'
        },
        template: RelatedMediaLayout
      },
      'fv:related_videos' : {
        label: 'Related Videos',
        item: {
          factory: MediaFactory,
          type: 'FVVideo'
        },
        template: RelatedMediaLayout
      },
      'fv:cultural_note' : {
        label: 'Cultural Notes'
      },
      'fv:reference': {
        label: 'Reference',
        help: <i>Origin of record (person, book, etc).</i>
      },
      'fv:source': {
        label: 'Source',
        help: <i>Contributor(s) who helped create this record.</i>,
        item: {
          factory: SelectSuggestFactory,
          type: 'FVContributor'
        }
      },
      'fv:available_in_childrens_archive': {
        label: 'Available in Children\'s Archive'
      }
    },
    i18n: i18nExt
  },
  FVBook: {
    order: ['dc:title', 'fvbook:title_literal_translation', 'fvbook:introduction', 'fvbook:introduction_literal_translation', 'fvbook:type', 'fv:related_audio', 'fv:related_pictures', 'fv:related_videos', 'fvbook:author', 'fv:cultural_note', 'fv:source', 'fv:available_in_childrens_archive'],
    fields: {
      'dc:title': {
        label: 'Book Title',
        help: <i>The title of the song or story</i>
       },
      'fvbook:title_literal_translation': {
        label: 'Book Title Translation',
        item: {
          fields: {
            translation: {
              label: 'Translation'
            },
            language: {
              label: 'Language',
              factory: SelectFactory,
              attrs: {
                defaultValue: 'english',
                directory: 'fv_language'
              }
            }
          },
          template: DefinitionsLayout
        },
        help: <i>Describe what the word translates to regardless of context.</i>
      },
      'fvbook:introduction': {
        label: 'Book Introduction',
        type: 'textarea',
        factory: WysiwygFactory,
        attrs: {
          placeholder: 'Enter book introduction here'
        }
      },
      'fvbook:introduction_literal_translation': {
        label: 'Introduction Translation',
        item: {
          fields: {
            translation: {
              label: 'Translation',
              type: 'textarea',
              factory: WysiwygFactory
            },
            language: {
              label: 'Language',
              factory: SelectFactory,
              attrs: {
                defaultValue: 'english',
                directory: 'fv_language'
              }
            }
          },
          template: DefinitionsLayout
        },
        help: <i>Describe what the word translates to regardless of context.</i>
      },
      'fvbook:type': {
        label: 'Type',
        factory: SelectFactory,
        attrs: {
          directory: 'fv_book_type'
        }
      },
      'fv:related_audio' : {
        label: 'Related Audio',
        item: {
          factory: MediaFactory,
          type: 'FVAudio'
        }
      },
      'fv:related_pictures' : {
        label: 'Related Pictures',
        item: {
          factory: MediaFactory,
          type: 'FVPicture'
        }
      },
      'fv:related_videos' : {
        label: 'Related Videos',
        item: {
          factory: MediaFactory,
          type: 'FVVideo'
        }
      },
      'fvbook:author': {
        label: 'Author',
        item: {
          factory: SelectSuggestFactory,
          type: 'FVContributor'
        }
      },
      'fv:source': {
        label: 'Source',
        help: <i>Contributor(s) who helped create this record.</i>,
        item: {
          factory: SelectSuggestFactory,
          type: 'FVContributor'
        }
      },
      'fv:cultural_note' : {
        label: 'Cultural Notes'
      },
      'fv:available_in_childrens_archive': {
        label: 'Available in Children\'s Archive'
      }      
    },
    i18n: i18nExt
  },
  FVBookEntry: {
    order: ['dc:title', 'fvbookentry:dominant_language_text', 'fv:literal_translation', 'fv:related_audio', 'fv:related_pictures', 'fv:related_videos', 'fv:cultural_note', 'fv:source'],
    fields: {
      'dc:title': {
        label: 'Page Content',
        type: 'textarea',
        factory: WysiwygFactory
       },
      'fvbookentry:dominant_language_text': {
        label: 'Dominant Language Text',
        item: {
          fields: {
            translation: {
              label: 'Translation',
              type: 'textarea'
            },
            language: {
              label: 'Language',
              factory: SelectFactory,
              attrs: {
                defaultValue: 'english',
                directory: 'fv_language'
              }
            }
          },
          template: DefinitionsLayout
        },
        help: <i>Page content translation.</i>
      },
      'fv:literal_translation': {
        label: 'Literal Translation',
        item: {
          fields: {
            translation: {
              label: 'Translation',
              type: 'textarea'
            },
            language: {
              label: 'Language',
              factory: SelectFactory,
              attrs: {
                defaultValue: 'english',
                directory: 'fv_language'
              }
            }
          },
          template: DefinitionsLayout
        },
        help: <i>Describe what the book entry translates to regardless of context.</i>
      },
      'fv:related_audio' : {
        label: 'Related Audio',
        item: {
          factory: MediaFactory,
          type: 'FVAudio'
        }
      },
      'fv:related_pictures' : {
        label: 'Related Pictures',
        item: {
          factory: MediaFactory,
          type: 'FVPicture'
        }
      },
      'fv:related_videos' : {
        label: 'Related Videos',
        item: {
          factory: MediaFactory,
          type: 'FVVideo'
        }
      },
      'fv:source': {
        label: 'Source',
        help: <i>Contributor(s) who helped create this record.</i>,
        item: {
          factory: SelectSuggestFactory,
          type: 'FVContributor'
        }
      },
      'fv:cultural_note' : {
        label: 'Cultural Notes'
      }
    },
    i18n: i18nExt
  },
  FVGallery: {
    order: ['dc:title', 'dc:description', 'fv:related_pictures'],
    fields: {
      'dc:title': {
        label: 'Gallery Name',
        help: <i>The name of the gallery</i>
       },

      'dc:description': {
        label: 'Gallery Description',
        type: 'textarea',
        attrs: {
          placeholder: 'Enter gallery description here'
        }
      },
      'fv:related_pictures' : {
        label: 'Related Pictures',
        item: {
          factory: MediaFactory,
          type: 'FVPicture'
        }
      }    
    },
    i18n: i18nExt
  },  
  
  FVCategory: {
    order: ['dc:title', 'dc:description', 'fvcategory:parent_category', 'fvcategory:image'],
    fields: {
      'dc:title': {
        label: 'Category Name',
        help: <i>The name of the category</i>
       },

      'dc:description': {
        label: 'Category Description',
        type: 'textarea',
        attrs: {
          placeholder: 'Enter category description here'
        }
      },
      'fvcategory:parent_category': {
          label: 'Parent Category Name',
          help: <i>The name of the parent category</i>,
          factory: SelectSuggestFactory,
          type: 'FVCategory',
          attrs: {
            page_provider: {
              name: 'category_suggestion',
              folder: 'Categories'
            },
            disableCreateNewButton: true
          }          
       },      
      'fvcategory:image' : {
        label: 'Category Image',
        factory: MediaFactory,
        type: 'FVPicture'
      }    
    },
    i18n: i18nExt
  }, 

  FVPhraseBook: {
    order: ['dc:title', 'dc:description'],
    fields: {
      'dc:title': {
        label: 'Phrase Book Name',
        help: <i>The name of the phrase book</i>
       },

      'dc:description': {
        label: 'Phrase Book Description',
        type: 'textarea',
        attrs: {
          placeholder: 'Enter phrase book description here'
        }
      }
    },
    i18n: i18nExt
  },   
  
  FVContributor: {
    order: ['dc:title', 'dc:description'],
    fields: {
      'dc:title': {
        label: 'Contributor Name',
        help: <i>The name of the contributor</i>
       },

      'dc:description': {
        label: 'Contributor Description',
        type: 'textarea',
        attrs: {
          placeholder: 'Enter contributor description here'
        }
      }   
    },
    i18n: i18nExt
  }, 
  
  FVPortal: {
    fields: {
      'fv-portal:greeting': {
        label: 'Portal Greeting'
      },
      'fv-portal:featured_audio' : {
        label: 'Greeting Audio',
        factory: MediaFactory,
        type: 'FVAudio'
      },
      'fv-portal:about': {
        label: 'Portal Introduction',
        type: 'textarea',
        factory: WysiwygFactory,
        attrs: {
          placeholder: 'Enter portal description here'
        }
      },
      'fv-portal:news': {
        label: 'News',
        type: 'textarea',
        factory: WysiwygFactory,
        help: 'Tip: Use * to start a bullet list!'
      },
      'fv-portal:background_top_image' : {
        label: 'Background Image',
        factory: MediaFactory,
        type: 'FVPicture'
      },
      'fv-portal:logo' : {
        label: 'Logo',
        factory: MediaFactory,
        type: 'FVPicture'
      },
      'fv-portal:featured_words' : {
        label: 'Featured Words',
        item: {
          factory: SelectSuggestFactory,
          type: 'FVWord',
          attrs: {
            disableCreateNewButton: true,
            previewProps: {
              minimal: true
            }
          }
        }
      },
      'fv-portal:related_links' : {
        label: 'Related Links',
        item: {
          factory: SelectSuggestFactory,
          type: 'FVLink',
          attrs: {
            previewProps: {
              minimal: true
            },
            allowEdit: true
          }
        }
      }
    },
    template: FVPortalTemplate,
    i18n: i18nExt
  },

  FVDialect: {
    fields: {
      'dc:title': {
        label: 'Dialect Name',
        type: 'text'
      },
      'dc:description': {
        label: 'About Dialect',
        type: 'textarea',
        factory: WysiwygFactory
      },
      'fvdialect:country': {
        label: 'Country',
        factory: SelectFactory,
        attrs: {
          fancy: false,
          directory: 'fv_countries'
        }
      },
      'fvdialect:dominant_language': {
        label: 'Dominant Language',
        factory: SelectFactory,
        attrs: {
          fancy: false,
          directory: 'fv_language'
        }
      },
      'fvdialect:region': {
        label: 'Region',
        type: 'text'
      },
      'fvdialect:keyboards': {
        label: 'Keyboard Links',
        item: {
          factory: SelectSuggestFactory,
          type: 'FVLink',
          attrs: {
            previewProps: {
              minimal: true
            },
            allowEdit: true
          }
        }
      },
      'fvdialect:language_resources': {
        label: 'Language Resources',
        item: {
          factory: SelectSuggestFactory,
          type: 'FVLink',
          attrs: {
            previewProps: {
              minimal: true
            },
            allowEdit: true
          }
        }
      },
      'fvdialect:contact_information': {
        label: 'Contact Information',
        type: 'textarea',
        factory: WysiwygFactory
      }
    },
    i18n: i18nExt
  },

  FVCharacter: {
    fields: {
      'dc:title': {
        label: 'Character',
        disabled: true
       },
      'fvcharacter:upper_case_character': {
        label: 'Upper Case',
        disabled: true
       },
      'fvcharacter:alphabet_order': {
        label: 'Sort Order',
        disabled: true
       },
      'fv:related_audio' : {
        label: 'Related Audio',
        item: {
          factory: MediaFactory,
          type: 'FVAudio'
        }
      },
      'fvcharacter:related_words' : {
        label: 'Featured Words',
        item: {
          factory: SelectSuggestFactory,
          type: 'FVWord',
          attrs: {
            disableCreateNewButton: true
          }
        }
      }
    },
    i18n: i18nExt
  },

  FVResource: {
    order: ['dc:title', 'dc:description', 'file', 'fvm:shared', 'fvm:child_focused', 'fvm:source', 'fvm:recorder'],
    fields: {
      'dc:title': {
        label: 'Name',
        type: 'text'
      },
      'dc:description': {
        label: 'Description',
        type: 'textarea'
      },
      'file': {
        label: 'File',
        type: 'file'
      },
      'fvm:shared': {
        label: 'Share across dialects?'
      },
      'fvm:child_focused': {
        label: 'Child focused'
      },
      'fvm:source': {
        label: 'Source',
        item: {
          factory: SelectSuggestFactory,
          type: 'FVContributor'
        }
      },
      'fvm:recorder': {
        label: 'Recorder',
        item: {
          factory: SelectSuggestFactory,
          type: 'FVContributor'
        }
      }
    },
    config: {
      horizontal: {
        md: [3, 9],
        sm: [6, 6]
      }
    },
    i18n: i18nExt
  },
  FVUser: {
    fields: {
      'userinfo:firstName': {
        label: 'First Name'
      },
      'userinfo:lastName': {
        label: 'Last Name'
      },
      'userinfo:email': {
        label: 'Email address'
      },
      'fvuserinfo:requestedSpace': {
        label: 'Dialect to Join',
        factory: SelectFactory,
        attrs: {
          query: 'SELECT ecm:uuid, dc:title FROM FVDialect WHERE ecm:path STARTSWITH \'/FV/sections\'',
          queryId: 'dialect_titles_uids',
          label: 'Dialect to Join'
        }
      }
    }
  },
  FVUserProfile: {
    fields: {
      'firstName': {
        label: 'First Name'
      },
      'lastName': {
        label: 'Last Name'
      },
      'email': {
        label: 'Email address'
      },
      'preferences': {
        label: 'Preferences',
        fields: {
          General: {
            label: 'General Options',
            fields: {
              primary_dialect: {
                label: 'My Primary Dialect',
                factory: SelectFactory,
                attrs: {
                  query: 'SELECT ecm:uuid, dc:title FROM FVDialect WHERE ecm:path STARTSWITH \'/FV/Workspaces\'',
                  queryId: 'dialect_titles_uids',
                  label: 'Primary Dialect',
                  help: 'Note: If you are a member of only one dialect, that will be your primary dialect automatically.'
                }
              }
            }
          }
        }
      }
    }
  },
  FVLink: {
    fields: {
      'dc:title': {
        label: 'Title'
      },
      'dc:description': {
        label: 'Description'
      },
      'fvlink:url': {
        label: 'URL',
        help: 'Specify URL if linking to external or internal links.'
      }/*,
      'file:content': {
        label: 'File',
        help: 'Optional: For linking directly to a file.',
        type: 'file'
      },*/
    }
  },

  FVBulkImportCSV: {
    fields: {
      'bulkImportFile': {
        label: 'Choose CSV file',
        help: 'File type must be CSV.',
        type: 'file'
      },
      'bulkImportRadioOptions': {
        label: 'Duplicate Record options',
        help: 'What should happen when a record already exists?',
        factory: BulkImportRadioOptionsFactory,
        attrs: {
          elementName: 'duplicateOption',
          defaultValue: 'duplicateAdd',
          options: [
            {value: 'duplicateAdd', label: 'Add duplicate records'},
            {value: 'duplicateUpdate', label: 'Update duplicate records'},
            {value: 'duplicateIgnore', label: 'Ignore duplicate records'}
          ]
        }
      }
    }
  }

};

export default options;